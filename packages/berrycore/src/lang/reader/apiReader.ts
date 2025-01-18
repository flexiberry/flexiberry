import { Token } from "../tokenizer/token";
import { TokenType } from "../tokenizer/tokenType";
import { isComment, isWhitespace } from "../util";
import { CommentReader } from "./commentReader";
import { KeyValuePair } from "./keyValuePair";
import { CReader, Reader } from "./reader";

export class ApiReader extends CReader implements Reader {
  constructor(input: string, position: number) {
    super(input, position);
  }
  read(token: TokenType): Token[] {
    let tkns: Token[] = [];
    let value = "";

    let start = this.position;

    if (TokenType.Api == token) {
      tkns.push(this.readApi());
      start = this.position;
      start = this.fetchApiIdandTitle(start, tkns, value);
    }

    if (TokenType.Url == token) start = this.extractUrl(start, tkns);
    if (TokenType.Body == token) start = this.extractBody(start, tkns);
    if (TokenType.Header == token) start = this.extractHeader(start, tkns);

    // tkns.push(Token.from("", TokenType.ApiEnd, start, start));

    return tkns;
  }

  private readComments(tkns: Token[]): number {
    // New function
    if (isComment(this.input, this.position)) {
      const commentReader = new CommentReader(
        this.input,
        this.position
      ).readComments();
      if (commentReader) {
        this.position = commentReader.position;
        tkns.push(...commentReader.token);
        return this.position++;
      }
    }
    return this.position; // Return updated position
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
        continue;
      }

      this.position++; // Move to the next
    }

    return this.position++;
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
    let start = this.position;
    let value = "";
    this.position = this.position + 6;
    tkns.push(
      Token.from(
        this.input.substring(start, this.position),
        TokenType.Header,
        start,
        this.position
      )
    );
    this.position++;

    while (
      this.position < this.input.length &&
      this.input[this.position] !== "-"
    ) {
      this.position++; // Move to the next character
    }

    if (this.input[this.position] === "-") {
      const kvReader = new KeyValuePair(this.input, this.position);
      const tk = kvReader.read();
      tkns.push(...tk);
      this.position = kvReader.getPosition(); // Update position
      start = this.position;
      this.position++; // Move to the next
    }

    start = this.position;
    return start;
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
      this.position++; // Move to the next character
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
