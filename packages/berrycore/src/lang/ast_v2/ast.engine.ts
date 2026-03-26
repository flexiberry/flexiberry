import { Token } from "../tokenizer/token";
import { TokenType } from "../tokenizer/tokenType";
import { Blocks, BlocksType } from "./blocks";
import { AstGrammer, grammar } from "./ast.grammer";

export class BaseAstEngine {
  protected tokens: Token[] = [];
  protected currentTokenIndex: number = 0;
  protected currentBlock: Blocks | null = null;
  protected grammar: AstGrammer[] = [];

  // Core parsing methods
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
  constructor(tokens: Token[]) {
    super();
    this.tokens = tokens;
    this.grammar = grammar;
  }

  /**
   * Main entry point to build AST from tokens
   */
  build(): Blocks[] {
    const rootBlocks: Blocks[] = [];

    while (this.not_eof()) {
      const block = this.parseBlock();
      if (block) {
        rootBlocks.push(block);
      } else {
        // Handle unexpected token or syntax error
        this.synchronize();
      }
    }

    return rootBlocks;
  }

  /**
   * Parse a block based on current token
   */
  private parseBlock(): Blocks | null {
    const currentToken = this.currentToken();
    if (!currentToken) return null;

    // Find matching grammar rule for current token
    const matchedRule = this.findMatchingRule(currentToken.type);
    if (!matchedRule) {
      // this.error(`Unexpected token: ${currentToken.type}`);
      return null;
    }

    // Create new block
    const block: Blocks = {
      type: matchedRule.block,
      sequence: [],
      intend: 0, // Will be calculated based on indentation
      lineStart: currentToken.position.line ?? 0,
      lineEnd: currentToken.position.line ?? 0,
      blocks: [],
    };

    // Parse block content based on grammar rules
    this.parseBlockContent(block, matchedRule);

    return block;
  }

  /**
   * Parse the content of a block based on its grammar rules
   */
  private parseBlockContent(block: Blocks, rule: AstGrammer) {
    // TODO: Implement based on specific grammar rules
    // This should handle the sequence of tokens expected for this block type
  }

  /**
   * Find matching grammar rule for current token
   */
  private findMatchingRule(tokenType: TokenType): AstGrammer | undefined {
    return this.grammar.find((rule) =>
      rule.tokens.some((seq) => seq.expected === tokenType)
    );
  }

  /**
   * Get current token
   */
  private currentToken() {
    return this.tokens[this.currentTokenIndex];
  }

  /**
   * Get next token without consuming it
   */
  private peek(offset = 0) {
    return this.tokens[this.currentTokenIndex + offset];
  }

  /**
   * Consume current token and move to next
   */
  private consume() {
    if (this.not_eof()) {
      return this.tokens[this.currentTokenIndex++];
    }
    return null;
  }

  /**
   * Check if current token matches expected type and consume it
   */
  private match(type: TokenType, consume = true): boolean {
    if (this.not_eof() && this.currentToken().type === type) {
      if (consume) this.consume();
      return true;
    }
    return false;
  }

  /**
   * Error handling - report error and synchronize
   */
  private error(message: string): never {
    const token = this.currentToken();
    const errorMsg = `[Line ${token?.position.line}:${token?.position.start}] ${message}`;
    throw new SyntaxError(errorMsg);
  }

  /**
   * Synchronize parser after error
   */
  private synchronize() {
    this.consume();
    // TODO: Implement better error recovery
  }
}
