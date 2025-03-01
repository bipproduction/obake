import {$} from 'bun'

const {stdout, stderr , exitCode} = await $`echo "test"`.cwd(process.cwd())

console.log(stdout.toString())
console.log(stderr.toString())
console.log(exitCode)


$.prototype.uppercase = function() {
    return this.stdout.toString().toUpperCase()
}