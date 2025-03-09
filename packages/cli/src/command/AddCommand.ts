import { log } from "@clack/prompts";
import { ApiUtility } from "./../util/ApiUtility.js";
import { EnvUtility } from "./../util/EnvUtility.js";
import { StepUtility } from "./../util/StepUtility.js";
import { TaskUtility } from "./../util/TaskUtility.js";
import { VarUtility } from "../util/VarUtility.js";

export type CmdOptions = {
  curl?: any;
  url?: any;
  method?: any;
  headers?: string;
  body?: any;
  bodyType: any;
  env?: any;
  var?: any;
};

export class AddCommand {
  static run(type: string, name: string, options: CmdOptions) {
    switch (type.toLowerCase()) {
      case "api":
        if (options.curl) {
          ApiUtility.addFromCurl(name, options.curl);
        } else {
          ApiUtility.add(name, options);
        }
        break;

      case "env":
        EnvUtility.add(name, options);
        break;

      case "task":
        if (!name) throw new Error("Name is required for task");
        TaskUtility.add(name);
        break;

      case "step":
        if (!name) throw new Error("Name is required for step");
        StepUtility.add(name, options);
        break;
      case "var":
        VarUtility.add(name, options);
        break;
      default:
        console.error(`Unknown type: ${type}`);
    }
  }
}
