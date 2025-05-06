export class SwaggerUtil {
  static async convertFromSwaggerApi(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      return `Failed to fetch Swagger: ${response.status} ${response.statusText}`;
    }
    const swaggerJson = await response.text();
    // Use the URL (or a part of it) as the id, or let the user provide a custom id
    const id = url.split("/").pop() || "api";
    return SwaggerUtil.convertSwaggerToBerry(swaggerJson, id);
  }

  static convertSwaggerToBerry(swagger: string, id: string): string {
    let obj: any;
    try {
      obj = typeof swagger === "string" ? JSON.parse(swagger) : swagger;
    } catch (e) {
      return `Invalid Swagger JSON`;
    }
    const servers =
      obj.servers && obj.servers.length > 0 ? obj.servers[0].url : "";
    let result = "";
    if (!obj.paths) return "No paths found in Swagger";
    let apiCount = 1;
    for (const [path, methods] of Object.entries(obj.paths)) {
      if (typeof methods !== "object" || methods === null) continue;
      for (const [method, details] of Object.entries<any>(methods)) {
        const opId = details.operationId || `${id}${apiCount}`;
        const { modPath, queryParams } = SwaggerUtil.handlePathParams(
          path,
          details.parameters
        );
        const url = SwaggerUtil.buildUrl(modPath, servers, obj, queryParams);
        const headers = SwaggerUtil.extractHeaders(details);
        const body = SwaggerUtil.generateBody(details, obj.components?.schemas);
        result += SwaggerUtil.generateApiString(
          method,
          opId,
          url,
          headers,
          body
        );
        apiCount++;
      }
    }
    return result.trim();
  }

  static handlePathParams(
    path: string,
    params: any[]
  ): { modPath: string; queryParams: string[] } {
    let modPath = path;
    const queryParams: string[] = [];
    if (params) {
      for (const param of params) {
        if (param.in === "path") {
          // Replace {param} with {{param
          modPath = modPath.replace(
            new RegExp(`{${param.name}}`, "g"),
            `{{${param.name}}}`
          );
        }
        if (param.in === "query") {
          queryParams.push(`${param.name}={{${param.name}}}`);
        }
      }
    }
    return { modPath, queryParams };
  }

  static buildUrl(
    modPath: string,
    servers: string,
    obj: any,
    queryParams: string[]
  ): string {
    let url = modPath;
    if (servers) {
      url = servers + modPath;
    } else if (obj.host) {
      // Swagger 2.0 style
      const scheme = obj.schemes && obj.schemes[0] ? obj.schemes[0] : "https";
      const basePath = obj.basePath || "";
      url = `${scheme}://${obj.host}${basePath}${modPath}`;
    }
    if (queryParams.length > 0) {
      url += (url.includes("?") ? "&" : "?") + queryParams.join("&");
    }
    return url;
  }

  static extractHeaders(details: any): string[] {
    const headers: string[] = [];
    if (details.consumes) {
      headers.push(`Content-Type: '${details.consumes[0]}'`);
    } else if (details.requestBody && details.requestBody.content) {
      const types = Object.keys(details.requestBody.content);
      if (types.length > 0) headers.push(`Content-Type: '${types[0]}'`);
    }
    if (details.produces) {
      headers.push(`Accept: '${details.produces[0]}'`);
    }
    // Custom headers
    if (details.parameters) {
      for (const param of details.parameters) {
        if (param.in === "header") {
          headers.push(
            `${param.name}: '${param.example || param.default || ""}'`
          );
        }
      }
    }
    return headers;
  }

  static generateBody(details: any, definitions?: any): string {
    let bodyExample = "";
    const bodyHandled = false;
    // OpenAPI 3: requestBody
    if (details.requestBody && details.requestBody.content) {
      const content = details.requestBody.content;
      for (const [ctype, cval] of Object.entries<any>(content)) {
        if (cval.example) {
          bodyExample = cval.example;
        } else if (cval.schema) {
          bodyExample = SwaggerUtil.generateDummyFromSchema(
            cval.schema,
            definitions
          );
        }
        if (bodyExample) {
          // Determine bodyType from content-type
          let bodyType = "RAW";
          if (ctype.includes("json")) bodyType = "JSON";
          else if (ctype.includes("xml")) bodyType = "XML";
          else if (ctype.includes("form")) bodyType = "FORM";
          else if (ctype.includes("x-www-form-urlencoded")) bodyType = "FORM";
          else if (ctype.includes("octet-stream")) bodyType = "BINARY";
          else bodyType = ctype.toUpperCase();
          return `Body ${bodyType} \`${typeof bodyExample === "string" ? bodyExample : JSON.stringify(bodyExample, null, 2)}\`\n`;
        }
      }
    }
    // Swagger 2: parameters with in: body
    if (!bodyHandled && details.parameters) {
      for (const param of details.parameters) {
        if (param.in === "body" && param.schema) {
          bodyExample = SwaggerUtil.generateDummyFromSchema(
            param.schema,
            definitions
          );
          return `Body JSON \`${typeof bodyExample === "string" ? bodyExample : JSON.stringify(bodyExample, null, 2)}\`\n`;
        }
      }
    }
    return "";
  }

  static generateApiString(
    method: string,
    opId: string,
    url: string,
    headers: string[],
    body: string
  ): string {
    let result = `Api ${method.toUpperCase()} #${opId}\n`;
    result += `Url ${url}\n`;
    if (headers.length > 0) {
      result += "Header\n";
      for (const h of headers) {
        result += `- ${h}\n`;
      }
    }
    if (body) {
      result += body;
    }
    result += "\n";
    return result;
  }

  // Helper: Generate dummy object from schema
  static generateDummyFromSchema(schema: any, definitions?: any): any {
    if (!schema) return {};
    if (schema.example) return schema.example;
    if (schema.default) return schema.default;
    if (schema.$ref) {
      // Resolve $ref
      const ref = schema.$ref.replace(
        /^#\/(definitions|components\/schemas)\//,
        ""
      );
      if (definitions && definitions[ref]) {
        return SwaggerUtil.generateDummyFromSchema(
          definitions[ref],
          definitions
        );
      }
      return {};
    }
    if (schema.type === "object" || schema.properties) {
      const obj: any = {};
      for (const [k, v] of Object.entries(schema.properties || {})) {
        obj[k] = SwaggerUtil.generateDummyFromSchema(v, definitions);
      }
      return obj;
    }
    if (schema.type === "array" && schema.items) {
      return [SwaggerUtil.generateDummyFromSchema(schema.items, definitions)];
    }
    // Fallbacks for primitive types
    if (schema.type === "string") return "string";
    if (schema.type === "integer" || schema.type === "number") return 0;
    if (schema.type === "boolean") return false;
    return {};
  }
}
