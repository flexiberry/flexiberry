/**
 * add-command.ts
 *
 * Routes `flexiberry add <type>` subcommands to the appropriate utility class.
 * Uses native lib/prompts log helper instead of @clack/prompts.
 */

import { log } from "../lib/prompts.js";
import { ApiUtility } from "./../util/api-utility.js";
import { EnvUtility } from "./../util/env-utility.js";
import { StepUtility } from "./../util/step-utility.js";
import { TaskUtility } from "./../util/task-utility.js";
import { VarUtility } from "../util/var-utility.js";

export type CmdOptions = {
  curl?: string;
  swagger?: string;
  url?: string;
  method?: string;
  postman?: string;
  headers?: string;
  body?: string;
  bodyType?: string;
  title?: string;
  env?: string;
  var?: string;
};

export class AddCommand {
  static run(type: string, name: string, options: CmdOptions): void {
    switch (type.toLowerCase()) {
      case "api":
        if (options.curl) {
          ApiUtility.addFromCurl(name, options.curl);
        } else if (options.swagger) {
          ApiUtility.addFromSwagger(name, options.swagger);
        } else if (options.postman) {
          ApiUtility.addFromPostman(name, options.postman);
        } else {
          ApiUtility.add(name, options);
        }
        break;

      case "env":
        EnvUtility.add(name, options);
        break;

      case "task":
        if (!name) {
          log.error("A name is required for type 'task'.");
          return;
        }
        TaskUtility.add(name);
        break;

      case "step":
        if (!name) {
          log.error("A name is required for type 'step'.");
          return;
        }
        StepUtility.add(name, options);
        break;

      case "var":
        VarUtility.add(name, options);
        break;

      default:
        log.error(`Unknown type: "${type}". Valid types: api, env, task, step, var`);
    }
  }
}
