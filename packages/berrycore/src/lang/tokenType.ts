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
  Api,
  Url,
  Body,
  BodyType,
  Header,
  HeaderValue,

  TestCase,
  TestCaseName,
  Step,
  StepName,
  Call,
  CallTitle,

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

  Comment,
  DocumentStart,
  DocumentEnd,
  Whitespace,
  Eof,
  EmptyLine,
  Comma,
}
