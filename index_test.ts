import {$} from 'bun'

console.log("ngetest ....")
const test = await $`mkdir ~/.ssh`.text()
console.log(test)