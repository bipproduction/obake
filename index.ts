import { exec } from "child_process";
import { promisify } from "util";
import { fAdmin } from "@/fadmin";
import CryptoJS from "crypto-js";
import dedent from "dedent";
import _ from "lodash";
import minimist from "minimist";

// Promisify exec untuk menggunakan async/await
const execPromise = promisify(exec);

// Tipe untuk output shell
interface ShellOutput {
  stdout: string;
  stderr: string;
}

// Parsing argumen CLI
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

// Dekripsi data
const dataRequired = CryptoJS.AES.decrypt(data_required, key).toString(
  CryptoJS.enc.Utf8
);
const dataRequiredJson = JSON.parse(dataRequired);
const extendData = CryptoJS.AES.decrypt(data_extend, key).toString(
  CryptoJS.enc.Utf8
);
const dataExtendJson = JSON.parse(extendData);

// Firebase Admin SDK
const admin = fAdmin({
  credential: dataRequiredJson.firebase.credential,
  databaseURL: dataRequiredJson.firebase.databaseURL,
});
const db = admin.database();

// Logging ke Firebase
async function kirimLog(...args: string[]) {
  const body = args.join(" ");
  await db.ref("/logs").child(dataExtendJson.namespace).child("log").push(body);
}

// Update status running
async function updateStatusRunning(isRunning: boolean = true) {
  await db
    .ref("/logs")
    .child(dataExtendJson.namespace)
    .child("isRunning")
    .set(isRunning);
}

// Fungsi untuk menjalankan perintah shell
async function runCommand(
  command: string,
  options: { cwd?: string } = {}
): Promise<ShellOutput> {
  try {
    const { stdout, stderr } = await execPromise(command, options);
    return { stdout, stderr };
  } catch (error: any) {
    throw new Error(error.stderr || error.message || "Unknown error");
  }
}

// Handler untuk setiap langkah
async function handleStep(
  shell: () => Promise<ShellOutput>,
  params?: { info?: string }
) {
  const { info = "running ..." } = params || {};
  await kirimLog("[RUN    ] ", info);
  try {
    const output = await shell();
    if (output.stderr) {
      await kirimLog("[ERROR  ] ", output.stderr);
      throw new Error(output.stderr);
    }
    await kirimLog("[SUCCESS] ", info);
    await kirimLog("[INFO   ] ", output.stdout);
  } catch (error: any) {
    await kirimLog("[ERROR  ] ", error.message || "Unknown error");
    throw error;
  }
}

(async () => {
  await updateStatusRunning();

  // Logging initial data
  await kirimLog(JSON.stringify(_.omit(dataExtendJson, ["env"])));

  // Tree before clone
  await handleStep(
    () =>
      runCommand(`tree -a -I node_modules -I .next -L 1`, {
        cwd: process.cwd(),
      }),
    { info: "tree sebelum clone ..." }
  );

  // Git clone
  await handleStep(
    () =>
      runCommand(
        `git clone --branch ${dataExtendJson.branch} https://x-access-token:${dataRequiredJson.githubToken}@github.com/bipproduction/${dataExtendJson.repo}.git ${dataExtendJson.appVersion}`
      ),
    { info: "clone ..." }
  );

  // Tree after clone
  await handleStep(
    () =>
      runCommand(`tree -a -I node_modules -L 1`, {
        cwd: dataExtendJson.appVersion,
      }),
    { info: "tree setelah clone ..." }
  );

  // Generate .env
  await handleStep(
    () =>
      runCommand(`echo '${dataExtendJson.env}' > .env`, {
        cwd: dataExtendJson.appVersion,
      }),
    { info: "generate env ..." }
  );

  // Bun install
  await handleStep(
    () =>
      runCommand(`bun install`, {
        cwd: dataExtendJson.appVersion,
      }),
    { info: "install ..." }
  );

  // Prisma db push
  await handleStep(
    () =>
      runCommand(`bunx prisma db push`, {
        cwd: dataExtendJson.appVersion,
      }),
    { info: "db push ..." }
  );

  // Prisma db seed
  await handleStep(
    () =>
      runCommand(`bunx prisma db seed`, {
        cwd: dataExtendJson.appVersion,
      }),
    { info: "seed ..." }
  );

  // Build
  await handleStep(
    () =>
      runCommand(`bun --bun run build`, {
        cwd: dataExtendJson.appVersion,
      }),
    { info: "run build ..." }
  );

  // Cleaning
  await handleStep(
    () =>
      runCommand(`rm -rf .git node_modules`, {
        cwd: dataExtendJson.appVersion,
      }),
    { info: "cleaning ..." }
  );

  // Tree after build
  await handleStep(
    () =>
      runCommand(`tree -a -I node_modules -L 1`, {
        cwd: dataExtendJson.appVersion,
      }),
    { info: "tree sesudah build ..." }
  );

  // Create RSA key
  const cmdCreateRsa = dedent`
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
    cat <<EOF > ~/.ssh/id_rsa
    ${dataRequiredJson.ssh.key}
    EOF
    chmod 600 ~/.ssh/id_rsa
    ssh-keyscan ${dataRequiredJson.ssh.host} >> ~/.ssh/known_hosts
    chmod 644 ~/.ssh/known_hosts
  `;
  await handleStep(() => runCommand(cmdCreateRsa), { info: "create rsa ..." });

  // Create directory on the server
  const cmdCreateDir = dedent`
    mkdir -p /var/www/projects/${dataExtendJson.name}/${dataExtendJson.namespace}/releases/${dataExtendJson.appVersion}
  `;
  await handleStep(
    () =>
      runCommand(
        `ssh -i ~/.ssh/id_rsa ${dataRequiredJson.ssh.user}@${dataRequiredJson.ssh.host} -t "${cmdCreateDir}"`
      ),
    { info: "create dir on the server ..." }
  );

  // Upload directory
  const cmdUploadDir = dedent`
    scp -r -i ~/.ssh/id_rsa \
    ./${dataExtendJson.appVersion}/ \
    ${dataRequiredJson.ssh.user}@${dataRequiredJson.ssh.host}:/var/www/projects/${dataExtendJson.name}/${dataExtendJson.namespace}/releases/${dataExtendJson.appVersion}
  `;
  await handleStep(() => runCommand(cmdUploadDir), { info: "upload dir ..." });
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
