import { log } from "console";
import { VarReader } from "../../lang/tokenizer/reader/varReader";
import { type ApiModel } from "../builder/api.builder";
import { VarBuilder } from "../builder/var.builder";
import { StringUtil } from "../util/StringUtil";

export class ApiCaller {
  constructor(private apiBuilder: ApiModel) {} // Assuming apiBuilder is passed in

  async callApi() {
    const url = this.buildUrl(this.apiBuilder.url);
    const options: RequestInit = {
      method: this.apiBuilder.method,
      headers: this.buildHeaders(this.apiBuilder.header),
      body: StringUtil.interpolateString(this.apiBuilder.body) ?? undefined,
    };

    if (!url) {
      throw new Error(`API URL is not defined`);
    }

    log(`Calling API: ${url}`);
    log(`Options: ${JSON.stringify(options)}`);

    // const response = await fetch(url, options);
    // if (!response.ok) {
    //   throw new Error(`API call failed: ${response.statusText}`);
    // }
    // return response.json();
  }
  buildUrl(url: string | undefined) {
    if (!url) {
      return undefined;
    }

    url = StringUtil.interpolateString(url);

    return url;
  }

  buildHeaders(
    header: Record<string, string> | undefined
  ): Headers | undefined {
    if (!header) {
      return undefined;
    }
    const headers = new Headers();
    for (const [key, value] of Object.entries(header)) {
      headers.append(key, StringUtil.interpolateString(value));
    }
    return headers;
  }
}
