import minimist from "minimist";
import CryptoJS from "crypto-js";
import _ from "lodash";
import dedent from "dedent";

const argv = minimist(process.argv.slice(2));
const data = argv.data;

if (!data) {
  console.error("data not found");
  process.exit(1);
}

const listData = data.split("[x]");
const key = listData[0];
const firebase = listData[1];
const reqData = listData[2];

const decryptedData = CryptoJS.AES.decrypt(reqData, key).toString(
  CryptoJS.enc.Utf8
);
const jsonData = JSON.parse(decryptedData);

const keyData = Object.keys(jsonData);

let dataText = "";
for (const key of keyData) {
  dataText += `WIBU_${_.upperCase(key)}=${jsonData[key]}\n`;
}

console.log(dedent`${dataText}`);
