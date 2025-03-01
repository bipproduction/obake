import { fAdmin } from "@/fadmin";
import { $, type ShellOutput } from "bun";
import CryptoJS from "crypto-js";
import dedent from "dedent";
import _ from "lodash";
import minimist from "minimist";
const argv = minimist(process.argv.splice(2));

const key = argv.key;
const data_required = argv["data-required"];
const data_extend = argv["data-extend"];
if (!key) {
  console.error("key not found");
  process.exit(1);
}

if (!data_required) {
  console.error("data_required not found");
  process.exit(1);
}

if (!data_extend) {
  console.error("data_extend not found");
  process.exit(1);
}

const dataRequired = CryptoJS.AES.decrypt(data_required, key).toString(
  CryptoJS.enc.Utf8
);
const dataRequiredJson: RequiredData = JSON.parse(dataRequired);

const extendData = CryptoJS.AES.decrypt(data_extend, key).toString(
  CryptoJS.enc.Utf8
);
const dataExtendJson = JSON.parse(extendData);

const admin = fAdmin({
  credential: dataRequiredJson.firebase.credential,
  databaseURL: dataRequiredJson.firebase.databaseURL,
});

const db = admin.database();

async function kirimLog(...args: any[]) {
  const body = args.join(" ");
  await db.ref("/logs").child(dataExtendJson.namespace).child("log").push(body);
}

async function updateStatusRunning(isRunning: boolean = true) {
  await db
    .ref("/logs")
    .child(dataExtendJson.namespace)
    .child("isRunning")
    .set(isRunning);
}

async function getPort() {
  const res = await fetch("https://wibu-bot.wibudev.com/api/find-port");
  const portJson = await res.json();
  return portJson;
}

async function handleStep(
  shell: () => Promise<ShellOutput>,
  params?: {
    info?: string;
  }
) {
  const { info = "running ..." } = params || {};
  await kirimLog("[RUN    ] ", info);
  try {
    const output = await shell();
    if (output.exitCode === 0) {
      await kirimLog("[SUCCESS] ", info);
      await kirimLog("[INFO   ] ", output.stdout.toString());
    } else {
      await kirimLog("[ERROR  ] ", output.stderr.toString());
      throw new Error(output.stderr.toString());
    }
  } catch (error) {
    await kirimLog("[ERROR  ] ", error || "Unknown error");
    throw error; // Re-throw untuk memastikan proses berhenti jika gagal
  }
}

(async () => {
  await updateStatusRunning();

  const port = await getPort();

  await kirimLog(Bun.inspect.table(_.omit(dataExtendJson, ["env"])));

  await handleStep(
    async () => {
      return await $`tree -a -I node_modules -I .next -L 1`.nothrow();
    },
    {
      info: "tree sebelum clone ...",
    }
  );

  await handleStep(
    async () => {
      return await $`git clone --branch ${dataExtendJson.branch} https://x-access-token:${dataRequiredJson.githubToken}@github.com/bipproduction/${dataExtendJson.repo}.git ${dataExtendJson.appVersion}`;
    },
    {
      info: "clone ...",
    }
  );

  await handleStep(
    async () => {
      return await $`tree -a -I node_modules -L 1`
        .cwd(dataExtendJson.appVersion)
        .nothrow();
    },
    {
      info: "tree setelah clone ...",
    }
  );

  await handleStep(
    async () =>
      $`echo ${dataExtendJson.env} > .env`.cwd(dataExtendJson.appVersion),
    {
      info: "generate env ...",
    }
  );

  await handleStep(
    async () => {
      return await $`bun install`.cwd(dataExtendJson.appVersion);
    },
    {
      info: "install ...",
    }
  );

  await handleStep(
    async () => {
      return await $`bunx prisma db push`.cwd(dataExtendJson.appVersion);
    },
    {
      info: "db push ...",
    }
  );

  await handleStep(
    async () => {
      return await $`bunx prisma db seed`
        .cwd(dataExtendJson.appVersion)
        .nothrow();
    },
    {
      info: "seed ...",
    }
  );

  // handle build
  await handleStep(
    async () => $`bun --bun run build`.cwd(dataExtendJson.appVersion),
    {
      info: "run build ...",
    }
  );

  // hapus .git dan node_modules
  await handleStep(
    async () => {
      return await $`rm -rf .git node_modules`
        .cwd(dataExtendJson.appVersion)
        .nothrow();
    },
    {
      info: "cleaning ...",
    }
  );

  // check dir
  await handleStep(
    async () => {
      return await $`tree -a -I node_modules -L 1`
        .cwd(dataExtendJson.appVersion)
        .nothrow();
    },
    {
      info: "tree sesudah build ...",
    }
  );

  const cmdCreateRsa = dedent`
    cat <<EOF > ~/.id_rsa
    ${dataRequiredJson.ssh.key}
    EOF
    chmod 600 ~/.id_rsa
  `;
  await handleStep(async () => $`${cmdCreateRsa}`, {
    info: "create rsa ...",
  });

  // create dir on the server
  const cmdCreateDir = dedent`
  mkdir -p /var/www/projects/${dataExtendJson.name}/${dataExtendJson.namespace}/releases/${dataExtendJson.appVersion}
  `;
  await handleStep(
    async () =>
      $`ssh -i ~/.id_rsa ${dataRequiredJson.ssh.user}@${dataRequiredJson.ssh.host} -t "${cmdCreateDir}"`.cwd(
        process.cwd()
      ),
    {
      info: "create dir on the server ...",
    }
  );

  // upload dir
  const cmdUploadDir = dedent`
  scp -r -i ~/.id_rsa \
  ./${dataExtendJson.appVersion}/ \
  ${dataRequiredJson.ssh.user}@${dataRequiredJson.ssh.host}:/var/www/projects/${dataExtendJson.name}/${dataExtendJson.namespace}/releases/${dataExtendJson.appVersion}
 `;
  await handleStep(
    async () => {
      return await $`${cmdUploadDir}`;
    },
    {
      info: "upload dir ...",
    }
  );
})()
  .then(async () => {
    await kirimLog("[INFO-FINAL] ", "Proccess Finished ...");
  })
  .catch(async (error) => {
    console.log(error);
    await updateStatusRunning(false);
    await kirimLog("[ERROR-FINAL]", JSON.stringify(error));
  })
  .finally(async () => {
    await kirimLog("[FINAL]", "Proccess Finished ...");
    await updateStatusRunning(false);
    setTimeout(() => {
      process.exit(0);
    }, 5000);
  });
