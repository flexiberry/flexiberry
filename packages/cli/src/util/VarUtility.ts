import { group, intro, isCancel, log, outro, text } from "@clack/prompts";
import { CmdOptions } from "../command/AddCommand.js";
import { FormatUtil } from "@flexiberry/berrycore";
import { FileUtility } from "./FileUtility.js";
import { outroMessage } from "./util.js";

export class VarUtility {
  private static validateVariables(value: string): string | undefined {
    if (!value) return "Value is required!";
    if (value.split(",").some((v) => !v.match(/[^:]+:[^:]+/))) {
      return "Invalid Header format";
    }
  }

  private static async promptForDetails(
    t: string
  ): Promise<{ title: string; env: string; variables: string[] } | undefined> {
    const details = await group({
      title: () =>
        text({
          message: "Please enter the variable title",
          defaultValue: t,
          initialValue: t,
          validate: (value) =>
            value.length === 0 ? `Value is required!` : undefined,
        }),
      env: () =>
        text({
          message: "Please enter the variable Environment Pointer (Optional)",
          defaultValue: "",
        }),
      variables: () =>
        text({
          message: "Please enter Variables Details (comma-separated)",
          placeholder: "key1:value1 , key2:value2",
          validate: this.validateVariables,
        }),
    });

    if (isCancel(details)) {
      log.step("Variables details not provided");
      return;
    }

    return {
      title: details.title,
      env: details.env,
      variables: details.variables.split(","),
    };
  }

  static async add(v: string, option?: CmdOptions) {
    console.log(option);
    intro("🍀 Building Variables");

    let variables: string[];
    let env = option?.env;

    if (option?.var) {
      if (!v) return "Variable title is required";
      if (this.validateVariables(option.var)) {
        return "Invalid Variable format";
      }
      variables = option.var.split(",");
      env = option.env;
    } else {
      const details = await this.promptForDetails(v);
      if (!details) return;

      v = details.title;
      env = details.env;
      variables = details.variables;
    }

    const code = FormatUtil.buildVar(v, variables, env);
    log.step("Code generated");
    const status = FileUtility.updateBerryCode(code);
    outro(outroMessage(status));
  }
}
