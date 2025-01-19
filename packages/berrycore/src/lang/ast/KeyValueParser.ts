import { KV } from "./types";
import { TokenType } from "../tokenizer/tokenType";
import { BaseParser } from "./BaseParser";

export class KeyValueParser extends BaseParser {
  parseKeyValue(): KV {
    // Expect and consume the hyphen token
    this.expect(TokenType.Hyphen, "Expected hyphen at start of key-value pair");

    // Parse the key (identifier)
    const key = this.expect(
      TokenType.Identifier,
      "Expected key identifier"
    ).value;

    // Expect and consume the colon
    this.expect(TokenType.Colon, "Expected colon after key");

    let value: string;

    // Handle quoted values
    if (this.at().type === TokenType.Quote) {
      this.eat(); // Consume opening quote
      value = this.expect(TokenType.Scalar, "Expected scalar value").value;
      this.expect(TokenType.Quote, "Expected closing quote");
    }
    // Handle backtick values
    else if (this.at().type === TokenType.Backtick) {
      this.eat(); // Consume opening backtick
      value = this.expect(TokenType.Scalar, "Expected scalar value").value;
      this.expect(TokenType.Backtick, "Expected closing backtick");
    }
    // Handle plain scalar values
    else {
      value = this.expect(TokenType.Scalar, "Expected scalar value").value;
    }

    return {
      key,
      value,
    };
  }
}
