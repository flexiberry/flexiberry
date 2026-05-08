import { LexerEngine, AstEngine } from "@flexiberry/berrycore";
import * as fs from "fs";

const source = fs.readFileSync("testmyberry.berry", "utf8");
const tokens = new LexerEngine(source).tokenize();
const ast = new AstEngine(tokens).build();
console.log(JSON.stringify(ast, null, 2));
