import { group } from "console";
import { Token } from "../token";
import { comment } from "./grammer/comment.grammer";
import { varLexerGrammer } from "./grammer/var.grammer";
import { LexerGrammer } from "./lexer.types";
import { TokenType } from "../tokenType";

const grammer: LexerGrammer[] = [...varLexerGrammer, comment];

export class LexerEngine {
  private input: string;
  private tokens: Token[] = [];

  private lines: string[] = [];
  private lineIndex: number = 0;
  private columnIndex: number = 0;

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
    return this.at();
  }
  private prev() {
    this.lineIndex--;
    return this.at();
  }

  constructor(input: string) {
    this.input = input;
  }

  private processGrammer(gr: LexerGrammer, line: string) {
    if (gr.start && gr.end && gr.start.test(line)) {
      do {
        line += this.next();
      } while (
        !gr.end.test(line) &&
        gr.mergeLines &&
        this.lineIndex < this.lines.length
      );
    }
    if (gr.regex.test(line)) {
      const match = line.match(gr.regex);
      if (match) {
        // if (!gr.groups) return true;
        for (const group of gr.groups) {
          this.tokens.push(
            Token.from(
              match[group.index || 0],
              group.tokenType,
              this.columnIndex,
              this.columnIndex + match[group?.index || 0].length,
              this.lineIndex
            )
          );
          this.columnIndex += match[group.index || 0].length;
          line = line.slice(match[group.index || 0].length);
        }
        if (gr.next) {
          let isProcessed = false;
          for (const nextGr of gr.next) {
            if (isProcessed && nextGr.isOptional) {
              continue;
            }
            if (nextGr.moveNextLine) {
              this.next();
              line = this.at();
              isProcessed = this.processGrammer(nextGr, line);
            } else {
              isProcessed = this.processGrammer(nextGr, line);
            }
          }
        }
        if (gr.loopUntil) {
          do {
            if (gr.mergeLines) {
              line += this.next();
            } else line = this.next();
            const isProcessed = this.processGrammer(gr, line);
            if (!isProcessed) return false;
          } while (
            gr.loopUntil.test(line) &&
            this.lineIndex < this.lines.length
          );
          return true;
        }
      }
      return true;
    } else {
      if (gr.isOptional != undefined && gr.isOptional == false)
        throw new Error("Invalid grammer");
    }

    return false;
  }
  tokenize() {
    this.lines = this.input.split("\n");
    while (this.lineIndex < this.lines.length) {
      this.columnIndex = 0;
      let line = this.at();
      for (const gr of grammer) {
        const isProcessed = this.processGrammer(gr, line);
        if (isProcessed) break;
      }
      this.next();
    }
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
