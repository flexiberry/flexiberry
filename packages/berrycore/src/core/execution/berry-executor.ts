import path from "node:path";
import { InputType } from "../../enum/misc";
import { RUNNER_EVENT } from "../../enum/runner.event";
import { FileUtils } from "../functions/file";
// import { Producer } from "../producer/producer";
import * as fs from "fs";
// import { RuntimeError } from "../runtime/runtime.error";
import { throws } from "node:assert";
// import { Runtime } from "../runtime/runtime";
import { emitEvent } from "../util/event-utils";

export class BerryExecutor {
  private events: { [key: string]: Function } = {};

  on(eventName: string, callback: Function): BerryExecutor {
    this.events[eventName] = callback;
    return this;
  }

  async run(filePath: string): Promise<void> {
    await this.emit(RUNNER_EVENT.START, { info: "started" });
    const fileType = FileUtils.isValidFilePath(filePath);
    if (fileType === InputType.Invalid) {
      // throw new RuntimeError("Invalid file path");
    }
    const content = FileUtils.loadFile(filePath);
    await this.emit(RUNNER_EVENT.CONSOLE, { info: "parsed" });
    // await this.emit(RUNNER_EVENT.CONSOLE, { info: "AST PRODUCED" });
    // const producer = new Producer().build(ast.body);
    // await this.emit(RUNNER_EVENT.CONSOLE, { info: "PRODUCED" });

    // await new Runtime(producer, this.events).execute();
    // await this.emit(RUNNER_EVENT.COMPLETED, { status: "COMPLETED" });
  }

  async emit(event: string, data: any) {
    await emitEvent(this.events, event, data);
  }
}
