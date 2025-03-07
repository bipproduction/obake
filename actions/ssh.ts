import minimist from "minimist";
import { $ } from "bun";

const args = minimist(process.argv.slice(2));
const data = args.data.split("[x]");
const user = data[0];
const host = data[1];
const key = data[2];

const log = await $`
cat <<EOF > ~/.ssh/id_rsa
${key}
EOF
chmod 600 ~/.ssh/id_rsa
`;

console.log(log.text());
