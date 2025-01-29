import { VarCoreModel } from "../producer/core.model";

export class VarBuilder {
  private static vars: Map<string, any>;

  public static init(varsJson: VarCoreModel[]): void {
    VarBuilder.vars = VarBuilder.convertJsonArrayToMap(varsJson);
  }

  private static convertJsonArrayToMap(
    varsJson: VarCoreModel[]
  ): Map<string, any> {
    const map = new Map<string, any>();
    varsJson.forEach((vars) => {
      map.set(vars.statement, vars.value);
    });
    return map;
  }

  public static getVars(): Map<string, any> {
    return VarBuilder.vars;
  }

  public static updateVars(key: string, value: any): void {
    VarBuilder.vars.set(key, value);
  }

  public static getVarsList(): string[] {
    return Array.from(VarBuilder.vars.keys());
  }

  public static isExists(key: string): boolean {
    return VarBuilder.vars.has(key);
  }

  public static getScope(key: string): any {
    return VarBuilder.vars.get(key);
  }
}
