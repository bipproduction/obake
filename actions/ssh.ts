import { $ } from "bun";
import minimist from "minimist";

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

    // Execute SSH command
    console.log(`Connecting to ${user}@${host}...`);
    const log = await $`ssh -i ${sshKeyPath} -o StrictHostKeyChecking=no root@wibudev.com "echo 'Hello World'"`.text();
    console.log("Output from server:", log.trim());
} catch (error) {
    console.error("SSH command failed:", error);
    process.exit(1);
}