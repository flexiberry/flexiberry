import * as fs from "fs";

export class PostmanUtil {
  /**
   * Convert a Postman collection file (JSON) to Berry API code
   * @param filePath Path to the Postman collection JSON file
   */
  static convertFromPostmanFile(filePath: string): string {
    let content: string;
    try {
      content = fs.readFileSync(filePath, "utf-8");
    } catch (e) {
      throw new Error(`Failed to read file: ${e}`);
    }
    let collection: any;
    try {
      collection = JSON.parse(content);
    } catch (e) {
      throw new Error(`Invalid JSON in Postman file`);
    }
    if (!collection.item)
      throw new Error("No items found in Postman collection");
    let result = "";

    // Helper: Build URL from req.url
    function buildUrl(req: any): string {
      if (typeof req.url === "string") return req.url;
      if (!req.url) return "";
      if (req.url.raw) return req.url.raw;
      if (req.url.host) {
        let url = `${req.url.protocol || "https"}://${req.url.host.join(".")}${req.url.path ? "/" + req.url.path.join("/") : ""}`;
        if (req.url.query && req.url.query.length > 0) {
          url +=
            "?" +
            req.url.query.map((q: any) => `${q.key}={{${q.key}}}`).join("&");
        }
        return url;
      }
      return "";
    }

    // Helper: Extract headers
    function extractHeaders(req: any): string[] {
      if (!req.header || !Array.isArray(req.header)) return [];
      return req.header
        .filter((h: any) => h.key && h.value !== undefined)
        .map((h: any) => `${h.key}: '${h.value}'`);
    }

    function abbreviation(title: string): string {
      const stopWords = new Set([
        "a",
        "in",
        "the",
        "with",
        "and",
        "of",
        "to",
        "for",
        "on",
        "at",
        "by",
      ]);

      return title
        .toLowerCase()
        .split(" ")
        .filter((word) => !stopWords.has(word))
        .map((word, index) =>
          index === 0 ? word : word[0].toUpperCase() + word.slice(1)
        )
        .join("");
    }
    // Helper: Extract body content
    function extractBody(req: any): string {
      if (!req.body || !req.body.mode) return "";
      if (req.body.mode === "raw" && req.body.raw) return req.body.raw;
      if (req.body.mode === "urlencoded" && req.body.urlencoded) {
        const obj: any = {};
        req.body.urlencoded.forEach((kv: any) => {
          obj[kv.key] = kv.value;
        });
        return JSON.stringify(obj, null, 2);
      }
      if (req.body.mode === "formdata" && req.body.formdata) {
        const obj: any = {};
        req.body.formdata.forEach((kv: any) => {
          obj[kv.key] = kv.value;
        });
        return JSON.stringify(obj, null, 2);
      }
      return "";
    }

    // Helper: Detect body type
    function detectBodyType(headers: string[], req: any): string {
      let bodyType = "JSON";
      let contentTypeHeader = headers.find((h) =>
        h.toLowerCase().startsWith("content-type")
      );
      if (contentTypeHeader) {
        const ct = contentTypeHeader.toLowerCase();
        if (ct.includes("json")) bodyType = "JSON";
        else if (ct.includes("xml")) bodyType = "XML";
        else if (ct.includes("form")) bodyType = "FORM";
        else if (ct.includes("x-www-form-urlencoded")) bodyType = "FORM";
        else if (ct.includes("octet-stream")) bodyType = "BINARY";
        else
          bodyType =
            contentTypeHeader
              .split(":")[1]
              ?.replace(/['\"]/g, "")
              .trim()
              .toUpperCase() || "RAW";
      } else if (
        req.body &&
        req.body.options &&
        req.body.options.raw &&
        req.body.options.raw.language === "xml"
      ) {
        bodyType = "XML";
      } else {
        bodyType = "RAW";
      }
      return bodyType;
    }

    // Recursively process items (folders or requests)
    function processItems(items: any[], parentName = "") {
      for (const item of items) {
        if (item.item) {
          processItems(item.item, item.name);
          continue;
        }
        if (!item.request) continue;
        const req = item.request;
        const name = item.name || parentName || "api";
        const method = req.method || "GET";
        // URL
        let url = buildUrl(req);
        url = url.replace(/\/:([a-zA-Z0-9_]+)/g, "/{{$1}}");
        // ID
        let apiId = abbreviation(name);
        result += `Api ${method.toUpperCase()} #${apiId} ${name}\n`;
        result += `Url ${url}\n`;
        // Headers
        let headers = extractHeaders(req);
        if (headers.length > 0) {
          result += "Header\n";
          for (const h of headers) {
            result += `- ${h}\n`;
          }
        }
        // Body
        const bodyContent = extractBody(req);
        if (bodyContent) {
          const bodyType = detectBodyType(headers, req);
          result += `Body ${bodyType} \`${bodyContent}\`\n`;
        }
        result += "\n";
      }
    }
    processItems(collection.item);
    return result.trim();
  }
}
