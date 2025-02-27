import { $ } from "bun";
import CryptoJS from "crypto-js";
import minimist from "minimist";

interface RequiredData {
  firebase: { databaseURL: string };
  githubToken: string;
}

interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

// Konfigurasi dan Inisialisasi
const argv = minimist(process.argv.slice(2));
const { key, "data-required": dataRequired, "data-extend": dataExtend } = argv;

// Utilitas untuk dekripsi dan parsing JSON
const decryptAndParse = (encrypted: string, key: string) => {
  const decrypted = CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
  return JSON.parse(decrypted);
};

// Kelas untuk menangani logging
class Logger {
  private logData: string = "";
  private readonly databaseURL: string;

  constructor(databaseURL: string) {
    this.databaseURL = databaseURL;
  }

  async log(...args: any[]) {
    const message = args.join(" ");
    this.logData += `\n${message}`;
    return this;
  }

  async commit(version: string) {
    await fetch(`${this.databaseURL}/logs.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [version]: this.logData }),
    });
  }
}

// Fungsi untuk menjalankan perintah shell dengan logging
async function executeCommand(
  command: any,
  logger: Logger,
  infoMessage: string,
  errorMessage: string
): Promise<void> {
  const result = await command.nothrow().quiet();
  
  await logger.log("[INFO] ", infoMessage);
  await logger.log("[INFO] ", result.stdout.toString());
  
  if (result.exitCode !== 0) {
    await logger.log("[ERROR] ", errorMessage, result.stderr.toString());
    await logger.log("{{ close }}");
    process.exit(1);
  }
}

// Fungsi utama
async function main() {
  // Validasi input
  for (const [param, value] of Object.entries({ key, dataRequired, dataExtend })) {
    if (!value) {
      console.error(`${param} not found`);
      process.exit(1);
    }
  }

  // Dekripsi dan parsing data
  const requiredData: RequiredData = decryptAndParse(dataRequired, key);
  const extendData = decryptAndParse(dataExtend, key);
  const logger = new Logger(requiredData.firebase.databaseURL);

  // Log data awal
  await logger.log(Bun.inspect.table(extendData));

  // Ambil port
  const port = await (async () => {
    const res = await fetch("https://wibu-bot.wibudev.com/api/find-port");
    return (await res.json()).port;
  })();

  // Eksekusi perintah-perintah
  const commands = [
    {
      cmd: $`git clone https://x-access-token:${requiredData.githubToken}@github.com/bipproduction/${extendData.repo}.git ${extendData.appVersion}`,
      info: "cloning ...",
      error: "Failed to clone repository"
    },
    {
      cmd: $`bun install`.cwd(extendData.appVersion),
      info: "installing ...",
      error: "Failed to install dependencies"
    },
    {
      cmd: $`bunx prisma db push`.cwd(extendData.appVersion),
      info: "db pushing ...",
      error: "Failed to push database"
    },
    {
      cmd: $`bunx prisma db seed`.cwd(extendData.appVersion),
      info: "db seeding ...",
      error: "Failed to seed database"
    },
    {
      cmd: $`bun --bun run build`.cwd(extendData.appVersion),
      info: "building ...",
      error: "Failed to build application"
    }
  ];

  for (const { cmd, info, error } of commands) {
    await executeCommand(cmd, logger, info, error);
  }

  (await logger.log("{{ close }}")).commit(extendData.appVersion);
  process.exit(0);
}

// Jalankan aplikasi
main().catch(async (error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});