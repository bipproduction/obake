import { $, ShellPromise } from "bun";
import CryptoJS from "crypto-js";
import minimist from "minimist";

// Definisi tipe data
interface RequiredData {
  firebase: {
    databaseURL: string;
  };
  githubToken: string;
}

interface ExtendData {
  appVersion: string;
  repo: string;
}

// Memperbaiki error TypeScript dengan mendeklarasikan tipe global
declare global {
  var requiredData: RequiredData | undefined;
  var extendData: ExtendData | undefined;
}

// Variabel untuk menyimpan log
let logData = "";

// Fungsi untuk mengirim log
async function logMessage(...args: any[]) {
  const body = args.join(" ");
  logData += `\n${body}`;

  if (!global.requiredData || !global.extendData) return; // Hindari error saat data belum diinisialisasi

  await fetch(`${global.requiredData.firebase.databaseURL}/logs.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      [global.extendData.appVersion]: logData,
    }),
  });
}

// Dekripsi dan parsing data
function decryptAndParse<T>(encryptedData: string, key: string): T {
  const decrypted = CryptoJS.AES.decrypt(encryptedData, key).toString(
    CryptoJS.enc.Utf8
  );
  return JSON.parse(decrypted);
}

// Validasi argumen dan memproses
function validateAndProcessArgs() {
  const argv = minimist(process.argv.splice(2));

  const key = argv.key;
  const dataRequired = argv["data-required"];
  const dataExtend = argv["data-extend"];

  if (!key) throw new Error("key not found");
  if (!dataRequired) throw new Error("data_required not found");
  if (!dataExtend) throw new Error("data_extend not found");

  return {
    key,
    dataRequired,
    dataExtend,
  };
}

// Mendapatkan port dari API
async function getPort() {
  try {
    const res = await fetch("https://wibu-bot.wibudev.com/api/find-port");
    return await res.json();
  } catch (error) {
    throw new Error(
      `Failed to get port: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Fungsi untuk mengeksekusi langkah dengan logging
async function executeStep(
  stepName: string,
  command: ShellPromise,
  options: { cwd?: string }
) {
  await logMessage(`[INFO] ${stepName} starting...`);

  const result = await command
    .cwd(options.cwd ?? process.cwd())
    .nothrow()
    .quiet();

  await logMessage(`[INFO] ${result.stdout.toString()}`);

  if (result.exitCode !== 0) {
    throw new Error(`${stepName} failed: ${result.stderr.toString()}`);
  }

  await logMessage(`[INFO] ${stepName} completed successfully`);
  return result;
}

// Menjalankan langkah-langkah deployment
async function runDeploymentSteps(
  requiredData: RequiredData,
  extendData: ExtendData
) {
  // Simpan data ke global untuk digunakan oleh fungsi logMessage
  global.requiredData = requiredData;
  global.extendData = extendData;

  // Clone repository
  await executeStep(
    "git clone",
    $`git clone https://x-access-token:${requiredData.githubToken}@github.com/bipproduction/${extendData.repo}.git ${extendData.appVersion}`,
    { cwd: "." }
  );

  // Install dependencies
  await executeStep("install dependencies", $`bun install`, {
    cwd: extendData.appVersion,
  });

  // Database push
  await executeStep("db push", $`bunx prisma db push`, {
    cwd: extendData.appVersion,
  });

  // Database seed
  await executeStep("db seed", $`bunx prisma db seed`, {
    cwd: extendData.appVersion,
  });

  // Build
  await executeStep("build", $`bun --bun run build`, {
    cwd: extendData.appVersion,
  });
}

// Fungsi utama
async function main() {
  try {
    // Validasi dan memproses argumen
    const { key, dataRequired, dataExtend } = validateAndProcessArgs();

    // Dekripsi dan parsing data
    const requiredData = decryptAndParse<RequiredData>(dataRequired, key);
    const extendData = decryptAndParse<ExtendData>(dataExtend, key);

    // Menampilkan informasi
    await logMessage(Bun.inspect.table(extendData));

    // Mendapatkan port
    const port = await getPort();

    // Menjalankan proses deployment
    await runDeploymentSteps(requiredData, extendData);

    // Sukses
    await logMessage("{{ close }}");
    process.exit(0);
  } catch (error) {
    await logMessage(
      "[ERROR]",
      error instanceof Error ? error.message : String(error)
    );
    await logMessage("{{ close }}");
    process.exit(1);
  }
}

// Jalankan program
main();
