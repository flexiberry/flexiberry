import { TokenType } from "../../tokenType";
import { LexerGrammer } from "../lexer.types";

export const linkGrammer: LexerGrammer = {
  name: "link",
  regex: /^\s*(Link)\s+(.+?)\s*$/,
  groups: [
    {
      tokenType: TokenType.Link,
      index: 1,
    },
    {
      tokenType: TokenType.LinkPath,
      index: 2,
    },
  ],
  isOptional: true,
  isMultiline: false,
};
