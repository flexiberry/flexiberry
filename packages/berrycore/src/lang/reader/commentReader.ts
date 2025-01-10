import { Token } from "../tokenizer/token";
import { TokenType } from "../tokenizer/tokenType";
import { isComment } from "../util";
import { CReader, Reader } from "./reader";

export class CommentReader extends CReader implements Reader {
  constructor(input: string, position: number) {
    super(input, position);
  }

  readComments() {
    if (isComment(this.input, this.position)) {
      const comment = this.read();
      return {
        token: comment,
        position: this.getPosition(),
      };
    }
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
