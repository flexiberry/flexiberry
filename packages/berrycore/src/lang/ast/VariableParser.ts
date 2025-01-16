import { NodeType, Scope, Variable, VariableKv } from "./Ast";
import { TokenType } from "../tokenizer/tokenType";
import { BaseParser } from "./BaseParser";

export class VariableParser extends BaseParser {
  parseStore(): Variable {
    let store: Variable = {
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
      let v = this.expect(
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
      let key = this.expect(
        TokenType.Identifier,
        "Missing Identifier in Var decleration "
      );

      let kv: VariableKv = {
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

      let value = this.expect(
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
