#!/usr/bin/env bun
import CryptoJS from "crypto-js";
import admin from "firebase-admin";
import minimist from "minimist";

const argv = minimist(process.argv.splice(2));

const data = argv.data;
const finish = argv.finish;
const type = argv.type;

if (!data) {
  console.error("data not found");
  process.exit(1);
}

const listData = data.split("[x]");
const key = listData[0];
const firebase = listData[1];
const reqData = listData[2];

const dataAppJsonString = CryptoJS.AES.decrypt(reqData, key).toString(
  CryptoJS.enc.Utf8
);
const dataAppJson = JSON.parse(dataAppJsonString);

const decryptedFirebase = CryptoJS.AES.decrypt(firebase, key).toString(
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
    const finalType = type ? type : "INFO";
    kirimNotify(`[${finalType}]`.padEnd(10, " "), inputData.trim());
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
