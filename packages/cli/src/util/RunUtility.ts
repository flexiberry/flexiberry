import { confirm, intro, isCancel, log, outro, select } from "@clack/prompts";
import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { FileUtility } from "./FileUtility.js";
import { BerryCore } from "@flexiberry/berrycore";
export class RunUtility {
  static async run(file: string) {
    intro(`🏎️ Run FlexiBerry`);

    if (!!file) {
      const filePath = path.join(process.cwd(), file);
      if (!fs.existsSync(filePath)) {
        console.log(chalk.red(`😬 Error: File not found at ${filePath}`));
        return;
      }
      log.message(" 🥳 File found!" + chalk.blue(`Location: ${filePath}`));
      log.success(chalk.green("✅ File selected!"));
    } else {
      const fileSelected = await this.selectFromCurrentFolder();
      if (!fileSelected) {
        const hasP = await confirm({
          message: "Do you want to continue with pre-selected file",
        });
        if (isCancel(hasP) || !hasP) {
          log.step("Skipped  ");
          return;
        }
        const preSelectedFile = FileUtility.getPreselectedFile();
        if (!preSelectedFile) {
          return;
        }

        log.step("Prepareing for Run the script from " + preSelectedFile);

        let core = new BerryCore();

        let parse = core.parseFile(preSelectedFile.toString());
      }
    }

    outro("✅ Completed \n");
  }

  static async selectFromCurrentFolder() {
    log.step(chalk.blue("Selecting a file... \n"));
    const files = fs.readdirSync(process.cwd());
    const berryFiles = files
      .filter((x) => x.endsWith(".berry"))
      .map((x) => {
        return { value: x, label: x };
      });
    if (berryFiles.length <= 0) {
      log.error("❌ .berry files are not found in this folder \n");
      return;
    }

    const selectedFile = await select({
      message: "Files in the current directory. Pick a file",
      maxItems: 10,
      options: berryFiles,
    });

    if (!selectedFile) {
      log.error("❌ No file selected");
      return;
    }

    log.message("Selected File is " + selectedFile.toString());

    return selectedFile.toString();
  }
}
