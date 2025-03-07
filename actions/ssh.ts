import { $ } from "bun";
import minimist from "minimist";
import { Client } from "ssh2";

// Parse arguments
const args = minimist(process.argv.slice(2));
if (!args.data) {
    console.error("Error: Missing --data argument");
    process.exit(1);
}

// Split user and host
const [user, host] = args.data.split("[x]");
if (!user || !host) {
    console.error("Error: Invalid --data format. Expected 'user[x]host'");
    process.exit(1);
}

try {
    // Check if the SSH key exists
    const sshKeyPath = "./id_rsa";
    const { existsSync } = await import("fs");
    if (!existsSync(sshKeyPath)) {
        console.error(`Error: SSH key not found at ${sshKeyPath}`);
        process.exit(1);
    }

   const conn = new Client()
   conn.on("ready", () => {
    conn.exec("echo 'Hello World'", (err, stream) => {
        if (err) throw err;
        stream.on("data", (data: any) => {
            console.log(data.toString());
        });
        stream.end();
    });
   })
   .connect({
    host,
    port: 22,
    username: user,
    privateKey: sshKeyPath
   })
} catch (error) {
    console.error("SSH command failed:", error);
    process.exit(1);
}