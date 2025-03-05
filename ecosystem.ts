import CryptoJS from "crypto-js";
import minimist from "minimist";
import fs from "fs/promises";

const argv = minimist(process.argv.slice(2));
const data = argv.data;

if (!data) {
  console.error("data not found");
  process.exit(1);
}

const listData = data.split("[x]");
const key = listData[0];
const firebase = listData[1];
const appData = listData[2];

const dcryptAppData = CryptoJS.AES.decrypt(appData, key).toString(
  CryptoJS.enc.Utf8
);

const appDataJson = JSON.parse(dcryptAppData);

async function findPort() {
  const res = await fetch("https://wibu-bot.wibudev.com/api/find-port");
  const [portJson] = await res.json();
  return portJson;
}

const port = await findPort();

const configString = {
  name: appDataJson.name+"-"+port,
  namespace: appDataJson.namespace,
  script: "bun",
  args: "--bun run start",
  exec_mode: "fork",
  instances: 1,
  env: {
    NODE_ENV: "production",
    PORT: port,
  },
  max_memory_restart: "1G",
  autorestart: true,
  watch: false,
  wait_ready: true,
  restart_delay: 4000,
  merge_logs: true,
  time: true,
  max_size: "10M",
  retain: 5,
  compress: true,
  source_map_support: false,
  cwd: `/var/www/projects/${appDataJson.name}/${appDataJson.namespace}/current`,
};

const ecosystemString = JSON.stringify(configString);

await fs.writeFile("ecosystem.config.json", ecosystemString);
