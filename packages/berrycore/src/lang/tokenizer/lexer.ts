import {
  isWhitespace,
  isComment,
  isEnv,
  isVar,
  isApi,
  isBody,
  isHeader,
  isUrl,
  isStep,
  isCapture,
  isParams,
  isTask,
  isCheck,
} from "../util";
import { ApiReader } from "./reader/apiReader";
import { CaptureReader } from "./reader/captureReader";
import { CheckReader } from "./reader/checkReader";
import { CommentReader } from "./reader/commentReader";
import { EnvReader } from "./reader/envReader";
import { ParamsReader } from "./reader/paramsReader";
import { StepReader } from "./reader/stepReader";
import { TaskReader } from "./reader/taskReader";
import { VarReader } from "./reader/varReader";
import { Token } from "./token";
import { TokenType } from "./tokenType";

/**
 * @deprecated use `import { LexerEngine } from "@berrycore/tokenizer/reader_v2"` instead.
 * Lexer is a class that tokenizes the input string into tokens.
 */
export class Lexer {
  private input: string;
  private position: number = 0;

  constructor(input: string) {
    this.input = input;
  }

  // Tokenize the input (optimized with dispatch table)
  tokenize() {
    const tokens = [];
    const dispatchTable: {
      [char: string]: Array<{
        check: Function;
        reader: any;
        tokenType?: TokenType;
      }>;
    } = {
      E: [{ check: isEnv, reader: EnvReader }],
      V: [{ check: isVar, reader: VarReader }],
      A: [{ check: isApi, reader: ApiReader, tokenType: TokenType.Api }],
      B: [{ check: isBody, reader: ApiReader, tokenType: TokenType.Body }],
      H: [{ check: isHeader, reader: ApiReader, tokenType: TokenType.Header }],
      U: [{ check: isUrl, reader: ApiReader, tokenType: TokenType.Url }],
      S: [{ check: isStep, reader: StepReader }],
      C: [
        { check: isCapture, reader: CaptureReader },
        { check: isCheck, reader: CheckReader },
      ],
      P: [{ check: isParams, reader: ParamsReader }],
      T: [{ check: isTask, reader: TaskReader }],
    };

    while (this.position < this.input.length) {
      const char = this.input[this.position];
      if (isWhitespace(char)) {
        this.position++;
        continue; // Skip whitespace
      }

      // Comment check (not by first char)
      if (isComment(this.input, this.position)) {
        const commentReader = new CommentReader(this.input, this.position);
        const comment = commentReader.read();
        tokens.push(...comment);
        this.position = commentReader.getPosition(); // Update position
        continue;
      }

      // Use dispatch table for fast routing
      const handlers = dispatchTable[char];
      let matched = false;
      if (handlers) {
        for (const { check, reader, tokenType } of handlers) {
          if (check(this.input, this.position)) {
            const r =
              tokenType !== undefined
                ? new reader(this.input, this.position)
                : new reader(this.input, this.position);
            const tkns = tokenType !== undefined ? r.read(tokenType) : r.read();
            tokens.push(...tkns);
            this.position = r.getPosition();
            matched = true;
            break;
          }
        }
      }
      if (matched) continue;

      // If nothing matched, move to the next character
      this.position++;
    }

    tokens.push(Token.from("EOF", TokenType.Eof, this.position, this.position));
    return tokens;
  }
}
