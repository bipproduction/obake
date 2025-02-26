import { fAdmin } from "./fadmin";
import getDataPenting from "./get-data-penting";
import minimist from "minimist";
const argv = minimist(process.argv.splice(2));

const OWNER = "bipproduction";
const REPO = "obake";
const WORKFLOW_ID = "mainv2.yml";

const key = argv.key;
if (!key) {
  console.error("key not found");
  process.exit(1);
}

const dataPenting = await getDataPenting(key);

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
      },
    }),
  }
);

const dataText = await res.text();
console.log(dataText);

const admin = fAdmin({
  credential: dataPenting.firebase.credential,
  databaseURL: dataPenting.firebase.databaseURL,
});
const db = admin.database();
db.ref("/logs").on("value", (snapshot) => {
  console.log(snapshot.val());
});
