import { Token } from "../token";
import { TokenType } from "../tokenType";
import { isWhitespace } from "../util";
import { CReader, Reader } from "./reader";

export class ApiReader extends CReader implements Reader {
  constructor(input: string, position: number) {
    super(input, position);
  }
  read(): Token[] {
    let tkns: Token[] = [];
    let value = "";

    tkns.push(this.readApi());
    let start = this.position;

    start = this.fetchApiIdandTitle(start, tkns, value);

    while (
      this.position < this.input.length &&
      this.input[this.position] !== "\n"
    ) {
      const char = this.input[this.position];

      if (isWhitespace(char)) {
        this.position++; // Move to the next character
        continue; // Skip whitespace
      }
      if (this.input.substring(this.position, this.position + 3) === "Url") {
        start = this.readUrl(tkns);
        this.position++;
        continue;
      }

      this.position++; // Move to the next
    }

    return tkns;
  }
  private readUrl(tkns: Token[]): number {
    let start = this.position;
    let value = "";
    this.position = this.position + 3;
    tkns.push(
      Token.from(
        this.input.substring(start, this.position),
        TokenType.Url,
        start,
        this.position
      )
    );
    start = this.position + 1;
    while (
      this.position < this.input.length &&
      this.input[this.position] !== "\n"
    ) {
      const char = this.input[this.position];

      if (isWhitespace(char)) {
        this.position++; // Move to the next character
        continue; // Skip whitespace
      }
      value += char;
      this.position++;
    }

    tkns.push(
      Token.from(
        this.input.substring(start, this.position),
        TokenType.Value,
        start,
        this.position
      )
    );

    return this.position++;
  }
  private fetchApiIdandTitle(start: number, tkns: Token[], value: string) {
    while (
      this.position < this.input.length &&
      this.input[this.position] !== "\n"
    ) {
      const char = this.input[this.position];

      if (isWhitespace(char)) {
        this.position++; // Move to the next character
        continue; // Skip whitespace
      }

      if (char === "#") {
        start = this.fetchIdentifier(tkns, char, start);
        this.position++;
        continue;
      }

      if (!isWhitespace(char)) {
        value += char;
      }
      this.position++;
    }
    tkns.push(
      Token.from(
        this.input.substring(start, this.position),
        TokenType.Title,
        start,
        this.position
      )
    );
    return this.position++;
  }

  fetchIdentifier(tkns: Token[], char: string, start: number): number {
    tkns.push(Token.from(char, TokenType.Hash, start, this.position));
    this.position++; // Move to the next character

    start = this.position;
    while (
      this.position < this.input.length &&
      !isWhitespace(this.input[this.position])
    ) {
      this.position++; // Move to the next character
    }
    if (isWhitespace(this.input[this.position])) {
      tkns.push(
        Token.from(
          this.input.substring(start, this.position),
          TokenType.Identifier,
          start,
          this.position
        )
      );
    }
    start = this.position;
    return start;
  }
  readApi(): Token {
    const start = this.position;
    this.position += 3;
    return Token.from(
      this.input.substring(start, start + 3),
      TokenType.Api,
      start,
      this.position
    );
  }
}
