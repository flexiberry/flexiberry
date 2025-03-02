import { FormatUtil } from "../berry/FormatUtil.js";
import { FileUtility } from "./FileUtility.js";
import { intro, outro, spinner } from "@clack/prompts";

export class ApiUtility {
  static add(
    name: any,
    arg1: { url: any; method: any; headers: any; body: any }
  ) {
    console.log("Adding API", name, arg1);
  }
  static addFromCurl(name: any, curl: any) {
    intro(`📦 Adding API from cURL `);
    const s = spinner();
    s.start("Coverting cURL to Berry");
    const apiCode = FormatUtil.convertCurlToBerry(curl, name);
    s.stop("Convertion completed successfully");
    const status = FileUtility.updateBerryCode(apiCode);
    outro(
      status == "Success"
        ? "Successfully updated ✅"
        : "Failed to update berry code 😔"
    );
  }
}
