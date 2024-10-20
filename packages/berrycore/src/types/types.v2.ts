export type Environment = string;

export type Variable = [];

export type Api = {
  name: string;
  url: string;
  body: Record<string, any>;
  header: Record<string, string>;
};
export type TestCase = {
  id: string;
  description: string;
  steps: Step[];
};

export type Step = {
  name: string;
  action: string;
  capture: Record<string, string>;
  validation: string;
};

export type DataStructure = {
  environments: Environment[];
  variables: Variable[];
  apis: Api[];
  testCases: TestCase[];
};
