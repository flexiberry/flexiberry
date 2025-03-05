import { intro, isCancel, log, outro, text } from "@clack/prompts";
import { CmdOptions } from "../command/AddCommand.js";
import { FileUtility } from "./FileUtility.js";
import { outroMessage } from "./util.js";
import { FormatUtil } from "@flexiberry/berrycore";

export class EnvUtility {
  static async add(env: string, option: CmdOptions) {
    let environment: string[] = [];
    intro(`🍀 Building Environment`);

    if (!!env && env.length > 0) {
      environment = env.split(",");
      const code = FormatUtil.buildEnv(environment);
      log.step("Code generated");
      const status = FileUtility.updateBerryCode(code);

      outro(outroMessage(status));
      return;
    }

    const value = await text({
      message: "Please enter Environment Details (comma-separated)",
      placeholder: "SIT,UAT",
      defaultValue: "SIT,UAT",
      validate: (value) => {
        if (value.length === 0) return `Value is required!`;
      },
    });

    if (isCancel(value)) {
      outro("Cancelled ❌");
      return;
    }

    environment = value.split(",");

    const code = FormatUtil.buildEnv(environment);
    log.step("Code generated");

    const status = FileUtility.updateBerryCode(code);

    outro(outroMessage(status));
  }
}
