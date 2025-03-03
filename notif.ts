#!/usr/bin/env bun
import dotenv from "dotenv";
import admin from "firebase-admin";
import fs from "fs/promises";
import path from "path";
import type { DataRequired } from "./init-data";
import minimist from "minimist";
import CryptoJS from "crypto-js";

const argv = minimist(process.argv.splice(2));
const finish = argv.finish;
const data = argv.data;
const firebase = argv.firebase;
const token = argv.token;

if (!data) {
  console.error("data not found");
  process.exit(1);
}

if (!firebase) {
  console.error("firebase not found");
  process.exit(1);
}

if (!token) {
  console.error("token not found");
  process.exit(1);
}


const dataAppJsonString = CryptoJS.AES.decrypt(data, token).toString(
  CryptoJS.enc.Utf8
);

const dataAppJson: DataRequired["dataApp"] = JSON.parse(dataAppJsonString);

const decryptedFirebase = CryptoJS.AES.decrypt(firebase, token).toString(
  CryptoJS.enc.Utf8
);

const firebaseConfig = JSON.parse(decryptedFirebase);
const app = admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig.credential),
  databaseURL: firebaseConfig.databaseURL,
});

const db = app.database();

async function kirimNotify(...args: any[]) {
  const body = args.join(" ");
  db.ref("/logs").child(dataAppJson.namespace).child("log").push(body);
  console.log(body);
}

let inputData = "";
if (!process.stdin.isTTY) {
  process.stdin.on("data", (chunk) => {
    inputData += chunk.toString();
  });

  process.stdin.on("end", () => {
    console.log("Piped input:", inputData.trim());
    kirimNotify("[INFO]".padEnd(10, " "), inputData.trim());
    setTimeout(() => {
      db.app.delete();
    }, 3000);
  });
} else {
  console.log("No piped input detected.");
}

if (finish) {
  db.app.delete();
}
