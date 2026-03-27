import { TokenType } from "../../tokenType";
import { LexerGrammer } from "../lexer.types";

export const comment: LexerGrammer = {
  name: "comment",
  regex: /^\s*##(.*$)/,
  groups: [
    {
      tokenType: TokenType.Comment,
      index: 1,
    },
  ],
  isOptional: true,
  isMultiline: false,
};
