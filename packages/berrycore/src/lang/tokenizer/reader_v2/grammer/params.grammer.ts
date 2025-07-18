import { TokenType } from "../../tokenType";
import { LexerGrammer } from "../lexer.types";
import { keyValueGrammer } from "./keyvalue.grammer";

export const paramsGrammer: LexerGrammer = {
  name: "Params",
  regex: /^\s*(Params)/,
  groups: [
    {
      tokenType: TokenType.Params,
      index: 1,
    },
  ],
  next: [
    {
      ...keyValueGrammer,
      moveNextLine: true,
    },
  ],
  isOptional: true,

  isMultiline: false,
  moveNextLine: true,
};
