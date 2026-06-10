import type { BerryCore } from "@flexiberry/berrycore";
import type { WebUIAdapter } from "./WebUIAdapter";

export interface RunLog {
  time: string;
  level: "info" | "warn" | "error" | "system";
  msg: string;
}

export interface PlanStep {
  targetName: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  duration?: number;
  request?: {
    url: string;
    method: string;
    headers?: any;
    body?: any;
  };
  response?: {
    status?: number;
    headers?: any;
    body?: any;
  };
  error?: string;
}

export interface PlanTask {
  title: string | null;
  status: "pending" | "running" | "completed" | "failed";
  steps: PlanStep[];
}

export interface RunInstance {
  id: string;
  fileName: string;
  status: "running" | "completed" | "failed" | "killed";
  startTime: Date;
  endTime?: Date;
  elapsedTime: number;
  logs: RunLog[];
  currentTask?: string;
  currentStep?: string;
  completedSteps: number;
  totalSteps: number;
  core: BerryCore;
  adapter: WebUIAdapter;
  minimized: boolean;
  isFullscreen: boolean;
  timerInterval?: any;
  promptActive: boolean;
  promptMessage: string;
  promptValue: string;
  resolvePrompt?: (val: string) => void;
  error?: string;
  plan: PlanTask[];
}
