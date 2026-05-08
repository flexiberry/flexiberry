import {
  intro,
  outro,
  log,
  text,
  select,
  confirm,
  isCancel,
} from "../lib/prompts.js";
import { colors } from "../lib/colors.js";
import { FileUtility } from "./file-utility.js";
import { outroMessage } from "./util.js";
import { StepUtility } from "./step-utility.js";
import * as fs from "fs";

export class TaskUtility {
  static async add(name: string, options?: any) {
    intro(`📦 Building Task Interactively`);

    const taskName = await text({
      message: "What is the name of this task?",
      placeholder: "My Task",
      initialValue: name,
      validate: (v) => (v.trim().length === 0 ? "A task name is required!" : undefined),
    });

    if (isCancel(taskName)) {
      outro("Cancelled ❌");
      return;
    }

    let code = `Task ${taskName}\n`;

    const addStep = await confirm({ message: "Do you want to add a step?", initialValue: true });
    if (isCancel(addStep)) {
      outro("Cancelled ❌");
      return;
    }

    if (addStep) {
      const file = FileUtility.getPreselectedFile();
      let content = "";
      if (file && fs.existsSync(file)) {
        content = fs.readFileSync(file, "utf-8");
      }
      
      const stepCode = await StepUtility.buildStep(content);
      if (!stepCode) {
        outro("Cancelled ❌");
        return;
      }
      
      code += "\n" + stepCode + "\n";
    }

    log.step("DSL code generated ✔");
    const status = FileUtility.updateBerryCode(code.trim());
    outro(outroMessage(status));
  }
}
