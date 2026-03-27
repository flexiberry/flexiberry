/**
 * Berry Code Formatter
 *
 * Walks a ProgramNode AST and emits properly formatted Berry source code.
 * This is a pure code-generator — no side effects, no runtime logic.
 *
 * Formatting rules:
 *   - Top-level blocks (Var, Api, Task) separated by blank lines
 *   - Api sub-blocks (Url, Header, Body) indented with no extra blank lines
 *   - Task → Step indented 1 level (8 spaces)
 *   - Step → Params/Capture/Check indented 2 levels (16 spaces)
 *   - Key-value entries indented under their parent with "- key: value"
 *   - Conditions indented under Check with "- lhs operator rhs"
 */

import {
  NodeType,
  ProgramNode,
  StatementNode,
  VarDeclarationNode,
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
  CommentNode,
} from "../ast/ast.types";

// ─── Configuration ──────────────────────────────────────────────────────────

export interface FormatterOptions {
  /** Number of spaces per indent level (default: 8) */
  readonly indentSize: number;
  /** Blank lines between top-level blocks (default: 1) */
  readonly blankLinesBetweenBlocks: number;
  /** Whether to quote key-value string values (default: true) */
  readonly quoteValues: boolean;
}

const DEFAULT_OPTIONS: FormatterOptions = {
  indentSize: 8,
  blankLinesBetweenBlocks: 1,
  quoteValues: true,
};

// ─── Formatter ──────────────────────────────────────────────────────────────

export class BerryFormatter {
  private readonly options: FormatterOptions;

