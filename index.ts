import { $, type ShellOutput } from "bun";
import CryptoJS from "crypto-js";
import minimist from "minimist";
import "colors";
const argv = minimist(process.argv.splice(2));

const key = argv.key;
const data_required = argv["data-required"];
const data_extend = argv["data-extend"];
if (!key) {
  console.error("key not found");
  process.exit(1);
}

if (!data_required) {
  console.error("data_required not found");
  process.exit(1);
}

if (!data_extend) {
  console.error("data_extend not found");
  process.exit(1);
}

const dataRequired = CryptoJS.AES.decrypt(data_required, key).toString(
  CryptoJS.enc.Utf8
);
const dataRequiredJson: RequiredData = JSON.parse(dataRequired);

const extendData = CryptoJS.AES.decrypt(data_extend, key).toString(
  CryptoJS.enc.Utf8
);
const dataExtendJson = JSON.parse(extendData);

let logData = "";
async function kirimLog(...args: any[]) {
  const body = args.join(" ");

  logData += `\n${body}`;

  await fetch(`${dataRequiredJson.firebase.databaseURL}/logs.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      [dataExtendJson.appVersion]: logData,
    }),
  });
}



async function action(params: {
  startText: string;
  cmd: string;
  env?: Record<string, string>;
  cwd?: string;
  endText?: string;
  killOnError?: boolean;
}) {
  const {
    startText = "START! ...",
    cmd,
    env = {},
    cwd,
    endText = "SUCCESS!",
    killOnError = true,
  } = params;

  await kirimLog(startText);
  const shellValue = await $`${cmd}`
    .nothrow();

  if (shellValue.exitCode !== 0 && killOnError) {
    await kirimLog(shellValue.stderr.toString().red);
    await kirimLog("{{ close }}");
    process.exit(1);
  } else if (shellValue.exitCode !== 0) {
    await kirimLog(shellValue.stderr.toString());
  } else {
    await kirimLog(endText);
  }
}

async function getPort() {
  const res = await fetch("https://wibu-bot.wibudev.com/api/find-port");
  const portJson = await res.json();
  return portJson;
}

const port = await getPort();

await kirimLog(Bun.inspect.table(dataExtendJson));

const command = await $`
git clone https://x-access-token:${dataRequiredJson.githubToken}@github.com/bipproduction/${dataExtendJson.repo}.git ${dataExtendJson.appVersion}
cd ${dataExtendJson.appVersion}
echo "${dataExtendJson.env}" > .env
bun install
bunx prisma db push || echo "prisma db push error"
bunx prisma db seed || echo "prisma db seed error"
bun --bun run build
`
.nothrow()
.quiet()

await kirimLog(command.exitCode);
await kirimLog(command.stdout.toString());
await kirimLog(command.stderr.toString());

await kirimLog("{{ close }}")


// git clone https://x-access-token:${dataRequiredJson.githubToken}@github.com/bipproduction/${dataExtendJson.repo}.git ${dataExtendJson.appVersion}
// await action({
//   startText: "clone start ...",
//   cmd: `git --version && git status`,
//   endText: "clone end ...",
// });

// await action({
//   startText: "create env ...",
//   cmd: `echo "${dataExtendJson.env}" > .env`,
//   endText: "create env end ...",
// });

// await action({
//   startText: "install ...",
//   cmd: `bun install`,
//   endText: "install end ...",
// });

// await action({
//   startText: "db push ...",
//   cmd: `bunx prisma db push`,
//   endText: "db push end ...",
// });

// await action({
//   startText: "seed ...",
//   cmd: `bunx prisma db seed`,
//   endText: "seed end ...",
//   killOnError: false,
// });

// await action({
//   startText: "build ...",
//   cmd: `bun --bun run build`,
//   endText: "build end ...",
// });

// await kirimLog("{{ close }}");
