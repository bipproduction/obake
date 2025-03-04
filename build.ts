#!/usr/bin/env bun

import minimist from "minimist";
import admin from "firebase-admin";
import CryptoJS from "crypto-js";
import {$} from 'bun'

const argv = minimist(process.argv.slice(2));

const data = argv.data;
if (!data) {
  console.error("data not found");
  process.exit(1);
}

const listData = data.split("[x]");
const key = listData[0];
const firebase = listData[1];
const appData = listData[2];

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
    const envNameSpace = await $`echo NAME_SPACE="${appDataJson.namespace}" >> $GITHUB_ENV`
    const envProjectSource = await $`echo DIR_SOURCE="${appDataJson.appVersion}" >> $GITHUB_ENV`
    const envProjectTarget = await $`echo DIR_RELEASES="/var/www/projects/${appDataJson.name}/${appDataJson.namespace}/releases" >> $GITHUB_ENV`
    const envProjectRoot = await $`echo DIR_TARGET_CWD="/var/www/projects/${appDataJson.name}/${appDataJson.namespace}" >> $GITHUB_ENV`

    const clone = await $`git clone --branch ${appDataJson.branch} https://x-access-token:${key}@github.com/bipproduction/${appDataJson.repo}.git ${appDataJson.appVersion}`
    const env = await $`echo "${appDataJson.env}" > .env`.cwd(appDataJson.appVersion)
    const install = await $`bun install`.cwd(appDataJson.appVersion)
    const dbPush = await $`bunx prisma db push`.cwd(appDataJson.appVersion)
    const dbSeed = await $`bunx prisma db seed`.nothrow().cwd(appDataJson.appVersion)
    const build = await $`bun --bun run build 2>&1 | tee build.log`.cwd(appDataJson.appVersion)
    const cleaning = await $`rm -rf .git node_modules`.cwd(appDataJson.appVersion)
}

main()
  .then((err) => {
    console.log("success");
    process.exit(0);
  })
  .catch((error) => {
    $`echo "error: ${error}" >> build.log`.cwd(appDataJson.appVersion)
    console.error(error);
    process.exit(1);
  });
