import type { ApiCoreModel } from "../producer/core.model";

export type ApiModel = {
  url?: string;
  header?: Record<string, string>;
  body: string;
  bodyType?: string;
  method: string;
  interpolation?: string[];
};
export class ApiBuilder {
  private static apis: Map<string, ApiModel>;

  public static init(apiCore: ApiCoreModel[]): void {
    ApiBuilder.apis = ApiBuilder.convertJsonArrayToMap(apiCore);
  }

  static convertJsonArrayToMap(apiCore: ApiCoreModel[]): Map<string, ApiModel> {
    const map = new Map<string, ApiModel>();
    apiCore.forEach((api) => {
      map.set(api.id, {
        url: api.url,
        header: api.header,
        body: api.body,
        bodyType: api.bodyType,
        method: api.method,
        interpolation: api.interpolation,
      });
    });
    return map;
  }

  public static getApis(): Map<string, ApiModel> {
    return ApiBuilder.apis;
  }

  public static updateApis(key: string, value: ApiModel): void {
    ApiBuilder.apis.set(key, value);
  }

  public static getApiList(): string[] {
    return Array.from(ApiBuilder.apis.keys());
  }

  public static isExists(key: string): boolean {
    return ApiBuilder.apis.has(key);
  }

  public static getApi(key: string): ApiModel | undefined {
    return ApiBuilder.apis.get(key);
  }
}
