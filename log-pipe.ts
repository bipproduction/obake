import log from "./src/lib/log";

const { kirimLog } = await log();
let inputData = "";
if (!process.stdin.isTTY) {
  // If stdin is not a terminal (i.e., piped input exists)
  process.stdin.on("data", (chunk) => {
    inputData += chunk.toString();
  });

  process.stdin.on("end", () => {
    console.log("Piped input:", inputData.trim());
    kirimLog("[INFO]".padEnd(10, " "), inputData.trim());
  });
} else {
  console.log("No piped input detected.");
}
