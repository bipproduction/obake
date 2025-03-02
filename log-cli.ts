import log from "./src/lib/log";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2));

const message = argv._[0];
if (!message) {
  console.error("args not found");
  process.exit(1);
}

const { kirimLog } = await log();
const args = argv;
kirimLog("[MESSAGE]".padEnd(10, " "),message);