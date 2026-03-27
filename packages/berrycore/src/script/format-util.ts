/**
 * Format Utility
 *
 * Utilities for converting external API formats (CURL, etc.) to Berry code.
 */

export interface ApiCommand {
  method: string;
  url: string;
  title?: string;
  body?: string;
  bodyType?: string;
  headers?: string;
}

export class FormatUtil {
  /**
   * Convert a CURL command to Berry Api string
   * @param curl The CURL command string
   * @param id The name/identifier for the Api
   */
  static convertCurlToBerry(curl: string, id: string): string {
    // 1. Extract Method
    const methodMatch = curl.match(/(?:--location|-X)\s+(\w+)/);
    const method = (methodMatch ? methodMatch[1] : "GET").toUpperCase();

    // 2. Extract URL
    const urlMatch = curl.match(/(?:['"]?)(https?:\/\/[^\s'"]+)(?:['"]?)/);
    const url = urlMatch ? urlMatch[1] : "";

    // 3. Extract Headers
    const headers: Record<string, string> = {};
    const headerPattern = /(?:--header|-[Hh])\s+(['"])(.*?):\s*(.*?)\1/gm;

    let match;
    while ((match = headerPattern.exec(curl)) !== null) {
      if (match[2] && match[3]) {
        headers[match[2].trim()] = match[3].trim();
      }
    }

    // 4. Extract Body
    const bodyMatch = curl.match(
      /(?:--data-raw|--data-binary|--data|-[dD])\s+(?:'|")?(\{.*\}|.*)(?:'|")?/s
    );
    // Cleanup body: remove leading/trailing quotes if the regex captured them lazily
    let body = bodyMatch ? bodyMatch[1].trim() : null;
    if (body && (body.startsWith("'") || body.startsWith('"'))) {
      body = body.slice(1, -1);
    }

    // 5. Construct Berry String
    const lines = [`Api ${method} #${id}`];
    lines.push(`Url ${url}`);

    if (body) {
      // Inline the body for simplicity in CURL conversion
      const cleanBody = body.replace(/\n/g, " ").trim();
      lines.push(`Body JSON \`${cleanBody}\``);
    }

    if (Object.entries(headers).length > 0) {
      lines.push("Header");
      for (const [key, value] of Object.entries(headers)) {
        lines.push(`- ${key}: '${value}'`);
      }
    }

    return lines.join("\n") + "\n";
  }

  /**
   * Build a Berry Api block from a command object
   */
  static buildApi(name: string, cmd: ApiCommand): string {
    const lines = [`Api ${cmd.method.toUpperCase()} #${name} ${cmd.title || ""}`];
    lines.push(`Url ${cmd.url}`);

    if (cmd.body) {
      const type = (cmd.bodyType || "JSON").toUpperCase();
      lines.push(`Body ${type}`);
      lines.push("`", cmd.body, "`");
    }

    if (cmd.headers) {
      lines.push("Header");
      const headerList = cmd.headers.split(",").map((h) => h.trim());
      for (const h of headerList) {
        if (h) lines.push(`- ${h}`);
      }
    }

    return lines.join("\n") + "\n";
  }

  /**
   * Build a Berry Var block
   */
  static buildVar(title: string, variables: string[], env?: string): string {
    const header = `Var ${env ? "@" + env : ""} ${title}`;
    const lines = [header];
    for (const v of variables) {
      lines.push(`- ${v}`);
    }
    return lines.join("\n") + "\n";
  }

  /**
   * Build a Berry Env block
   */
  static buildEnv(envs: (string | null | undefined)[]): string {
    const validEnvs = envs
      .filter((e): e is string => !!e)
      .map((e) => e.trim().toUpperCase());

    if (validEnvs.length === 0) return "";
    return `Env ${validEnvs.join(",")}\n`;
  }
}
