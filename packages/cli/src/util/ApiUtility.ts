import { FormatUtil } from "../berry/FormatUtil.js";
import { FileUtility } from "./FileUtility.js";
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

export class ApiUtility {
  static async add(
    name: any,
    arg: { url: any; method: any; headers: any; body: any }
  ) {
    intro(`📦 Building API`);
    if (!name) {
      const value = await text({
        message: "What is the name of API?",
        placeholder: "Api Name",
        validate: (value) => {
          if (value.length === 0) return `Value is required!`;
        },
      });
      if (isCancel(value)) {
        outro("Cancelled");
        return;
      }
      name = value;
      log.info(`API Name: ${name}`);
    }

    if (!arg.url) {
      const value = await text({
        message: "Please enter the URL",
        placeholder: "https://api.example.com",
        validate: (value) => {
          if (value.length === 0) return `Value is required!`;
          if (!value.match(/[http|https]+:\/\/[^\s'"]+/)) return `Invalid URL`;
        },
      });
      if (isCancel(value)) {
        outro("Cancelled");
        return;
      }
      arg.url = value;
    }
    if (!arg.method) {
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
      arg.method = value;
    }

    if (!arg.headers) {
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
      }
      arg.headers = value;
    }

    if (!arg.body) {
      const hasP = await confirm({
        message: "Do you have a payload?",
      });

      if (isCancel(hasP) || !hasP) {
        log.step("Skipped request payload ");
      } else {
        const body = await group(
          {
            type: () =>
              select({
                message: "Choose the Payload Type",
                options: [
                  { value: "Json" },
                  { value: "Xml" },
                  { value: "Text" },
                  { value: "GraphQL" },
                  { value: "Other" },
                ],
              }),
            payload: () =>
              text({
                message: "Please enter Payload Details (Optional)",
                placeholder: `json / xml / text`,
                validate: (value) => {
                  if (value.length === 0) return `Value is required!`;
                },
              }),
          },
          {
            // On Cancel callback that wraps the group
            // So if the user cancels one of the prompts in the group this function will be called
            onCancel: ({ results }) => {
              log.step("Body details not provided");
              process.exit(0);
            },
          }
        );

        arg.body = body.payload;
      }
    }

    outro(" ✅ done 💾");
  }
  static addFromCurl(name: any, curl: any) {
    intro(`📦 Adding API from cURL `);
    const s = spinner();
    s.start("Coverting cURL to Berry");
    const apiCode = FormatUtil.convertCurlToBerry(curl, name);
    s.stop("Convertion completed successfully");
    const status = FileUtility.updateBerryCode(apiCode);
    outro(
      status == "Success"
        ? "Successfully updated ✅"
        : "Failed to update berry code 😔"
    );
  }
}
