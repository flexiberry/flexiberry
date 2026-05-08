import { intro, outro, log, text, select, isCancel } from "../lib/prompts.js";
import { FileUtility } from "./file-utility.js";
import { outroMessage } from "./util.js";
import * as fs from "fs";

export class StepUtility {
  static async add(name: any, options: any) {
    intro(`📦 Building Step Interactively`);

    const file = FileUtility.getPreselectedFile();
    if (!file || !fs.existsSync(file)) {
      log.error("No file selected. Please select a file first.");
      outro("Cancelled ❌");
      return;
    }

    const content = fs.readFileSync(file, "utf-8");
    const taskOptions: { value: string; label: string }[] = [];
    const seenTasks = new Set<string>();

    try {
      const { LexerEngine, AstEngine, NodeType } = await import("@flexiberry/berrycore");
      const tokens = new LexerEngine(content).tokenize();
      const ast = new AstEngine(tokens).build();
      
      for (const node of ast.body) {
        if (node.type === NodeType.TaskBlock) {
          const taskNode = node as any;
          if (!seenTasks.has(taskNode.name)) {
            taskOptions.push({ value: taskNode.name, label: `📝 ${taskNode.name}` });
            seenTasks.add(taskNode.name);
          }
        }
      }
    } catch (e) {
      // Fallback to regex if AST parsing fails
      const regex = /^Task\s+(.+)$/gim;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const tName = match[1].trim();
        if (!seenTasks.has(tName)) {
          taskOptions.push({ value: tName, label: `📝 ${tName}` });
          seenTasks.add(tName);
        }
      }
    }

    if (taskOptions.length === 0) {
      log.error("No tasks found in the selected file.");
      outro("Cancelled ❌");
      return;
    }

    const selectedTaskName = await select({
      message: "Select the task to add a step to:",
      options: taskOptions,
    });
    if (isCancel(selectedTaskName)) return outro("Cancelled ❌");

    const code = await StepUtility.buildStep(content);
    if (!code) {
      outro("Cancelled ❌");
      return;
    }

    const lines = content.split("\n");
    let taskStartLine = -1;
    let nextBlockLine = lines.length;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(new RegExp(`^Task\\s+${selectedTaskName}\\s*$`, "i"))) {
        taskStartLine = i;
        break;
      }
    }

    if (taskStartLine === -1) {
      log.error("Failed to find the task in the file to append to.");
      return outro("Cancelled ❌");
    }

    for (let i = taskStartLine + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.match(/^(Api|Task|Var|Env)\s+/i)) {
        nextBlockLine = i;
        break;
      }
    }

    let insertLine = nextBlockLine;
    while (insertLine > taskStartLine + 1 && lines[insertLine - 1].trim() === "") {
      insertLine--;
    }

    const codeLines = ("\n" + code.trimEnd() + "\n").split("\n");
    lines.splice(insertLine, 0, ...codeLines);
    const newContent = lines.join("\n");

    log.step("DSL code generated ✔");
    try {
      fs.writeFileSync(file, newContent);
      outro(outroMessage("Success"));
    } catch (e) {
      log.error("Failed to write to file");
      outro(outroMessage("Error"));
    }
  }

  static async buildStep(content?: string): Promise<string | null> {
    const action = await select({
      message: "Choose the action",
      options: [{ value: "Call", label: "Call (Default)" }],
    });
    if (isCancel(action)) return null;

    const target = await select({
      message: "Choose the target",
      options: [{ value: "Api", label: "Api (Default)" }],
    });
    if (isCancel(target)) return null;

    let pointer = "";
    if (target === "Api") {
      const apiOptions: { value: string; label: string }[] = [];
      const seenApi = new Set<string>();
      
      if (content) {
        try {
          const { LexerEngine, AstEngine, NodeType } = await import("@flexiberry/berrycore");
          const tokens = new LexerEngine(content).tokenize();
          const ast = new AstEngine(tokens).build();
          
          for (const node of ast.body) {
            if (node.type === NodeType.ApiBlock) {
              const apiNode = node as any;
              if (!seenApi.has(apiNode.name)) {
                apiOptions.push({ value: apiNode.name, label: `📄 ${apiNode.name}${apiNode.title ? ' - ' + apiNode.title : ''}` });
                seenApi.add(apiNode.name);
              }
            }
          }
        } catch (e) {
          const regex = /^Api\s+(?:(?:GET|POST|PUT|PATCH|DELETE)\s+)?([#a-zA-Z0-9_-]+)/gim;
          let match;
          while ((match = regex.exec(content)) !== null) {
            if (!seenApi.has(match[1])) {
              apiOptions.push({ value: match[1], label: `📄 ${match[1]}` });
              seenApi.add(match[1]);
            }
          }
        }
      }
      apiOptions.push({ value: "_OTHER_", label: "Other (Enter custom name)" });

      const pointerChoice = await select({
        message: "Choose the API pointer",
        options: apiOptions,
      });
      if (isCancel(pointerChoice)) return null;

      if (pointerChoice === "_OTHER_") {
        const customPointer = await text({
          message: "Enter custom API pointer name",
          validate: (v) => (v.trim().length === 0 ? "A pointer name is required!" : undefined),
        });
        if (isCancel(customPointer)) return null;
        pointer = customPointer as string;
      } else {
        pointer = pointerChoice as string;
      }
    }

    const stepTitle = await text({
      message: "Enter an optional step title (leave blank for none)",
    });
    if (isCancel(stepTitle)) return null;

    let code = `Step ${action} ${target} ${pointer} ${stepTitle}`.trimEnd() + "\n";

    const blocks: Record<string, string[]> = {
      Capture: [],
      Params: [],
      Check: [],
    };

    let availableBlocks = ["Capture", "Params", "Check"];
    let selectedAtLeastOne = false;

    while (availableBlocks.length > 0) {
      const options = availableBlocks.map((b) => ({ value: b, label: b }));
      
      if (selectedAtLeastOne) {
        options.push({ value: "Done", label: "Done adding blocks" });
      }

      const blockChoice = await select({
        message: selectedAtLeastOne ? "Add another step block?" : "Add a step block (at least one is required):",
        options,
      });
      if (isCancel(blockChoice)) return null;
      if (blockChoice === "Done") break;

      availableBlocks = availableBlocks.filter((b) => b !== blockChoice);
      selectedAtLeastOne = true;

      const itemsInput = await text({
        message: `Enter ${blockChoice} as comma-separated key:value pairs or conditions`,
        placeholder: blockChoice === "Check" ? "$.status == 200, id != null" : "id: response.id, status: response.status",
        validate: (v) => (v.trim().length === 0 ? "Value is required!" : undefined),
      });
      if (isCancel(itemsInput)) return null;

      const items = (itemsInput as string).split(",").map((i) => i.trim()).filter(Boolean);
      blocks[blockChoice as string].push(...items);
    }

    for (const [blockName, items] of Object.entries(blocks)) {
      if (items.length > 0) {
        code += `${blockName}\n`;
        code += items.map((i) => `- ${i}`).join("\n") + "\n";
      }
    }

    return code;
  }
}

