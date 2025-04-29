import { type ApiModel } from "../builder/api.builder";
import { ApiCoreModel } from "../producer/core.model";
import axios from "axios";
import { InterpolationUtil } from "../util/interpolations";

export class ApiTemplate {
  constructor(private apiBuilder: ApiModel) {} // Assuming apiBuilder is passed in

  public callApi(api: ApiCoreModel) {
    const url = InterpolationUtil.replaceInterpolation(
      api.url,
      api.interpolation
    );
    const body = InterpolationUtil.replaceInterpolation(
      api.body,
      api.interpolation
    );
    const header: Record<string, string> = {};
    for (const key in api.header) {
      header[key] = InterpolationUtil.replaceInterpolation(
        api.header[key],
        api.interpolation
      );
    }

    // Build Axios Object
    return axios({
      method: api.method,
      url: url,
      data: body,
      headers: header,
      params: {},
    });
  }
}
