import { ApiReader } from "../reader/apiReader";
import { CommentReader } from "../reader/commentReader";
import { EnvReader } from "../reader/envReader";
import { VarReader } from "../reader/varReader";
import { Token } from "./token";
import { TokenType } from "./tokenType";
import {
  isApi,
  isCapture,
  isCheck,
  isComment,
  isEnv,
  isParams,
  isStep,
  isVar,
  isWhitespace,
} from "../util";
import { StepReader } from "../reader/stepReader";
import { CaptureReader } from "../reader/captureReader";
import { ParamsReader } from "../reader/paramsReader";
import { CheckReader } from "../reader/checkReader";

export class Lexer {
  private input: string;
  private position: number = 0;

  constructor(input: string) {
    this.input = input;
  }

  // Tokenize the input
  tokenize() {
    const tokens = [];
    while (this.position < this.input.length) {
      const char = this.input[this.position];

      if (isWhitespace(char)) {
        this.position++;
        continue; // Skip whitespace
      }

      if (isComment(this.input, this.position)) {
        const commentReader = new CommentReader(this.input, this.position);
        const comment = commentReader.read();
        tokens.push(...comment);
        this.position = commentReader.getPosition(); // Update position
        continue;
      }

      if (isEnv(this.input, this.position)) {
        const envReader = new EnvReader(this.input, this.position);
        const envTokens = envReader.read();
        tokens.push(...envTokens);
        this.position = envReader.getPosition(); // Update position
        continue;
      }

      if (isVar(this.input, this.position)) {
        const varReader = new VarReader(this.input, this.position);
        const varTokens = varReader.read();
        tokens.push(...varTokens);
        this.position = varReader.getPosition(); // Update position
        continue;
      }

      if (isApi(this.input, this.position)) {
        const apiReader = new ApiReader(this.input, this.position);
        const tkns = apiReader.read();
        tokens.push(...tkns);
        this.position = apiReader.getPosition(); // Update position
        continue;
      }

      if (isStep(this.input, this.position)) {
        const stepReader = new StepReader(this.input, this.position);
        const tkns = stepReader.read();
        tokens.push(...tkns);
        this.position = stepReader.getPosition(); // Update position
        continue;
      }
      if (isCapture(this.input, this.position)) {
        const captureReader = new CaptureReader(this.input, this.position);
        const tkns = captureReader.read();
        tokens.push(...tkns);
        this.position = captureReader.getPosition(); // Update position
        continue;
      }
      if (isParams(this.input, this.position)) {
        const paramsReader = new ParamsReader(this.input, this.position);
        const tkns = paramsReader.read();
        tokens.push(...tkns);
        this.position = paramsReader.getPosition(); // Update position
        continue;
      }
      // if (isCheck(this.input, this.position)) {
      //   const checkReader = new CheckReader(this.input, this.position);
      //   const tkns = checkReader.read();
      //   tokens.push(...tkns);
      //   this.position = checkReader.getPosition(); // Update position
      //   continue;
      // }

      this.position++; // Move to the next character if no match
    }

    tokens.push(Token.from("EOF", TokenType.Eof, this.position, this.position));

    return tokens;
  }
}
