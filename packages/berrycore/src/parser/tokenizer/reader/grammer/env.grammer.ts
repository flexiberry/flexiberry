import { TokenType } from "../../tokenType";
import { LexerGrammer } from "../lexer.types";

export const envGrammer: LexerGrammer = {
  name: "env",
  regex: /^\s*(Env)\s+(.+?)\s*$/,
  groups: [
    {
      tokenType: TokenType.Env,
      index: 1,
    },
    {
      tokenType: TokenType.Value,
      index: 2,
    },
  ],
  isOptional: true,
  isMultiline: false,
};
