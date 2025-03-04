import dayjs from "dayjs";
import dedent from "dedent";
import CryptoJS from "crypto-js";
import path from "path";
import fs from "fs/promises";
import admin from "firebase-admin";

const OWNER = "bipproduction";
const REPO = "obake";
const WORKFLOW_ID = "build.yml";
const TOKEN = process.env["TOKEN"];

if (!TOKEN) {
  console.error("TOKEN not found");
  process.exit(1);
}

const data = {
  name: "darmasaba",
  namespace: "darmasaba-prod",
  appVersion: "",
  repo: "sistem-desa-mandiri",
  branch: "main",
  date: dayjs().format("YYYY-MM-DD_HH-mm-ss"),
  env: dedent`
        DATABASE_URL="postgresql://bip:Production_123@localhost:5433/sistem_desa_mandiri?schema=public"
        URL="http://localhost:3000"
        WS_APIKEY="eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImlkIjoiY20wdnQ4bzFrMDAwMDEyenE1eXl1emd5YiIsIm5hbWUiOiJhbWFsaWEiLCJlbWFpbCI6ImFtYWxpYUBiaXAuY29tIiwiQXBpS2V5IjpbeyJpZCI6ImNtMHZ0OG8xcjAwMDIxMnpxZDVzejd3eTgiLCJuYW1lIjoiZGVmYXVsdCJ9XX0sImlhdCI6MTcyNTkzNTE5MiwiZXhwIjo0ODgxNjk1MTkyfQ.7U-HUnNBDmeq_6XXohiFZjFnh2rSzUPMHDdrUKOd7G4"
        NEXT_PUBLIC_VAPID_PUBLIC_KEY=BBC6ml3Ro9eBdhSq_DPx0zQ0hBH4NvOeJbFXdQy3cZ-UyJ2m6V1RyO1XD9B08kshTdVNoGZeqBDKBPzpWgwRBNY
        VAPID_PRIVATE_KEY=p9GfSmCRJe1_dzwKqe29HF81mTE2JwlrW4cXINnkI7c
        WIBU_REALTIME_KEY="padahariminggukuturutayahkekotanaikdelmanistimewakududukdimuka"
    `,
};

data["appVersion"] = `${data["repo"]}_${data["branch"]}_${data["date"]}`;

const encryptData = CryptoJS.AES.encrypt(
  JSON.stringify(data),
  TOKEN
).toString();

const res = await fetch(
  `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_ID}/dispatches`,
  {
    method: "POST",
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
    body: JSON.stringify({
      ref: "main",
      inputs: {
        data: encryptData,
      },
    }),
  }
);
const dataText = await res.text();

const firebaseText = await fs.readFile(
  path.resolve(process.cwd(), "firebase.txt"),
  "utf-8"
);
const decryptFirebase = CryptoJS.AES.decrypt(firebaseText, TOKEN).toString(
  CryptoJS.enc.Utf8
);

const firebaseJson = JSON.parse(decryptFirebase);

const app = admin.initializeApp({
  credential: admin.credential.cert(firebaseJson.credential),
  databaseURL: firebaseJson.databaseURL,
});

const db = app.database();

db.ref("/logs").child(data.namespace).child("isRunning").set(true);
db.ref("/logs").child(data.namespace).child("log").remove();
db.ref("/logs").child(data.namespace).child("log").push("[START]");

db.ref("/logs")
  .child(data.namespace)
  .child("log")
  .on("value", (snapshot) => {
    const dataString = snapshot.val();
    if (dataString) {
      const listData = Object.values(dataString);
      for (const data of listData) {
        console.log(data);
      }
    }
  });
