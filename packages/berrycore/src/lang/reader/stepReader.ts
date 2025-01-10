import { Token } from "../tokenizer/token";
import { TokenType } from "../tokenizer/tokenType";
import { isComment, isStep, isWhitespace } from "../util";
import { CommentReader } from "./commentReader";
import { CReader, Reader } from "./reader";

export class StepReader extends CReader implements Reader {
  constructor(input: string, position: number) {
    super(input, position);
  }

  read(): Token[] {
    let tkns: Token[] = [];

    tkns.push(this.readStepKeyword());

    // Handle any trailing comments
    while (
      this.position < this.input.length &&
      this.input[this.position] !== "\n"
    ) {
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

      // Read optional identifier if present
      if (this.input[this.position] === "#") {
        tkns.push(
          Token.from(
            this.input.substring(this.position, this.position + 1),
            TokenType.Hash,
            this.position,
            this.position + 1
          )
        );
        tkns.push(this.readIdentifier());
      }

      if (this.input.substring(this.position, this.position + 4) == "Call")
        tkns.push(this.readCallKeyword());

      if (this.input.substring(this.position, this.position + 3) == "Api") {
        tkns.push(
          Token.from(
            this.input.substring(this.position, this.position + 3),
            TokenType.Api,
            this.position,
            this.position + 3
          )
        );
        this.position += 3;
        tkns.push(this.readApiPointer());
      }

      this.position++;
    }

    return tkns;
  }

  private readStepKeyword(): Token {
    const start = this.position;
    this.position += 4;
    const value = this.input.substring(start, this.position);
    return Token.from(value, TokenType.Step, start, this.position);
  }

  private readIdentifier(): Token {
    this.position++;
    let start = this.position;

    while (
      this.position < this.input.length &&
      !isWhitespace(this.input[this.position])
    ) {
      this.position++;
    }

    return Token.from(
      this.input.substring(start, this.position),
      TokenType.Identifier,
      start,
      this.position
    );
  }

  private readCallKeyword(): Token {
    const start = this.position;
    this.position += 4;
    return Token.from(
      this.input.substring(start, this.position),
      TokenType.Call,
      start,
      this.position
    );
  }

  private readApiPointer(): Token {
    while (
      this.position < this.input.length &&
      isWhitespace(this.input[this.position])
    ) {
      this.position++;
    }
    const start = this.position;

    while (
      this.position < this.input.length &&
      !isWhitespace(this.input[this.position]) &&
      this.input[this.position] !== "\n"
    ) {
      this.position++;
    }

    return Token.from(
      this.input.substring(start, this.position),
      TokenType.Identifier,
      start,
      this.position
    );
  }
}
