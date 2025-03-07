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

const [appData, key] = data.split("[x]");

const dcryptAppData = CryptoJS.AES.decrypt(appData, key).toString(
  CryptoJS.enc.Utf8
);

const appDataJson = JSON.parse(dcryptAppData);

;(async () => {
  const listKey = Object.keys(appDataJson);
  for (const key of listKey) {
    const dataEnv = `WIBU_${_.snakeCase(_.upperCase(key))}='${appDataJson[key]}'`;
    await $`echo "${dataEnv}" >> $GITHUB_ENV`;
    console.log(dataEnv);
  }
})();