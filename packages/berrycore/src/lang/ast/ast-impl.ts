import { Token } from "../tokenizer/token";
import { TokenType } from "../tokenizer/tokenType";
import {
  type ApiStatement,
  type Environment,
  NodeType,
  type ProgramBody,
  type Task,
  type Variable,
} from "./ast-node-type";
import { ApiParser } from "./api-parser";
import { EnvironmentParser } from "./environment-parser";
import { VariableParser } from "./variable-parser";
import { BaseParser } from "./base-parser";
import { TaskParser } from "./task-parser";

export class CProgramBody extends BaseParser implements ProgramBody {
  kind: NodeType.ProgramBody = NodeType.ProgramBody;
  environment?: Environment;
  variables: Variable[] = [];
  api: ApiStatement[] = [];
  tasks: Task[] = [];

  private apiParser: ApiParser;
  private envParser: EnvironmentParser;
  private varParser: VariableParser;
  private taskParser: TaskParser;

  constructor() {
    super();
    this.apiParser = new ApiParser();
    this.envParser = new EnvironmentParser();
    this.varParser = new VariableParser();
    this.taskParser = new TaskParser();
  }

  build(tokens: Token[]) {
    this.tokens = tokens;
    this.apiParser.setTokens(tokens);
    this.envParser.setTokens(tokens);
    this.varParser.setTokens(tokens);
    this.taskParser.setTokens(tokens);

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
    if (this.at().type === TokenType.Env) {
      this.environment = this.envParser.parseEnv() as Environment;
      return;
    }
    if (this.at().type === TokenType.Api) {
      this.api.push(this.apiParser.parseApi());
      return;
    }
    if (this.at().type === TokenType.Var) {
      this.variables.push(this.varParser.parseStore());
      return;
    }
    if (this.at().type === TokenType.Task) {
      this.tasks.push(this.taskParser.parseTask());
      return;
    }
    this.eat();
    return;
  }
}
