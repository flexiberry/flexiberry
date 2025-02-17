import { type ApiStatement, NodeType } from "./Ast";
import { TokenType } from "../tokenizer/tokenType";
import { BaseParser } from "./BaseParser";
import { KeyValueParser } from "./KeyValueParser";

export class ApiParser extends BaseParser {
  parseApi(): ApiStatement {
    const api: ApiStatement = {
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
      this.expect(TokenType.Hash, "Expecting Hash");
      api.identifier = this.expect(
        TokenType.Identifier,
        "Expecting Identifier"
      ).value;
    }

    // Set title if Title token is present
    if (this.at().type === TokenType.Title) {
      api.title = this.expect(TokenType.Title, "Expecting Identifier").value;
    }

    do {
      switch (this.at().type) {
        case TokenType.Url:
          this.eat();
          api.sturct.url = this.expect(TokenType.Value, "Expecting Url").value;
          break;
        case TokenType.Body:
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
          break;
        case TokenType.Header:
          this.expect(TokenType.Header, "Expected Header ");

          api.sturct.header = {};

          while (this.at().type === TokenType.Hyphen) {
            const kvParser = new KeyValueParser();
            kvParser.setTokens(this.getTokens());
            const { key, value } = kvParser.parseKeyValue();
            api.sturct.header[key] = value;
            this.setTokens(kvParser.getTokens()); // Update tokens after parsing
          }

          break;

        default:
          break;
      }
    } while (
      this.at().type === TokenType.Url ||
      this.at().type === TokenType.Body ||
      this.at().type === TokenType.Header
    );

    return api;
  }
}
