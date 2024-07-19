import axios, { Method } from "axios";
import { HttpApiConfig } from "../../types/types";

export class RestApiCaller {
  async build(api: HttpApiConfig) {
    await this.callApi(api.endpoint, api.method, api.body, api.params);
  }

  async callApi(
    url: string,
    method: Method,
    params?: any,
    body?: any,
    headers?: any
  ): Promise<any> {
    try {
      const response = await axios({
        method: method,
        headers: headers,
        url: url,
        params: params,
        data: body,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`API call failed: ${error.message}`);
    }
  }
}
