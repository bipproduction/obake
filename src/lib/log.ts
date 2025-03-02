import db from "@/lib/db";
import getRequiredData from "./get-required-data";

async function log() {
  const { dataAppJson } = await getRequiredData();
  async function kirimLog(...args: any[]) {
    const body = args.join(" ");
    await db.ref("/logs").child(dataAppJson.namespace).child("log").push(body);
    console.log(body);
  }

  async function updateStatusRunning(isRunning: boolean = true) {
    await db
      .ref("/logs")
      .child(dataAppJson.namespace)
      .child("isRunning")
      .set(isRunning);
  }
  return { kirimLog, updateStatusRunning };
}

export default log;
