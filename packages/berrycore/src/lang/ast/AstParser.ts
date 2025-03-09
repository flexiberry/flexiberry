import { Lexer } from "../tokenizer/lexer";
import { Token } from "../tokenizer/token";
import { TokenType } from "../tokenizer/tokenType";
import { NodeType, type Program, type ProgramBody } from "./Ast";
import { CProgramBody } from "./AstImpl";

export default class Parser {
  public produce(sourceCode: string): Program {
    const lexer = new Lexer(sourceCode);
    const tokens = lexer.tokenize();

    const program: Program = {
      kind: NodeType.Program,
      body: new CProgramBody().build(tokens) as ProgramBody,
    };
    return program;
  }
}
