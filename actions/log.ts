import { Client } from "ssh2";
import minimist from "minimist";
import { existsSync, readFileSync } from "fs";
import fs from "fs/promises";
import { spawn } from "bun";

// Parse arguments
const args = minimist(process.argv.slice(2));
if (!args.data) {
  console.error("Error: Missing --data argument");
  process.exit(1);
}

// Split user and host
const [user, host, namespace] = args.data.split("[x]");
if (!user || !host) {
  console.error("Error: Invalid --data format. Expected 'user[x]host'");
  process.exit(1);
}

try {
  // Check if the SSH key exists
  const sshKeyPath = "./id_rsa";
  if (!existsSync(sshKeyPath)) {
    console.error(`Error: SSH key not found at ${sshKeyPath}`);
    process.exit(1);
  }

  // Read the private key
  const privateKey = readFileSync(sshKeyPath, "utf8");


  const child = spawn(["/bin/bash", "-c", "ssh -o StrictHostKeyChecking=no -i " + sshKeyPath + " " + user + "@" + host + " timeout 10s pm2 log " + namespace + " 2>&1 || true"]);
  const dataText = await new Response(child.stdout).text();
  await fs.writeFile("./live-log.txt", dataText);

  // Create SSH connection
  // const conn = new Client();
  // conn
  //   .on("ready", () => {
  //     console.log("Client :: ready");
  //     conn.exec(`timeout 10s pm2 log ${namespace} 2>&1 || true`, (err, stream) => {
  //       if (err) {
  //         console.error("Error executing command:", err.message);
  //         conn.end();
  //         return;
  //       }
  //       stream
  //         .on("close", (code: number, signal: string) => {
  //           conn.end();
  //         })
  //         .on("data", async (data: Buffer) => {
  //           await fs.writeFile("./live-log.txt", data.toString());
  //         })
  //         .stderr.on("data", (data) => {
  //           console.error("STDERR: " + data.toString().trim());
  //         });
  //     });
  //   })
  //   .on("error", (err) => {
  //     console.error("Connection error:", err.message);
  //     process.exit(1);
  //   })
  //   .connect({
  //     host,
  //     port: 22,
  //     username: user,
  //     privateKey,
  //   });
} catch (error) {
  console.error("SSH command failed:", (error as any).toString());
  process.exit(1);
}