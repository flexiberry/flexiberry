import { runLexer } from "./core/cli/cli";
import Parser from "./lang/ast/AstParser";
import { Lexer } from "./lang/tokenizer/lexer";

runLexer();

export { Lexer, Parser };
