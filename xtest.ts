import { $ } from "bun";

const dbSeed = await $`ls p`
    .nothrow()
    .quiet()


// console.log(dbSeed.exitCode);
console.log(dbSeed.stdout.toString());
console.log(dbSeed.stderr.toString());