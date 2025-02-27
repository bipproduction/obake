import { $ } from "bun";

const dbSeed = await $`git --version`
    .nothrow()
    .quiet()


// console.log(dbSeed.exitCode);
console.log(dbSeed.stdout.toString());
console.log(dbSeed.stderr.toString());