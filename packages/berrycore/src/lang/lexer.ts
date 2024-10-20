import { CommentReader } from "./reader/commentReader";
import { EnvReader } from "./reader/envReader";
import { TokenType } from "./tokenType";
import { isApi, isComment, isEnv, isVar, isWhitespace } from "./util";

export class Lexer {
  private input: string;
  private position: number = 0;

  constructor(input: string) {
    this.input = input;
  }

  // Tokenize the input
  tokenize() {
    const tokens = [];
    while (this.position < this.input.length) {
      const char = this.input[this.position];

      if (isWhitespace(char)) {
        this.position++;
        continue; // Skip whitespace
      }

      if (isComment(this.input, this.position)) {
        const commentReader = new CommentReader(this.input, this.position);
        const comment = commentReader.read();
        tokens.push(...comment);
        this.position = commentReader.getPosition(); // Update position from CommentReader
        continue;
      }

      if (isEnv(this.input, this.position)) {
        const envReader = new EnvReader(this.input, this.position);
        const envTokens = envReader.read();
        tokens.push(...envTokens); // Spread operator to add all tokens
        this.position = envReader.getPosition(); // Update position from EnvReader
        continue;
      }

      this.position++; // Move to the next character if no match
    }
    return tokens;
  }
}
