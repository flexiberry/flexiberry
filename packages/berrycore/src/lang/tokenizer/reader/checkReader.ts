import { stat } from "fs";

import { CommentReader } from "./commentReader";
import { KeyValuePair } from "./keyValuePair";
import { CReader, type Reader } from "./reader";
import { isWhitespace, isComment } from "../../util";
import { Token } from "../token";
import { TokenType } from "../tokenType";

export class CheckReader extends CReader implements Reader {
  private readonly operandsScalar = ["'", "`"];
  private readonly logicalOperator = ["AND", "OR"];

  constructor(input: string, position: number) {
    super(input, position);
  }
  read(): Token[] {
    const tkns: Token[] = [];

    tkns.push(this.readcheck());

    while (
      this.position < this.input.length &&
      this.input[this.position] !== "\n"
    ) {
      this.position++;
    }

    this.position++;

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
        continue;
      }

      // Skip whitespace at start of line

      if (this.input[this.position] === "-") {
        // this.position++;
        tkns.push(...this.readExpression());
        continue;
      }

      this.position++; // Move past newline
    }
    return tkns;
  }
  private readcheck(): Token {
    const start = this.position;
    this.position += 5;
    const value = this.input.substring(start, this.position);
    return Token.from(value, TokenType.Check, start, this.position);
  }

  private readExpression(): Token[] {
    const tkns: Token[] = [];
    const lineStart = this.position;
    tkns.push(Token.from("-", TokenType.Hyphen, lineStart, this.position));
    this.position++;
    let hasLogicalOperator: boolean = false;
    do {
      // Read left hand side (identifier)
      tkns.push(Token.from("Lhs", TokenType.Lhs, lineStart, this.position));
      let start = this.readOperands(tkns);

      this.readOperator(tkns, start);

      tkns.push(Token.from("Rhs", TokenType.Rhs, lineStart, this.position));
      start = this.readOperands(tkns);

      // Check if there is a logical operator after the current operand
      hasLogicalOperator = this.hasLogicalOperator(
        hasLogicalOperator,
        start,
        tkns
      );

      this.position++;
    } while (hasLogicalOperator);

    return tkns;
  }

  private hasLogicalOperator(
    hasLogicalOperator: boolean,
    start: number,
    tkns: Token[]
  ) {
    if (this.input[this.position] !== "\n") {
      hasLogicalOperator = true;
      while (!isWhitespace(this.input[this.position])) {
        this.position++;
      }

      const lgOprtor = this.input
        .substring(start, this.position)
        .toLocaleUpperCase();
      const token = this.logicalOperator.includes(lgOprtor)
        ? lgOprtor === "AND"
          ? TokenType.And
          : TokenType.Or
        : TokenType.Unknown;

      if (token == TokenType.Unknown) return false;

      tkns.push(Token.from(lgOprtor, token, start, this.position));
    } else {
      hasLogicalOperator = false;
    }
    return hasLogicalOperator;
  }

  private readOperator(tkns: Token[], start: number) {
    while (isWhitespace(this.input[this.position])) {
      this.position++;
    }
    start = this.position;

    while (!isWhitespace(this.input[this.position])) {
      this.position++;
    }
    tkns.push(
      Token.from(
        this.input.substring(start, this.position),
        TokenType.Operator,
        start,
        this.position
      )
    );
    this.position++;
    start = this.position;
  }

  private readOperands(tkns: Token[]) {
    let start = this.position;
    while (
      this.position < this.input.length &&
      isWhitespace(this.input[this.position])
    ) {
      this.position++;
    }

    let char = this.input[this.position];
    let tokenType = TokenType.Operands;
    if (this.operandsScalar.includes(char)) {
      char = this.input[this.position];
      start = this.position;
      this.position++;
      while (
        this.position < this.input.length &&
        char != this.input[this.position]
      ) {
        this.position++;
      }
      tokenType = TokenType.OperandsScalar;
      this.position++;
    } else {
      start = this.position;
      while (
        this.position < this.input.length &&
        !isWhitespace(this.input[this.position]) &&
        this.input[this.position] !== "\n"
      ) {
        if (this.input[this.position] == "\n") break;
        this.position++;
      }
    }
    const value = this.input.substring(start, this.position);

    tkns.push(Token.from(value, tokenType, start, this.position));
    while (
      this.position < this.input.length &&
      isWhitespace(this.input[this.position])
    ) {
      this.position++;
      if (this.input[this.position] == "\n") break;
    }
    start = this.position;
    return start;
  }
}
