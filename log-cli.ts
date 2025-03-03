import log from "./src/lib/log";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2));

const message = argv._[0];
if (!message) {
  console.error("args not found");
  process.exit(1);
}

const { kirimLog, close } = await log();
kirimLog("[MESSAGE]".padEnd(10, " "), message);
setTimeout(() => {
    close();
}, 3000)
