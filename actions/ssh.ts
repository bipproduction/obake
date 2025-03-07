import minimist from "minimist";
import { $ } from "bun";
import fs from "fs/promises";

const args = minimist(process.argv.slice(2));
const data = args.data.split("[x]");
const user = data[0];
const host = data[1];
const key = data[2];

await fs.writeFile(`./id_rsa`, key);
await fs.writeFile(`./id_rsa.pub`, key);
await $`chmod 600 ./id_rsa`;
await $`chmod 600 ./id_rsa.pub`;

try {
    const log = await $`ssh -i ./id_rsa root@wibudev.com -t "tree -L 3"`.text();
    console.log(log);
} catch (error) {
    console.log(error);
}


