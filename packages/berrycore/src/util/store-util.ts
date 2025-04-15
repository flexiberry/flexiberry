import * as fs from "fs";
import os from "os";
import path from "path";

export class StoreUtility {
  systemDocumentFolder = path.join(os.homedir(), "Documents");

  static async storeData(data: Record<string, any>, fileName: string) {
    const fileContent = Object.entries(data)
      .map(([key, value]) => `${key}:${value}`)
      .join("\n");
    fs.writeFileSync(fileName, fileContent);
  }
  static async retriveData(fileName: string) {
    const fileData = fs.readFileSync(fileName, "utf8");
    const keyValueMap: Record<string, string> = {};
    fileData.split("\n").forEach((line) => {
      const [key, value] = line.split(":");
      if (key && value) {
        keyValueMap[key.trim()] = value.trim();
      }
    });
  }
}
