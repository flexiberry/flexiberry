import { Lexer } from "../lang/tokenizer/lexer";
import Parser from "../lang/ast/AstParser";
import { FileUtils } from "./functions/file";
import { InputType } from "../enum/misc";

export class BerryCore {
  /**
   * Parses the content of a .berry file and returns the AST
   * @param content The content of the .berry file to parse
   * @returns The parsed AST
   */
  public parseContent(content: string) {
    // Parse the tokens into an AST
    const parser = new Parser();
    return parser.produce(content);
  }

  /**
   * Parses a .berry file from the given file path
   * @param filePath Path to the .berry file
   * @returns The parsed AST
   */
  public parseFile(filePath: string) {
    // Validate and load the file
    const fileType = FileUtils.isValidFilePath(filePath);
    if (fileType === InputType.Invalid) {
      throw new Error("Invalid file path");
    }

    const content = FileUtils.loadFile(filePath);
    // Parse the content
    

    return this.parseContent(content);
  }
}
