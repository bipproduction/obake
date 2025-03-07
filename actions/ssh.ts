import minimist from "minimist";
import { $ } from "bun";
import fs from "fs/promises";

const args = minimist(process.argv.slice(2));
const data = args.data.split("[x]");
const user = data[0];
const host = data[1];
const key = data[2];
const dir = data[3];

await fs.writeFile(`./id_rsa`, key);
await fs.writeFile(`./id_rsa.pub`, key);
await $`chmod 600 ./id_rsa`;
await $`chmod 600 ./id_rsa.pub`;

console.log(await fs.readFile(`./id_rsa`, "utf-8"));
