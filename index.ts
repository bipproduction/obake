import { fAdmin } from "@/fbase";
import { file } from "bun";
import minimist from "minimist";
import CryptoJS from "crypto-js";
const argv = minimist(process.argv.splice(2));

const key = argv.key;
if (!key) {
  console.error("key not found");
  process.exit(1);
}

const encryptedData = await file("data.txt").text();
const dataString = CryptoJS.AES.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8);
const data = JSON.parse(dataString);

console.log(JSON.stringify(data, null, 2));
