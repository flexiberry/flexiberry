import { NodeType, Step, Capture, Check } from "./Ast";
import { TokenType } from "../tokenizer/tokenType";
import { BaseParser } from "./BaseParser";

export class StepParser extends BaseParser {
  parseStep(): Step {
    let step: Step = {
      kind: NodeType.Step,
      identifier: "",
      title: "",
      action: "",
      target: "",
      functionId: "",
      capture: [],
      check: [],
    };

    // Expect and consume Step token
    this.expect(TokenType.Step, "Expected step keyword");

    // Parse identifier if present
    if (this.at().type === TokenType.Hash) {
      this.eat(); // Consume hash
      step.identifier = this.expect(
        TokenType.Identifier,
        "Expected step identifier"
      ).value;
    }
    step.action = this.expect(TokenType.Call, "Expected Action ").value;
    step.target = this.expect(
      TokenType.Api,
      "Expected target function type "
    ).value;
    step.functionId = this.expect(
      TokenType.Identifier,
      "Expected target function identifier"
    ).value;

    // // Parse until next step, task, or EOF
    // while (
    //   this.not_eof() &&
    //   this.at().type !== TokenType.Step &&
    //   this.at().type !== TokenType.Task
    // ) {
    //   switch (this.at().type) {
    //     case TokenType.Capture:
    //       this.eat(); // Consume capture token
    //       const capture: Capture = {
    //         kind: NodeType.Capture,
    //       };
    //       step.capture.push(capture);
    //       break;

    //     case TokenType.Check:
    //       this.eat(); // Consume check token
    //       const check: Check = {
    //         kind: NodeType.Check,
    //       };
    //       step.check.push(check);
    //       break;

    //     default:
    //       // Skip unknown tokens
    //       this.eat();
    //       break;
    //   }
    // }

    return step;
  }
}
