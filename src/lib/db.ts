import path from "path";
import fs from "fs/promises";
import CryptoJS from "crypto-js";
import admin from "firebase-admin";

async function loadDb() {
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
  const app = admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig.credential),
    databaseURL: firebaseConfig.databaseURL,
  });

  const db = app.database();

  return { db, app };
}
export default loadDb;
