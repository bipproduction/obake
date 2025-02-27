import { file } from "bun";
import CryptoJS from "crypto-js";
import path from "path";

async function getRequiredData(key: string) {
  const encryptedData = await file(
    path.resolve(process.cwd(), "data-penting.txt")
  ).text();
  const dataString = CryptoJS.AES.decrypt(encryptedData, key).toString(
    CryptoJS.enc.Utf8
  );
  const dataPenting: RequiredData = JSON.parse(dataString);

  return dataPenting;
}

export default getRequiredData;
