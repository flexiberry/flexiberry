export class FormatUtil {
  static convertCurlToBerry(curl: string, id: string): string {
    const methodMatch = curl.match(/-X\s+(\w+)/);
    const method = methodMatch ? methodMatch[1] : "GET"; // Default to GET if no method is found

    const urlMatch = curl.match(/[http|https]+:\/\/[^\s'"]+/);
    const url = urlMatch ? urlMatch[0] : "";

    const headers: Record<string, string> = {};
    const headerMatches = curl.match(/-H\s+'([^:]+):\s*([^']+)'/g);
    if (headerMatches) {
      headerMatches.forEach((header) => {
        const [key, value] = header
          .replace(/-H\s+'/, "")
          .replace(/'/g, "")
          .split(": ");
        headers[key.trim()] = value.trim();
      });
    }

    const bodyMatch = curl.match(/-d\s+'([^']+)'/);
    const body = bodyMatch ? JSON.parse(bodyMatch[1]) : null;

    // Construct the Berry format string
    let berryFormat = `Api ${method} #${id} \n`;
    berryFormat += `        Url ${url}\n\n`;
    if (!!body)
      berryFormat += `        Body JSON\n        \`n${JSON.stringify(body, null, 4)}\n        \`\n\n`;
    if (!!headers && Object.entries(headers).length > 0) {
      berryFormat += `        Header\n`;
      for (const [key, value] of Object.entries(headers)) {
        berryFormat += `        - ${key}: '${value}'\n`;
      }
    }

    return berryFormat;
  }
}
