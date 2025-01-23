import { KV } from "./types";

export enum NodeType {
  Program,
  ProgramBody,

  Environment,

  Variable,
  VariableKeyValue,

  Capture,
  ApiFunction,
  ApiSturcture,

  Task,

  Step,
  Call,
  Check,
  Params,
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
  variables: Variable[];
  api: ApiStatement[];
  tasks: Task[];
}
export interface Task extends Statement {}
export type Variable = Statement & {
  kind: NodeType.Variable;
  identifier: string;
  scope: Scope;
  pointer: string;
  comments: string;

  value: VariableKv[];
};

export interface VariableKv extends Statement {
  kind: NodeType.VariableKeyValue;
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
  method: string;
}
export interface ApiStructure extends Statement {
  url?: string;
  type?: string;
  body?: string;
  header?: Record<string, string>;
}

export interface Task extends Statement {
  kind: NodeType.Task;
  identifier: string;
  title: string;
  steps: Step[];
}

export interface Step extends Statement {
  kind: NodeType.Step;
  identifier: string;
  title: string;
  action: string;
  target: string;
  functionId: string;
  capture: Capture[];
  check: Check[];
  params: Params[];
}

export interface Params extends Statement {
  kind: NodeType.Params;
  key: string;
  value: string;
  type: string;
}

export interface Capture extends Statement {
  kind: NodeType.Capture;
  key: string;
  value: string;
  type: string;
}

export interface Check extends Statement {
  kind: NodeType.Check;
  conditions: Condition[];
}

export interface Condition extends Statement {
  operator?: string; // Optional operator for conditions (e.g., "AND", "OR")
  leftOperand?: string; // Optional left operand for complex conditions
  rightOperand?: string; // Optional right operand for complex conditions
  logicalOperator?: string;
}
