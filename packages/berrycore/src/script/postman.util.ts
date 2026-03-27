import * as fs from "fs";

/**
 * Postman Collection Interfaces (Minimal for conversion)
 */
export interface PostmanHeader {
  key: string;
  value: string;
  description?: string;
}

export interface PostmanUrl {
  raw: string;
  protocol?: string;
  host?: string[];
  path?: string[];
  query?: Array<{ key: string; value: string }>;
  variable?: Array<{ key: string; value: string }>;
}

export interface PostmanBody {
  mode: "raw" | "urlencoded" | "formdata" | "file" | "graphql";
  raw?: string;
  urlencoded?: Array<{ key: string; value: string }>;
  formdata?: Array<{ key: string; value: string }>;
  options?: {
    raw?: {
      language: string;
    };
  };
}

export interface PostmanRequest {
  method: string;
  header: PostmanHeader[];
  url: PostmanUrl | string;
  body?: PostmanBody;
}

export interface PostmanItem {
  name: string;
  request?: PostmanRequest;
  item?: PostmanItem[];
}

export interface PostmanCollection {
  info: {
    name: string;
    schema: string;
  };
  item: PostmanItem[];
}

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

    let collection: PostmanCollection;
    try {
      collection = JSON.parse(content);
    } catch (e) {
      throw new Error(`Invalid JSON in Postman file`);
    }

    if (!collection.item) {
      throw new Error("No items found in Postman collection");
    }

    const lines: string[] = [];

    // Recursively process items
    this.processItems(collection.item, lines);

    return lines.join("\n").trim() + "\n";
  }

  /**
   * Internal recursive processor for Postman items
   */
  private static processItems(items: PostmanItem[], lines: string[], parentName = ""): void {
    for (const item of items) {
      if (item.item) {
        // It's a folder/group
        this.processItems(item.item, lines, item.name);
        continue;
      }

      if (!item.request) continue;

      const req = item.request;
      const name = item.name || parentName || "api";
      const method = (req.method || "GET").toUpperCase();

      // 1. URL Resolution
      let url = this.buildUrl(req.url);
      // Replace postman path params :param with berry {{param}}
      url = url.replace(/\/:([a-zA-Z0-9_]+)/g, "/{{$1}}");

      // 2. ID Generation (Abbreviation)
      const apiId = this.abbreviate(name);

      // 3. Construct Berry Block
      lines.push(`Api ${method} #${apiId} ${name}`);
      lines.push(`Url ${url}`);

      // 4. Headers
      const headers = this.extractHeaders(req.header);
      if (headers.length > 0) {
        lines.push("Header");
        for (const h of headers) {
          lines.push(`- ${h}`);
        }
      }

      // 5. Body
      const bodyContent = this.extractBody(req.body);
      if (bodyContent) {
        const bodyType = this.detectBodyType(req.header, req.body);
        // Clean body to single line for preview-style import or preserve formatting?
        // Let's preserve formatting if it's multiple lines
        if (bodyContent.includes("\n")) {
          lines.push(`Body ${bodyType} \`${bodyContent.trim()}\``);
        } else {
          lines.push(`Body ${bodyType} \`${bodyContent}\``);
        }
      }

      lines.push(""); // Spacer
    }
  }

  /**
   * Build URL string from Postman URL object
   */
  private static buildUrl(url: PostmanUrl | string): string {
    if (typeof url === "string") return url;
    if (!url) return "";
    if (url.raw) return url.raw;

    if (url.host) {
      const protocol = url.protocol || "https";
      const host = url.host.join(".");
      const path = url.path ? "/" + url.path.join("/") : "";
      let fullUrl = `${protocol}://${host}${path}`;

      if (url.query && url.query.length > 0) {
        const queryParams = url.query
          .filter((q) => q.key)
          .map((q) => `${q.key}={{${q.key}}}`)
          .join("&");
        fullUrl += `?${queryParams}`;
      }
      return fullUrl;
    }
    return "";
  }

  /**
   * Abbreviate title to camelCase ID
   */
  private static abbreviate(title: string): string {
    const stopWords = new Set(["a", "in", "the", "with", "and", "of", "to", "for", "on", "at", "by", "is", "it"]);
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "") // Remove special chars
      .split(" ")
      .filter((word) => word.length > 0 && !stopWords.has(word))
      .map((word, index) => (index === 0 ? word : word[0].toUpperCase() + word.slice(1)))
      .join("");
  }

  /**
   * Extract headers to Berry format
   */
  private static extractHeaders(headers?: PostmanHeader[]): string[] {
    if (!headers || !Array.isArray(headers)) return [];
    return headers
      .filter((h) => h.key && h.value !== undefined)
      .map((h) => `${h.key.trim()}: '${h.value.trim()}'`);
  }

  /**
   * Extract body content from Postman request
   */
  private static extractBody(body?: PostmanBody): string {
    if (!body || !body.mode) return "";

    switch (body.mode) {
      case "raw":
        return body.raw || "";
      case "urlencoded":
        if (body.urlencoded) {
          const obj: Record<string, string> = {};
          body.urlencoded.forEach((kv) => (obj[kv.key] = kv.value));
          return JSON.stringify(obj, null, 2);
        }
        break;
      case "formdata":
        if (body.formdata) {
          const obj: Record<string, string> = {};
          body.formdata.forEach((kv) => (obj[kv.key] = kv.value));
          return JSON.stringify(obj, null, 2);
        }
        break;
      case "graphql":
        // Postman stores graphql in a specific way, but we'll treat as raw for now
        return body.raw || "";
    }
    return "";
  }

  /**
   * Detect Berry body type from content-type or Postman options
   */
  private static detectBodyType(headers?: PostmanHeader[], body?: PostmanBody): string {
    if (body?.options?.raw?.language) {
      const lang = body.options.raw.language.toUpperCase();
      if (["JSON", "XML"].includes(lang)) return lang;
    }

    const contentType = headers?.find((h) => h.key.toLowerCase() === "content-type")?.value.toLowerCase() || "";

    if (contentType.includes("json")) return "JSON";
    if (contentType.includes("xml")) return "XML";
    if (contentType.includes("form")) return "FORM";
    if (contentType.includes("octet-stream")) return "BINARY";

    return "RAW";
  }
}
