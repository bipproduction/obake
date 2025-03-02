import dayjs from "dayjs";
import dedent from "dedent";
import CryptoJS from "crypto-js";
import db from "@/lib/db";

const OWNER = "bipproduction";
const REPO = "obake";
const WORKFLOW_ID = "build.yml";

const name = "darmasaba";
const namespace = "darmasaba-prod";
const repo = "sistem-desa-mandiri";
const branch = "main";
const date = dayjs().format("YYYY-MM-DD_HH-mm-ss");

const TOKEN = process.env.TOKEN!;

if (!TOKEN) {
  console.error("TOKEN not found");
  process.exit(1);
}

// Escape special characters in the `env` field
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
  name,
  repo,
  branch,
  namespace,
  date,
  env,
};

const encyptData = CryptoJS.AES.encrypt(
  JSON.stringify(dataExtend),
  process.env.TOKEN!
);

async function dispatch() {
  await db
    .ref("/logs")
    .child(dataExtend.namespace)
    .child("isRunning")
    .set(true);
  db.ref("/logs")
    .child(dataExtend.namespace)
    .child("log")
    .remove();
  try {
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
            data: encyptData.toString(),
          },
        }),
      }
    );

    // Log response details
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Request failed with status ${res.status}: ${errorText}`);
      return;
    }

    const dataText = await res.text();
    console.log("Dispatch running ...", dataText);

    db.ref("/logs")
      .child(dataExtend.namespace)
      .child("log")
      .on("value", (snapshot) => {
        const log = snapshot.val() || {};
        for (const key in log) {
          console.log(log[key]);
        }
      });
  } catch (error) {
    console.error("An error occurred while dispatching the workflow:", error);
  }
}

dispatch();
