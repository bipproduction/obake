import minimist from "minimist";
import fs from "fs/promises";
const argv = minimist(process.argv.splice(2));

const dataString = await fs.readFile("data.json", "utf-8");
console.log(dataString);
