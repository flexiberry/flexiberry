import { printTable } from "console-table-printer";
import { Lexer } from "../../lang/tokenizer/lexer";
import { FileUtils } from "../functions/file";
import { TokenTypeValueOf } from "../../lang/tokenizer/tokenType";
import { CProgramBody } from "../../lang/ast/AstImpl";
import { Producer } from "../producer/producer";
import { Test } from "./test";

export function runLexer() {
  console.time("Time");

  const fileContent = FileUtils.loadFile(
    "/Users/rinturajc/lib_projects/Flexiberry/flexiberry/packages/berrycore/src/_fake_data/sample.fb"
  );

  console.log("Running lexer on file content...");

  // eval(`console.log('rintu')`); // Executes the uploaded code

  const lexer = new Lexer(fileContent);
  const tokens = lexer.tokenize();
  console.timeLog("Time", "tokenized");

  printTable(
    tokens.map((token) => ({
      Value: token.value,
      TokenType: TokenTypeValueOf(token.type),
      Start: token.position.start,
      End: token.position.end,
    }))
  );

  const program = new CProgramBody().build(tokens);

  console.log(JSON.stringify(program.getAst(), null, 2));

  const producer = new Producer();
  const pro = producer.build(program.getAst());
  console.log(JSON.stringify(pro, null, 2));

  // console.dir(program);
  console.timeEnd("Time");

  new Test().test();
}
