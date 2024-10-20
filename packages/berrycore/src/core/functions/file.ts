import { TestSuite } from "../../types/types";
import * as fs from "fs";
import * as yaml from "js-yaml";
import { InputType } from "../../enum/misc";

export class FileUtils {
  static isValidFilePath(filePath: string): InputType {
    try {
      const urlPattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
          "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
          "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
          "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
          "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
          "(\\#[-a-z\\d_]*)?$",
        "i"
      ); // fragment locator
      const jsonPattern = /\.json$/i;
      const filePathPattern = /^(.+)\/([^\/]+)$/;

      if (urlPattern.test(filePath)) {
        console.log("Valid URL path.");
        return InputType.URL;
      } else if (jsonPattern.test(filePath)) {
        console.log("Valid JSON file path.");
        return InputType.JSON;
      } else if (fs.existsSync(filePath) && filePathPattern.test(filePath)) {
        console.log("Valid file path.");
        return InputType.FilePath;
      } else {
        console.error("Invalid path.");
        return InputType.Invalid;
      }
    } catch (error) {
      console.error("Error validating file path:", error);
      return InputType.Invalid;
    }
  }
  public static parseFromYmlFile(file: string): TestSuite {
    try {
      const fileContents = fs.readFileSync(file, "utf8");
      const result: TestSuite = yaml.load(fileContents) as TestSuite;
      console.log(result);
      return result;
    } catch (error) {
      console.error("Failed to parse YAML file:", error);
      throw error;
    }
  }

  public static loadFile(file: string) {
    const fileContents = fs.readFileSync(file, "utf8");
    return fileContents;
  }
}
