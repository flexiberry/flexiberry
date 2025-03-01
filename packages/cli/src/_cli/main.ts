import { Lexer } from "@flexiberry/berrycore";

export class Main {
  public static main(): void {
    console.log("Hello, World!");
    new Lexer("Hello, Berry!").tokenize();
  }
}
