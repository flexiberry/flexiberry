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

  // Utility to get nested value by path like "user.profile.name" or "items[0].id"
  public static getValueByPath(obj: any, path: string): any {
    if (path.startsWith("response.")) {
      path = path.slice("response.".length);
    }
    return path
      .replace(/\[(\w+)\]/g, ".$1") // convert [0] to .0
      .split(".")
      .filter(Boolean)
      .reduce(
        (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
        obj
      );
  }
}
