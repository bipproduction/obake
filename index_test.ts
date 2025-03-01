import {$} from 'bun'

const test = await $`scp --version`.text()
console.log(test)