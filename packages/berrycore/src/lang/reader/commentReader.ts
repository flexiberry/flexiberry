import { Token } from "../tokenizer/token";
import { TokenType } from "../tokenizer/tokenType";
import { CReader, Reader } from "./reader";

export class CommentReader extends CReader implements Reader {
  constructor(input: string, position: number) {
    super(input, position);
  }

  // Read comments
  read(): Token[] {
    const start = this.position;
    while (
      this.position < this.input.length &&
      this.input[this.position] !== "\n"
    ) {
      this.position++;
    }
    return [
      Token.from(
        this.input.substring(start, this.position),
        TokenType.Comment,
        start,
        this.position
      ),
    ];
  }
}
