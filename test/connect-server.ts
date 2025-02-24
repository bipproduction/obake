import { resolve } from "path";
const TOKEN = process.env.TOKEN;
const OWNER = "bipproduction";
const REPO = "obake";
const WORKFLOW_ID = "connect-server.yml";

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
        secret: "",
        env: "",
        host: "wibudev.com",
        username: "root",
        key: keyString,
      },
    }),
  }
)
  .then((res) => res.text())
  .then((text) => console.log(text));
