import { Token } from "../tokenizer/token";
import { TokenType } from "../tokenizer/tokenType";
import {
  ApiStatement,
  Environment,
  NodeType,
  ProgramBody,
  Scope,
  Statement,
  Store,
  StoreKv,
} from "./Ast";

export class CProgramBody implements ProgramBody {
  kind: NodeType.ProgramBody = NodeType.ProgramBody;
  environment?: Environment;
  store: Store[] = [];
  api: ApiStatement[] = [];

  //token Collection
  tokens: Token[] = [];

  constructor() {}

  private not_eof(): boolean {
    return this.tokens[0].type != TokenType.Eof;
  }

  private at() {
    return this.tokens[0] as Token;
  }

  private eat() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  private expect(type: TokenType, err: any) {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type != type) {
      console.error(
        `\x1b[31mParser Error:\x1b[0m\n`,
        err,
        // TokenType[prev.type].toUpperCase(),
        " - \x1b[33mExpecting:\x1b[0m ",
        TokenType[type].toUpperCase()
      );
      //   throw new Error("Parser Error:\n" + err + prev + " - Expecting: " + type);
    }

    return prev;
  }

  build(tokens: Token[]) {
    this.tokens = tokens;

    while (this.not_eof()) {
      this.parseBody();
      this.eat();
    }

    return this;
  }

  parseBody() {
    if (this.at().type == TokenType.Env) {
      this.environment = this.parseEnvAst() as Environment;
    }
    if (this.at().type == TokenType.Api) {
    }
    if (this.at().type == TokenType.Var) {
      this.store.push(this.parseStore());
    }
  }

  parseStore(): Store {
    let store: Store = {
      comments: "",
      identifier: "",
      kind: NodeType.Store,
      pointer: "",
      scope: Scope.Environment,
      value: [] as StoreKv[],
    };

    if (this.at().type === TokenType.Var) {
      this.eat();
    }
    if (this.at().type === TokenType.Pointer) {
      this.eat();
      let v = this.expect(
        TokenType.Pointed,
        "Var pointer is expected following pointer"
      );
      store.pointer = v.value;
    }
    if (this.at().type === TokenType.Title) {
      store.comments = this.at().value;
      this.eat();
    }

    do {
      this.expect(TokenType.Hyphen, "Missing Hyphen in Var decleration ");
      let key = this.expect(
        TokenType.Identifier,
        "Missing Identifier in Var decleration "
      );

      let kv: StoreKv = {
        dataType: "number",
        key: key.value,
        kind: NodeType.StoreKeyValue,
        value: "",
      };
      this.expect(
        TokenType.Colon,
        "Missing Colon in Var Key Value decleration "
      );
      if (
        this.at().type == TokenType.Quote ||
        this.at().type == TokenType.Backtick
      ) {
        kv.dataType = "string";
        this.eat();
      }

      let value = this.expect(
        TokenType.Scalar,
        "Missing Value in Var Key Value decleration  "
      );

      if (this.at().type == TokenType.Quote) this.eat();
      if (this.at().type == TokenType.Backtick) this.eat();

      kv.value = value.value;

      store.value.push(kv);
    } while (this.at().type == TokenType.Hyphen);
    return store;
  }

  parseEnvAst(): Statement {
    const isEnv = this.eat().type == TokenType.Env;

    let values: string[] = [];

    while (
      this.at().type == TokenType.Comma ||
      this.at().type == TokenType.Value
    ) {
      if (this.at().type == TokenType.Comma) {
        this.eat();
        continue;
      }
      if (this.at().type == TokenType.Value) {
        let v = this.eat().value;
        values.push(v);
        continue;
      }
      this.expect(
        TokenType.Value,
        "Enviroment values are missing. Env decleration is invalid"
      );
      break;
    }
    return {
      kind: NodeType.Environment,
      value: values,
    } as Environment;
  }
}
