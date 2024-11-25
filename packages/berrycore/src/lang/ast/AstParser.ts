import { Lexer } from "../tokenizer/lexer";
import { Token } from "../tokenizer/token";
import { TokenType } from "../tokenizer/tokenType";
import { NodeType, Program, ProgramBody } from "./Ast";
import { CProgramBody } from "./AstImpl";

export default class Parser {
  public produce(sourceCode: string): Program {
    let lexer = new Lexer(sourceCode);
    let tokens = lexer.tokenize();

    const program: Program = {
      kind: NodeType.Program,
      body: new CProgramBody().build(tokens) as ProgramBody,
    };

    console.dir(program, {
      colors: true,
    });
    return program;
  }
}
