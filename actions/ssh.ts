import minimist from "minimist";
import { $ } from "bun";
import fs from "fs/promises";

const args = minimist(process.argv.slice(2));
const data = args.data.split("[x]");
const user = data[0];
const host = data[1];

try {
    const log = await $`ssh -i ./id_rsa root@wibudev.com "echo 'Hello World'"`.text();
    console.log(log);
} catch (error) {
    console.log(error);
}


