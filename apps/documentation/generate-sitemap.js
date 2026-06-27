import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, "./docs/.vitepress/dist");
const HOSTNAME = "https://docs.flexiberry.dev";

function getHtmlFiles(dir, base = "") {
  let files = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      files = files.concat(getHtmlFiles(filePath, path.join(base, file)));
    } else if (file.endsWith(".html") && file !== "404.html") {
      let relativePath = path.join(base, file);
      // Clean up index.html files
      if (relativePath.endsWith("index.html")) {
        relativePath = relativePath.slice(0, -10);
      } else {
        relativePath = relativePath.slice(0, -5);
      }
      files.push(relativePath);
    }
  }
  return files;
}

try {
  if (!fs.existsSync(DIST_DIR)) {
    console.error("Dist directory does not exist. Run build first.");
    process.exit(1);
  }

  const paths = getHtmlFiles(DIST_DIR);
  const lastmod = new Date().toISOString().split("T")[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const p of paths) {
    const urlPath = p.replace(/\\/g, "/");
    const loc = `${HOSTNAME}/${urlPath}`.replace(/\/$/, ""); // Remove trailing slash if any
    xml += "  <url>\n";
    xml += `    <loc>${loc || HOSTNAME + "/"}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += "  </url>\n";
  }

  xml += "</urlset>\n";

  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), xml);
  console.log("sitemap.xml generated successfully in dist/");
} catch (error) {
  console.error("Failed to generate sitemap:", error);
}
