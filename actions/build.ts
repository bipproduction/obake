#!/usr/bin/env bun

import { $ } from "bun";
import CryptoJS from "crypto-js";
import admin from "firebase-admin";
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


const dcryptFirebase = CryptoJS.AES.decrypt(firebase, key).toString(
  CryptoJS.enc.Utf8
);
const dcryptAppData = CryptoJS.AES.decrypt(appData, key).toString(
  CryptoJS.enc.Utf8
);

const firebaseJson = JSON.parse(dcryptFirebase);
const appDataJson = JSON.parse(dcryptAppData);

const app = admin.initializeApp({
  credential: admin.credential.cert(firebaseJson.credential),
  databaseURL: firebaseJson.databaseURL,
});

const db = app.database();

async function main() {
  await $`echo NAME_SPACE="${appDataJson.namespace}" >> $GITHUB_ENV`;
  await $`echo DIR_SOURCE="${appDataJson.appVersion}" >> $GITHUB_ENV`;
  await $`echo DIR_RELEASES="/var/www/projects/${appDataJson.name}/${appDataJson.namespace}/releases" >> $GITHUB_ENV`;
  await $`echo DIR_TARGET_CWD="/var/www/projects/${appDataJson.name}/${appDataJson.namespace}" >> $GITHUB_ENV`;

  await $`git clone --branch ${appDataJson.branch} https://x-access-token:${TOKEN}@github.com/bipproduction/${appDataJson.repo}.git ${appDataJson.appVersion}`;
  await $`echo "${appDataJson.env}" > .env`.cwd(appDataJson.appVersion);
  await $`bun install`.cwd(appDataJson.appVersion);
  await $`bunx prisma db push`.cwd(appDataJson.appVersion);
  await $`bunx prisma db seed`.nothrow().cwd(appDataJson.appVersion);
  await $`bun --bun run build`.cwd(appDataJson.appVersion);
  await $`rm -rf node_modules`.cwd(appDataJson.appVersion);
}

main()
  .then((err) => {
    console.log("success");
    process.exit(0);
  })
  .catch((error) => {
    $`echo "error: ${error}" >> build.log`.cwd(appDataJson.appVersion);
    console.error(error);
    process.exit(1);
  });
