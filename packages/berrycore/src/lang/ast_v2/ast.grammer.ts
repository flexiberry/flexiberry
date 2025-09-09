import { TokenType } from "../tokenizer/tokenType";
import { BlocksType } from "./blocks";

export type TokenSequence = {
  expected: TokenType;
  optional: Boolean;
  next: TokenType[];
};

export type AstGrammer = {
  block: BlocksType;
  tokens: TokenSequence[];
};
