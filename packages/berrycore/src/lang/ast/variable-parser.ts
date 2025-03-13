import {
  NodeType,
  Scope,
  type Variable,
  type VariableKv,
} from "./ast-node-type";
import { TokenType } from "../tokenizer/tokenType";
import { BaseParser } from "./base-parser";

export class VariableParser extends BaseParser {
  parseStore(): Variable {
    const store: Variable = {
      comments: "",
      identifier: "",
      kind: NodeType.Variable,
      pointer: "",
      scope: Scope.Environment,
      value: [] as VariableKv[],
    };

    if (this.at().type === TokenType.Var) {
      this.eat();
    }

    if (this.at().type === TokenType.Pointer) {
      this.eat();
      const v = this.expect(
        TokenType.Pointed,
        "Var pointer is expected following pointer"
      );
      store.pointer = v.value;
    }

    if (this.at().type === TokenType.Title) {
      store.comments = this.at().value;
      this.eat();
    }

    do {
      this.expect(TokenType.Hyphen, "Missing Hyphen in Var decleration ");
      const key = this.expect(
        TokenType.Identifier,
        "Missing Identifier in Var decleration "
      );

      const kv: VariableKv = {
        dataType: "number",
        key: key.value,
        kind: NodeType.VariableKeyValue,
        value: "",
      };

      this.expect(
        TokenType.Colon,
        "Missing Colon in Var Key Value decleration "
      );

      if (
        this.at().type == TokenType.Quote ||
        this.at().type == TokenType.Backtick
      ) {
        kv.dataType = "string";
        this.eat();
      }

      const value = this.expect(
        TokenType.Scalar,
        "Missing Value in Var Key Value decleration  "
      );

      if (this.at().type == TokenType.Quote) this.eat();
      if (this.at().type == TokenType.Backtick) this.eat();

      kv.value = value.value;
      store.value.push(kv);
    } while (this.at().type == TokenType.Hyphen);

    return store;
  }
}
