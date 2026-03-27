import { group } from "console";
import { Token } from "../token";
import { comment } from "./grammer/comment.grammer";
import { varLexerGrammer } from "./grammer/var.grammer";
import { LexerGrammer } from "./lexer.types";
import { TokenType } from "../tokenType";
import { apiGrammer } from "./grammer/api.grammer";
import { taskGrammer } from "./grammer/task.grammer";
import { stepGrammer } from "./grammer/step.grammer";
import { paramsGrammer } from "./grammer/params.grammer";
import { captureGrammer } from "./grammer/capture.grammer";
import { checkGrammer } from "./grammer/check.grammer";

const grammer: LexerGrammer[] = [
  ...varLexerGrammer,
  comment,
  ...apiGrammer,
  taskGrammer,
  stepGrammer,
  paramsGrammer,
  captureGrammer,
  checkGrammer,
];

export class LexerEngine {
  private input: string;
  private tokens: Token[] = [];

  private lines: string[] = [];
  private lineIndex: number = 0;
  private columnIndex: number = 0;
  private currentLine: string = "";

  private at() {
    return this.lines[this.lineIndex];
  }
  private next() {
    do {
      this.lineIndex++;
    } while (
      comment.regex.test(this.at()) &&
      this.lineIndex < this.lines.length
    );
    this.columnIndex = 0;
    return this.at();
  }

  private prev() {
    this.lineIndex--;
    return this.at();
  }

  constructor(input: string) {
    this.input = input;
  }

  /**
   * Processes a grammar rule against the given line and updates tokens.
   * Optimized for readability and performance.
   */
  private processGrammer(grammar: LexerGrammer): boolean {
    // Handle multi-line grammar start/end
    if (grammar.start && grammar.end && grammar.start.test(this.currentLine)) {
      this.currentLine = this.mergeLinesUntilEnd(grammar, this.currentLine);
    }

    // Check if the line matches the grammar regex
    if (grammar.regex.test(this.currentLine)) {
      const match = this.currentLine.match(grammar.regex);
      if (match) {
        this.processGroups(grammar, match);
        // Handle next grammar rules if present
        if (grammar.next) {
          this.processNextGrammars(grammar.next);
        }
        if (grammar.loopUntil) {
          this.processLoopUntil(grammar);
          if (
            grammar.moveNextLine ||
            grammar.loopUntil.test(this.currentLine)
          ) {
            this.currentLine = this.prev();
          }
        }
      }
      return true;
    } else {
      if (grammar.isOptional === false) {
        throw new Error("Invalid grammar");
      }
    }
    return false;
  }

  /**
   * Merges lines until the grammar's end pattern is matched or lines run out.
   */
  private mergeLinesUntilEnd(grammar: LexerGrammer, line: string): string {
    while (
      grammar.end &&
      !grammar.end.test(line) &&
      grammar.mergeLines &&
      this.lineIndex < this.lines.length
    ) {
      line += this.next();
    }
    return line;
  }

  /**
   * Processes the groups in the grammar and generates tokens.
   */
  private processGroups(grammar: LexerGrammer, match: RegExpMatchArray): void {
    for (const group of grammar.groups) {
      const groupIdx = group.index ?? 0;
      const matchedValue = match[groupIdx];
      if (group.index !== undefined && matchedValue) {
        this.tokens.push(
          Token.from(
            matchedValue,
            group.tokenType,
            this.columnIndex,
            this.columnIndex + matchedValue.length,
            this.lineIndex
          )
        );
        const indexofmatch = this.currentLine.indexOf(matchedValue);
        this.columnIndex += indexofmatch >= 0 ? indexofmatch : 0;
        this.currentLine = this.currentLine.substring(
          indexofmatch + matchedValue.length
        );
      }
    }
  }

  /**
   * Processes any next grammar rules chained to the current grammar.
   */
  private processNextGrammars(nextGrammars: LexerGrammer[]): void {
    let isProcessed = false;
    for (const nextGrammar of nextGrammars) {
      if (isProcessed && nextGrammar.isOptional) continue;
      if (nextGrammar.moveNextLine) {
        this.currentLine = this.next();
      }
      isProcessed = this.processGrammer(nextGrammar);
    }
  }

  /**
   * Handles looping a grammar until a condition is met.
   */
  private processLoopUntil(grammar: LexerGrammer): boolean {
    if (!grammar.loopUntil) return true;
    do {
      this.currentLine = grammar.mergeLines
        ? this.currentLine + this.next()
        : grammar.moveNextLine
          ? this.next()
          : this.currentLine;
      const isProcessed = this.processGrammer(grammar);
      if (!isProcessed) return false;
    } while (
      grammar.loopUntil &&
      grammar.loopUntil.test(this.currentLine) &&
      this.lineIndex < this.lines.length
    );
    return true;
  }
  /**
   * Tokenizes the input string into tokens using the defined grammar list.
   */
  tokenize() {
    this.lines = this.input.split("\n");
    const totalLines = this.lines.length;
    // Process each line
    while (this.lineIndex < totalLines) {
      this.columnIndex = 0;
      this.currentLine = this.at();
      // Try each grammar rule; break if processed
      for (const grammarRule of grammer) {
        if (this.processGrammer(grammarRule)) {
          break;
        }
      }
      this.next();
    }
    // Add EOF token at the end
    this.tokens.push(
      Token.from(
        "EOF",
        TokenType.Eof,
        this.columnIndex,
        this.columnIndex,
        this.lineIndex
      )
    );
    return this.tokens;
  }
}
