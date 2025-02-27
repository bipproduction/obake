import { $ } from "bun";
import 'colors'

const dbSeed = await $`ls m 2>&1 || echo "error" 2>&1`
    .nothrow()
    .quiet()


// console.log(dbSeed.exitCode);
console.log(dbSeed.stdout.toString().green);
console.log(dbSeed.stderr.toString().red);