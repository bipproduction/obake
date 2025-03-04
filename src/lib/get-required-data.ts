import path from "path";
import fs from "fs/promises";
import type { DataRequired } from "../../xsampah/init-data";

async function getRequiredData() {
  const dataAppJsonString = await fs.readFile(
    path.resolve(process.cwd(), "data-app.json"),
    "utf-8"
  );
  const dataAppJson: DataRequired["dataApp"] = JSON.parse(dataAppJsonString);

  const dataUploadJsonString = await fs.readFile(
    path.resolve(process.cwd(), "data-upload.json"),
    "utf-8"
  );
  const dataUploadJson: DataRequired["dataUpload"] =
    JSON.parse(dataUploadJsonString);

  return { dataAppJson, dataUploadJson };
}

export default getRequiredData;
