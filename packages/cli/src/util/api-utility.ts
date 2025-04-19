import { CmdOptions } from "../command/add-command.js";
import { FileUtility } from "./file-utility.js";
import {
  confirm,
  group,
  intro,
  isCancel,
  log,
  outro,
  select,
  spinner,
  text,
} from "@clack/prompts";
import { outroMessage } from "./util.js";
import { FormatUtil, SwaggerUtil } from "@flexiberry/berrycore";
import chalk from "chalk";

export class ApiUtility {
  static async addFromSwagger(name: string, swagger: any) {
    intro(`📦 Adding API from Swagger`);
    const s = spinner();
    s.start("Please wait... Converting Swagger to Berry");
    try {
      const apiCode = await SwaggerUtil.convertFromSwaggerApi(swagger);
      s.stop("Conversion completed successfully");
      const status = FileUtility.updateBerryCode(apiCode);
      outro(outroMessage(status));
    } catch (error: any) {
      log.error(error);
      s.stop("Conversion failed");
      outro(chalk.red("Error"));
    }
  }
  static addFromCurl(name: any, curl: any) {
    intro(`📦 Adding API from cURL `);
    const s = spinner();
    s.start("Converting cURL to Berry");
    const apiCode = FormatUtil.convertCurlToBerry(curl, name);

    s.stop("Conversion completed successfully");
    const status = FileUtility.updateBerryCode(apiCode);
    outro(outroMessage(status));
  }
  static async add(name: any, arg: CmdOptions) {
    intro(`📦 Building API`);
    name = await this.getInput("What is the name of API?", "Api Name", name);
    if (!name) return;
    arg.url = await this.getUrl(arg.url);
    if (!arg.url) return;
    arg.method = await this.getMethod(arg.method);
    if (!arg.method) return;
    arg.headers = await this.getHeaders(arg.headers);
    const body = await this.getBody(arg.body);
    arg.body = body?.payload;
    arg.bodyType = body?.type;

    const code = FormatUtil.buildApi(name, arg);
    log.step("Code generated");

    const status = FileUtility.updateBerryCode(code);
    outro(outroMessage(status));
  }

  static async getInput(
    message: string,
    placeholder: string,
    defaultValue: any
  ) {
    if (defaultValue) return defaultValue;
    const value = await text({
      message,
      placeholder,
      validate: (value) =>
        value.length === 0 ? `Value is required!` : undefined,
    });
    if (isCancel(value)) {
      outro("Cancelled");
      return null;
    }
    return value;
  }

  static async getUrl(existingUrl: any) {
    if (existingUrl) return existingUrl;
    return await this.getInput(
      "Please enter the URL",
      "https://api.example.com",
      existingUrl
    );
  }

  static async getMethod(existingMethod: any) {
    if (existingMethod) return existingMethod;
    const value = await select({
      message: "Choose the HTTP method",
      options: [
        { value: "GET" },
        { value: "POST" },
        { value: "PUT" },
        { value: "PATCH" },
        { value: "DELETE" },
      ],
    });
    if (isCancel(value)) {
      outro("Cancelled");
      return;
    }
    return value;
  }

  static async getHeaders(existingHeaders: any) {
    if (existingHeaders) return existingHeaders;
    const hasP = await confirm({
      message: "Do you want to update Header details?",
    });
    if (isCancel(hasP) || !hasP) {
      log.step("Headers skipped");
      return;
    }
    const value = await text({
      message: "Please enter Header Details (Optional)",
      placeholder: "key1:value1 , key2:value2",
      validate: (value) => {
        if (value.length === 0) return `Value is required!`;
        const split = value.split(",");
        for (let i = 0; i < split.length; i++) {
          if (!split[i].match(/[^:]+:[^:]+/)) return `Invalid Header format`;
        }
      },
    });
    if (isCancel(value)) {
      log.step("Header details not provided");
      return;
    }
    return value.toString();
  }

  static async getBody(existingBody: any) {
    if (existingBody) return existingBody;
    const hasP = await confirm({ message: "Do you have a payload?" });
    if (isCancel(hasP) || !hasP) {
      log.step("Request payload skipped");
      return;
    }
    const body = await group(
      {
        type: () =>
          select({
            message: "Choose the Payload Type",
            options: [
              { value: "JSON" },
              { value: "XML" },
              { value: "TEXT" },
              { value: "GRAPQL" },
              { value: "OTHER" },
            ],
          }),
        payload: () =>
          text({
            message: "Please enter Payload Details (Optional)",
            placeholder: `json / xml / text`,
            validate: (value) =>
              value.length === 0 ? `Value is required!` : undefined,
          }),
      },
      {
        onCancel: ({ results }) => {
          log.step("Request body skipped");
          process.exit(0);
        },
      }
    );
    if (body.type === "JSON") {
      body.payload = this.jsonFormat(body.payload);
    }
    return body;
  }

  private static jsonFormat(jsonString: string): string {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return jsonString; // Return original string if parsing fails
    }
  }
}
