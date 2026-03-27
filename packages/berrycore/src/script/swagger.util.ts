/**
 * Swagger / OpenAPI Utility
 *
 * Utilities for converting Swagger/OpenAPI definitions to Berry code.
 */

export interface OpenApiSchema {
  type?: string;
  properties?: Record<string, OpenApiSchema>;
  items?: OpenApiSchema;
  $ref?: string;
  example?: any;
  default?: any;
}

export interface OpenApiParameter {
  name: string;
  in: "path" | "query" | "header" | "body";
  required?: boolean;
  schema?: OpenApiSchema;
  example?: any;
  default?: any;
}

export interface OpenApiOperation {
  operationId?: string;
  summary?: string;
  parameters?: OpenApiParameter[];
  requestBody?: {
    content: Record<string, { schema: OpenApiSchema; example?: any }>;
  };
  consumes?: string[];
  produces?: string[];
}

export interface OpenApiDefinition {
  openapi?: string;
  swagger?: string;
  host?: string;
  basePath?: string;
  schemes?: string[];
  servers?: Array<{ url: string }>;
  paths: Record<string, Record<string, OpenApiOperation>>;
  components?: {
    schemas: Record<string, OpenApiSchema>;
  };
  definitions?: Record<string, OpenApiSchema>;
}

export class SwaggerUtil {
  /**
   * Fetch a Swagger/OpenAPI doc from a URL and convert it to Berry code
   */
  static async convertFromSwaggerApi(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return `Failed to fetch Swagger: ${response.status} ${response.statusText}`;
      }
      const swaggerJson = await response.text();
      const id = url.split("/").pop() || "api";
      return this.convertSwaggerToBerry(swaggerJson, id);
    } catch (e) {
      return `Error fetching Swagger: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  /**
   * Convert a Swagger/OpenAPI JSON string to Berry code
   */
  static convertSwaggerToBerry(swagger: string | OpenApiDefinition, id: string): string {
    let obj: OpenApiDefinition;
    try {
      obj = typeof swagger === "string" ? JSON.parse(swagger) : swagger;
    } catch (e) {
      return `Invalid Swagger/OpenAPI JSON`;
    }

    if (!obj.paths) return "No paths found in Swagger definition";

    const lines: string[] = [];
    const serverUrl = obj.servers?.[0]?.url || "";
    const schemas = obj.components?.schemas || obj.definitions || {};

    let apiCount = 1;

    for (const [path, methods] of Object.entries(obj.paths)) {
      if (!methods) continue;

      for (const [method, details] of Object.entries(methods)) {
        if (typeof details !== "object") continue;

        const opId = details.operationId || `${id}${apiCount}`;
        const { modPath, queryParams } = this.handlePathParams(path, details.parameters || []);

        const finalUrl = this.buildUrl(modPath, serverUrl, obj, queryParams);
        const headers = this.extractHeaders(details);
        const bodyBlock = this.generateBodyBlock(details, schemas);

        // ── Construct API Block ──
        lines.push(`Api ${method.toUpperCase()} #${opId} ${details.summary || ""}`);
        lines.push(`Url ${finalUrl}`);

        if (headers.length > 0) {
          lines.push("Header");
          for (const h of headers) lines.push(`- ${h}`);
        }

        if (bodyBlock) lines.push(bodyBlock);

        lines.push(""); // Spacer
        apiCount++;
      }
    }

    return lines.join("\n").trim() + "\n";
  }

  /**
   * Replace {param} with {{param}} and extract query params
   */
  private static handlePathParams(path: string, params: OpenApiParameter[]): { modPath: string; queryParams: string[] } {
    let modPath = path;
    const queryParams: string[] = [];

    for (const param of params) {
      if (param.in === "path") {
        modPath = modPath.replace(new RegExp(`{${param.name}}`, "g"), `{{${param.name}}}`);
      } else if (param.in === "query") {
        queryParams.push(`${param.name}={{${param.name}}}`);
      }
    }
    return { modPath, queryParams };
  }

  /**
   * Build the full URL
   */
  private static buildUrl(modPath: string, serverUrl: string, obj: OpenApiDefinition, queryParams: string[]): string {
    let url = modPath;

    if (serverUrl) {
      url = serverUrl.endsWith("/") && modPath.startsWith("/") ? serverUrl + modPath.slice(1) : serverUrl + modPath;
    } else if (obj.host) {
      const scheme = obj.schemes?.[0] || "https";
      const base = obj.basePath || "";
      url = `${scheme}://${obj.host}${base}${modPath}`;
    }

    if (queryParams.length > 0) {
      url += (url.includes("?") ? "&" : "?") + queryParams.join("&");
    }
    return url;
  }

  /**
   * Extract headers from operation details
   */
  private static extractHeaders(details: OpenApiOperation): string[] {
    const headers: string[] = [];

    // Content-Type
    if (details.consumes?.[0]) {
      headers.push(`Content-Type: '${details.consumes[0]}'`);
    } else if (details.requestBody?.content) {
      const types = Object.keys(details.requestBody.content);
      if (types[0]) headers.push(`Content-Type: '${types[0]}'`);
    }

    // Accept
    if (details.produces?.[0]) {
      headers.push(`Accept: '${details.produces[0]}'`);
    }

    // Custom headers from parameters
    if (details.parameters) {
      for (const p of details.parameters) {
        if (p.in === "header") {
          headers.push(`${p.name}: '${p.example || p.default || ""}'`);
        }
      }
    }
    return headers;
  }

  /**
   * Generate the Body JSON block
   */
  private static generateBodyBlock(details: OpenApiOperation, schemas: Record<string, OpenApiSchema>): string {
    // OpenAPI 3
    if (details.requestBody?.content) {
      const content = details.requestBody.content;
      for (const [ctype, cval] of Object.entries(content)) {
        const dummy = cval.example || this.generateDummy(cval.schema, schemas);
        const bodyType = this.mapContentTypeToBodyType(ctype);
        return `Body ${bodyType} \`${JSON.stringify(dummy, null, 2)}\``;
      }
    }

    // Swagger 2
    if (details.parameters) {
      const bodyParam = details.parameters.find((p) => p.in === "body");
      if (bodyParam?.schema) {
        const dummy = this.generateDummy(bodyParam.schema, schemas);
        return `Body JSON \`${JSON.stringify(dummy, null, 2)}\``;
      }
    }

    return "";
  }

  private static mapContentTypeToBodyType(ctype: string): string {
    const ct = ctype.toLowerCase();
    if (ct.includes("json")) return "JSON";
    if (ct.includes("xml")) return "XML";
    if (ct.includes("form")) return "FORM";
    if (ct.includes("octet-stream")) return "BINARY";
    return "RAW";
  }

  /**
   * Recursively generate dummy data from an OpenAPI schema
   */
  private static generateDummy(schema: OpenApiSchema | undefined, schemas: Record<string, OpenApiSchema>, depth = 0): any {
    if (!schema || depth > 5) return {};

    if (schema.example !== undefined) return schema.example;
    if (schema.default !== undefined) return schema.default;

    if (schema.$ref) {
      const refName = schema.$ref.replace(/^#\/(definitions|components\/schemas)\//, "");
      const resolved = schemas[refName];
      return resolved ? this.generateDummy(resolved, schemas, depth + 1) : {};
    }

    switch (schema.type) {
      case "string":
        return "string";
      case "integer":
      case "number":
        return 0;
      case "boolean":
        return false;
      case "array":
        return schema.items ? [this.generateDummy(schema.items, schemas, depth + 1)] : [];
      case "object":
      default:
        if (schema.properties) {
          const obj: Record<string, any> = {};
          for (const [key, prop] of Object.entries(schema.properties)) {
            obj[key] = this.generateDummy(prop, schemas, depth + 1);
          }
          return obj;
        }
        return {};
    }
  }
}
