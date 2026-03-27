import { TokenType } from "../../tokenType";
import { LexerGrammer } from "../lexer.types";
import { stepGrammer } from "./step.grammer";

export const taskGrammer: LexerGrammer = {
  name: "task",
  regex: /^\s*(Task)\s*(?:(.*))?$/,
  groups: [
    {
      tokenType: TokenType.Task,
      index: 1,
    },
    {
      tokenType: TokenType.Title,
      index: 2,
    },
  ],
  isOptional: true,
  isMultiline: false,
};
