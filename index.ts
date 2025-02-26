import minimist from "minimist";
import path from "path";
import fs from "fs";
import { file } from "bun";
const argv = minimist(process.argv.splice(2));
const root = path.resolve();
const dataLocal = await file(path.resolve(root, "assets/data-local.json")).json();
console.log(JSON.stringify(dataLocal), null, 2);

