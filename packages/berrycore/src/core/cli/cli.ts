import { Lexer } from "../../lang/tokenizer/lexer";
import { FileUtils } from "../functions/file";
import { TokenTypeValueOf } from "../../lang/tokenizer/tokenType";
import { Producer } from "../producer/producer";
import { CProgramBody } from "../../lang/ast/ast-impl";

export function runLexer() {
  console.time("Time");

  const fileContent = FileUtils.loadFile(
    "/Users/rinturajc/lib_projects/Flexiberry/flexiberry/packages/berrycore/src/_fake_data/sample.fb"
  );

  // eval(`// Executes the uploaded code

  const lexer = new Lexer(fileContent);
  const tokens = lexer.tokenize();
  console.timeLog("Time", "tokenized");

  const program = new CProgramBody().build(tokens);

  const producer = new Producer();
  const pro = producer.build(program.getAst());

  // console.dir(program);
  console.timeEnd("Time");
}
