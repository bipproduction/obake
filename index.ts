import minimist from "minimist";
import path from "path";
import fs from "fs";
const argv = minimist(process.argv.splice(2));
const root = path.resolve();
const dataLocal = fs.readFileSync(path.resolve(root, "assets/data-local.json"), "utf-8");
console.log(JSON.stringify(dataLocal), null, 2);

