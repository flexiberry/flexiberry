import path from "node:path";
import { InputType } from "../../enum/misc";
import { RUNNER_EVENT } from "../../enum/runner.event";
import Parser from "../../lang/ast/ast-parser";
import { FileUtils } from "../functions/file";
import { Producer } from "../producer/producer";
import * as fs from "fs";

export class BerryExecutor {
  private events: { [key: string]: Function } = {};
  private startTime: number = Date.now();
  // Subscribe to an event
  on(eventName: string, callback: Function): BerryExecutor {
    this.events[eventName] = callback;
    return this;
  }

  async run(filePath: string): Promise<void> {
    this.startTime = Date.now();
    await this.emit(RUNNER_EVENT.START, { info: "started" });
    const fileType = FileUtils.isValidFilePath(filePath);
    if (fileType === InputType.Invalid) {
      throw new Error("Invalid file path");
    }
    const content = FileUtils.loadFile(filePath);
    await this.emit(RUNNER_EVENT.CONSOLE, { info: "parsed" });

    // produce the AST
    const parser = new Parser();
    const ast = parser.produce(content);
    await this.emit(RUNNER_EVENT.CONSOLE, { info: "AST PRODUCED" });
    let tempFileName = `temp_ast.json`;
    let tempFilePath = path.join(process.cwd(), "../../sample/", tempFileName);
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    fs.writeFileSync(tempFilePath, JSON.stringify(ast, null, 2));
    const producer = new Producer().build(ast.body);
    await this.emit(RUNNER_EVENT.CONSOLE, { info: "PRODUCED" });

    tempFileName = `temp_producer.json`;
    tempFilePath = path.join(process.cwd(), "../../sample/", tempFileName);
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    fs.writeFileSync(tempFilePath, JSON.stringify(producer, null, 2));

    await this.emit(RUNNER_EVENT.COMPLETED, { status: "COMPLETED" });
  }

  async emit(event: string, data: any) {
    data.time = Date.now() - this.startTime + "ms";
    if (this.events[event]) await this.events[event](data); // Await the execution of each handler
  }
}
