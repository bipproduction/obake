import { $ } from "bun";
import CryptoJS from "crypto-js";
import minimist from "minimist";
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

await kirimLog(Bun.inspect.table(dataExtendJson));

await kirimLog("clone start ...");
const clone =
  await $`git clone https://x-access-token:${dataRequiredJson.githubToken}@github.com/bipproduction/${dataExtendJson.repo}.git ${dataExtendJson.appVersion}`
    .env({
      path: process.env.PATH as string,
      ...process.env,
    })
    .nothrow()
    .quiet();

await kirimLog(clone.exitCode, clone.stderr.toString());
if (clone.exitCode !== 0) process.exit(1);

await kirimLog("create env ...");
const createEnv = await $`echo "${dataExtendJson.env}" > .env`
  .env({
    path: process.env.PATH as string,
  })
  .cwd(dataExtendJson.appVersion)
  .nothrow()
  .quiet();

await kirimLog(createEnv.exitCode, createEnv.stderr.toString());
if (createEnv.exitCode !== 0) process.exit(1);

await kirimLog("install ...");
const install = await $`bun install`
  .env({
    path: process.env.PATH as string,
  })
  .cwd(dataExtendJson.appVersion)
  .nothrow()
  .quiet();

await kirimLog(install.exitCode, install.stderr.toString());
if (install.exitCode !== 0) process.exit(1);

await kirimLog("db push ...");
const dbPush = await $`bunx prisma db push`
  .env({
    path: process.env.PATH as string,
  })
  .cwd(dataExtendJson.appVersion)
  .nothrow()
  .quiet();

await kirimLog(dbPush.exitCode, dbPush.stderr.toString());
if (dbPush.exitCode !== 0) process.exit(1);

await kirimLog("start ...");
const dbSeed = await $`bunx prisma db seed`
  .env({
    path: process.env.PATH as string,
  })
  .cwd(dataExtendJson.appVersion)
  .nothrow()
  .quiet();

await kirimLog(dbSeed.exitCode, dbSeed.stderr.toString());

await kirimLog("build ...");
const build = await $`bun --bun run build`
  .env({
    path: process.env.PATH as string,
  })
  .cwd(dataExtendJson.appVersion)
  .nothrow()
  .quiet();

await kirimLog(build.exitCode, build.stderr.toString());
if (build.exitCode !== 0) {
  await kirimLog("{{ close }}");
  process.exit(1);
}

await kirimLog("{{ close }}");
