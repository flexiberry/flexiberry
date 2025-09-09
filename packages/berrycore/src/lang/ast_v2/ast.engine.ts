import { Token } from "../tokenizer/token";
import { TokenType } from "../tokenizer/tokenType";

export class BaseAstEngine {
  protected tokens: Token[] = [];

  protected not_eof(): boolean {
    return this.tokens.length > 0 && this.tokens[0].type != TokenType.Eof;
  }

  protected eof(): boolean {
    return this.tokens.length === 0 || this.tokens[0].type == TokenType.Eof;
  }
  protected at() {
    return this.tokens[0] as Token;
  }

  protected eat() {
    let prev;
    do {
      prev = this.tokens.shift() as Token;
    } while (
      this.tokens.length > 0 &&
      this.tokens[0].type === TokenType.Comment
    );

    return prev;
  }

  protected expect(type: TokenType, err: any) {
    const prev = this.tokens.shift() as Token;
    if (!prev || (prev.type != type && prev.type != TokenType.Comment)) {
      console.error(
        `\x1b[31mParser Error:\x1b[0m\nError: ${err}, But got : ${TokenType[prev.type].toUpperCase()}`
      );
    }
    return prev;
  }

  setTokens(tokens: Token[]) {
    this.tokens = tokens;
  }

  getTokens(): Token[] {
    return this.tokens;
  }
}

export class AstEngine extends BaseAstEngine {
  build() {}
}
