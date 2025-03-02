import minimist from "minimist";
import fs from "fs/promises";
import CryptoJS from "crypto-js";
import { fAdmin } from "@/fadmin";
import { $, type ShellOutput } from "bun";

const argv = minimist(process.argv.splice(2));

const data = argv.data;
const key = argv.key;

if (!data) {
  console.error("data not found");
  process.exit(1);
}

if (!key) {
  console.error("key not found");
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
  db.ref("/logs").child(dataJson.namespace).child("log").push(body);
}

async function updateStatusRunning(isRunning: boolean = true) {
  db.ref("/logs").child(dataJson.namespace).child("isRunning").set(isRunning);
}

async function step(
  { title }: { title: string },
  shell: () => Promise<ShellOutput>
) {
  await kirimLog("[RUN    ] ", title);
  const { stdout, stderr, exitCode } = await shell();
  if (exitCode !== 0) {
    await kirimLog("[ERROR  ] ", stderr.toString());
    throw new Error(stderr.toString());
  } else {
    await kirimLog("[SUCCESS] ", title);
    await kirimLog("[INFO   ] ", stdout.toString());
  }
}

async function main() {
  await step(
    {
      title: "clone project",
    },
    () => $`git clone --branch ${dataJson.branch} https://x-access-token:${key}@github.com/bipproduction/${dataJson.repo}.git ${dataJson.appVersion}`
  );
}

main()
  .then(() => {
    kirimLog("[SUCCESS]", "Proccess Finished ...");
    process.exit(0);
  })
  .catch((error) => {
    kirimLog("[ERROR]", error);
    process.exit(1);
  })
