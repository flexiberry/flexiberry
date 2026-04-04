/**
 * api.cli.ts
 *
 * Standalone HTTP call utility with professional terminal output.
 * Replaced chalk with native lib/colors.
 */

import { colors, c } from "../lib/colors.js";
import * as http from "http";
import * as https from "https";
import { URL } from "url";

// ─── Inline spinner (independent of prompts.ts) ───────────────────────────────

function startSpinner(text: string): { stop: (finalText: string) => void } {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  const timer = setInterval(() => {
    process.stdout.write(`\r${colors.cyan(frames[i++ % frames.length])} ${colors.dim(text)}`);
  }, 80);

  return {
    stop(finalText: string) {
      clearInterval(timer);
      process.stdout.write(`\r${finalText}\n`);
    },
  };
}

// ─── Header pretty-printer ────────────────────────────────────────────────────

const IMPORTANT_HEADERS = new Set([
  "content-type", "content-length", "date", "server",
  "set-cookie", "x-powered-by", "cache-control", "etag",
  "pragma", "expires", "vary", "authorization", "location", "status",
]);

function printImportantHeaders(headers: Record<string, unknown>): void {
  const filtered = Object.entries(headers).filter(([k]) =>
    IMPORTANT_HEADERS.has(k.toLowerCase())
  );

  console.log(colors.magenta("\nHeaders (important only):"));

  if (filtered.length === 0) {
    console.log(colors.dim("  No important headers present."));
    return;
  }

  const keyWidth = Math.max(...filtered.map(([k]) => k.length));
  for (const [k, v] of filtered) {
    const paddedKey = k.padEnd(keyWidth);
    const valueStr = Array.isArray(v) ? v.join(", ") : String(v ?? "");
    console.log(`  ${colors.bold(colors.gray(paddedKey))} │ ${valueStr}`);
  }
}

// ─── Response body printer ────────────────────────────────────────────────────

function printResponse(contentType: string, data: string): void {
  if (contentType.includes("application/json")) {
    try {
      const parsed = JSON.parse(data);
      console.log(colors.cyan("\nResponse (JSON):"));
      console.log(colors.gray(JSON.stringify(parsed, null, 2)));
    } catch {
      console.log(colors.yellow("Could not parse JSON response — printing raw:"));
      console.log(data);
    }
  } else {
    console.log(colors.cyan("\nResponse (Raw):"));
    console.log(data);
  }
}

function printRequest(contentType: string, raw?: string): void {
  if (!raw) return;
  if (contentType === "application/json") {
    console.log("\nRequest (JSON):", JSON.stringify(raw, null, 2));
  } else {
    console.log("\nRequest (Raw):", raw);
  }
}

// ─── Status-code coloriser ────────────────────────────────────────────────────

function colorStatus(code?: number | string): string {
  if (code == null) return colors.yellow("?");
  const num = Number(code);
  if (num >= 200 && num < 300) return colors.green(String(code));
  if (num >= 400 && num < 600) return colors.red(String(code));
  return colors.yellow(String(code));
}

// ─── Public interface ─────────────────────────────────────────────────────────

export interface ApiCallOptions {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string | Record<string, unknown>;
}

/**
 * Makes an HTTP/HTTPS call and renders a professional, colour-coded report
 * in the terminal including status, headers, timing, and response body.
 */
export async function apiCliCall(options: ApiCallOptions): Promise<string | null> {
  const { url, method = "GET", headers = {}, body } = options;

  console.log(colors.magentaBright("\n  Contacting API, please wait...\n"));
  const spin = startSpinner(`${c.boldBlueBright(method)} ${url}`);
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
        res.on("data", (chunk) => { raw += chunk; });
        res.on("end", () => {
          const time = Date.now() - start;
          spin.stop(
            `\n${colors.green("✔ Success")}  ${colors.bold(method)} ${url}` +
            `  (${colorStatus(res.statusCode)})  ${colors.dim(time + "ms")}`
          );

          const contentType = res.headers["content-type"] ?? "";
          printImportantHeaders(res.headers as Record<string, unknown>);
          printRequest(contentType, typeof body === "string" ? body : JSON.stringify(body));
          printResponse(contentType, raw);

          console.log(`\n${colors.bold("Status:")} ${colorStatus(res.statusCode)}`);
          console.log(`${colors.blue("Time:")} ${time}ms`);
          resolve(raw);
        });
      });

      req.on("error", (e) => {
        spin.stop(`${colors.red("✖ Failed")} ${method} ${url}`);
        console.error(`${colors.red("Error:")} ${e.message}`);
        resolve(null);
      });

      if (body) {
        req.write(typeof body === "string" ? body : JSON.stringify(body));
      }
      req.end();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      spin.stop(`${colors.red("✖ Failed")} ${method} ${url}`);
      console.error(`${colors.red("Error:")} ${msg}`);
      resolve(null);
    }
  });
}
