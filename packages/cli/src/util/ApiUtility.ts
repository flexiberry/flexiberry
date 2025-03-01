import consola from "consola";
import { FormatUtil } from "../berry/FormatUtil.js";
import { FileUtility } from "./FileUtility.js";
import { createConsola } from "consola/core";

export class ApiUtility {
  static add(
    name: any,
    arg1: { url: any; method: any; headers: any; body: any }
  ) {
    console.log("Adding API", name, arg1);
  }
  static addFromCurl(name: any, curl: any) {
    consola.start(`Adding API from cURL: ${name}`);

    const apiCode = FormatUtil.convertCurlToBerry(curl, name);
    FileUtility.updateBerryCode(apiCode);
  }
}
