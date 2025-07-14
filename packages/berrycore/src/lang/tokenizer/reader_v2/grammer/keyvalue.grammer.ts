import { TokenType } from "../../tokenType";
import { LexerGrammer } from "../lexer.types";

export const keyValueGrammer: LexerGrammer = {
  name: "keyValue",
  regex: /^\s*-\s*/, // Matches the leading dash and optional spaces
  groups: [
    {
      tokenType: TokenType.Hyphen,
    },
  ],
  next: [
    {
      name: "quotedKey",
      regex: /(['"`])(.*?)(\1)\s*(:)/, // Matches 'key' or "key" followed by colon
      groups: [
        {
          tokenType: TokenType.Quote,
          index: 1,
        },
        {
          tokenType: TokenType.Identifier,
          index: 2,
        },
        {
          tokenType: TokenType.Quote,
          index: 3,
        },
        {
          tokenType: TokenType.Colon,
          index: 4,
        },
      ],
      next: [
        {
          name: "value",
          regex: /(['"])(.*?)(\1)/,
          isOptional: true,
          groups: [
            {
              tokenType: TokenType.Quote,
              index: 1,
            },
            {
              tokenType: TokenType.Scalar,
              index: 2,
            },
            {
              tokenType: TokenType.Quote,
              index: 3,
            },
          ],
        },
        {
          name: "valuebacktick",
          regex: /`([\s\S]*?)`/,
          isOptional: true,
          groups: [
            {
              tokenType: TokenType.Quote,
              index: 1,
            },
          ],
          loopUntil: /`/,
          mergeLines: true,
        },
        {
          name: "unquotedValue",
          regex: /([a-zA-Z_.][a-zA-Z0-9_.]*)/,
          groups: [
            {
              tokenType: TokenType.Identifier,
              index: 1,
            },
          ],
          isOptional: true,
        },
      ],
    },
    {
      name: "unquotedKey",
      regex: /\s*([a-zA-Z_.][a-zA-Z0-9_.]*)\s*(:)/, // Matches name:
      groups: [
        {
          tokenType: TokenType.Identifier,
          index: 1,
        },
        {
          tokenType: TokenType.Colon,
          index: 2,
        },
      ],
      next: [
        {
          name: "value",
          regex: /(['"])(.*?)(\1)/,
          groups: [
            {
              tokenType: TokenType.Quote,
              index: 1,
            },
            {
              tokenType: TokenType.Scalar,
              index: 2,
            },
            {
              tokenType: TokenType.Quote,
              index: 3,
            },
          ],
          isOptional: true,
        },
        {
          name: "multilineValue",
          regex: /(`)([\s\S]*?)(`)/,
          isOptional: true,
          groups: [
            {
              tokenType: TokenType.Backtick,
              index: 1,
            },
            {
              tokenType: TokenType.Scalar,
              index: 2,
            },
            {
              tokenType: TokenType.Backtick,
              index: 3,
            },
          ],
          start: /(`)([\s\S]*?)/,
          end: /(`)([\s\S]*?)(`)/,
          mergeLines: true,
        },
        {
          name: "unquotedValue",
          regex: /(?<!['"])([a-zA-Z_.][a-zA-Z0-9_.]*)(?!['"])/,
          groups: [
            {
              tokenType: TokenType.Identifier,
              index: 1,
            },
          ],
          isOptional: true,
        },
      ],
      isMultiline: false,
      isOptional: true,
    },
  ],
  loopUntil: /^\s*-\s*$/,
  isMultiline: false,
};
