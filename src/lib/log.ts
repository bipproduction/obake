import loadDb from "@/lib/db";
import getRequiredData from "./get-required-data";

async function log() {
  const { db } = await loadDb();
  const { dataAppJson } = await getRequiredData();
  async function kirimLog(...args: any[]) {
    const body = args.join(" ");
    db.ref("/logs").child(dataAppJson.namespace).child("log").push(body);
    console.log(body);
  }

  async function updateStatusRunning(isRunning: boolean = true) {
    db.ref("/logs")
      .child(dataAppJson.namespace)
      .child("isRunning")
      .set(isRunning);
  }

  async function close() {
    db.app.delete();
  }

  return { kirimLog, updateStatusRunning, close };
}

export default log;
