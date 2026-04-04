/**
 * api-utility.ts
 *
 * Handles the `flexiberry add api` command flow.
 * Uses native lib/prompts and lib/colors instead of chalk + @clack/prompts.
 */

import { CmdOptions } from "../command/add-command.js";
import { FileUtility } from "./file-utility.js";
import {
  intro,
  outro,
  log,
  text,
  select,
  confirm,
  group,
  spinner,
  isCancel,
} from "../lib/prompts.js";
import { colors } from "../lib/colors.js";
import { outroMessage } from "./util.js";
import { FormatUtil, PostmanUtil, SwaggerUtil } from "@flexiberry/berrycore";

export class ApiUtility {
  // ─── Import-from helpers ──────────────────────────────────────────────────

  /** Imports APIs from a Postman collection file. */
  static addFromPostman(name: string, postman: string): void {
    intro(`📦 Adding API from Postman Collection`);
    const s = spinner();
    s.start("Converting Postman Collection to Berry...");
    try {
      const apiCode = PostmanUtil.convertFromPostmanFile(postman);
      s.stop("Conversion completed successfully ✔");
      const status = FileUtility.updateBerryCode(apiCode);
      outro(outroMessage(status));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      log.error(msg);
      s.stop(colors.red("Conversion failed ✖"));
      outro(colors.red("Error ❌"));
    }
  }

  /** Imports APIs from a Swagger / OpenAPI URL. */
  static async addFromSwagger(name: string, swagger: string): Promise<void> {
    intro(`📦 Adding API from Swagger / OpenAPI`);
    const s = spinner();
    s.start("Fetching and converting Swagger spec...");
    try {
      const apiCode = await SwaggerUtil.convertFromSwaggerApi(swagger);
      s.stop("Conversion completed successfully ✔");
      const status = FileUtility.updateBerryCode(apiCode);
      outro(outroMessage(status));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      log.error(msg);
      s.stop(colors.red("Conversion failed ✖"));
      outro(colors.red("Error ❌"));
    }
  }

  /** Imports an API from a cURL command string. */
  static addFromCurl(name: string, curl: string): void {
    intro(`📦 Adding API from cURL`);
    const s = spinner();
    s.start("Converting cURL to Berry DSL...");
    const apiCode = FormatUtil.convertCurlToBerry(curl, name);
    s.stop("Conversion completed successfully ✔");
    const status = FileUtility.updateBerryCode(apiCode);
    outro(outroMessage(status));
  }

  // ─── Interactive add ──────────────────────────────────────────────────────

  /** Prompts for all API details interactively and generates the DSL code. */
  static async add(name: string, arg: CmdOptions): Promise<void> {
    intro(`📦 Building API Interactively`);

    const resolvedName = await this.getInput("What is the name of this API?", "Api Name", name);
    if (!resolvedName) return;

    arg.url = await this.getUrl(arg.url);
    if (!arg.url) return;

    arg.method = await this.getMethod(arg.method);
    if (!arg.method) return;

    arg.headers = await this.getHeaders(arg.headers);

    const body = await this.getBody(arg.body);
    arg.body = body?.payload;
    arg.bodyType = body?.type;

    // At this point url and method are guaranteed to be strings
    const code = FormatUtil.buildApi(resolvedName, {
      method: arg.method,
      url: arg.url,
      headers: arg.headers,
      body: arg.body,
      bodyType: arg.bodyType,
    });
    log.step("DSL code generated ✔");

    const status = FileUtility.updateBerryCode(code);
    outro(outroMessage(status));
  }

  // ─── Field prompts ────────────────────────────────────────────────────────

  /** Generic text input with optional default. Returns null on cancel. */
  static async getInput(
    message: string,
    placeholder: string,
    defaultValue?: string
  ): Promise<string | undefined> {
    if (defaultValue) return defaultValue;

    const value = await text({
      message,
      placeholder,
      validate: (v) => (v.trim().length === 0 ? "A value is required!" : undefined),
    });

    if (isCancel(value)) {
      outro("Cancelled ❌");
      return undefined;
    }
    return value;
  }

  /** Prompts for the API URL, or returns the existing value if already set. */
  static async getUrl(existingUrl?: string): Promise<string | undefined> {
    if (existingUrl) return existingUrl;
    return this.getInput("Please enter the API URL", "https://api.example.com");
  }

  /** Prompts to pick an HTTP method, or returns the existing value. */
  static async getMethod(existingMethod?: string): Promise<string | undefined> {
    if (existingMethod) return existingMethod;

    const value = await select({
      message: "Choose the HTTP method",
      options: [
        { value: "GET",    label: "GET    — Retrieve data" },
        { value: "POST",   label: "POST   — Create a resource" },
        { value: "PUT",    label: "PUT    — Replace a resource" },
        { value: "PATCH",  label: "PATCH  — Partially update a resource" },
        { value: "DELETE", label: "DELETE — Remove a resource" },
      ],
    });

    if (isCancel(value)) {
      outro("Cancelled ❌");
      return undefined;
    }
    return value;
  }

  /** Optionally prompts for request headers. */
  static async getHeaders(existingHeaders?: string): Promise<string | undefined> {
    if (existingHeaders) return existingHeaders;

    const add = await confirm({ message: "Do you want to add request headers?" });
    if (isCancel(add) || !add) {
      log.step("Headers skipped.");
      return undefined;
    }

    const value = await text({
      message: "Enter headers as comma-separated key:value pairs",
      placeholder: "Content-Type:application/json , Authorization:Bearer token",
      validate: (v) => {
        if (v.trim().length === 0) return "At least one header is required!";
        const pairs = v.split(",");
        for (const pair of pairs) {
          if (!/[^:]+:[^:]+/.test(pair.trim())) return "Invalid header format — use key:value";
        }
      },
    });

    if (isCancel(value)) {
      log.step("Header details not provided.");
      return undefined;
    }
    return value.toString();
  }

  /** Optionally prompts for a request body and its content type. */
  static async getBody(existingBody?: string): Promise<{ type: string; payload: string } | undefined> {
    if (existingBody) return undefined; // Caller already supplies the body

    const has = await confirm({ message: "Does this API have a request body?" });
    if (isCancel(has) || !has) {
      log.step("Request body skipped.");
      return undefined;
    }

    const body = await group(
      {
        type: () =>
          select({
            message: "Choose the body content type",
            options: [
              { value: "JSON",    label: "JSON" },
              { value: "XML",     label: "XML" },
              { value: "TEXT",    label: "Plain Text" },
              { value: "GRAPHQL", label: "GraphQL" },
              { value: "OTHER",   label: "Other" },
            ],
          }),
        payload: () =>
          text({
            message: "Enter the request body payload",
            placeholder: `{ "key": "value" }`,
            validate: (v) => (v.trim().length === 0 ? "Payload is required!" : undefined),
          }),
      },
      {
        onCancel: () => {
          log.step("Request body skipped.");
          process.exit(0);
        },
      }
    );

    const type = (body.type ?? "OTHER") as string;
    const payload = (body.payload ?? "") as string;

    return {
      type,
      payload: type === "JSON" ? this.jsonFormat(payload) : payload,
    };
  }

  /** Formats a JSON string with 2-space indentation. Returns original on parse failure. */
  private static jsonFormat(jsonString: string): string {
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch {
      return jsonString;
    }
  }
}
