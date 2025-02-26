import { fAdmin } from "./fadmin";
import getDataPenting from "./get-data-penting";
import minimist from "minimist";

const argv = minimist(process.argv.splice(2));

if (!argv.key) {
  console.error("key not found");
  process.exit(1);
}

const dataPenting = await getDataPenting(argv.key);
const admin = fAdmin({
  credential: dataPenting.firebase.credential,
  databaseURL: dataPenting.firebase.databaseURL,
});

const db = admin.database();
db.ref("/logs").on("value", (snapshot) => {
  console.clear()
  const log = snapshot.val()?.log || "";
  console.log(log);
});
