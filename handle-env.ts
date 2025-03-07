#!/usr/bin/env bun

import { $ } from "bun";
import CryptoJS from "crypto-js";
import _ from "lodash";
import minimist from "minimist";
import fs from "fs/promises";

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
  await $`echo "WIBU_NAME=${appDataJson.name}" >> $GITHUB_ENV"`;
  await $`echo "WIBU_NAMESPACE=${appDataJson.namespace}" >> $GITHUB_ENV"`;
  await $`echo "WIBU_REPO=${appDataJson.repo}" >> $GITHUB_ENV"`;
  await $`echo "WIBU_BRANCH=${appDataJson.branch}" >> $GITHUB_ENV"`;
  await fs.writeFile(".env.app", appDataJson.env);
})();