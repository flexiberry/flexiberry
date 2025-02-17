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
import { StepReader } from "./reader/stepReader.js";
import { TaskReader } from "./reader/taskReader";
import { VarReader } from "./reader/varReader";
import { Token } from "./token";
import { TokenType } from "./tokenType";

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
      console.log(this.input.substring(this.position, 3));

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
        const tkns = apiReader.read(TokenType.Api);
        tokens.push(...tkns);
        this.position = apiReader.getPosition(); // Update position
        continue;
      }

      // Check for Body, Header, and Url
      if (isBody(this.input, this.position)) {
        const bodyReader = new ApiReader(this.input, this.position);
        const bodyTkns = bodyReader.read(TokenType.Body);
        tokens.push(...bodyTkns);
        this.position = bodyReader.getPosition(); // Update position
        continue;
      }
      if (isHeader(this.input, this.position)) {
        const headerReader = new ApiReader(this.input, this.position);
        const headerTkns = headerReader.read(TokenType.Header);
        tokens.push(...headerTkns);
        this.position = headerReader.getPosition(); // Update position
        continue;
      }
      if (isUrl(this.input, this.position)) {
        const urlReader = new ApiReader(this.input, this.position);
        const urlTkns = urlReader.read(TokenType.Url);
        tokens.push(...urlTkns);
        this.position = urlReader.getPosition(); // Update position
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
      if (isTask(this.input, this.position)) {
        const taskReader = new TaskReader(this.input, this.position);
        const tkns = taskReader.read();
        tokens.push(...tkns);
        this.position = taskReader.getPosition(); // Update position
        continue;
      }

      if (isCheck(this.input, this.position)) {
        const checkReader = new CheckReader(this.input, this.position);
        const tkns = checkReader.read();
        tokens.push(...tkns);
        this.position = checkReader.getPosition(); // Update position
        continue;
      }

      this.position++; // Move to the next character if no match
    }

    tokens.push(Token.from("EOF", TokenType.Eof, this.position, this.position));

    return tokens;
  }
}
