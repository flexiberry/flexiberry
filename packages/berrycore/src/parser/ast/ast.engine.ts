/**
 * AST Engine — Recursive Descent Parser
 *
 * Consumes Token[] from the LexerEngine and produces a ProgramNode AST.
 * Each parse* method corresponds to one grammar rule from reader_v2.
 *
 * Architecture rules enforced:
 *   - Parser ONLY produces AST — no runtime execution
 *   - Deterministic recursive descent
 *   - Throws syntax errors with line/column info
 */

import { LexerEngine } from "../tokenizer/reader/lexer.engine";
import { Token } from "../tokenizer/token";
import { TokenType } from "../tokenizer/tokenType";
import {
  NodeType,
  NodePosition,
  ProgramNode,
  StatementNode,
  VarDeclarationNode,
  PointerReferenceNode,
  ApiBlockNode,
  UrlStatementNode,
  HeaderBlockNode,
  BodyBlockNode,
  TaskBlockNode,
  StepBlockNode,
  ParamsBlockNode,
  CaptureBlockNode,
  CheckBlockNode,
  KeyValuePairNode,
  ConditionNode,
  BinaryExpressionNode,
  CommentNode,
} from "./ast.types";

// ─── Parser Errors ──────────────────────────────────────────────────────────

export class ParserError extends Error {
  constructor (
    message: string,
    public readonly line: number,
    public readonly column: number
  ) {
    super(`[ParserError at ${line}:${column}] ${message}`);
    this.name = "ParserError";
  }
}


export class Ast {

  static parse(code: string): ProgramNode {
    const lexer = new LexerEngine(code);
    const tokens = lexer.tokenize();
    const engine = new AstEngine(tokens);
    return engine.build();
  }

}

// ─── Parser Engine ──────────────────────────────────────────────────────────

export class AstEngine {
  private readonly tokens: readonly Token[];
  private cursor: number = 0;

  constructor (tokens: Token[]) {
    this.tokens = tokens;
  }

  // ── Public API ──────────────────────────────────────────────────────────

  /** Entry point: parse entire token stream into ProgramNode */
  build(): ProgramNode {
    const body: StatementNode[] = [];

    while (!this.isEof()) {
      // Skip comments at top-level but collect them as nodes
      if (this.check(TokenType.Comment)) {
        body.push(this.parseComment());
        continue;
      }

      const statement = this.parseStatement();
      if (statement) {
        body.push(statement);
      }
    }

    return {
      type: NodeType.Program,
      position: { line: 0, column: 0 },
      body,
    };
  }

  // ── Statement Dispatch ──────────────────────────────────────────────────

  private parseStatement(): StatementNode | null {
    if (this.check(TokenType.Var)) return this.parseVarDeclaration();
    if (this.check(TokenType.Api)) return this.parseApiBlock();
    if (this.check(TokenType.Task)) return this.parseTaskBlock();
    if (this.check(TokenType.Step)) return this.parseStepBlock();
    if (this.check(TokenType.Params)) return this.parseParamsBlock();
    if (this.check(TokenType.Capture)) return this.parseCaptureBlock();
    if (this.check(TokenType.Check)) return this.parseCheckBlock();
    if (this.check(TokenType.Comment)) return this.parseComment();

    // Skip unrecognized tokens to avoid infinite loop
    this.advance();
    return null;
  }

  // ── Var Declaration ─────────────────────────────────────────────────────

  /**
   * Grammar: Var ((@)(pointed) (title))? keyValueLoop
   * Tokens:  Var, optional Pointer+Pointed+Title, then key-value pairs
   */
  private parseVarDeclaration(): VarDeclarationNode {
    const varToken = this.expect(TokenType.Var, "Expected 'Var' keyword");
    const position = this.positionOf(varToken);

    let pointer: PointerReferenceNode | null = null;
    let title: string | null = null;

    // Check for pointer reference: @ followed by pointed name
    if (this.check(TokenType.Pointer)) {
      pointer = this.parsePointerReference();
    }

    // Check for title
    if (this.check(TokenType.Title)) {
      title = this.advance().value;
    }

    // Parse key-value entries
    const entries = this.parseKeyValuePairs();

    return {
      type: NodeType.VarDeclaration,
      position,
      title,
      pointer,
      entries,
    };
  }

