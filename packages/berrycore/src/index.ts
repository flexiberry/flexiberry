import { AstEngine, Ast, ParserError } from "./parser/ast/ast.engine";
import { LexerEngine, LexerError } from "./parser/tokenizer/reader/lexer.engine";
import { BerryFormatter } from "./parser/formatter/formatter";
import { Interpreter } from "./interpreter/interpreter";
import { CliAdapter } from "./adapter/cli-adapter";
import { FormatUtil } from "./script/format-util";
import { PostmanUtil } from "./script/postman.util";
import { SwaggerUtil } from "./script/swagger.util";
import { BerryCore } from "./berry-core";
import {
  InterpreterEvent,
  type CompletedPayload,
  type TaskResult,
  type StepResult,
  type IOAdapter,
  type LogLevel,
  ExecutionCommand,
  ExecutionState,
  ExecutionStatus,
} from "./interpreter/interpreter.types";
import { type BerryCoreOptions } from "./berry-core";
import { NodeType, type BaseNode, type TaskBlockNode, type StepBlockNode, type ParamsBlockNode, type CaptureBlockNode, type CheckBlockNode, type KeyValuePairNode, type ConditionNode, ProgramNode, type ApiBlockNode } from "./parser/ast/ast.types";

export {
  // ── High-level facade (recommended entry-point) ──────────────────────
  BerryCore,
  type BerryCoreOptions,

  // ── Low-level building blocks (advanced consumers) ───────────────────
  AstEngine,
  Ast,
  ParserError,
  LexerEngine,
  LexerError,
  BerryFormatter,
  Interpreter,
  CliAdapter,
  FormatUtil,
  PostmanUtil,
  SwaggerUtil,

  // ── Types / enums needed by consumers ────────────────────────────────
  InterpreterEvent,
  ExecutionCommand,
  ExecutionState,
  ExecutionStatus,
  NodeType,
  type IOAdapter,
  type LogLevel,
  type CompletedPayload,
  type TaskResult,
  type StepResult,
  type BaseNode,
  type TaskBlockNode,
  type StepBlockNode,
  type ParamsBlockNode,
  type CaptureBlockNode,
  type CheckBlockNode,
  type KeyValuePairNode,
  type ConditionNode,
  type ProgramNode,
  type ApiBlockNode
};
