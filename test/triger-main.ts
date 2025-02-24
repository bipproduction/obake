import dedent from "dedent";
import { resolve } from "path";
const TOKEN = process.env.TOKEN;
const OWNER = "bipproduction";
const REPO = "obake";
const WORKFLOW_ID = "main.yml";

const root = process.cwd();
const filePath = resolve(root, "key.pub");
const keyString = await Bun.file(filePath).text();

fetch(
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
        secret: dedent`
        TOKEN=${TOKEN}
        APP_NAME="sistem-desa-mandiri"
        BASE_NAME="darmasaba"
        REPO="sistem-desa-mandiri"
        WA_PHONE="6289697338821,6289697338822"
        BRANCH_NAME="main"
        UPLOAD_LOG_URL="https://wibu-bot.wibudev.com/api/file"
        `,
        env: dedent`
        DATABASE_URL="postgresql://bip:Production_123@localhost:5432/sistem_desa_mandiri?schema=public"
        URL="http://localhost:3000"
        WS_APIKEY="eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImlkIjoiY20wdnQ4bzFrMDAwMDEyenE1eXl1emd5YiIsIm5hbWUiOiJhbWFsaWEiLCJlbWFpbCI6ImFtYWxpYUBiaXAuY29tIiwiQXBpS2V5IjpbeyJpZCI6ImNtMHZ0OG8xcjAwMDIxMnpxZDVzejd3eTgiLCJuYW1lIjoiZGVmYXVsdCJ9XX0sImlhdCI6MTcyNTkzNTE5MiwiZXhwIjo0ODgxNjk1MTkyfQ.7U-HUnNBDmeq_6XXohiFZjFnh2rSzUPMHDdrUKOd7G4"
        NEXT_PUBLIC_VAPID_PUBLIC_KEY=BBC6ml3Ro9eBdhSq_DPx0zQ0hBH4NvOeJbFXdQy3cZ-UyJ2m6V1RyO1XD9B08kshTdVNoGZeqBDKBPzpWgwRBNY
        VAPID_PRIVATE_KEY=p9GfSmCRJe1_dzwKqe29HF81mTE2JwlrW4cXINnkI7c
        WIBU_REALTIME_KEY="padahariminggukuturutayahkekotanaikdelmanistimewakududukdimuka"
        `,
        host: "wibudev.com",
        username: "root",
        key: keyString,
      },
    }),
  }
)
  .then((response) => response.text())
  .then((text) => console.log(text));
