import { log } from "@clack/prompts";
import { ApiUtility } from "./../util/ApiUtility.js";
import { EnvUtility } from "./../util/EnvUtility.js";
import { StepUtility } from "./../util/StepUtility.js";
import { TaskUtility } from "./../util/TaskUtility.js";

export type CmdOptions = {
  curl?: any;
  url?: any;
  method?: any;
  headers?: string;
  body?: any;
  bodyType: any;
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

      default:
        console.error(`Unknown type: ${type}`);
    }
  }
}
