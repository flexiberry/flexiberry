import { register } from "node:module";
import { pathToFileURL } from "node:url";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

register("ts-node/esm", pathToFileURL("./"), {
  experimentalSpecifierResolution: "node",
  project: "./tsconfig.json",
});
