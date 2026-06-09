import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const file = resolve(__dirname, "package.json");
const json = readFileSync(file, "utf8");
const pkg = JSON.parse(json);

// Read core version dynamically
const coreFile = resolve(__dirname, "../../packages/berrycore/package.json");
let coreVersion = pkg.version;
try {
  coreVersion = JSON.parse(readFileSync(coreFile, "utf8")).version;
} catch (e) {
  console.warn("Could not read berrycore version", e);
}

export default defineConfig({
  plugins: [sveltekit()],
  assetsInclude: "static",
  define: {
    APP_VERSION: JSON.stringify(pkg.version),
    CORE_VERSION: JSON.stringify(coreVersion),
  },
  server: {
    fs: {
      // Allow serving files from one level up (the workspace root)
      allow: ["../.."],
    },
  },
});
