// Check for whitespace
export function isWhitespace(char: string): boolean {
  return /\s/.test(char);
}

// Check for comments
export function isComment(input: string, position: number): boolean {
  return input.substr(position, 2) === "**";
}

// Check for environment declaration
export function isEnv(input: string, position: number): boolean {
  return input.substr(position, 3) === "Env";
}

// Check for variable declaration
export function isVar(input: string, position: number): boolean {
  return input.substr(position, 3) === "Var";
}
// Check for API declaration
export function isApi(input: string, position: number): boolean {
  return input.substr(position, 3) === "Api";
}
