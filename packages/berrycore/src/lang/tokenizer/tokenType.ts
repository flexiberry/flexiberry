export function TokenTypeValueOf(value: TokenType) {
  return TokenType[value]; // Return the name of the TokenType
}

export enum TokenType {
  // Literal Types
  Number,
  Scalar,
  Value,

  Identifier,

  // Keywords
  Env,
  Var,
  Pointer,
  Pointed,

  Api,
  ApiMethod,
  Url,
  Body,
  BodyType,
  Header,
  HeaderValue,
  ApiEnd,

  Task,
  Step,
  StepName,
  Call,
  Title,

  //   logic types
  And,
  Or,
  Gte,
  Gt,
  Lte,
  Lt,
  Equal,
  Lhs,
  Rhs,
  Operands,
  Operator,
  OperandsScalar,

  Comment,
  DocumentStart,
  DocumentEnd,
  Whitespace,
  Eof,
  EmptyLine,
  Comma,
  Colon,
  Backtick,
  Hyphen,
  Hash,
  Quote,

  Capture,
  Params,
  Check,
  NotEqual,
  Unknown,
}
