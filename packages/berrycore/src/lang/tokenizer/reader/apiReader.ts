import { isWhitespace } from "../../util";
import { Token } from "../token";
import { TokenType } from "../tokenType";
import { CommentReader } from "./commentReader";
import { KeyValuePair } from "./keyValuePair";
import { CReader, type Reader } from "./reader";

export class ApiReader extends CReader implements Reader {
  constructor(input: string, position: number) {
    super(input, position);
  }
  read(token: TokenType): Token[] {
    const tkns: Token[] = [];
    const value = "";

    let start = this.position;

    if (TokenType.Api == token) {
      tkns.push(this.readApi());
      start = this.position;
      start = this.fetchApiIdandTitle(start, tkns, value);
    }

    if (TokenType.Url == token) start = this.extractUrl(start, tkns);
    if (TokenType.Body == token) start = this.extractBody(start, tkns);
    if (TokenType.Header == token) start = this.extractHeader(start, tkns);

    return tkns;
  }
  private extractBody(start: number, tkns: Token[]) {
    while (
      this.position < this.input.length &&
      this.input[this.position] !== "\n"
    ) {
      const char = this.input[this.position];

      if (isWhitespace(char)) {
        this.position++; // Move to the next character
        continue; // Skip whitespace
      }

      if (this.input.substring(this.position, this.position + 4) === "Body") {
        start = this.readBody(tkns);
        continue;
      }

      this.position++; // Move to the next
    }

    return this.position++;
  }
  private extractHeader(start: number, tkns: Token[]) {
    while (
      this.position < this.input.length &&
      this.input[this.position] !== "\n"
    ) {
      const char = this.input[this.position];

      if (isWhitespace(char)) {
        this.position++; // Move to the next character
        continue; // Skip whitespace
      }
      if (this.input.substring(this.position, this.position + 6) === "Header") {
        start = this.readHeader(tkns);
        break;
      }

      this.position++; // Move to the next
    }

    return this.position;
  }
  private extractUrl(start: number, tkns: Token[]) {
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
        continue;
      }
      this.position++; // Move to the next
    }
    return this.position++;
  }

  private readHeader(tkns: Token[]): number {
    const start = this.position;
    this.position += 6; // Skip 'Header'
    tkns.push(
      Token.from(
        this.input.substring(start, this.position),
        TokenType.Header,
        start,
        this.position
      )
    );
    this.position++;

    // Move to the first '-' (start of key-value pairs), skipping whitespace and newlines
    while (
      this.position < this.input.length &&
      (isWhitespace(this.input[this.position]) ||
        this.input[this.position] === "\n")
    ) {
      this.position++;
    }

    // Parse key-value pairs until an empty line or a non-hyphen character
    while (this.position < this.input.length) {
      // Skip whitespace at start of line (except newlines)
      while (
        this.position < this.input.length &&
        isWhitespace(this.input[this.position]) &&
        this.input[this.position] !== "\n" &&
        this.input[this.position] !== "-"
      ) {
        this.position++;
      }

      // Stop at empty line or end of input
      if (
        this.input[this.position] === "\n" ||
        this.input[this.position] === undefined
      ) {
        break;
      }

      // Stop if the next non-whitespace character is not '-'
      if (this.input[this.position] !== "-") {
        break;
      }

      // Parse key-value pair
      const kvReader = new KeyValuePair(this.input, this.position);
      const tk = kvReader.read();
      tkns.push(...tk);
      this.position = kvReader.getPosition();

      // Move past newline if present
      if (this.input[this.position] === "\n") {
        this.position++;
      }
    }

    return this.position;
  }

  private readBody(tkns: Token[]): number {
    let start = this.position;
    let value = "";
    this.position = this.position + 4;
    tkns.push(
      Token.from(
        this.input.substring(start, this.position),
        TokenType.Body,
        start,
        this.position
      )
    );
    while (
      this.position < this.input.length &&
      this.input[this.position] !== "`"
    ) {
      this.position++;
      if (
        !isWhitespace(this.input[this.position]) &&
        this.input[this.position] !== "`" &&
        this.input[this.position] !== "\n"
      )
        value += this.input[this.position];
    }

    if (value !== null && value !== "") {
      tkns.push(Token.from(value, TokenType.BodyType, start, this.position));
    }

    start = this.position;
    tkns.push(
      Token.from(
        this.input.substring(start, this.position + 1),
        TokenType.Backtick,
        start,
        this.position
      )
    );
    this.position++;
    start = this.position;
    value = "";
    while (
      this.position < this.input.length &&
      this.input[this.position] !== "`"
    ) {
      value += this.input[this.position];
      this.position++;
    }
    tkns.push(
      Token.from(
        this.input.substring(start, this.position),
        TokenType.Scalar,
        start,
        this.position
      )
    );
    this.position++;
    start = this.position;
    tkns.push(
      Token.from(
        this.input.substring(start - 1, this.position),
        TokenType.Backtick,
        start,
        this.position
      )
    );

    // tkns.push(Token.from(value, TokenType.BodyType, start, this.position));
    start = this.position;

    while (
      this.position < this.input.length &&
      this.input[this.position] !== "\n"
    ) {
      const char = this.input[this.position];

      this.position++;
    }

    start = this.position;
    return start;
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

    return this.position;
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
        tkns.push(Token.from(value, TokenType.ApiMethod, start, this.position));

        start = this.fetchIdentifier(tkns, char, start);
        // this.position++;
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
