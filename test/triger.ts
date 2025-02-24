import dedent from "dedent";
const TOKEN = process.env.TOKEN;
const OWNER = "bipproduction";
const REPO = "obake";
const WORKFLOW_ID = "main.yml";

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
        data: dedent`
        TOKEN=${TOKEN}
        APP_NAME=darmasaba
        `,
      },
    }),
  }
)
  .then((response) => response.text())
  .then((text) => console.log(text));
