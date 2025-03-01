import {$} from 'bun'

console.log("ngetest ....")
const test = await $`mkdir ~/.ssh && cd ~/.ssh && touch id_rsa && cat id_rsa && echo "test success"`.text()
console.log(test)