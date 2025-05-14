import figlet from "figlet";
import chalk from "chalk";
import { intro, isCancel, log, outro, select, text } from "@clack/prompts";
import { FileUtility } from "./file-utility.js";

export class Cli {
  public static async main(version: string): Promise<void> {
    console.log("Hello, World!");
    this.banner(version);

    intro("Flexiberry CLI \n");
    const method = await this.getMethod();
    if (!method) return;
    switch (method) {
      case "Add":
        // await this.add();
        break;
      case "Create":
        // await this.create();
        break;
      case "Run":
        // await this.run();
        break;
      case "View":
        await this.view();
        break;
      case "Select":
        const folder = await askForFolderPath();
        if (!folder) {
          outro("Operation cancelled.");
          return;
        }
        await FileUtility.select(folder);

        break;
    }
    outro("Thanks for using Flexiberry CLI!\n\n");
  }
  static async view() {
    const preSelectedFile = FileUtility.getPreselectedFile();
    if (!preSelectedFile) {
      return;
    }
    log.message(`📂 Selected file: ${preSelectedFile}`);
    log.message("Opening file in editor...");
    FileUtility.openEditor(preSelectedFile);
  }

  static async getMethod() {
    const value = await select({
      message: "Please choose an option",
      options: [
        { value: "Add", label: "Add components to .berry file" },
        { value: "Create", label: "Create new .berry file" },
        { value: "Run", label: "Run .berry file" },
        { value: "Select", label: "Select .berry file from folder" },
        { value: "View", label: "View .berry file from folder" },
      ],
    });
    if (isCancel(value)) {
      outro("Cancelled");
      return;
    }
    return value;
  }

  private static banner(version: string) {
    const text =
      "\n\n" +
      figlet.textSync("Flexiberry", {
        font: "Pagga",
      });

    console.log(chalk.green(text));
    console.log(chalk.green("Welcome to"), chalk.bgGreen(" FlexiBerry CLI! "));
    console.log(chalk.gray("Version: ") + chalk.green(version));

    console.log("\n");
  }
}

/**
 * Prompts the user to enter a folder path, defaulting to the current folder (.)
 * if left blank.
 */
export async function askForFolderPath(): Promise<string | undefined> {
  const folder = await text({
    message:
      'Specify the folder to use (use "." for current folder, or enter a relative path):',
    placeholder: "./../sample",
    defaultValue: ".",
    validate: (value) => {
      if (value.length === 0) return `Value is required!`;
      return undefined;
    },
  });

  if (isCancel(folder)) return undefined;
  return typeof folder === "string" && folder.trim() === "" ? "." : folder;
}
