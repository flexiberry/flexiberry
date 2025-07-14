import { TokenType } from "../tokenType";

export type CaptureGroup = {
  tokenType: TokenType;
  index?: number;
};
export type LexerGrammer = {
  name: string;
  regex: RegExp;
  groups: CaptureGroup[];
  isOptional?: boolean;
  moveNextLine?: boolean;
  isMultiline?: boolean;
  next?: LexerGrammer[];
  loopUntil?: RegExp;
  mergeLines?: boolean;
  start?: RegExp;
  end?: RegExp;
};
