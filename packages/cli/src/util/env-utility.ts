/**
 * env-utility.ts
 *
 * Handles the `flexiberry add env` command flow.
 * Uses native lib/prompts and lib/colors instead of chalk + @clack/prompts.
 */

import { intro, outro, log, text, isCancel } from "../lib/prompts.js";
import { CmdOptions } from "../command/add-command.js";
import { FileUtility } from "./file-utility.js";
import { outroMessage } from "./util.js";
import { FormatUtil } from "@flexiberry/berrycore";

export class EnvUtility {
  /**
   * Adds an environment block to the selected .berry file.
   * Accepts a pre-supplied comma-separated env string via CLI flag, or
   * falls back to an interactive prompt.
   */
  static async add(env: string, _option: CmdOptions): Promise<void> {
    let environments: string[] = [];

    intro(`🍀 Building Environment`);

    // Fast path: env already provided via CLI flag
    if (env && env.length > 0) {
      environments = env.split(",").map((e) => e.trim());
      const code = FormatUtil.buildEnv(environments);
      log.step("DSL code generated ✔");
      const status = FileUtility.updateBerryCode(code);
      outro(outroMessage(status));
      return;
    }

    // Interactive path
    const value = await text({
      message: "Please enter environment names (comma-separated)",
      placeholder: "SIT, UAT, PROD",
      defaultValue: "SIT,UAT",
      validate: (v) => {
        if (v.trim().length === 0) return "At least one environment name is required!";
      },
    });

    if (isCancel(value)) {
      outro("Cancelled ❌");
      return;
    }

    environments = value.split(",").map((e) => e.trim());

    const code = FormatUtil.buildEnv(environments);
    log.step("DSL code generated ✔");

    const status = FileUtility.updateBerryCode(code);
    outro(outroMessage(status));
  }
}
