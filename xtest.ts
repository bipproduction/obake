import { NodeSSH } from "node-ssh";
const ssh = new NodeSSH();
const conn = await ssh.connect({
  host: "wibudev.com",
  username: "root",
  privateKeyPath: "/Users/bip/.ssh/id_rsa",
});

await conn.putDirectory(".", "/var/www/projects/obake/releases/obake-0.0.1");

const { stdout } = await conn.execCommand("ls -la", {
    cwd: "/var/www/projects/"
});
console.log(stdout);

console.log("connected: ", conn.isConnected());
process.exit(0);
