import { NodeType, Task } from "./Ast";
import { TokenType } from "../tokenizer/tokenType";
import { BaseParser } from "./BaseParser";
import { StepParser } from "./StepParser";

export class TaskParser extends BaseParser {
  parseTask(): Task {
    let task: Task = {
      kind: NodeType.Task,
      identifier: "",
      title: "",
      steps: [],
    };

    // Expect and consume Task token
    this.expect(TokenType.Task, "Expected task keyword");

    // Parse title
    if (this.at().type === TokenType.Title) {
      task.title = this.at().value;
      this.eat();
    }

    // Parse steps until next task or EOF
    const stepParser = new StepParser();
    while (this.not_eof() && this.at().type !== TokenType.Task) {
      if (this.at().type === TokenType.Step) {
        stepParser.setTokens(this.getTokens());
        const step = stepParser.parseStep();
        task.steps.push(step);
        this.setTokens(stepParser.getTokens());
      } else {
        this.eat();
        if (this.eof()) break;
      }
    }

    return task;
  }
}
