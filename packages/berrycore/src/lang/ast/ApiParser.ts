import { ApiStatement, NodeType } from "./Ast";
import { TokenType } from "../tokenizer/tokenType";
import { BaseParser } from "./BaseParser";

export class ApiParser extends BaseParser {
  parseApi(): ApiStatement {
    let api: ApiStatement = {
      kind: NodeType.ApiFunction,
      identifier: "",
      title: "",
      method: "GET",
      sturct: {
        kind: NodeType.ApiSturcture,
      },
    };

    // Check for API token and eat it
    if (this.at().type === TokenType.Api) this.eat();

    // Set method if ApiMethod token is present
    if (this.at().type === TokenType.ApiMethod) {
      api.method = this.eat().value;
    }

    // Set identifier if Hash token is present
    if (this.at().type === TokenType.Hash) {
      this.eat();
      api.identifier = this.expect(
        TokenType.Identifier,
        "Expecting Identifier"
      ).value;
    }

    // Set title if Title token is present
    if (this.at().type === TokenType.Title) {
      api.title = this.expect(TokenType.Title, "Expecting Identifier").value;
    }

    // Set URL if Url token is present
    if (this.at().type === TokenType.Url) {
      this.eat();
      api.sturct.url = this.expect(TokenType.Value, "Expecting Url").value;
    }

    // Handle Body and BodyType tokens
    if (this.at().type === TokenType.Body) {
      this.eat();
      if (this.at().type === TokenType.BodyType) {
        api.sturct.type = this.at().value;
        this.eat();
      }
      this.expect(TokenType.Backtick, "Expecting Backtick ");
      api.sturct.body = this.expect(
        TokenType.Scalar,
        "Expecting Scalar "
      ).value;
      this.expect(TokenType.Backtick, "Expecting Backtick ");
    }

    return api;
  }
}
