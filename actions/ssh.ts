import minimist from "minimist";

const args = minimist(process.argv.slice(2));
const data = args.data

console.log(data)