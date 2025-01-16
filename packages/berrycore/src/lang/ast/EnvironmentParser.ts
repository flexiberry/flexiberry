import { Environment, NodeType, Statement } from "./Ast";
import { TokenType } from "../tokenizer/tokenType";
import { BaseParser } from "./BaseParser";

export class EnvironmentParser extends BaseParser {
  parseEnv(): Statement {
    const isEnv = this.eat().type == TokenType.Env;
    let values: string[] = [];

    while (
      this.at().type == TokenType.Comma ||
      this.at().type == TokenType.Value
    ) {
      if (this.at().type == TokenType.Comma) {
        this.eat();
        continue;
      }
      if (this.at().type == TokenType.Value) {
        let v = this.eat().value;
        values.push(v);
        continue;
      }
      this.expect(
        TokenType.Value,
        "Environment values are missing. Env declaration is invalid"
      );
      break;
    }

    return {
      kind: NodeType.Environment,
      value: values,
    } as Environment;
  }
}
