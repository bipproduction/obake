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
    close();
    process.exit(0);
  });

} else {
  console.log("No piped input detected.");
}
