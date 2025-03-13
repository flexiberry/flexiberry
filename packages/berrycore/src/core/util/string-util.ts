import { EnvBuilder } from "../builder/env.builder";
import { VarBuilder } from "../builder/var.builder";

export class StringUtil {
  public static interpolateString(str: string): string {
    if (!str) {
      return "";
    }

    const vars = VarBuilder.getVars();
    const varsRecord: Record<string, any> = Object.fromEntries(vars.entries());

    const activeEnv =
      EnvBuilder.getActiveEnv() === "default"
        ? ""
        : `${EnvBuilder.getActiveEnv()}.`;

    return str.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const v = varsRecord[`Var.${activeEnv}${key}`];
      return v?.value || "";
    });
  }
}
