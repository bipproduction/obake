import { NodeSSH } from "node-ssh";
const ssh = new NodeSSH();
const conn = await ssh.connect({
  host: "wibudev.com",
  username: "root",
  privateKeyPath: "/Users/bip/.ssh/id_rsa",
});

const { stdout } = await conn.execCommand("ls -la");
console.log(stdout);

console.log("connected: ", conn.isConnected());
process.exit(0);
