import minimist from "minimist";
const argv = minimist(process.argv.splice(2));
console.log(JSON.parse(argv.data));