  private parsePointerReference(): PointerReferenceNode {
    const pointerToken = this.expect(TokenType.Pointer, "Expected '@' pointer");
    const position = this.positionOf(pointerToken);

    const pointedToken = this.expect(
      TokenType.Pointed,
      "Expected pointed name after '@'"
    );

    return {
      type: NodeType.PointerReference,
      position,
      symbol: pointerToken.value,
      target: pointedToken.value,
    };
  }

  // ── API Block ───────────────────────────────────────────────────────────

  /**
   * Grammar: Api (GET|POST|..)? #identifier title?
   *          Url value
   *          Header keyValueLoop
   *          Body type `content`
   */
  private parseApiBlock(): ApiBlockNode {
    const apiToken = this.expect(TokenType.Api, "Expected 'Api' keyword");
    const position = this.positionOf(apiToken);

    // Optional method
    let method: string | null = null;
    if (this.check(TokenType.ApiMethod)) {
      method = this.advance().value;
    }

    // Hash + Identifier (API name)
    if (this.check(TokenType.Hash)) {
      this.advance(); // consume '#'
    }

    const nameToken = this.expect(
      TokenType.Identifier,
      "Expected API identifier after '#'"
    );
    const name = nameToken.value;

    // Optional title
    let title: string | null = null;
    if (this.check(TokenType.Title)) {
      title = this.advance().value;
    }

    // Parse sub-blocks: Url, Header, Body (in any order)
    let url: UrlStatementNode | null = null;
    let headers: HeaderBlockNode | null = null;
    let body: BodyBlockNode | null = null;

    while (
      this.check(TokenType.Url) ||
      this.check(TokenType.Header) ||
      this.check(TokenType.Body)
    ) {
      if (this.check(TokenType.Url)) {
        url = this.parseUrlStatement();
      } else if (this.check(TokenType.Header)) {
        headers = this.parseHeaderBlock();
      } else if (this.check(TokenType.Body)) {
        body = this.parseBodyBlock();
      }
    }

    return {
      type: NodeType.ApiBlock,
      position,
      method,
      name,
      title,
      url,
      headers,
      body,
    };
  }

  private parseUrlStatement(): UrlStatementNode {
    const urlToken = this.expect(TokenType.Url, "Expected 'Url' keyword");
    const position = this.positionOf(urlToken);

    const valueToken = this.expect(
      TokenType.Value,
      "Expected URL value after 'Url'"
    );

    return {
      type: NodeType.UrlStatement,
      position,
      value: valueToken.value,
    };
  }

  private parseHeaderBlock(): HeaderBlockNode {
    const headerToken = this.expect(
      TokenType.Header,
      "Expected 'Header' keyword"
    );
    const position = this.positionOf(headerToken);

    const entries = this.parseKeyValuePairs();

    return {
      type: NodeType.HeaderBlock,
      position,
      entries,
    };
  }

  private parseBodyBlock(): BodyBlockNode {
    const bodyToken = this.expect(TokenType.Body, "Expected 'Body' keyword");
    const position = this.positionOf(bodyToken);

    const bodyTypeToken = this.expect(
      TokenType.BodyType,
      "Expected body type (e.g. 'json') after 'Body'"
    );

    // Expect backtick-wrapped content
    let content = "";
    if (this.check(TokenType.Backtick)) {
      this.advance(); // opening backtick
      if (this.check(TokenType.Scalar)) {
        content = this.advance().value;
      }
      if (this.check(TokenType.Backtick)) {
        this.advance(); // closing backtick
      }
    }

    return {
      type: NodeType.BodyBlock,
      position,
      bodyType: bodyTypeToken.value,
      content,
    };
  }

  // ── Task Block ──────────────────────────────────────────────────────────

  /**
   * Grammar: Task title?
   * Tokens:  Task, Title
   */
  private parseTaskBlock(): TaskBlockNode {
    const taskToken = this.expect(TokenType.Task, "Expected 'Task' keyword");
    const position = this.positionOf(taskToken);

    let title: string | null = null;
    if (this.check(TokenType.Title)) {
      title = this.advance().value;
    }

    // Collect Step blocks that follow this Task
    const steps: StepBlockNode[] = [];
    while (this.check(TokenType.Step)) {
      steps.push(this.parseStepBlock());
    }

    return {
      type: NodeType.TaskBlock,
      position,
      title,
      steps,
    };
  }

