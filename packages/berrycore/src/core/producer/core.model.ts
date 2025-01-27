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
  params?: Record<string, string>;
  methode: string;
  body: any;
  bodyType: string | undefined;
  interpolation?: string[];
  id: string;
  title: string;
};

export type CoreModel = {
  environments: EnvCoreModel[];
  variables: VarCoreModel[];
  apis: ApiCoreModel[];
};
