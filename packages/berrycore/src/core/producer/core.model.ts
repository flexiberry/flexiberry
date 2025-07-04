export type EnvCoreModel = {
  values: string;
  scope: "GLOBAL" | "LOCAL";
};

export type VarCoreModel = {
  key: string;
  value: string;
  valueType: "LITERAL" | "IDENTIFIER";
  dataType: string;
  scope: "LOCAL" | "GLOBAL" | "ENVIRONMENT";
  pointer: string;
  id: string;
  comments: string;
  statement: string;
};

export type ApiCoreModel = {
  url: string | undefined;
  header?: Record<string, string>;
  method: string;
  body: any;
  bodyType: string | undefined;
  interpolation?: string[];
  id: string;
  title: string;
};

export type KeyValueCoreModel = {
  key: string;
  value: string;
};

export type CaptureCoreModel = KeyValueCoreModel & {
  type: string;
  id: string;
};
export type ParamsCoreModel = KeyValueCoreModel & {
  type: string;
  id: string;
};
export type CheckCoreModel = {
  conditions: ConditionCoreModel[];
  id: string;
};
export type ConditionCoreModel = {
  operator?: string; // Optional operator for conditions (e.g., "AND", "OR")
  leftOperand?: string;
  rightOperand?: string;
  logicalOperator?: string;
};
export type StepCoreModel = {
  id: string;
  title: string;
  action: string;
  target: string;
  functionId: string;
  capture?: CaptureCoreModel[];
  check?: CheckCoreModel[];
  params?: ParamsCoreModel[];
  status?: string;
  comments?: string;
  error?: string;
};
export type TaskCoreModel = {
  title: string;
  id: string;
  steps?: StepCoreModel[];
  status?: string;
  comments?: string;
  error?: string;
};
export type CoreModel = {
  environments?: EnvCoreModel[];
  variables?: VarCoreModel[];
  apis: ApiCoreModel[];
  tasks?: TaskCoreModel[];
};
