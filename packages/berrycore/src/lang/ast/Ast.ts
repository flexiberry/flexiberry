import { KV } from "./types";

export enum NodeType {
  Program,
  ProgramBody,

  Environment,

  Store,
  StoreKeyValue,

  Capture,
  ApiFunction,
}

export enum Scope {
  Global,
  Function,
  Environment,
}

export type Statement = {
  kind: NodeType;
};

export interface Program extends Statement {
  kind: NodeType.Program;
  body: ProgramBody;
}

export interface ProgramBody extends Statement {
  kind: NodeType.ProgramBody;
  environment?: Environment;
  store: Store[];
  api: ApiStatement[];
}

export type Store = Statement & {
  kind: NodeType.Store;
  identifier: string;
  scope: Scope;
  pointer: string;
  comments: string;

  value: StoreKv[];
};

export interface StoreKv extends Statement {
  kind: NodeType.StoreKeyValue;
  value: any;
  key: string;
  dataType: string;
}

export interface Environment extends Statement {
  kind: NodeType.Environment;
  value: string[];
}

export interface ApiStatement extends Statement {
  kind: NodeType.ApiFunction;
  identifier: string;
  title: string;
  sturct: ApiStructure;
}
export interface ApiStructure extends Statement {}
