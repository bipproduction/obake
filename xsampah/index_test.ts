import {$} from 'bun'

console.log("ngetest ....")
const test = await $`scp --version"`
console.log(test.stderr.toString())