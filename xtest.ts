import { $ } from "bun";
import 'colors'

const dbSeed = await $`git --version`
    .nothrow()
    .quiet()


// console.log(dbSeed.exitCode);
console.log(dbSeed.stdout.toString().green);
console.log(dbSeed.stderr.toString().red);