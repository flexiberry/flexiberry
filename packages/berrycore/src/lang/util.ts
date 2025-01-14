// Check for whitespace
export function isWhitespace(char: string): boolean {
  return /\s/.test(char);
}

export function isNotEof(input: string, position: number) {
  return position < input.length;
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
// Check for API declaration
export function isStep(input: string, position: number): boolean {
  return input.substr(position, 4) === "Step";
}

export function isCapture(input: string, position: number) {
  return input.substr(position, 7) === "Capture";
}

export function isParams(input: string, position: number) {
  return input.substr(position, 6) === "Params";
}
export function isCheck(input: string, position: number) {
  return input.substr(position, 5) === "Check";
}
export function isTask(input: string, position: number) {
  return input.substr(position, 4) === "Task";
}
