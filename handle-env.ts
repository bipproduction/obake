#!/usr/bin/env bun

import { $ } from "bun";
import CryptoJS from "crypto-js";
import _ from "lodash";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2));

const data = argv.data;
if (!data) {
  console.error("data not found");
  process.exit(1);
}

const listData = data.split("[x]");
const TOKEN = listData[0];
const firebase = listData[1];
const appData = listData[2];
const key = listData[3];

// const dcryptFirebase = CryptoJS.AES.decrypt(firebase, key).toString(
//   CryptoJS.enc.Utf8
// );
const dcryptAppData = CryptoJS.AES.decrypt(appData, key).toString(
  CryptoJS.enc.Utf8
);

// const firebaseJson = JSON.parse(dcryptFirebase);
const appDataJson = JSON.parse(dcryptAppData);

// const app = admin.initializeApp({
//   credential: admin.credential.cert(firebaseJson.credential),
//   databaseURL: firebaseJson.databaseURL,
// });

// const db = app.database();

;(async () => {
  const listKey = Object.keys(appDataJson);
  for (const key of listKey) {
    await $`echo WIBU_${_.upperCase(key)}=${appDataJson[key]} >> $GITHUB_ENV`;
  }
})();