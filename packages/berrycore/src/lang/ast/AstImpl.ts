import { Token } from "../tokenizer/token";
import { TokenType } from "../tokenizer/tokenType";
import {
  ApiStatement,
  Environment,
  NodeType,
  ProgramBody,
  Scope,
  Statement,
  Task,
  Variable,
} from "./Ast";
import { ApiParser } from "./ApiParser";
import { EnvironmentParser } from "./EnvironmentParser";
import { VariableParser } from "./VariableParser";
import { BaseParser } from "./BaseParser";

export class CProgramBody extends BaseParser implements ProgramBody {
  kind: NodeType.ProgramBody = NodeType.ProgramBody;
  environment?: Environment;
  variables: Variable[] = [];
  api: ApiStatement[] = [];
  tasks: Task[] = [];

  private apiParser: ApiParser;
  private envParser: EnvironmentParser;
  private varParser: VariableParser;

  constructor() {
    super();
    this.apiParser = new ApiParser();
    this.envParser = new EnvironmentParser();
    this.varParser = new VariableParser();
  }

  build(tokens: Token[]) {
    this.tokens = tokens;
    this.apiParser.setTokens(tokens);
    this.envParser.setTokens(tokens);
    this.varParser.setTokens(tokens);

    while (this.not_eof()) {
      this.parseBody();
      this.eat();
    }

    return this;
  }

  parseBody() {
    if (this.at().type == TokenType.Env) {
      this.environment = this.envParser.parseEnv() as Environment;
    }
    if (this.at().type == TokenType.Api) {
      this.api.push(this.apiParser.parseApi());
      console.log(this.at());
    }
    if (this.at().type == TokenType.Var) {
      this.variables.push(this.varParser.parseStore());
    }
  }
}
