import minimist from "minimist";
import fs from "fs/promises";
import CryptoJS from "crypto-js";
import { fAdmin } from "@/lib/fadmin";
import { $, type ShellOutput } from "bun";

const argv = minimist(process.argv.splice(2));

const data = argv.data;
const key = argv.key;

const vps_host = argv["vps-host"];
const vps_user = argv["vps-user"];


if (!data) {
  console.error("data not found");
  process.exit(1);
}

if (!key) {
  console.error("key not found");
  process.exit(1);
}

if (!vps_host) {
  console.error("vps_host not found");
  process.exit(1);
}

if (!vps_user) {
  console.error("vps_user not found");
  process.exit(1);
}

const decryptedData = CryptoJS.AES.decrypt(data, key).toString(
  CryptoJS.enc.Utf8
);
const dataJson: {
  appVersion: string;
  name: string;
  namespace: string;
  repo: string;
  branch: string;
  env: string;
  date: string;
} = JSON.parse(decryptedData);

const firebaseString = await fs.readFile("firebase.txt", "utf-8");
const decryptFirebase = CryptoJS.AES.decrypt(firebaseString, key).toString(
  CryptoJS.enc.Utf8
);
const firebaseJson: { credential: string; databaseURL: string } =
  JSON.parse(decryptFirebase);

const admin = fAdmin({
  credential: firebaseJson.credential,
  databaseURL: firebaseJson.databaseURL,
});

const db = admin.database();

async function kirimLog(...args: any[]) {
  const body = args.join(" ");
  await db.ref("/logs").child(dataJson.namespace).child("log").push(body);
  console.log(body);
}

async function updateStatusRunning(isRunning: boolean = true) {
  await db
    .ref("/logs")
    .child(dataJson.namespace)
    .child("isRunning")
    .set(isRunning);
}

async function step(
  { title }: { title: string },
  shell: () => Promise<ShellOutput>
) {
  await kirimLog("[RUN]".padEnd(10, " "), title);
  const { stdout, stderr, exitCode, text } = await shell();
  if (exitCode !== 0) {
    await kirimLog("[ERROR]".padEnd(10, " "), stderr.toString());
    throw new Error(stderr.toString());
  } else {
    await kirimLog("[SUCCESS]".padEnd(10, " "), title);
    await kirimLog("[INFO]".padEnd(10, " "), stdout.toString());
  }
}

async function main() {
  await updateStatusRunning();
  await step(
    {
      title: "clone project",
    },
    () =>
      $`git clone --branch \
    ${dataJson.branch} \
    https://x-access-token:${key}@github.com/bipproduction/${dataJson.repo}.git \
    ${dataJson.appVersion}`
  );

  await step(
    {
      title: "create env",
    },
    () => $`echo "${dataJson.env}" > .env`.cwd(dataJson.appVersion)
  );

  await step(
    {
      title: "install dependencies",
    },
    () => $`bun install`.cwd(dataJson.appVersion)
  );

  await step(
    {
      title: "db push",
    },
    () => $`bunx prisma db push`.cwd(dataJson.appVersion)
  );

  await step(
    {
      title: "db seeder",
    },
    () => $`bunx prisma db seed`.cwd(dataJson.appVersion).nothrow()
  );

  await step(
    {
      title: "run build",
    },
    () => $`bun --bun run build`.cwd(dataJson.appVersion)
  );

  await step(
    {
      title: "server create dir",
    },
    () => $`ssh -i ~/.ssh/id_rsa ${vps_user}@${vps_host} -t "mkdir -p /var/www/projects/${dataJson.name}/${dataJson.namespace}/releases/${dataJson.appVersion}"`
  );

  await step(
    {
      title: "server push",
    },
    () => $`scp -i ~/.ssh/id_rsa -r ${dataJson.appVersion}/* ${vps_user}@${vps_host}:/var/www/projects/${dataJson.name}/${dataJson.namespace}/releases/${dataJson.appVersion}`
  );
}

main()
  .then(() => {
    kirimLog("[SUCCESS]".padEnd(10, " "), "Proccess Finished ...");
    updateStatusRunning(false);
    process.exit(0);
  })
  .catch((error) => {
    kirimLog("[ERROR]".padEnd(10, " "), error);
    updateStatusRunning(false);
    process.exit(1);
  });
