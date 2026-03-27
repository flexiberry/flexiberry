import { TokenType } from "../../tokenType";
import { LexerGrammer } from "../lexer.types";
import { keyValueGrammer } from "./keyvalue.grammer";

export const varLexerGrammer: LexerGrammer[] = [
  {
    name: "var",
    regex: /^Var/,
    groups: [
      {
        tokenType: TokenType.Var,
      },
    ],
    next: [
      {
        name: "pointer",
        regex: /(@)(\S+)\s+(.*)/,
        isOptional: true,
        groups: [
          {
            tokenType: TokenType.Pointer,
            index: 1,
          },
          {
            tokenType: TokenType.Pointed,
            index: 2,
          },
          {
            tokenType: TokenType.Title,
            index: 3,
          },
        ],
      },
      {
        name: "title",
        regex: /\s+(.*)/,
        groups: [
          {
            tokenType: TokenType.Title,
            index: 0,
          },
        ],
        isOptional: true,
      },
      { ...keyValueGrammer, ...{ moveNextLine: true } },
    ],
    isMultiline: false,
  },
];
