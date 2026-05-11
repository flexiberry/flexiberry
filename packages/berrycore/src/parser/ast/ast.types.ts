/**
 * AST Node Types for Flexiberry DSL
 *
 * Pure data interfaces — no methods, no logic.
 * Each node type maps to a specific lexer grammar rule from reader_v2.
 */

// ─── Node Type Discriminator ────────────────────────────────────────────────

export enum NodeType {
  Program = "Program",

  // Variable constructs
  VarDeclaration = "VarDeclaration",
  PointerReference = "PointerReference",

  // Link constructs
  LinkStatement = "LinkStatement",

  // API constructs
  ApiBlock = "ApiBlock",
  UrlStatement = "UrlStatement",
  HeaderBlock = "HeaderBlock",
  BodyBlock = "BodyBlock",

  // Task / Step constructs
  TaskBlock = "TaskBlock",
  StepBlock = "StepBlock",

  // Data constructs
  ParamsBlock = "ParamsBlock",
  CaptureBlock = "CaptureBlock",
  CheckBlock = "CheckBlock",

  // Shared primitives
  KeyValuePair = "KeyValuePair",
  Condition = "Condition",
  BinaryExpression = "BinaryExpression",

  // Terminals
  Identifier = "Identifier",
  Literal = "Literal",
  Comment = "Comment",
}

// ─── Position Info ──────────────────────────────────────────────────────────

/** Source location attached to every AST node */
export interface NodePosition {
  readonly line: number;
  readonly column: number;
}

// ─── Base Node ──────────────────────────────────────────────────────────────

export interface BaseNode {
  readonly type: NodeType;
  readonly position: NodePosition;
}

// ─── Root ───────────────────────────────────────────────────────────────────

/** Top-level program — an ordered list of declarations */
export interface ProgramNode extends BaseNode {
  readonly type: NodeType.Program;
  readonly body: ReadonlyArray<StatementNode>;
}

// ─── Statement Union ────────────────────────────────────────────────────────

export type StatementNode =
  | VarDeclarationNode
  | LinkStatementNode
  | ApiBlockNode
  | TaskBlockNode
  | StepBlockNode
  | ParamsBlockNode
  | CaptureBlockNode
  | CheckBlockNode
  | CommentNode;

// ─── Variable Constructs ────────────────────────────────────────────────────

/**
 * `Var @pointed title`
 * followed by key-value pairs on subsequent lines
 *
 * Grammar: var.grammer.ts
 * Tokens: Var, optional (Pointer + Pointed + Title), then keyValueGrammer loop
 */
export interface VarDeclarationNode extends BaseNode {
  readonly type: NodeType.VarDeclaration;
  readonly title: string | null;
  readonly pointer: PointerReferenceNode | null;
  readonly entries: ReadonlyArray<KeyValuePairNode>;
}

/**
 * `@pointed` reference inside a Var declaration
 *
 * Tokens: Pointer (@), Pointed (name)
 */
export interface PointerReferenceNode extends BaseNode {
  readonly type: NodeType.PointerReference;
  readonly symbol: string;   // the "@"
  readonly target: string;   // the pointed name
}

// ─── Link Constructs ────────────────────────────────────────────────────────

/**
 * `Link path/to/file.berry` or `Link http://example.com/file.berry`
 *
 * Grammar: link.grammer.ts
 * Tokens: Link, LinkPath
 */
export interface LinkStatementNode extends BaseNode {
  readonly type: NodeType.LinkStatement;
  readonly path: string;
}

// ─── API Constructs ─────────────────────────────────────────────────────────

/**
 * `Api GET #myApi Some Title`
 * followed by Url, Header, Body sub-blocks
 *
 * Grammar: api.grammer.ts
 * Tokens: Api, ApiMethod, Hash, Identifier, Title
 */
export interface ApiBlockNode extends BaseNode {
  readonly type: NodeType.ApiBlock;
  readonly method: string | null;     // GET | POST | PUT | DELETE | PATCH
  readonly name: string;              // identifier after #
  readonly title: string | null;
  readonly url: UrlStatementNode | null;
  readonly headers: HeaderBlockNode | null;
  readonly body: BodyBlockNode | null;
}

/**
 * `Url https://example.com/api`
 *
 * Grammar: api.grammer.ts (url rule)
 * Tokens: Url, Value
 */
export interface UrlStatementNode extends BaseNode {
  readonly type: NodeType.UrlStatement;
  readonly value: string;
}

/**
 * `Header` followed by key-value pairs
 *
 * Grammar: api.grammer.ts (Header rule)
 * Tokens: Header, then keyValueGrammer loop
 */
export interface HeaderBlockNode extends BaseNode {
  readonly type: NodeType.HeaderBlock;
  readonly entries: ReadonlyArray<KeyValuePairNode>;
}

/**
 * `Body json` followed by backtick-wrapped content
 *
 * Grammar: api.grammer.ts (Body rule)
 * Tokens: Body, BodyType, Backtick, Scalar, Backtick
 */
