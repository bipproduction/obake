import minimist from "minimist";
import { $ } from "bun";
import fs from "fs/promises";

const args = minimist(process.argv.slice(2));
const data = args.data.split("[x]");
const user = data[0];
const host = data[1];
const key = data[2];

await fs.writeFile("~/.ssh/id_rsa", key);
await fs.writeFile("~/.ssh/id_rsa.pub", key);
await $`chmod 600 ~/.ssh/id_rsa`;
await $`chmod 600 ~/.ssh/id_rsa.pub`;

console.log(await fs.readFile("~/.ssh/id_rsa", "utf-8"));
