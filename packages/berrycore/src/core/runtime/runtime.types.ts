export interface RuntimeInterface {
  emitRuntimeError(message: string): void;
}

export interface RuntimeJobOverview {
  fileName: string;
  payload: any;
  tasks: RuntimeTask[];
  apis: number;
  variables: number;
  environments: number;
  activeEnv: string;
  startTime?: Date;
  endTime?: Date;
  duration: string;
}

export interface RuntimeTask {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  duration: string;
  steps?: RuntimeStep[];
}

export interface RuntimeStep {
  id: string;
  title: string;
  action: string;
  taskId: string;
  target: string;
  functionId: string;
  startTime: Date;
  endTime: Date;
  duration: string;
  status: string;
  comments: string;
}
