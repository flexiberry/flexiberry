import { TokenType } from "../../tokenType";
import { LexerGrammer } from "../lexer.types";

export const inputGrammer: LexerGrammer = {
  name: "input",
  regex: /^\s*(Input)\s+(.+?)\s*$/,
  groups: [
    {
      tokenType: TokenType.Input,
      index: 1,
    },
    {
      tokenType: TokenType.InputPath,
      index: 2,
    },
  ],
  isOptional: true,
  isMultiline: false,
};
