import { $, ShellPromise, type ShellOutput } from "bun";
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

async function getPort() {
  const res = await fetch("https://wibu-bot.wibudev.com/api/find-port");
  const portJson = await res.json();
  return portJson;
}

const port = await getPort();

await kirimLog(Bun.inspect.table(dataExtendJson).green);

const clone =
  await $`git clone https://x-access-token:${dataRequiredJson.githubToken}@github.com/bipproduction/${dataExtendJson.repo}.git ${dataExtendJson.appVersion}`
    .nothrow()
    .quiet();
await kirimLog("[INFO] ", "cloning ...");
await kirimLog("[INFO] ", clone.stdout.toString());
await kirimLog("[ERROR]", clone.stderr.toString());

const installDependency = await $`bun install`
  .cwd(dataExtendJson.appVersion)
  .nothrow()
  .quiet();
await kirimLog("[INFO] ", "installing ...");
await kirimLog("[INFO] ", installDependency.stdout.toString());
await kirimLog("[ERROR]", installDependency.stderr.toString());

const dbPush = await $`bunx prisma db push`
  .cwd(dataExtendJson.appVersion)
  .nothrow()
  .quiet();

await kirimLog("[INFO] ", "db pushing ...");
await kirimLog("[INFO] ", dbPush.stdout.toString());
await kirimLog("[ERROR]", dbPush.stderr.toString());

const dbSeed = await $`bunx prisma db seed`
  .cwd(dataExtendJson.appVersion)
  .nothrow()
  .quiet();

await kirimLog("[INFO] ", "db seeding ...");
await kirimLog("[INFO] ", dbSeed.stdout.toString());
await kirimLog("[ERROR]", dbSeed.stderr.toString());

const build = await $`bunx prisma start`
  .cwd(dataExtendJson.appVersion)
  .nothrow()
  .quiet();

await kirimLog("[INFO] ", "building ...");
await kirimLog("[INFO] ", build.stdout.toString());
await kirimLog("[ERROR]", build.stderr.toString());

// git clone https://x-access-token:${dataRequiredJson.githubToken}@github.com/bipproduction/${dataExtendJson.repo}.git ${dataExtendJson.appVersion}
// await action({
//   startText: "clone start ...",
//   shell: $`git --version && git status`,
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

await kirimLog("{{ close }}");
