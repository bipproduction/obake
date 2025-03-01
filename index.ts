import minimist from "minimist";
import fs from "fs/promises";
const argv = minimist(process.argv.splice(2));

const dataString = await fs.readFile("index.json", "utf-8");
const data = JSON.parse(dataString);
console.log(JSON.stringify(data, null, 2));

