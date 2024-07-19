import chalk from "chalk";
import { HttpMethod } from "../enum/HttpMethod";
import { InputType } from "../enum/misc";
import { Environment, TestSuite } from "../types/types";

import { FileUtils } from "./functions/file";

export class BerryCore {
  testSuite?: TestSuite;
  env?: Environment;
  inputData?: Record<string, any>;
  inputType?: InputType;

  // variable for testSuite
  // variable for environment variables
  // variable for inputData

  // fucn to parse and validate
  parseAndValidateInput(filePath: string): TestSuite | undefined {
    this.inputType = FileUtils.isValidFilePath(filePath);
    if (this.inputType !== "filePath") {
      console.error("Invalid file path or type.");
      return undefined;
    }
    try {
      this.testSuite = FileUtils.parseFromYmlFile(filePath);
      console.log(chalk.greenBright("Test Suite loaded successfully."));
      return this.testSuite;
    } catch (error) {
      console.error("Error parsing input file:", error);
      return undefined;
    }
  }

  // func to run testsuite

  // func to run get Report

  // func to get Status
}
