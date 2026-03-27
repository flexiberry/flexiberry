import { TokenType } from "./tokenType";

export type Position = {
  start: number;
  end: number;
  line?: number;
};

export class Token {
  constructor(
    public value: any,
    public type: TokenType,
    public position: Position
  ) {}

  static from(
    value: any,
    type: TokenType,
    start: number,
    end: number,
    line?: number
  ): Token {
    return new Token(value, type, { start: start, end: end, line: line });
  }
}
