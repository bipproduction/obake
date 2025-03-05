import CryptoJS from "crypto-js";
import dayjs from "dayjs";
import dedent from "dedent";
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
  namespace: "drm-prod",
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
console.log(dataText);

const firebaseText = "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";
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
