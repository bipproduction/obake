import { $ } from "bun";
import dedent from "dedent";

const apaCmd = dedent`
scp --help
`
const apa = await $`ssh -i ~/.ssh/id_rsa root@wibudev.com -t "${apaCmd}"`;
console.log(apa.text());
