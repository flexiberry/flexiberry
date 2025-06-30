import { isWhitespace, isComment } from "../../util";
import { Token } from "../token";
import { TokenType } from "../tokenType";
import { CommentReader } from "./commentReader";
import { KeyValuePair } from "./keyValuePair";
import { CReader, type Reader } from "./reader";

export class ParamsReader extends CReader implements Reader {
  constructor(input: string, position: number) {
    super(input, position);
  }
  read(): Token[] {
    const tkns: Token[] = [];

    tkns.push(this.readParams());
    // Handle any trailing comments
    while (
      this.position < this.input.length &&
      this.input[this.position] !== "\n"
    ) {
      if (
        !isComment(this.input, this.position) ||
        this.input[this.position] !== "\n" ||
        !isWhitespace(this.input[this.position])
      ) {
        throw new Error("Invalid params reader");
      }

      if (isWhitespace(this.input[this.position])) {
        this.position++;
        continue;
      }

      if (isComment(this.input, this.position)) {
        const commentReader = new CommentReader(this.input, this.position);
        const comment = commentReader.read();
        tkns.push(...comment);
        this.position = commentReader.getPosition();
        break;
      }
    }

    this.position++;

    while (this.position < this.input.length) {
      // Skip whitespace at start of line
      while (
        this.position < this.input.length &&
        isWhitespace(this.input[this.position]) &&
        this.input[this.position] !== "\n"
      ) {
        this.position++;
      }

      // Check for empty line
      if (
        this.input[this.position] === "\n" ||
        this.input[this.position] === undefined
      ) {
        break;
      }

      if (this.input[this.position] === "-") {
        const kvReader = new KeyValuePair(this.input, this.position);
        const tk = kvReader.read();
        tkns.push(...tk);
        this.position = kvReader.getPosition(); // Update position
      }

      if (this.position < this.input.length) {
        this.position++; // Move past newline
      }
    }
    return tkns;
  }
  private readParams(): Token {
    const start = this.position;
    this.position += 6;
    const value = this.input.substring(start, this.position);
    return Token.from(value, TokenType.Params, start, this.position);
  }
}
