#!/usr/bin/env bun
import * as net from "net";

// Tipe untuk hasil parsing
interface ParsedArgs {
  _: string[]; // Argumen non-opsi
  [key: string]: string | boolean | string[]; // Opsi lainnya bisa string, boolean, atau array untuk _
}

// Tipe untuk aliases
type Aliases = Record<string, string>;

function parseArgs(args: string[], aliases: Aliases = {}): ParsedArgs {
  const result: ParsedArgs = {
    _: [],
  };

  const argList: string[] = Array.isArray(args) ? args.slice(2) : [];

  for (let i = 0; i < argList.length; i++) {
    const arg: string = argList[i];

    if (arg.startsWith("-")) {
      const cleanArg: string = arg.replace(/^-+/, "");
      let key: string = cleanArg;

      // Cek alias
      for (const [short, long] of Object.entries(aliases)) {
        if (cleanArg === short) {
          key = long;
          break;
        }
      }

      if (key.includes("=")) {
        const [k, value] = key.split("=", 2) as [string, string];
        result[k] = value;
      } else if (i + 1 < argList.length && !argList[i + 1].startsWith("-")) {
        result[key] = argList[i + 1];
        i++;
      } else {
        result[key] = true;
      }
    } else {
      result._.push(arg);
    }
  }

  return result;
}

const argv = parseArgs(process.argv);

async function findPort() {
  const count = argv.count ? Number(argv.count) : 1;
  const portStart = argv.portStart ? Number(argv.portStart) : 3000;
  const portEnd = argv.portEnd ? Number(argv.portEnd) : 6000;
  const exclude = argv.exclude ? JSON.parse(argv.exclude as string) : [];

  const listPort = [...exclude].flat();
  const usedPorts = Array.from(new Set(listPort)) as number[];

  // Validasi input
  if (count <= 0) {
    throw new Error("Count harus lebih besar dari 0");
  }
  if (count > portEnd - portStart + 1) {
    console.error(`Count tidak boleh lebih besar dari range port (${portEnd - portStart + 1})`);
    process.exit(1);
  }
  if (portStart >= portEnd) {
    console.error("portStart harus lebih kecil dari portEnd");
    process.exit(1);
  }
  if (portStart < 0 || portEnd > 65535) {
    console.error("Port harus berada dalam rentang 0-65535");
    process.exit(1);
  }

  // Fungsi untuk memeriksa apakah port tersedia
  const checkPort = (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const server = net.createServer();

      server.once("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE") {
          resolve(false);
        } else {
          resolve(true); // Anggap tersedia jika error bukan karena port digunakan
        }
        server.close();
      });

      server.once("listening", () => {
        resolve(true);
        server.close();
      });

      server.listen(port, "0.0.0.0");
    });
  };

  // Optimasi pencarian port
  const availablePorts = new Set<number>();
  const usedPortsSet = new Set(usedPorts);

  for (let port = portStart; port <= portEnd; port++) {
    if (availablePorts.size >= count) break;

    // Skip jika port ada di exclude list
    if (usedPortsSet.has(port)) continue;

    try {
      const isAvailable = await checkPort(port);
      if (isAvailable) {
        availablePorts.add(port);
      }
    } catch (error) {
      console.warn(`Gagal memeriksa port ${port}:`, error);
      continue;
    }
  }

  const result =
    availablePorts.size === count ? Array.from(availablePorts) : null;
  return result;
}

const port = await findPort();

const name = argv.name;
const namespace = argv.namespace;

if (!name || !namespace) {
  console.error("Missing name or namespace");
  process.exit(1);
}

const config = port?.map((v) => ({
  name: name + "-" + v,
  namespace: namespace,
  script: "bun",
  args: "--bun run start",
  exec_mode: "fork",
  instances: 1,
  env: {
    NODE_ENV: "production",
    PORT: v,
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
  cwd: `/var/www/projects/${name}/${namespace}/current`,
}));

const apps = {
  apps: config,
};

console.log(JSON.stringify(apps, null, 2));