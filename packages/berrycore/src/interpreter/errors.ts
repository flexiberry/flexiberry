/**
 * Interpreter Errors
 *
 * Strongly typed error classes with source position info.
 */

export class RuntimeError extends Error {
  public readonly line: number;
  public readonly column: number;

  constructor(message: string, line: number = 0, column: number = 0) {
    super(`[RuntimeError at ${line}:${column}] ${message}`);
    this.name = "RuntimeError";
    this.line = line;
    this.column = column;
  }
}

export class VariableNotFoundError extends RuntimeError {
  constructor(name: string, line: number = 0, column: number = 0) {
    super(`Variable '${name}' is not defined`, line, column);
    this.name = "VariableNotFoundError";
  }
}

export class ApiNotFoundError extends RuntimeError {
  constructor(name: string, line: number = 0, column: number = 0) {
    super(`API '${name}' is not defined`, line, column);
    this.name = "ApiNotFoundError";
  }
}
