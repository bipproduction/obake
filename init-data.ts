import dedent from "dedent";
import minimist from "minimist";
import fs from "fs/promises";
import CryptoJS from "crypto-js";
import path from "path";

const argv = minimist(process.argv.splice(2));

const data = argv.data;
const key = await fs.readFile(path.resolve(process.cwd(), "token.txt"), "utf-8");
console.log(key)

if (!data) {
  console.error("data not found");
  process.exit(1);
}

if (!key) {
  console.error("key not found");
  process.exit(1);
}

const decryptedData = CryptoJS.AES.decrypt(data, key).toString(
  CryptoJS.enc.Utf8
);

type DataJson = {
  appVersion: string;
  name: string;
  namespace: string;
  repo: string;
  branch: string;
  env: string;
  date: string;
};
const dataJson: DataJson = JSON.parse(decryptedData);

const dataApp = dedent`
  DATA_NAME=${dataJson.name}
  DATA_APP_VERSION=${dataJson.appVersion}
  DATA_NAMESPACE=${dataJson.namespace}
  DATA_REPO=${dataJson.repo}
  DATA_BRANCH=${dataJson.branch}
  DATA_ENV=${dataJson.env}
  DATA_DATE=${dataJson.date}
  DATA_KEY=${key}
  `;
await fs.writeFile("data-app.txt", dataApp);
await fs.writeFile("data-app.json", JSON.stringify(dataJson, null, 2));

const dataUploadJson = {
  dirSource: dataJson.appVersion,
  dirTarget: `/var/www/projects/${dataJson.name}/${dataJson.namespace}/releases`,
  dirTargetProject: `/var/www/projects/${dataJson.name}/${dataJson.namespace}/releases/${dataJson.appVersion}`,
};
// generate data upload
const dataUpl = dedent`
  DIR_SOURCE=${dataUploadJson.dirSource}
  DIR_TARGET=${dataUploadJson.dirTarget}
  DIR_TARGET_PROJECT=${dataUploadJson.dirTargetProject}
  `;
await fs.writeFile("data-upload.txt", dataUpl);
await fs.writeFile("data-upload.json", JSON.stringify(dataUploadJson, null, 2));

export type DataRequired = {
  dataApp: DataJson;
  dataUpload: typeof dataUploadJson;
};
