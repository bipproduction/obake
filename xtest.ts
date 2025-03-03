import { db } from "@/lib/db";
// Read piped input from stdin
let inputData = "";
if (!process.stdin.isTTY) {
  // If stdin is not a terminal (i.e., piped input exists)
  process.stdin.on("data", (chunk) => {
    inputData += chunk.toString();
  });

  process.stdin.on("end", () => {
    console.log("Piped input:", inputData.trim());
    db.ref("/test").child("log").push(inputData.trim());
  });
} else {
  console.log("No piped input detected.");
}
