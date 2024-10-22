import { stat } from "fs";
import { Token } from "../token";
import { TokenType } from "../tokenType";
import { isWhitespace } from "../util";
import { CReader, Reader } from "./reader";

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
        start = this.VarKeyValuePairExtract(tkns, char, start);
        this.position++; // Move to the next
        continue;
      }
      this.position++; // Move to the next
    }

    return tkns;
  }
  private VarKeyValuePairExtract(tkns: Token[], char: string, start: number) {
    start = this.position;
    tkns.push(Token.from(char, TokenType.Hyphen, start, this.position));
    this.position++; // Move to the next
    start = this.position;
    let collect: string = "";
    while (
      this.position < this.input.length &&
      this.input[this.position] !== "\n"
    ) {
      const c = this.input[this.position];
      if (isWhitespace(c)) {
        this.position++; // Move to the next character
        continue; // Skip whitespace
      }
      if (c === ":") {
        tkns.push(
          Token.from(collect, TokenType.Identifier, start, this.position)
        );
        start = this.position;
        tkns.push(Token.from(c, TokenType.Colon, start, this.position));
        collect = "";
        start = this.position;
        this.position++; // Move to the next
        continue;
      }

      if (c === "`") {
        tkns.push(Token.from(c, TokenType.Backtick, start, this.position));
        this.position++;
        start = this.position;
        collect = "";
        while (
          this.position < this.input.length &&
          this.input[this.position] !== "`"
        ) {
          collect += this.input[this.position];
          this.position++;
        }

        tkns.push(
          Token.from(collect, TokenType.Scalar, start, this.position - 1)
        );
        tkns.push(
          Token.from(c, TokenType.Backtick, this.position, this.position)
        );
        collect = "";
        start = this.position;
        this.position++; // Move to the next
        continue;
      }

      collect += c;
      this.position++; // Move to the next
    }
    if (collect.length > 0)
      tkns.push(Token.from(collect, TokenType.Scalar, start, this.position));
    return start;
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
