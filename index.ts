import minimist from "minimist";
const argv = minimist(process.argv.splice(2));
console.log(typeof argv.data, argv.data);
