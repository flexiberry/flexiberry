import { log } from "@clack/prompts";
import { ApiUtility } from "./../util/ApiUtility.js";
import { EnvUtility } from "./../util/EnvUtility.js";
import { StepUtility } from "./../util/StepUtility.js";
import { TaskUtility } from "./../util/TaskUtility.js";

export class AddCommand {
  static run(
    type: string,
    name: string,
    options: { curl: any; url: any; method: any; headers: string; body: any }
  ) {
    switch (type.toLowerCase()) {
      case "api":
        if (options.curl) {
          ApiUtility.addFromCurl(name, options.curl);
        } else {
          ApiUtility.add(name, {
            url: options.url,
            method: options.method,
            headers: options.headers?.split(","),
            body: options.body,
          });
        }
        break;

      case "env":
        EnvUtility.add(name?.split(",") || []);
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
