import { Token } from "../tokenizer/token";
import { TokenType } from "../tokenizer/tokenType";

export function isVarTokens(token: Token): boolean {
  return (
    token.type === TokenType.Var ||
    token.type === TokenType.Hyphen ||
    token.type == TokenType.Value
  );
}
