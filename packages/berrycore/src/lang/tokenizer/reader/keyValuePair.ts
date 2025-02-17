import { isWhitespace } from "../../util";
import { Token } from "../token";
import { TokenType } from "../tokenType";
import { CReader, type Reader } from "./reader";

export class KeyValuePair extends CReader implements Reader {
  constructor(input: string, position: number) {
    super(input, position);
  }

  read(): Token[] {
    const tkns: Token[] = [];
    const start = this.position;
    this.varKeyValuePairExtract(tkns, this.input[this.position], start);
    return tkns;
  }

  private varKeyValuePairExtract(tkns: Token[], char: string, start: number) {
    start = this.position;
    tkns.push(Token.from(char, TokenType.Hyphen, start, this.position));
    this.position++; // Move to the next
    start = this.position;
    let collect: string = "";
    while (
      this.position < this.input.length &&
      this.input[this.position] !== "\n"
    ) {
      const c = this.input[this.position];
      if (isWhitespace(c)) {
        this.position++; // Move to the next character
        continue; // Skip whitespace
      }
      if (c === ":") {
        tkns.push(
          Token.from(collect, TokenType.Identifier, start, this.position)
        );
        start = this.position;
        tkns.push(Token.from(c, TokenType.Colon, start, this.position));
        collect = "";
        start = this.position;
        this.position++; // Move to the next
        continue;
      }

      if (c === "'") {
        tkns.push(Token.from(c, TokenType.Quote, start, this.position));
        this.position++;
        start = this.position;
        collect = "";
        while (
          this.position < this.input.length &&
          this.input[this.position] !== "'"
        ) {
          collect += this.input[this.position];
          this.position++;
        }

        tkns.push(
          Token.from(collect, TokenType.Scalar, start, this.position - 1)
        );
        tkns.push(Token.from(c, TokenType.Quote, this.position, this.position));
        collect = "";
        start = this.position;
        this.position++; // Move to the next
        continue;
      }

      if (c === "`") {
        tkns.push(Token.from(c, TokenType.Backtick, start, this.position));
        this.position++;
        start = this.position;
        collect = "";
        while (
          this.position < this.input.length &&
          this.input[this.position] !== "`"
        ) {
          collect += this.input[this.position];
          this.position++;
        }

        tkns.push(
          Token.from(collect, TokenType.Scalar, start, this.position - 1)
        );
        tkns.push(
          Token.from(c, TokenType.Backtick, this.position, this.position)
        );
        collect = "";
        start = this.position;
        this.position++; // Move to the next
        continue;
      }

      collect += c;
      this.position++; // Move to the next
    }
    if (collect.length > 0)
      tkns.push(Token.from(collect, TokenType.Scalar, start, this.position));
    return start;
  }
}
