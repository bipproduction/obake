import {$} from 'bun'

console.log("ngetest ....")
const test = await $`scp --version"`.text()
console.log(test)