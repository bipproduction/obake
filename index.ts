import { file } from "bun";
import CryptoJS from "crypto-js";
import dedent from "dedent";
import minimist from "minimist";
import path from "path";
const argv = minimist(process.argv.splice(2));

const key = argv.key;
if (!key) {
  console.error("key not found");
  process.exit(1);
}

const encryptedData = await file(
  path.resolve(process.cwd(), "data-penting.txt")
).text();
const dataString = CryptoJS.AES.decrypt(encryptedData, key).toString(
  CryptoJS.enc.Utf8
);
const dataPenting: DataPenting = JSON.parse(dataString);

let logData = dedent`
================ LOG DATA =================
${new Date().toISOString()}
===========================================
`;
async function kirimData(...args: any[]) {
  const body = args.join(" ");

  logData += `\n${body}`;

  await fetch(`${dataPenting.firebase.databaseURL}/logs.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      log: logData,
    }),
  });
}

async function getPort() {
  const res = await fetch("https://wibu-bot.wibudev.com/api/find-port");
  const portJson = await res.json();
  return portJson;
}

const port = await getPort();
const actionData = await file("action-data.txt").text();

await kirimData("action data", actionData);
await kirimData("port", port);
