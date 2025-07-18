import { TokenType } from "../../tokenType";
import { LexerGrammer } from "../lexer.types";
import { keyValueGrammer } from "./keyvalue.grammer";

export const captureGrammer: LexerGrammer = {
  name: "Capture",
  regex: /^\s*(Capture)/,
  groups: [
    {
      tokenType: TokenType.Capture,
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
