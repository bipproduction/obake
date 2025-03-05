#!/usr/bin/env bun

import CryptoJS from "crypto-js";
import admin from "firebase-admin";
import fs from "fs/promises";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2));

const data = argv.data;
const filePath = argv["file-path"];

if (!data) {
  console.error("data not found");
  process.exit(1);
}

if (!filePath) {
  console.error("filePath not found");
  process.exit(1);
}

const listData = data.split("[x]");
const key = listData[0];
const firebase = listData[1];
const appData = listData[2];

const dcryptFirebase = CryptoJS.AES.decrypt(firebase, key).toString(
  CryptoJS.enc.Utf8
);
const dcryptAppData = CryptoJS.AES.decrypt(appData, key).toString(
  CryptoJS.enc.Utf8
);

const firebaseJson = JSON.parse(dcryptFirebase);
const appDataJson = JSON.parse(dcryptAppData);

const app = admin.initializeApp({
  credential: admin.credential.cert(firebaseJson.credential),
  databaseURL: firebaseJson.databaseURL,
});

const db = app.database();
try {
  const dataLog = await fs.readFile(filePath, "utf-8");
  console.log("[LOG]".padEnd(10, " "), dataLog.toString());
  db.ref("/logs").child(appDataJson.namespace).child("log").push("send log");
  db.ref("/logs")
    .child(appDataJson.namespace)
    .child("log")
    .push(dataLog.toString());
} catch (error) {
  console.error(error);
} finally {
  setTimeout(() => {
    app.delete();
  }, 3000);
}
