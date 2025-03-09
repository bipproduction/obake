#!/usr/bin/env bun
import minimist from "minimist";

const argv = minimist(process.argv.slice(2));
const phone = argv.phone;

let inputData = "";
if (!process.stdin.isTTY) {
  process.stdin.on("data", (chunk) => {
    inputData += chunk.toString();
  });

  process.stdin.on("end", () => {
    const text = Bun.escapeHTML(inputData.trim());
    fetch(`https://wa.wibudev.com/code?nom=${phone}&text=${text}`);
  });
} else {
  console.log("No piped input detected.");
}