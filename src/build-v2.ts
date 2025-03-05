import CryptoJS from "crypto-js";
import dayjs from "dayjs";
import dedent from "dedent";
import admin from "firebase-admin";

const OWNER = "bipproduction";
const REPO = "obake";
const WORKFLOW_ID = "build.yml";
const TOKEN = process.env["TOKEN"];
const key = "makuro"

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
  key
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
const decryptFirebase = CryptoJS.AES.decrypt(firebaseText, key).toString(
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
