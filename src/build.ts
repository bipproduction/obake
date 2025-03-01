const OWNER = "bipproduction";
const REPO = "obake";
const WORKFLOW_ID = "build.yml";

const TOKEN = process.env.TOKEN;
async function dispatch() {
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
          key: TOKEN,
        },
      }),
    }
  );
  const dataText = await res.text();
  console.log(dataText);
}

dispatch();
