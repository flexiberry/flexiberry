import {
  NodeType,
  type Step,
  type Capture,
  type Check,
  type Params,
  type Condition,
} from "./ast-node-type";
import { TokenType } from "../tokenizer/tokenType";
import { BaseParser } from "./base-parser";
import { KeyValueParser } from "./key-value-parser";
import { CheckParser } from "./check-parser";

export class StepParser extends BaseParser {
  parseStep(): Step {
    const step: Step = {
      kind: NodeType.Step,
      identifier: "",
      title: "",
      action: "Call",
      target: "Api",
      functionId: "",
      capture: [],
      check: [],
      params: [],
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
    step.action = this.expect(TokenType.Call, "Expected Action ")
      .value as "Call";
    step.target = this.expect(TokenType.Api, "Expected target function type ")
      .value as "Api";
    step.functionId = this.expect(
      TokenType.Identifier,
      "Expected target function identifier"
    ).value;
    if (this.at().type === TokenType.Title)
      step.title = this.expect(TokenType.Title, "Expected step title").value;
    else step.title = step.action + " " + step.target + " " + step.functionId;
    // Parse until next step, task, or EOF
    while (
      this.not_eof() &&
      this.at().type !== TokenType.Step &&
      this.at().type !== TokenType.Task
    ) {
      switch (this.at().type) {
        case TokenType.Params:
          this.eat(); // Consume params token
          while (this.at().type === TokenType.Hyphen) {
            const params: Params = {
              kind: NodeType.Params,
              key: "",
              value: "",
              type: "",
            };
            const kvParser = new KeyValueParser();
            kvParser.setTokens(this.getTokens());
            const { key, value, type } = kvParser.parseKeyValue();
            params.key = key;
            params.value = value;
            params.type = type;
            this.setTokens(kvParser.getTokens());
            step.params.push(params);
          }
          break;
        case TokenType.Capture:
          this.eat(); // Consume capture token
          while (this.at().type === TokenType.Hyphen) {
            const capture: Capture = {
              kind: NodeType.Capture,
              key: "",
              value: "",
              type: "",
            };
            const kvParser = new KeyValueParser();
            kvParser.setTokens(this.getTokens());
            const { key, value, type } = kvParser.parseKeyValue();
            capture.key = key;
            capture.value = value;
            capture.type = type;
            this.setTokens(kvParser.getTokens());
            step.capture.push(capture);
          }
          break;

        case TokenType.Check:
          const checkParser = new CheckParser();
          checkParser.setTokens(this.getTokens());
          const check = checkParser.parseCheck();
          step.check.push(...check);
          this.setTokens(checkParser.getTokens());
          break;

        default:
          // Skip unknown tokens
          this.eat();
          break;
      }
    }

    return step;
  }
}
