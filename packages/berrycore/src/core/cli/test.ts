import { ApiBuilder } from "../builder/api.builder";
import { EnvBuilder } from "../builder/env.builder";
import { VarBuilder } from "../builder/var.builder";
import { ApiCaller } from "../runtime/Api.runtime";

export class Test {
  public test() {
    const api = ApiBuilder.getApi("API");
    if (api) {
      const resp = new ApiCaller(api).callApi();
      resp.then((resp) => {});
    } else {
      console.error("API not found");
    }
  }
}