  constructor (options: Partial<FormatterOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /** Format an entire AST back into Berry source code */
  format(ast: ProgramNode): string {
    const blocks: string[] = [];

    for (const node of ast.body) {
      const formatted = this.formatStatement(node);
      if (formatted !== null) {
        blocks.push(formatted);
      }
    }

    const separator = "\n" + "\n".repeat(this.options.blankLinesBetweenBlocks);
    return blocks.join(separator) + "\n";
  }

  // ── Statement Dispatch ──────────────────────────────────────────────────

  private formatStatement(node: StatementNode): string | null {
    switch (node.type) {
      case NodeType.VarDeclaration:
        return this.formatVarDeclaration(node);
      case NodeType.ApiBlock:
        return this.formatApiBlock(node);
      case NodeType.TaskBlock:
        return this.formatTaskBlock(node);
      case NodeType.StepBlock:
        return this.formatStepBlock(node, 0);
      case NodeType.ParamsBlock:
        return this.formatParamsBlock(node, 0);
      case NodeType.CaptureBlock:
        return this.formatCaptureBlock(node, 0);
      case NodeType.CheckBlock:
        return this.formatCheckBlock(node, 0);
      case NodeType.Comment:
        return this.formatComment(node);
      default:
        return null;
    }
  }

  // ── Var Declaration ─────────────────────────────────────────────────────

  private formatVarDeclaration(node: VarDeclarationNode): string {
    const lines: string[] = [];

    // Var header
    let header = "Var";
    if (node.pointer) {
      header += ` ${node.pointer.symbol}${node.pointer.target}`;
    }
    if (node.title) {
      header += ` ${node.title}`;
    }
    lines.push(header);

    // Key-value entries (indented 1 level)
    for (const entry of node.entries) {
      lines.push(this.formatKeyValuePair(entry, 1));
    }

    return lines.join("\n");
  }

  // ── Api Block ───────────────────────────────────────────────────────────

  private formatApiBlock(node: ApiBlockNode): string {
    const lines: string[] = [];

    // Api header: Api METHOD #name title
    let header = "Api";
    if (node.method) {
      header += ` ${node.method}`;
    }
    header += ` #${node.name}`;
    if (node.title) {
      header += ` ${node.title}`;
    }
    lines.push(header);

    // Url
    if (node.url) {
      lines.push(this.formatUrlStatement(node.url));
    }

    // Header
    if (node.headers) {
      lines.push(this.formatHeaderBlock(node.headers));
    }

    // Body
    if (node.body) {
      lines.push(this.formatBodyBlock(node.body));
    }

    return lines.join("\n");
  }

  private formatUrlStatement(node: UrlStatementNode): string {
    return `Url ${node.value}`;
  }

  private formatHeaderBlock(node: HeaderBlockNode): string {
    const lines: string[] = ["Header"];
    for (const entry of node.entries) {
      lines.push(this.formatKeyValuePair(entry, 0));
    }
    return lines.join("\n");
  }

  private formatBodyBlock(node: BodyBlockNode): string {
    return `Body ${node.bodyType} \`${node.content}\``;
  }

  // ── Task Block ──────────────────────────────────────────────────────────

  private formatTaskBlock(node: TaskBlockNode): string {
    const lines: string[] = [];

    let header = "Task";
    if (node.title) {
      header += ` ${node.title.trim()}`;
    }
    lines.push(header);

    // Steps indented 1 level under Task
    for (const step of node.steps) {
      lines.push(this.formatStepBlock(step, 1));
    }

    return lines.join("\n");
  }

  // ── Step Block ──────────────────────────────────────────────────────────

  private formatStepBlock(node: StepBlockNode, indent: number): string {
    const lines: string[] = [];
    const pad = this.indent(indent);

    // Step Call Api <name>
    lines.push(`${pad}Step ${node.callType} ${node.targetType} ${node.targetName}`);

    // Sub-blocks indented one more level
    const subIndent = indent + 1;

    if (node.params) {
      lines.push(this.formatParamsBlock(node.params, subIndent));
    }

    if (node.capture) {
      lines.push(this.formatCaptureBlock(node.capture, subIndent));
    }

    if (node.check) {
      lines.push(this.formatCheckBlock(node.check, subIndent));
    }

    return lines.join("\n");
  }

  // ── Params / Capture / Check ────────────────────────────────────────────

  private formatParamsBlock(node: ParamsBlockNode, indent: number): string {
    const pad = this.indent(indent);
    const lines: string[] = [`${pad}Params`];
    for (const entry of node.entries) {
      lines.push(this.formatKeyValuePair(entry, indent));
    }
    return lines.join("\n");
  }

  private formatCaptureBlock(node: CaptureBlockNode, indent: number): string {
    const pad = this.indent(indent);
    const lines: string[] = [`${pad}Capture`];
    for (const entry of node.entries) {
      lines.push(this.formatKeyValuePair(entry, indent));
    }
    return lines.join("\n");
  }

  private formatCheckBlock(node: CheckBlockNode, indent: number): string {
    const pad = this.indent(indent);
    const lines: string[] = [`${pad}Check`];
    for (const condition of node.conditions) {
      lines.push(this.formatCondition(condition, indent));
    }
    return lines.join("\n");
  }

  // ── Key-Value Pair ──────────────────────────────────────────────────────

  private formatKeyValuePair(node: KeyValuePairNode, indent: number): string {
    const pad = this.indent(indent);

    // Format key
    const key = node.isKeyQuoted ? `'${node.key}'` : node.key;

    // Format value
    let value: string;
    if (node.isMultiline) {
      value = `\`${node.value}\``;
    } else if (node.isValueQuoted || this.options.quoteValues) {
      value = `'${node.value}'`;
    } else {
      value = node.value;
    }

    return `${pad}- ${key}: ${value}`;
  }

  // ── Condition ─────────────────────────────────────────────────────────

  private formatCondition(node: ConditionNode, indent: number): string {
    const pad = this.indent(indent);

    let line = `${pad}- ${node.lhs} ${node.operator} ${node.rhs}`;

    // Append OR chains
    for (const orExpr of node.orConditions) {
      line += ` OR ${orExpr.lhs} ${orExpr.operator} ${orExpr.rhs}`;
    }

    return line;
  }

  // ── Comment ─────────────────────────────────────────────────────────────

  private formatComment(node: CommentNode): string {
    return `##${node.text}`;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private indent(level: number): string {
    return " ".repeat(level * this.options.indentSize);
  }
}
