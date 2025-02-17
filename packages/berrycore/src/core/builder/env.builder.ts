import type { EnvCoreModel } from "../producer/core.model";

export class EnvBuilder {
  private static env: Map<string, any>;

  private static activeEnv: string;

  public static setActiveEnv(env: string): void {
    EnvBuilder.activeEnv = env;
  }

  public static getActiveEnv(): string {
    if (!EnvBuilder.activeEnv) {
      return "default";
    }
    return EnvBuilder.activeEnv;
  }

  public static init(envJson: EnvCoreModel[]): void {
    EnvBuilder.env = EnvBuilder.convertJsonArrayToMap(envJson);
  }

  private static convertJsonArrayToMap(
    envJson: EnvCoreModel[]
  ): Map<string, any> {
    const map = new Map<string, any>();
    envJson.forEach((env) => {
      map.set(env.values, env.scope);
    });
    return map;
  }

  public static getEnv(): Map<string, any> {
    return EnvBuilder.env;
  }

  public static updateEnv(key: string, value: any): void {
    EnvBuilder.env.set(key, value);
  }

  //  utility function to get all keys from the environment map
  public static getEnvList(): string[] {
    return Array.from(EnvBuilder.env.keys());
  }

  //  utility function to check if a specific key exists in the environment
  public static isExists(key: string): boolean {
    return EnvBuilder.env.has(key);
  }

  //  utility function to check the scope of a specific key
  public static getScope(key: string): any {
    return EnvBuilder.env.get(key);
  }
}
