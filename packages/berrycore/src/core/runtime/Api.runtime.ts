import { log } from "console";
import { VarReader } from "../../lang/tokenizer/reader/varReader";
import { type ApiModel } from "../builder/api.builder";
import { VarBuilder } from "../builder/var.builder";
import { StringUtil } from "../util/StringUtil";
import { ApiCoreModel } from "../producer/core.model";
import axios from "axios";
import { InterpolationUtil } from "../util/Interpolations";

export class ApiTemplate {
  constructor(private apiBuilder: ApiModel) {} // Assuming apiBuilder is passed in

  /**
   * Calls the API with the given name and arguments
   * @param apiName The name of the API to call
   * @param args The arguments to pass to the API
   * @returns The result of the API call
   */
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

    // log(`Calling API: ${api.method} ${url}`);
    // log(`Body: ${body}`);
    // log(`Header: ${header}`);

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
