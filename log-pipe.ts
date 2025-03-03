#!/usr/bin/env bun
import log from "./src/lib/log";

const { kirimLog, close } = await log();
let inputData = "";
if (!process.stdin.isTTY) {
  process.stdin.on("data", (chunk) => {
    inputData += chunk.toString();
  });

  process.stdin.on("end", () => {
    console.log("Piped input:", inputData.trim());
    kirimLog("[INFO]".padEnd(10, " "), inputData.trim());
    setTimeout(() => {
      close();
    }, 3000);
  });
} else {
  console.log("No piped input detected.");
}
