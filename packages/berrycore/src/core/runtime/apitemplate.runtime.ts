import { type ApiModel } from "../builder/api.builder";
import {
  ApiCoreModel,
  ParamsCoreModel,
  VarCoreModel,
} from "../producer/core.model";
import axios from "axios";
import { InterpolationUtil } from "../util/interpolations";

export class ApiTemplate {
  p: Record<string, string> | undefined = {};

  constructor(
    private varModel?: VarCoreModel[],
    private params?: ParamsCoreModel[]
  ) {
    this.p = this.params
      ? Object.fromEntries(this.params.map((v) => [v.key, v.value]))
      : undefined;
  } // Assuming apiBuilder is passed in

  public callApi(api: ApiCoreModel) {
    console.log(this.varModel);

    const url = InterpolationUtil.replaceInterpolation(
      api.url,
      api.interpolation,
      this.p
    );
    const body = InterpolationUtil.replaceInterpolation(
      api.body,
      api.interpolation,
      this.p
    );
    const header: Record<string, string> = {};
    for (const key in api.header) {
      header[key] = InterpolationUtil.replaceInterpolation(
        api.header[key],
        api.interpolation,
        this.p
      );
    }

    // Build Axios Object
    return axios({
      method: api.method,
      url: url,
      data: body,
      headers: header,
      params: this.params,
    });
  }
}
