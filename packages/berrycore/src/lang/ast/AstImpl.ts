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
    }

    return this;
  }

  getAst() {
    return {
      kind: this.kind,
      environment: this.environment,
      variables: this.variables,
      api: this.api,
      tasks: this.tasks,
    };
  }

  parseBody() {
    if (this.at().type == TokenType.Env) {
      this.environment = this.envParser.parseEnv() as Environment;
      return;
    }
    if (this.at().type == TokenType.Api) {
      this.api.push(this.apiParser.parseApi());
      return;
    }
    if (this.at().type == TokenType.Var) {
      this.variables.push(this.varParser.parseStore());
      return;
    }
    this.eat();
    return;
  }
}
