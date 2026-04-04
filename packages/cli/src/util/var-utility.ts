/**
 * var-utility.ts
 *
 * Handles the `flexiberry add var` command flow.
 * Uses native lib/prompts and lib/colors instead of chalk + @clack/prompts.
 */

import { intro, outro, log, text, group, isCancel } from "../lib/prompts.js";
import { CmdOptions } from "../command/add-command.js";
import { FormatUtil } from "@flexiberry/berrycore";
import { FileUtility } from "./file-utility.js";
import { outroMessage } from "./util.js";

export class VarUtility {
  /** Validates that a comma-separated variable string uses key:value format. */
  private static validateVariables(value: string): string | undefined {
    if (!value || value.trim().length === 0) return "A value is required!";
    const pairs = value.split(",");
    if (pairs.some((v) => !/[^:]+:[^:]+/.test(v.trim()))) {
      return "Invalid format — use key:value pairs separated by commas";
    }
  }

  /** Runs the interactive prompts to collect variable block details. */
  private static async promptForDetails(
    defaultTitle: string
  ): Promise<{ title: string; env: string; variables: string[] } | undefined> {
    const details = await group(
      {
        title: () =>
          text({
            message: "Enter a title for this variable block",
            defaultValue: defaultTitle,
            initialValue: defaultTitle,
            validate: (v) => (v.trim().length === 0 ? "A title is required!" : undefined),
          }),
        env: () =>
          text({
            message: "Enter the environment pointer this variable block belongs to (optional)",
            defaultValue: "",
          }),
        variables: () =>
          text({
            message: "Enter variables as comma-separated key:value pairs",
            placeholder: "baseUrl:https://api.example.com , timeout:5000",
            validate: VarUtility.validateVariables,
          }),
      },
      {
        onCancel: ({ results }) => {
          log.step("Variable details not provided.");
        },
      }
    );

    if (isCancel(details) || !details.variables) return undefined;

    return {
      title: (details.title as string) || defaultTitle,
      env: (details.env as string) || "",
      variables: (details.variables as string).split(",").map((v) => v.trim()),
    };
  }

  /**
   * Adds a variable block to the selected .berry file.
   * Accepts pre-supplied values via CLI flags, or falls back to interactive prompts.
   */
  static async add(v: string, option?: CmdOptions): Promise<void> {
    intro("🍀 Building Variables");

    let variables: string[];
    let env = option?.env as string | undefined;
    let title = v;

    if (option?.var) {
      // Fast path: values supplied via CLI flags
      if (!title) {
        log.error("Variable title is required (positional argument).");
        return;
      }
      const validationError = VarUtility.validateVariables(option.var);
      if (validationError) {
        log.error(validationError);
        return;
      }
      variables = (option.var as string).split(",").map((v) => v.trim());
    } else {
      // Interactive path
      const details = await VarUtility.promptForDetails(v);
      if (!details) {
        outro("Cancelled ❌");
        return;
      }
      title = details.title;
      env = details.env;
      variables = details.variables;
    }

    const code = FormatUtil.buildVar(title, variables, env);
    log.step("DSL code generated ✔");
    const status = FileUtility.updateBerryCode(code);
    outro(outroMessage(status));
  }
}
