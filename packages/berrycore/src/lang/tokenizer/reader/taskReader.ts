import { isComment } from "../../util";
import { Token } from "../token";
import { TokenType } from "../tokenType";
import { CommentReader } from "./commentReader";
import { CReader, type Reader } from "./reader";

export class TaskReader extends CReader implements Reader {
  constructor(input: string, position: number) {
    super(input, position);
  }

  read(): Token[] {
    const tkns: Token[] = [];

    tkns.push(this.readTaskKeyword());

    let value = "";

    // Handle any trailing comments
    const start = this.position;
    while (
      this.position < this.input.length &&
      this.input[this.position] !== "\n"
    ) {
      if (isComment(this.input, this.position)) {
        const commentReader = new CommentReader(this.input, this.position);
        const comment = commentReader.read();
        tkns.push(...comment);
        this.position = commentReader.getPosition();
        break;
      }

      value += this.input[this.position];
      this.position++;
    }

    tkns.push({
      position: { start: start, end: this.position },
      type: TokenType.Title,
      value: value,
    });

    return tkns;
  }

  private readTaskKeyword(): Token {
    const start = this.position;
    this.position += 4;
    const value = this.input.substring(start, this.position);
    return Token.from(value, TokenType.Task, start, this.position);
  }
}