export interface BodyBlockNode extends BaseNode {
  readonly type: NodeType.BodyBlock;
  readonly bodyType: string;   // e.g. "json", "xml", "form"
  readonly content: string;    // the scalar content between backticks
}

// ─── Task / Step Constructs ─────────────────────────────────────────────────

/**
 * `Task My Test Suite`
 *
 * Grammar: task.grammer.ts
 * Tokens: Task, Title
 */
export interface TaskBlockNode extends BaseNode {
  readonly type: NodeType.TaskBlock;
  readonly title: string | null;
  readonly steps: ReadonlyArray<StepBlockNode>;
}

/**
 * `Step Call Api myApi`
 *
 * Grammar: step.grammer.ts
 * Tokens: Step, Call, Api, Identifier
 */
export interface StepBlockNode extends BaseNode {
  readonly type: NodeType.StepBlock;
  readonly callType: string;      // "Call"
  readonly targetType: string;    // "Api"
  readonly targetName: string;    // the identifier
  readonly params: ParamsBlockNode | null;
  readonly capture: CaptureBlockNode | null;
  readonly check: CheckBlockNode | null;
}

// ─── Data Constructs ────────────────────────────────────────────────────────

/**
 * `Params` followed by key-value pairs
 *
 * Grammar: params.grammer.ts
 * Tokens: Params, then keyValueGrammer loop
 */
export interface ParamsBlockNode extends BaseNode {
  readonly type: NodeType.ParamsBlock;
  readonly entries: ReadonlyArray<KeyValuePairNode>;
}

/**
 * `Capture` followed by key-value pairs
 *
 * Grammar: capture.grammer.ts
 * Tokens: Capture, then keyValueGrammer loop
 */
export interface CaptureBlockNode extends BaseNode {
  readonly type: NodeType.CaptureBlock;
  readonly entries: ReadonlyArray<KeyValuePairNode>;
}

/**
 * `Check` followed by condition lines
 *
 * Grammar: check.grammer.ts
 * Tokens: Check, then conditionGrammer loop
 */
export interface CheckBlockNode extends BaseNode {
  readonly type: NodeType.CheckBlock;
  readonly conditions: ReadonlyArray<ConditionNode>;
}

// ─── Shared Primitives ──────────────────────────────────────────────────────

/**
 * `- key: value` or `- "key": "value"` or `- key: \`multiline\``
 *
 * Grammar: keyvalue.grammer.ts
 * Tokens: Hyphen, (Quote?, Identifier, Quote?, Colon), (Quote?, Scalar/Identifier, Quote?) or (Backtick, Scalar, Backtick)
 */
export interface KeyValuePairNode extends BaseNode {
  readonly type: NodeType.KeyValuePair;
  readonly key: string;
  readonly value: string;
  readonly isKeyQuoted: boolean;
  readonly isValueQuoted: boolean;
  readonly isMultiline: boolean;
}

/**
 * `- lhs == rhs` with optional `OR` chains
 *
 * Grammar: conditions.grammer.ts
 * Tokens: Hyphen, Lhs, Operator, Rhs, optional (Or, Lhs, Operator, Rhs)+
 */
export interface ConditionNode extends BaseNode {
  readonly type: NodeType.Condition;
  readonly lhs: string;
  readonly operator: string;    // "==" | "!=" | ">=" | "<=" | ">" | "<"
  readonly rhs: string;
  readonly orConditions: ReadonlyArray<BinaryExpressionNode>;
}

/**
 * An OR-chained binary expression within a condition
 *
 * Tokens: Or, Lhs, Operator, Rhs
 */
export interface BinaryExpressionNode extends BaseNode {
  readonly type: NodeType.BinaryExpression;
  readonly lhs: string;
  readonly operator: string;
  readonly rhs: string;
}

// ─── Terminal Nodes ─────────────────────────────────────────────────────────

export interface IdentifierNode extends BaseNode {
  readonly type: NodeType.Identifier;
  readonly name: string;
}

export interface LiteralNode extends BaseNode {
  readonly type: NodeType.Literal;
  readonly value: string | number | boolean;
  readonly raw: string;
}

export interface CommentNode extends BaseNode {
  readonly type: NodeType.Comment;
  readonly text: string;
}

// ─── Type Guard Helpers ─────────────────────────────────────────────────────

export type ASTNode =
  | ProgramNode
  | VarDeclarationNode
  | LinkStatementNode
  | PointerReferenceNode
  | ApiBlockNode
  | UrlStatementNode
  | HeaderBlockNode
  | BodyBlockNode
  | TaskBlockNode
  | StepBlockNode
  | ParamsBlockNode
  | CaptureBlockNode
  | CheckBlockNode
  | KeyValuePairNode
  | ConditionNode
  | BinaryExpressionNode
  | IdentifierNode
  | LiteralNode
  | CommentNode;
