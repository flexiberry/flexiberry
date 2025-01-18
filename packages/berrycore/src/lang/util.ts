// Check for whitespace
export function isWhitespace(char: string): boolean {
  return /\s/.test(char);
}

export function isNotEof(input: string, position: number) {
  return position < input.length;
}

// Check for comments and declarations
export function isDeclaration(
  input: string,
  position: number,
  declaration: string
): boolean {
  return input.substr(position, declaration.length) === declaration;
}

export function isComment(input: string, position: number): boolean {
  return isDeclaration(input, position, "**");
}

export function isEnv(input: string, position: number): boolean {
  return isDeclaration(input, position, "Env");
}

export function isVar(input: string, position: number): boolean {
  return isDeclaration(input, position, "Var");
}

export function isApi(input: string, position: number): boolean {
  return isDeclaration(input, position, "Api");
}

export function isBody(input: string, position: number): boolean {
  return isDeclaration(input, position, "Body");
}

export function isHeader(input: string, position: number): boolean {
  return isDeclaration(input, position, "Header");
}

export function isUrl(input: string, position: number): boolean {
  return isDeclaration(input, position, "Url");
}

export function isStep(input: string, position: number): boolean {
  return isDeclaration(input, position, "Step");
}

export function isCapture(input: string, position: number): boolean {
  return isDeclaration(input, position, "Capture");
}

export function isParams(input: string, position: number): boolean {
  return isDeclaration(input, position, "Params");
}

export function isCheck(input: string, position: number): boolean {
  return isDeclaration(input, position, "Check");
}

export function isTask(input: string, position: number): boolean {
  return isDeclaration(input, position, "Task");
}
