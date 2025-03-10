#!/usr/bin/env bun

import CryptoJS from "crypto-js";
import admin from "firebase-admin";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2));

const data = argv.data;
const ref = argv.ref;

if (!data) {
  console.error("data not found");
  process.exit(1);
}

if (!ref) {
    console.error("path not found");
    process.exit(1);
}

const [firebase, key] = data.split("[x]");


const dcryptFirebase = CryptoJS.AES.decrypt(firebase, key).toString(
  CryptoJS.enc.Utf8
);
const firebaseJson = JSON.parse(dcryptFirebase);
const app = admin.initializeApp({
  credential: admin.credential.cert(firebaseJson.credential),
  databaseURL: firebaseJson.databaseURL,
});

const db = app.database();

let inputData = "";
if (!process.stdin.isTTY) {
  process.stdin.on("data", (chunk) => {
    inputData += chunk.toString();
  });

  process.stdin.on("end", () => {
    const text = inputData.trim();
    db.ref(ref).set(text);
    setTimeout(() => {
      db.app.delete();
    }, 3000);
  });
} else {
  console.log("No piped input detected.");
}

