import { $, type ShellOutput } from "bun";
import CryptoJS from "crypto-js";
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

let logData = "";
async function kirimLog(...args: any[]) {
  const body = args.join(" ");

  logData += `\n${body}`;

  await fetch(`${dataRequiredJson.firebase.databaseURL}/logs.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      [dataExtendJson.appVersion]: logData,
    }),
  });
}

async function getPort() {
  const res = await fetch("https://wibu-bot.wibudev.com/api/find-port");
  const portJson = await res.json();
  return portJson;
}

const port = await getPort();

await kirimLog(Bun.inspect.table(_.omit(dataExtendJson, ["env"])));

async function handleStep(
  shell: () => Promise<ShellOutput>,
  params?: {
    info?: string;
    skipError?: boolean;
  }
) {
  const { info = "running ...", skipError = false } = params || {};
  await kirimLog("[INFO] ", info);
  const output = await shell();
  if (output.exitCode !== 0 && !skipError) {
    await kirimLog("[ERROR]", output.stderr.toString());
    await kirimLog("{{ close }}");
    process.exit(1);
  } else if (output.exitCode !== 0 && skipError) {
    await kirimLog("[ERROR]", "skipping ...");
    await kirimLog("[ERROR]", output.stderr.toString());
  } else {
    await kirimLog("[INFO] ", "success");
    await kirimLog("[INFO] ", output.stdout.toString());
  }
}

await handleStep(
  async () => {
    return await $`git clone https://x-access-token:${dataRequiredJson.githubToken}@github.com/bipproduction/${dataExtendJson.repo}.git ${dataExtendJson.appVersion}`
      .nothrow()
      .quiet();
  },
  {
    info: "clone ...",
  }
);

await handleStep(
  async () => {
    return await $`bun install`
      .cwd(dataExtendJson.appVersion)
      .nothrow()
      .quiet();
  },
  {
    info: "install ...",
  }
);

await handleStep(
  async () => {
    return await $`bunx prisma db push`
      .cwd(dataExtendJson.appVersion)
      .nothrow()
      .quiet();
  },
  {
    info: "db push ...",
    skipError: true,
  }
);

await handleStep(
  async () => {
    return await $`bunx prisma db seed`
      .cwd(dataExtendJson.appVersion)
      .nothrow()
      .quiet();
  },
  {
    info: "seed ...",
    skipError: true,
  }
);

// await kirimLog("[INFO] ", "cloning ...");
// await kirimLog("[INFO] ", clone.stdout.toString());
// if (clone.exitCode !== 0) {
//   await kirimLog("[ERROR]", clone.stderr.toString());
//   await kirimLog("{{ close }}");
//   process.exit(1);
// }

// const installDependency = await $`bun install`
//   .cwd(dataExtendJson.appVersion)
//   .nothrow()
//   .quiet();
// await kirimLog("[INFO] ", "installing ...");
// await kirimLog("[INFO] ", installDependency.stdout.toString());
// if (installDependency.exitCode !== 0) {
//   await kirimLog("[ERROR]", installDependency.stderr.toString());
//   await kirimLog("{{ close }}");
//   process.exit(1);
// }

// const dbPush = await $`bunx prisma db push`
//   .cwd(dataExtendJson.appVersion)
//   .nothrow()
//   .quiet();

// await kirimLog("[INFO] ", "db pushing ...");
// await kirimLog("[INFO] ", dbPush.stdout.toString());
// if (dbPush.exitCode !== 0) {
//   await kirimLog("[ERROR]", dbPush.stderr.toString());
//   await kirimLog("{{ close }}");
//   process.exit(1);
// }

// const dbSeed = await $`bunx prisma db seed`
//   .cwd(dataExtendJson.appVersion)
//   .nothrow()
//   .quiet();

// await kirimLog("[INFO] ", "db seeding ...");
// await kirimLog("[INFO] ", dbSeed.stdout.toString());
// if (dbSeed.exitCode !== 0) {
//   await kirimLog("[ERROR]", dbSeed.stderr.toString());
//   await kirimLog("{{ close }}");
//   process.exit(1);
// }

// const build = await $`bun --bun run build`
//   .cwd(dataExtendJson.appVersion)
//   .nothrow()
//   .quiet();

// await kirimLog("[INFO] ", "building ...");
// await kirimLog("[INFO] ", build.stdout.toString());
// if (build.exitCode !== 0) {
//   await kirimLog("[ERROR]", build.stderr.toString());
//   await kirimLog("{{ close }}");
//   process.exit(1);
// }

await kirimLog("{{ close }}");
process.exit(0);
