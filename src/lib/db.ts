import path from "path";
import fs from "fs/promises";
import CryptoJS from "crypto-js";
import { fAdmin } from "@/lib/fadmin";

const TOKEN = process.env.TOKEN!;

if (!TOKEN) {
  console.error("TOKEN not found");
  process.exit(1);
}

const firebase = await fs.readFile(
  path.resolve(process.cwd(), "firebase.txt"),
  "utf-8"
);
const decryptedFirebase = CryptoJS.AES.decrypt(firebase, TOKEN).toString(
  CryptoJS.enc.Utf8
);

const firebaseConfig = JSON.parse(decryptedFirebase);

const admin = fAdmin({
  credential: firebaseConfig.credential,
  databaseURL: firebaseConfig.databaseURL,
});

const db = admin.database();
export default db;
