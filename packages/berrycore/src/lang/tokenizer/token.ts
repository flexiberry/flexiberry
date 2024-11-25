import { TokenType } from "./tokenType";

export type Position = {
  start: number;
  end: number;
};

export class Token {
  constructor(
    public value: string,
    public type: TokenType,
    public position: Position
  ) {}

  static from(
    value: string,
    type: TokenType,
    start: number,
    end: number
  ): Token {
    return new Token(value, type, { start: start, end: end });
  }
}