  // ── Step Block ──────────────────────────────────────────────────────────

  /**
   * Grammar: Step Call Api identifier
   * Tokens:  Step, Call, Api, Identifier
   */
  private parseStepBlock(): StepBlockNode {
    const stepToken = this.expect(TokenType.Step, "Expected 'Step' keyword");
    const position = this.positionOf(stepToken);

    const callToken = this.expect(
      TokenType.Call,
      "Expected 'Call' after 'Step'"
    );

    const apiToken = this.expect(
      TokenType.Api,
      "Expected 'Api' after 'Call'"
    );

    const nameToken = this.expect(
      TokenType.Identifier,
      "Expected API name after 'Api'"
    );

    // Parse optional sub-blocks: Params, Capture, Check
    let params: ParamsBlockNode | null = null;
    let capture: CaptureBlockNode | null = null;
    let check: CheckBlockNode | null = null;

    while (
      this.check(TokenType.Params) ||
      this.check(TokenType.Capture) ||
      this.check(TokenType.Check)
    ) {
      if (this.check(TokenType.Params)) {
        params = this.parseParamsBlock();
      } else if (this.check(TokenType.Capture)) {
        capture = this.parseCaptureBlock();
      } else if (this.check(TokenType.Check)) {
        check = this.parseCheckBlock();
      }
    }

    return {
      type: NodeType.StepBlock,
      position,
      callType: callToken.value,
      targetType: apiToken.value,
      targetName: nameToken.value,
      params,
      capture,
      check,
    };
  }

  // ── Params Block ────────────────────────────────────────────────────────

  /**
   * Grammar: Params keyValueLoop
   * Tokens:  Params, then key-value pairs
   */
  private parseParamsBlock(): ParamsBlockNode {
    const paramsToken = this.expect(
      TokenType.Params,
      "Expected 'Params' keyword"
    );
    const position = this.positionOf(paramsToken);

    const entries = this.parseKeyValuePairs();

    return {
      type: NodeType.ParamsBlock,
      position,
      entries,
    };
  }

  // ── Capture Block ───────────────────────────────────────────────────────

  /**
   * Grammar: Capture keyValueLoop
   * Tokens:  Capture, then key-value pairs
   */
  private parseCaptureBlock(): CaptureBlockNode {
    const captureToken = this.expect(
      TokenType.Capture,
      "Expected 'Capture' keyword"
    );
    const position = this.positionOf(captureToken);

    const entries = this.parseKeyValuePairs();

    return {
      type: NodeType.CaptureBlock,
      position,
      entries,
    };
  }

  // ── Check Block ─────────────────────────────────────────────────────────

  /**
   * Grammar: Check conditionLoop
   * Tokens:  Check, then condition list
   */
  private parseCheckBlock(): CheckBlockNode {
    const checkToken = this.expect(
      TokenType.Check,
      "Expected 'Check' keyword"
    );
    const position = this.positionOf(checkToken);

    const conditions = this.parseConditions();

    return {
      type: NodeType.CheckBlock,
      position,
      conditions,
    };
  }

  // ── Key-Value Pairs ─────────────────────────────────────────────────────

  /**
   * Grammar: (- key: value)*
   * Loops while Hyphen tokens appear
   */
  private parseKeyValuePairs(): KeyValuePairNode[] {
    const entries: KeyValuePairNode[] = [];

    while (this.check(TokenType.Hyphen)) {
      const hyphenToken = this.advance(); // consume '-'
      const position = this.positionOf(hyphenToken);

      let key = "";
      let isKeyQuoted = false;
      let value = "";
      let isValueQuoted = false;
      let isMultiline = false;

      // Key: quoted or unquoted
      if (this.check(TokenType.Quote)) {
        isKeyQuoted = true;
        this.advance(); // opening quote
        if (this.check(TokenType.Identifier)) {
          key = this.advance().value;
        }
        if (this.check(TokenType.Quote)) {
          this.advance(); // closing quote
        }
      } else if (this.check(TokenType.Identifier)) {
        key = this.advance().value;
      }

      // Colon separator
      if (this.check(TokenType.Colon)) {
        this.advance();
      }

      // Value: quoted string, multiline backtick, or unquoted identifier
      if (this.check(TokenType.Quote)) {
        isValueQuoted = true;
        this.advance(); // opening quote
        if (this.check(TokenType.Scalar)) {
          value = this.advance().value;
        }
        if (this.check(TokenType.Quote)) {
          this.advance(); // closing quote
        }
      } else if (this.check(TokenType.Backtick)) {
        isMultiline = true;
        this.advance(); // opening backtick
        if (this.check(TokenType.Scalar)) {
          value = this.advance().value;
        }
        if (this.check(TokenType.Backtick)) {
          this.advance(); // closing backtick
        }
      } else if (this.check(TokenType.Identifier)) {
        value = this.advance().value;
      }

      entries.push({
        type: NodeType.KeyValuePair,
        position,
        key,
        value,
        isKeyQuoted,
        isValueQuoted,
        isMultiline,
      });
    }

    return entries;
  }

