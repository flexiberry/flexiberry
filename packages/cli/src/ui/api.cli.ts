import chalk from "chalk";
import * as http from "http";
import * as https from "https";
import { URL } from "url";

// Simple CLI spinner
function startSpinner(text: string) {
  const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  process.stdout.write(text + " ");
  const interval = setInterval(() => {
    process.stdout.write(
      `\r${text} ${spinnerFrames[i++ % spinnerFrames.length]}`
    );
  }, 80);
  return {
    stop: (finalText: string) => {
      clearInterval(interval);
      process.stdout.write(`\r${finalText}\n`);
    },
  };
}

// Helper: print important headers as table
function printImportantHeaders(headers: Record<string, unknown>) {
  const importantKeys = [
    "content-type",
    "content-length",
    "date",
    "server",
    "set-cookie",
    "x-powered-by",
    "cache-control",
    "etag",
    "pragma",
    "expires",
    "vary",
    "authorization",
    "location",
    "status",
  ];
  const filtered = Object.entries(headers).filter(([k]) =>
    importantKeys.includes(k.toLowerCase())
  );
  console.log(chalk.magenta("\nHeaders (important only):"));
  if (filtered.length === 0) {
    console.log(chalk.gray("No important headers present."));
    return;
  }
  const keyWidth = Math.max(...filtered.map(([k]) => k.length));
  for (const [k, v] of filtered) {
    const padKey = k.padEnd(keyWidth, " ");
    const valueStr = Array.isArray(v) ? v.join(", ") : String(v ?? "");
    console.log(`${chalk.bold.gray(padKey)} │ ${valueStr}`);
  }
}

// Helper: print response body
function printResponse(contentType: string, data: string) {
  if (contentType.includes("application/json")) {
    try {
      const parsed = JSON.parse(data);
      console.log(chalk.cyan("\nResponse (JSON):"));
      console.log(chalk.gray(JSON.stringify(parsed, null, 2)));
    } catch {
      console.log(chalk.yellow("Could not parse JSON response. Raw output:"));
      console.log(data);
    }
  } else {
    console.log(chalk.cyan("\nResponse (Raw):"));
    console.log(data);
  }
}

export interface ApiCallOptions {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

export async function apiCliCall(options: ApiCallOptions) {
  const { url, method = "GET", headers = {}, body } = options;

  // Attractive banner before spinner
  console.log(chalk.magentaBright("\n Making Api Call Please Wait....\n"));
  const spinner = startSpinner(chalk.blueBright(`Calling ${method} ${url}`));
  const start = Date.now();

  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === "https:";
      const reqOptions: http.RequestOptions = {
        method,
        headers,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
      };
      const reqModule = isHttps ? https : http;
      const req = reqModule.request(reqOptions, (res) => {
        let raw = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          const time = Date.now() - start;
          // Helper for colored status code
          function getColoredStatusCode(code?: number | string) {
            if (!code) return chalk.yellow("?");
            const num = Number(code);
            if (num >= 200 && num < 300) return chalk.green(code);
            if (num >= 400 && num < 600) return chalk.red(code);
            return chalk.yellow(code);
          }

          spinner.stop(
            `\n${chalk.green("Success")} ${chalk.bold.yellow(method)} ${url} (${getColoredStatusCode(res.statusCode)}) in ${chalk.gray(time + "ms")}`
          );
          const contentType = res.headers["content-type"] || "";
          printImportantHeaders(res.headers);
          printResponse(contentType, raw);

          // Highlight status
          const statusStr = `Status: ${getColoredStatusCode(res.statusCode)}`;
          console.log("\n" + statusStr);
          console.log(chalk.blue(`Time: ${time}ms`));
          resolve(raw);
        });
      });
      req.on("error", (e) => {
        spinner.stop(`${chalk.red("Failed")} ${method} ${url}`);
        console.error(chalk.red("Error:"), e.message);
        resolve(null);
      });
      if (body) {
        req.write(typeof body === "string" ? body : JSON.stringify(body));
      }
      req.end();
    } catch (e: any) {
      spinner.stop(`${chalk.red("Failed")} ${method} ${url}`);
      console.error(chalk.red("Error:"), e.message || e);
      resolve(null);
    }
  });
}
