import {
  confirm,
  intro,
  isCancel,
  log,
  outro,
  select,
  spinner,
} from "@clack/prompts";
import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { FileUtility } from "./file-utility.js";
import { BerryCore, BerryExecutor, RUNNER_EVENT } from "@flexiberry/berrycore";
import { UI } from "../ui/ui.js";
import { runDemo } from "../ui/demo-ui.js";

export class RunUtility {
  static async run(file: string) {
    intro(`🏎️ Starting FlexiBerry Execution`);

    if (!!file) {
      const filePath = path.join(process.cwd(), file);
      if (!fs.existsSync(filePath)) {
        log.error(
          chalk.red(`❌ Error: The specified file was not found at ${filePath}`)
        );
        return;
      }
      log.message(`📄 File detected: ${chalk.blue(filePath)}`);
      log.success(chalk.green("✅ File successfully selected!"));
    } else {
      const fileSelected = await this.selectFromCurrentFolder();
      if (!fileSelected) {
        const hasP = await confirm({
          message: `Would you like to proceed with the pre-selected file? (y/n) ${chalk.bgBlue(FileUtility.getPreselectedFileName())}`,
        });
        if (isCancel(hasP) || !hasP) {
          log.step("⚠️ Operation skipped.");
          return;
        }
        const preSelectedFile = FileUtility.getPreselectedFile();
        if (!preSelectedFile) {
          return;
        }
        log.step(`🔄 Preparing to execute script using: ${preSelectedFile}`);
        const spin = spinner({
          indicator: "dots",
        });
        spin.start("File is Ready..");
        spin.message("Executing...");

        new BerryExecutor()
          .on(RUNNER_EVENT.START, (x: any) => {
            log.message(`${chalk.bgWhite("+") + chalk.bgBlue(x.time)} Started`);
          })
          .on(RUNNER_EVENT.CONSOLE, (x: any) => {
            log.message(
              `${chalk.bgWhite(" + ") + chalk.bgBlue(" " + x.time)}📄 ${x.info}`
            );
          })
          .on(RUNNER_EVENT.COMPLETED, (x: any) => {
            log.message(`${chalk.bgWhite(" + ")} COMPLETED`);
            spin.stop();
            outro("✅ Execution completed successfully.\n");
            runDemo();
          })
          .run(preSelectedFile.toString());
      }
    }
  }

  static async selectFromCurrentFolder() {
    log.step(chalk.blue("🔍 Scanning for available files... \n"));
    const files = fs.readdirSync(process.cwd());
    const berryFiles = files
      .filter((x) => x.endsWith(".berry"))
      .map((x) => {
        return { value: x, label: x };
      });

    if (berryFiles.length === 0) {
      log.error(
        chalk.bgRed("❌ No .berry files were found in the current directory.\n")
      );
      return;
    }

    const selectedFile = await select({
      message: "Select a file from the current directory:",
      maxItems: 10,
      options: berryFiles,
    });
    if (!selectedFile) {
      log.error("❌ No file was selected.");
      return;
    }

    log.message(`📂 Selected file: ${selectedFile.toString()}`);

    return selectedFile.toString();
  }
}
