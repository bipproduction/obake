import minimist from "minimist";
import { fAdmin } from "./fadmin";
import getRequiredData from "./get-required-data";
import { file } from "bun";
import path from "path";
import CryptoJS from "crypto-js";
import dayjs from "dayjs";
const argv = minimist(process.argv.splice(2));

const OWNER = "bipproduction";
const REPO = "obake";
const WORKFLOW_ID = "mainv2.yml";

const encrypted_data_require = await file(
  path.resolve(process.cwd(), "data-required.txt")
).text();

const key = argv.key;
if (!key) {
  console.error("key not found");
  process.exit(1);
}

function convertDataExtend(params: {
  data: { [key: string]: any };
  key: string;
}) {
  const { data, key } = params;
  const encrypt = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  return encrypt;
}

const branch = "main";
const date = dayjs().format("YYYY-MM-DD_HH-mm-ss");

const id = `${branch}_${date}`;
const dataExtend = {
  id,
  name: "sistem desa mandiri",
  repo: "sistem-desa-mandiri",
  branch,
  namespace: "darmasaba",
  date,
};

const encryptedDataExtend = convertDataExtend({ data: dataExtend, key });

const res = await fetch(
  `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_ID}/dispatches`,
  {
    method: "POST",
    headers: {
      Authorization: `token ${key}`,
      Accept: "application/vnd.github.v3+json",
    },
    body: JSON.stringify({
      ref: "main",
      inputs: {
        key,
        data_required: encrypted_data_require,
        data_extend: encryptedDataExtend,
      },
    }),
  }
);

const dataText = await res.text();
console.log(dataText);

const dataPenting = await getRequiredData(key);
const admin = fAdmin({
  credential: dataPenting.firebase.credential,
  databaseURL: dataPenting.firebase.databaseURL,
});

const db = admin.database();
db.ref("/logs").child("log").set("loading ...");
db.ref("/logs").on("value", (snapshot) => {
  console.clear();
  console.log(snapshot.val()?.log ?? "");
});
