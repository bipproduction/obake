import minimist from "minimist";
import { fAdmin } from "./fadmin";
import getRequiredData from "./get-required-data";
import { file } from "bun";
import path from "path";
import CryptoJS from "crypto-js";
import dayjs from "dayjs";
import dedent from "dedent";
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

const repo = "sistem-desa-mandiri";
const branch = "main";
const date = dayjs().format("YYYY-MM-DD_HH-mm-ss");
const env = dedent`
DATABASE_URL="postgresql://bip:Production_123@localhost:5433/sistem_desa_mandiri?schema=public"
URL="http://localhost:3000"
WS_APIKEY="eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImlkIjoiY20wdnQ4bzFrMDAwMDEyenE1eXl1emd5YiIsIm5hbWUiOiJhbWFsaWEiLCJlbWFpbCI6ImFtYWxpYUBiaXAuY29tIiwiQXBpS2V5IjpbeyJpZCI6ImNtMHZ0OG8xcjAwMDIxMnpxZDVzejd3eTgiLCJuYW1lIjoiZGVmYXVsdCJ9XX0sImlhdCI6MTcyNTkzNTE5MiwiZXhwIjo0ODgxNjk1MTkyfQ.7U-HUnNBDmeq_6XXohiFZjFnh2rSzUPMHDdrUKOd7G4"
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BBC6ml3Ro9eBdhSq_DPx0zQ0hBH4NvOeJbFXdQy3cZ-UyJ2m6V1RyO1XD9B08kshTdVNoGZeqBDKBPzpWgwRBNY
VAPID_PRIVATE_KEY=p9GfSmCRJe1_dzwKqe29HF81mTE2JwlrW4cXINnkI7c
WIBU_REALTIME_KEY="padahariminggukuturutayahkekotanaikdelmanistimewakududukdimuka"
`;

const id = `${repo}_${branch}_${date}`;
const dataExtend = {
  appVersion: id,
  name: "sistem desa mandiri",
  repo,
  branch,
  namespace: "darmasaba",
  date,
  env,
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
db.ref("/logs").child(id).set("loading ...");
db.ref("/logs").child(id).on("value", (snapshot) => {
  const dataString = snapshot.val();
  console.clear();
  console.log(dataString);
  if (dataString?.includes("{{ close }}")) {
    process.exit(0);
  }
});
