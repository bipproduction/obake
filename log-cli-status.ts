import log from "./src/lib/log";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2));

const status = argv._[0];
if (!status) {
  console.error("args not found");
  process.exit(1);
}

const { updateStatusRunning, close } = await log();

updateStatusRunning(status === "true");
setTimeout(() => {
  close();
}, 3000);
