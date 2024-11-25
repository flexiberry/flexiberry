import { stat } from "fs";
import { Token } from "../tokenizer/token";
import { TokenType } from "../tokenizer/tokenType";
import { isWhitespace } from "../util";
import { CReader, Reader } from "./reader";
import { KeyValuePair } from "./keyValuePair";

export class VarReader extends CReader implements Reader {
  read(): Token[] {
    let tkns: Token[] = [];
    let start = this.position;
    let value = "";

    tkns.push(this.readVar());

    while (
      this.position < this.input.length &&
      this.input[this.position] !== "\n"
    ) {
      const char = this.input[this.position];

      if (isWhitespace(char)) {
        this.position++; // Move to the next character
        continue; // Skip whitespace
      }

      if (char === "@") {
        start = this.varPointerAndDetails(tkns, char, start);
        this.position++;
        continue;
      }

      if (char === "-") {
        const kvReader = new KeyValuePair(this.input, this.position);
        const tk = kvReader.read();
        tkns.push(...tk);
        this.position = kvReader.getPosition(); // Update position
        start = this.position;
        this.position++; // Move to the next
        continue;
      }
      value += char;

      if (this.input[this.position + 1] === "\n") {
        tkns.push(Token.from(value, TokenType.Title, start, this.position));
        this.position++; // Move to the next
        this.position++; // Move to the next
        continue;
      }
      this.position++; // Move to the next
    }

    return tkns;
  }

  private varPointerAndDetails(tkns: Token[], char: string, start: number) {
    tkns.push(Token.from(char, TokenType.Pointer, start, this.position));
    this.position++; // Move to the next
    start = this.position;
    while (
      this.position < this.input.length &&
      !isWhitespace(this.input[this.position])
    ) {
      this.position++; // Move to the next character
    }
    tkns.push(
      Token.from(
        this.input.substring(start, this.position),
        TokenType.Pointed,
        start,
        this.position
      )
    );

    this.position++; // Move to the next
    start = this.position;
    while (
      this.position < this.input.length &&
      this.input[this.position] !== "\n"
    ) {
      this.position++; // Move to the next character
    }
    tkns.push(
      Token.from(
        this.input.substring(start, this.position),
        TokenType.Title,
        start,
        this.position
      )
    );
    return start;
  }

  readVar(): Token {
    const start = this.position;
    this.position += 3;
    return Token.from(
      this.input.substring(start, start + 3),
      TokenType.Var,
      start,
      this.position
    );
  }
}
