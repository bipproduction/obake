import dayjs from "dayjs";
import minimist from "minimist";
const argv = minimist(process.argv.splice(2))

console.log(dayjs().format("YYYY-MM-DD_HH-mm-ss"))