import { TokenType } from "../../tokenType";
import { LexerGrammer } from "../lexer.types";

export const conditionGrammer: LexerGrammer = {
  name: "conditions",
  regex:
    /^\s*(-)\s*(\d+|true|false|".*?"|'.*?'|`[\s\S]*?`|['"a-zA-Z0-9_$\.\-]*)\s*/, // Matches the leading dash and optional spaces
  groups: [
    {
      tokenType: TokenType.Hyphen,
      index: 1,
    },
  ],
  next: [
    {
      name: "conditions",
      regex:
        /^\s*(\d+|true|false|".*?"|'.*?'|`[\s\S]*?`|['"a-zA-Z0-9_$\.\-]*)\s*(==|!=|>=|<=|>|<)\s*(\d+|true|false|".*?"|'.*?'|`[\s\S]*?`|['"a-zA-Z0-9_$\.\-]*)\s*/,
      groups: [
        {
          tokenType: TokenType.Lhs,
          index: 1,
        },
        {
          tokenType: TokenType.Operator,
          index: 2,
        },
        {
          tokenType: TokenType.Rhs,
          index: 3,
        },
      ],
      next: [
        {
          name: "OR",
          regex: /\s*(OR|Or|or)\s*/,
          groups: [],
          next: [
            {
              name: "conditionsOr",
              regex:
                /^\s*(OR|Or|or)\s*(\d+|true|false|".*?"|'.*?'|`[\s\S]*?`|['"a-zA-Z0-9_$\.\-]*)\s*(==|!=|>=|<=|>|<)\s*(\d+|true|false|".*?"|'.*?'|`[\s\S]*?`|['"a-zA-Z0-9_$\.\-]*)\s*/,
              groups: [
                {
                  tokenType: TokenType.Or,
                  index: 1,
                },
                {
                  tokenType: TokenType.Lhs,
                  index: 2,
                },
                {
                  tokenType: TokenType.Operator,
                  index: 3,
                },
                {
                  tokenType: TokenType.Rhs,
                  index: 4,
                },
              ],
              moveNextLine: false,
            },
          ],
          loopUntil: /\s*(OR|Or|or)\s*/,
          isMultiline: false,
        },
      ],
    },
  ],
  // moveNextLine: true,
  loopUntil:
    /^\s*(-)\s*(\d+|true|false|".*?"|'.*?'|`[\s\S]*?`|['"a-zA-Z0-9_$\.\-]*)\s*/,
  isMultiline: false,
};
