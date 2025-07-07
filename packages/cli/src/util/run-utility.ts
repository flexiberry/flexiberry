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
import {
  BerryExecutor,
  RUNNER_EVENT,
  RuntimeStep,
  RuntimeTask,
} from "@flexiberry/berrycore";
// import { runDemo } from "../ui/demo-ui.js";
import { apiCliCall } from "../ui/api.cli.js";
import { UI } from "../ui/ui.js";

export class RunUtility {
  static async run(file: string) {
    intro(`🏎️ Starting FlexiBerry Execution`);

    if (file) {
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
        spin.message("Preparing to execute...");
        spin.stop();
        outro("CLI UI is Loaded...");

        const ui = new UI();
        ui.printJobDetails(FileUtility.getPreselectedFileName(), "Local");
        new BerryExecutor()
          .on(RUNNER_EVENT.ERROR, (x: any) => {
            console.log(x);
          })
          .on(RUNNER_EVENT.PARSED, (x: any) => {
            console.log("Parsed");
          })
          .on(RUNNER_EVENT.COMPLETED, (x: any) => {
            console.log("Parsed");
            ui.exit();
          })
          .on(RUNNER_EVENT.START, (x: any) => {
            // runDemo();
          })
          .on(RUNNER_EVENT.TASK_OVERVIEW, (x: any) => {
            ui.initializeTable(
              x.tasks.map((y: any) => {
                return {
                  id: y.id,
                  title: y.title,
                  // startTime: ,
                  steps: y.steps.map((z: any) => {
                    return {
                      id: z.id,
                      title: z.title,
                      action: z.action,
                      target: z.target,
                      functionId: z.functionId,
                      status: "PENDING",
                      startTime: z.startTime,
                      endTime: z.endTime,
                      duration: z.duration,
                      comments: z.comments,
                    } as RuntimeStep;
                  }),
                } as RuntimeTask;
              })
            );
          })
          .on(RUNNER_EVENT.STEP_DONE, (x: any) => {
            ui.updateTestStep(x);
          })
          .on(RUNNER_EVENT.STEP_BEGIN, (x: any) => {
            ui.updateTestStep(x);
          })
          .run(preSelectedFile.toString());
      }
    }
  }

  // runDemo();
  // apiCliCall({
  //   url: "https://jsonplaceholder.typicode.com/posts/1",
  //   method: "GET",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // });

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
