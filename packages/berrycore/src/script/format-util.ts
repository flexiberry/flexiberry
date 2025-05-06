export class FormatUtil {
  static convertCurlToBerry(curl: string, id: string): string {
    const methodMatch = curl.match(/(?:--location|-X)\s+(\w+)/);
    const method = methodMatch ? methodMatch[1] : "GET"; // Default to GET if no method is found

    const urlMatch = curl.match(/[http|https]+:\/\/[^\s'"]+/);
    const url = urlMatch ? urlMatch[0] : "";

    const headers: Record<string, string> = {};
    const headerPattern = /(?:--header|-[Hh])\s+(['"])(.*?):\s*(.*?)\1/gm;

    const headerMatches = curl.match(headerPattern);
    if (headerMatches) {
      headerMatches.forEach((header) => {
        const [key, value] = header
          .replace(/(?:--header|-[Hh])\s+('|")/, "")
          .replace(/('|")/g, "")
          .split(": ");
        headers[key.trim()] = value.trim();
      });
    }

    const bodyMatch = curl.match(
      /(?:--data-raw|-[dD]|--data)\s+(['"])([^'"]+)\1/
    );
    const body = bodyMatch ? bodyMatch[2] : null;

    // Construct the Berry format string
    let berryFormat = `Api ${method} #${id} \n`;
    berryFormat += `Url ${url}\n`;
    if (body) berryFormat += `Body JSON  \`${body.replaceAll("\n", "")}\`\n`;
    if (!!headers && Object.entries(headers).length > 0) {
      berryFormat += `Header\n`;
      for (const [key, value] of Object.entries(headers)) {
        berryFormat += `- ${key}: '${value}'\n`;
      }
    }

    return berryFormat;
  }
  static buildApi(name: any, cmd: any) {
    let template = `Api ${cmd.method} #${name}  ${cmd.title ? cmd.title : ""} \n Url ${cmd.url}`;
    if (cmd.body) {
      template += `Body ${cmd.bodyType ? cmd.bodyType.toUpperCase() : "JSON"}\n\`\n${cmd.body}\n\``;
    }
    if (cmd.headers) {
      template += `Header\n - ${cmd.headers.split(",").join("\n  - ")}`;
    }
    return template;
  }

  static buildVar(title: string, variables: string[], env: string) {
    const code = `Var ${env ? "@" + env : ""} ${title} \n - ${variables.join("\n - ")}`;
    return code;
  }

  static buildEnv(env: string[]) {
    return `Env ${env
      .filter((x) => x != null)
      .map((x) => x.toUpperCase())
      .join(",")}`;
  }
}
