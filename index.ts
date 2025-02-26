import { file } from "bun";
import minimist from "minimist";
const argv = minimist(process.argv.splice(2));

const data = await file("data.json").json();
console.log(data);
