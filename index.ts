import minimist from "minimist";
import fs from "fs/promises";
import CryptoJS from "crypto-js";
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

const decryptedData = CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
const dataJson = JSON.parse(decryptedData);
console.log(JSON.stringify(dataJson, null, 2))
