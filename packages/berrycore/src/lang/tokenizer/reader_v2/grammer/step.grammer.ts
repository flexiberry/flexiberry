import { TokenType } from "../../tokenType";
import { LexerGrammer } from "../lexer.types";
import { keyValueGrammer } from "./keyvalue.grammer";

export const stepGrammer: LexerGrammer = {
  name: "step",
  regex: /^\s*(Step)\s*(?:(Call))\s*(?:(Api))\s*(\w*|\W*)/,
  groups: [
    {
      tokenType: TokenType.Step,
      index: 1,
    },
    {
      tokenType: TokenType.Call,
      index: 2,
    },
    {
      tokenType: TokenType.Api,
      index: 3,
    },
    {
      tokenType: TokenType.Pointer,
      index: 4,
    },
  ],
  isOptional: true,
  isMultiline: false,
};
