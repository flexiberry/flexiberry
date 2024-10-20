import { Token } from "../token";

export interface Reader {
  getPosition(): number;
  read(): Token[];
}

export class CReader {
  public input: string = "";
  public position: number = 0;

  constructor(input: string, position: number) {
    this.input = input;
    this.position = position;
  }

  public getPosition(): number {
    return this.position;
  }
}
