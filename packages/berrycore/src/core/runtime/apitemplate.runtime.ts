import { ApiCoreModel, ParamsCoreModel } from "../producer/core.model";
import axios from "axios";
import { InterpolationUtil } from "../util/interpolations";

export class ApiTemplate {
  constructor(private storedValue: { [key: string]: string }) {}

  /*
   * Process params - Combine storedValue and localStore
   * @param params - ParamsCoreModel[] | undefined
   * @param localStore - { [key: string]: any }
   * @returns { [key: string]: any }
   */
  private processParams(
    params: ParamsCoreModel[] | undefined,
    localStore: { [key: string]: any }
  ): { [key: string]: any } {
    const combineStore = { ...this.storedValue, ...localStore };

    if (!params?.length) {
      return { ...combineStore };
    }

    const paramsStore = params.reduce<Record<string, any>>(
      (acc, { type, key, value }) => {
        acc[key] = type === "Literal" ? value : combineStore[value];
        return acc;
      },
      {}
    );

    return { ...paramsStore, ...combineStore };
  }

  /*
   * Call API
   * @param api - ApiCoreModel
   * @param localStore - { [key: string]: any }
   * @param params - ParamsCoreModel[] | undefined
   * @returns Promise<any>
   */
  public callApi(
    api: ApiCoreModel,
    localStore: { [key: string]: any },
    params?: ParamsCoreModel[] | undefined
  ) {
    const paramsStore = this.processParams(params, localStore);

    const url = InterpolationUtil.replaceInterpolation(
      api.url,
      api.interpolation,
      paramsStore
    );
    const body = InterpolationUtil.replaceInterpolation(
      api.body,
      api.interpolation,
      paramsStore
    );
    const header: Record<string, string> = {};
    for (const key in api.header) {
      header[key] = InterpolationUtil.replaceInterpolation(
        api.header[key],
        api.interpolation,
        paramsStore
      );
    }
    // Build Axios Object
    return axios({
      method: api.method,
      url: url,
      data: body,
      headers: header,
    });
  }
}
