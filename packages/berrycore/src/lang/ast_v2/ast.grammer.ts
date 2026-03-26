import { TokenType } from "../tokenizer/tokenType";
import { BlocksType } from "./blocks";

export type TokenSequence = {
  expected: TokenType;
  optional: boolean;
  next: TokenType[];
};

export type AstGrammer = {
  block: BlocksType;
  tokens: TokenSequence[];
};


export const variableGrammar: AstGrammer[] = [
  {
    block: BlocksType.Variables,
    tokens: [
      {
        expected: TokenType.Var,
        optional: false,
        next: [TokenType.Identifier]
      },
      {
        expected: TokenType.Identifier,
        optional: false,
        next: [TokenType.Equal]
      },
      {
        expected: TokenType.Equal,
        optional: false,
        next: [TokenType.Number, TokenType.Scalar, TokenType.Value]
      },
      {
        expected: TokenType.Number,
        optional: true,
        next: []
      },
      {
        expected: TokenType.Scalar,
        optional: true,
        next: []
      },
      {
        expected: TokenType.Value,
        optional: true,
        next: []
      }
    ]
  },
  // Variable reference (e.g., "pointer myVar" or "pointed myVar")
  {
    block: BlocksType.Variables,
    tokens: [
      {
        expected: TokenType.Pointer,
        optional: false,
        next: [TokenType.Identifier]
      },
      {
        expected: TokenType.Identifier,
        optional: false,
        next: []
      }
    ]
  },
  {
    block: BlocksType.Variables,
    tokens: [
      {
        expected: TokenType.Pointed,
        optional: false,
        next: [TokenType.Identifier]
      },
      {
        expected: TokenType.Identifier,
        optional: false,
        next: []
      }
    ]
  }
];

export const grammar: AstGrammer[] = [
  ...variableGrammar,
  // Add other grammars here (API, Task, Step, etc.)
];