  // ── Conditions ──────────────────────────────────────────────────────────

  /**
   * Grammar: (- lhs operator rhs (OR lhs operator rhs)*)*
   * Loops while Hyphen tokens appear
   */
  private parseConditions(): ConditionNode[] {
    const conditions: ConditionNode[] = [];

    while (this.check(TokenType.Hyphen)) {
      const hyphenToken = this.advance(); // consume '-'
      const position = this.positionOf(hyphenToken);

      const lhs = this.expect(TokenType.Lhs, "Expected LHS in condition").value;
      const operator = this.expect(
        TokenType.Operator,
        "Expected operator in condition"
      ).value;
      const rhs = this.expect(TokenType.Rhs, "Expected RHS in condition").value;

      // Parse OR chains
      const orConditions: BinaryExpressionNode[] = [];
      while (this.check(TokenType.Or)) {
        const orToken = this.advance(); // consume 'OR'
        const orPos = this.positionOf(orToken);

        const orLhs = this.expect(
          TokenType.Lhs,
          "Expected LHS after 'OR'"
        ).value;
        const orOperator = this.expect(
          TokenType.Operator,
          "Expected operator after OR LHS"
        ).value;
        const orRhs = this.expect(
          TokenType.Rhs,
          "Expected RHS after OR operator"
        ).value;

        orConditions.push({
          type: NodeType.BinaryExpression,
          position: orPos,
          lhs: orLhs,
          operator: orOperator,
          rhs: orRhs,
        });
      }

      conditions.push({
        type: NodeType.Condition,
        position,
        lhs,
        operator,
        rhs,
        orConditions,
      });
    }

    return conditions;
  }

  // ── Comment ─────────────────────────────────────────────────────────────

  private parseComment(): CommentNode {
    const commentToken = this.expect(
      TokenType.Comment,
      "Expected comment text"
    );

    return {
      type: NodeType.Comment,
      position: this.positionOf(commentToken),
      text: commentToken.value,
    };
  }

  // ── Token Helpers ─────────────────────────────────────────────────────

  /** Check if we've reached EOF */
  private isEof(): boolean {
    return (
      this.cursor >= this.tokens.length ||
      this.tokens[this.cursor].type === TokenType.Eof
    );
  }

  /** Peek at current token without consuming */
  private peek(): Token {
    return this.tokens[this.cursor];
  }

  /** Check if current token matches expected type */
  private check(type: TokenType): boolean {
    if (this.isEof()) return false;
    return this.peek().type === type;
  }

  /** Consume current token and return it */
  private advance(): Token {
    const token = this.tokens[this.cursor];
    this.cursor++;
    return token;
  }

  /** Expect a specific token type or throw a ParserError */
  private expect(type: TokenType, errorMessage: string): Token {
    if (this.isEof()) {
      const lastToken = this.tokens[this.tokens.length - 1];
      throw new ParserError(
        `${errorMessage} — unexpected end of input`,
        lastToken?.position.line ?? 0,
        lastToken?.position.start ?? 0
      );
    }

    const token = this.peek();
    if (token.type !== type) {
      throw new ParserError(
        `${errorMessage} — got '${TokenType[token.type]}' (${token.value})`,
        token.position.line ?? 0,
        token.position.start
      );
    }

    return this.advance();
  }

  /** Extract NodePosition from a Token */
  private positionOf(token: Token): NodePosition {
    return {
      line: token.position.line ?? 0,
      column: token.position.start,
    };
  }
}
