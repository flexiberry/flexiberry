import { TokenType } from "../../tokenType";
import { LexerGrammer } from "../lexer.types";
import { conditionGrammer } from "./conditions.grammer";
import { keyValueGrammer } from "./keyvalue.grammer";

export const checkGrammer: LexerGrammer = {
  name: "Check",
  regex: /^\s*(Check)/,
  groups: [
    {
      tokenType: TokenType.Check,
      index: 1,
    },
  ],
  next: [
    {
      ...conditionGrammer,
      moveNextLine: true,
    },
  ],
  isOptional: true,

  isMultiline: false,
  moveNextLine: true,
};
