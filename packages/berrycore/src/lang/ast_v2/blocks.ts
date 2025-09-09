import { Token } from "../tokenizer/token";

export enum BlocksType {
  Variables,
  Api,
  Task,
  Step,
}

export type Blocks = {
  type: BlocksType;
  sequence: Token[];
  intend: number;
  lineStart: number;
  lineEnd: number;
  blocks?: Blocks[];
};

export type BlocksParent = Blocks & {};

export class BlocksBuilder {}
