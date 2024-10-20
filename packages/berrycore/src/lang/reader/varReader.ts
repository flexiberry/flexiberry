import { Token } from "../token";
import { CReader, Reader } from "./reader";

export class VarReader extends CReader implements Reader {
  read(): Token[] {
    throw new Error("Method not implemented.");
  }
}
