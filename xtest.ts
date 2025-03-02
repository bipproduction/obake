import { $ } from "bun";

const { stdout, text, stderr, exitCode } =
  await $`tree -a -I node_modules -L 1`.quiet();

try {
    const tx = text();
    console.log(tx, stderr.toString(), exitCode);
} catch (error) {
    console.log(error);
}
console.log( stderr.toString(), exitCode);