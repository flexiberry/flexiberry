import { ApiBuilder } from "../builder/api.builder";
import { EnvBuilder } from "../builder/env.builder";
import { VarBuilder } from "../builder/var.builder";
import { ApiCaller } from "../runtime/Api.runtime";

export class Test {
  public test() {
    console.log("Test");
    console.log(VarBuilder.getVars());
    console.log(EnvBuilder.getEnv());
    console.log(ApiBuilder.getApis());

    const api = ApiBuilder.getApi("API");
    if (api) {
      let resp = new ApiCaller(api).callApi();
      resp.then((resp) => {
        console.log(resp);
      });
    } else {
      console.error("API not found");
    }
  }
}
