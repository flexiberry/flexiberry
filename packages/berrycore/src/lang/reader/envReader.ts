import { Position, Token } from "../tokenizer/token";
import { TokenType } from "../tokenizer/tokenType";
import { isWhitespace } from "../util";
import { CReader, Reader } from "./reader";

export class EnvReader extends CReader implements Reader {
  constructor(input: string, position: number) {
    super(input, position);
  }

  // Read environment declaration
  readEnv(): Token {
    // Logic to read environment
    const start = this.position;
    this.position += 3;
    return Token.from(
      this.input.substr(start, 3),
      TokenType.Env,
      start,
      this.position
    );
  }

  read(): Token[] {
    let tkns: Token[] = [];
    let start = this.position;
    let envValues = "";

    tkns.push(this.readEnv());

    while (
      this.position < this.input.length &&
      this.input[this.position] !== "\n"
    ) {
      const char = this.input[this.position];

      if (isWhitespace(char)) {
        this.position++; // Move to the next character
        continue; // Skip whitespace
      }

      if (char === "," || char === "\n") {
        tkns.push(
          Token.from(envValues, TokenType.Value, start, this.position - 1)
        );
        start = this.position + 1; // Move past the comma/newline
        envValues = ""; // Reset for the next value

        if (char === ",") {
          // Tokenize the comma
          tkns.push(
            Token.from(char, TokenType.Comma, this.position, this.position)
          );
        }
      } else {
        envValues += char; // Accumulate the value
      }
      this.position++; // Move to the next character
    }

    // Handle the last value if it exists
    if (envValues) {
      tkns.push(Token.from(envValues, TokenType.Value, start, this.position));
    }

    return tkns;
  }
}
