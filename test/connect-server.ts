import dedent from "dedent";
const TOKEN = process.env.TOKEN;
const OWNER = "bipproduction";
const REPO = "obake";
const WORKFLOW_ID = "connect-server.yml";

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
        `,
      },
    }),
  }
)
  .then((res) => res.text())
  .then((text) => console.log(text));
