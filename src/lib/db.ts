import path from "path";
import fs from "fs/promises";
import CryptoJS from "crypto-js";
import admin from "firebase-admin";
import dotenv from "dotenv";

async function loadDb() {
  const env = dotenv.parse(
    await fs.readFile(path.resolve(process.cwd(), ".env"), "utf-8")
  );
  const key = env["TOKEN"];

  const firebase = await fs.readFile(
    path.resolve(process.cwd(), "firebase.txt"),
    "utf-8"
  );
  const decryptedFirebase = CryptoJS.AES.decrypt(firebase, key).toString(
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
