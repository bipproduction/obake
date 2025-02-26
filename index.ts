import { file } from "bun";
import CryptoJS from "crypto-js";
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

async function kirimData(params: { body: string }) {
  const { body } = params;
  await fetch(`${dataPenting.firebase.databaseURL}/logs.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
}

for (let i = 0; i < 10; i++) {
  await kirimData({
    body: JSON.stringify({ log: `halo apa kabar ini adalah lognya ${i}` }),
  });
  Bun.sleep(1000);
}
