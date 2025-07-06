import { Producer } from "../producer/producer";
import { CheckValidator } from "./check-validator";
import type { ProgramBody } from "../../lang/ast/ast-node-type";
import {
  CoreModel,
  StepCoreModel,
  TaskCoreModel,
} from "../producer/core.model";
import { RuntimeError } from "./runtime.error";
import { RUNNER_EVENT } from "../../enum/runner.event";
import { emitEvent } from "../util/event-utils";
import { ApiTemplate } from "./apitemplate.runtime";
import { title } from "node:process";
import { StringUtil } from "../util/string-util";
import { AxiosResponse } from "axios";

export class Runtime {
  /**
   * Stores the core model, which represents the entire program's structure.
   * Used to access and modify the program's data, variables, APIs, and tasks.
   */
  private model: CoreModel | null = null;

  /**
   * Stores event handler functions, keyed by event name.
   * Used to emit and handle custom runtime events during workflow execution.
   */
  private events: { [key: string]: Function };

  /**
   * In-memory key-value store holding the current state of all variables during runtime.
   * Used to resolve, update, and pass data between workflow steps in real time.
   * Keys are variable names; values can be of any type.
   */
  private dataStore: { [key: string]: any } = {};

  constructor(model: CoreModel, events: { [key: string]: Function }) {
    this.model = model;
    this.events = events;
  }

  /**
   * Executes the program by running through each task and step in sequence.
   * @returns A Promise that resolves when the program execution is complete.
   */
  public async execute(): Promise<void> {
    if (!this.model) {
      await this.emitRuntimeError("Runtime execution Error");
      return;
    }

    this.resolveDataStore();

    if (!this.model.tasks || this.model.tasks.length === 0) {
      await this.emitRuntimeError("No tasks found in the program.");
      return;
    }

    await this.emitTaskOverview(this.model);

    for (const task of this.model.tasks) {
      await this.runTask(task);
    }
  }
  private async runTask(task: TaskCoreModel) {
    await this.emitTaskBegin(task);

    if (!task.steps || task.steps.length === 0) {
      await this.emitRuntimeError("No steps found in the task.");
      return;
    }

    let localStore: { [key: string]: any } = {};

    for (const step of task.steps) {
      await this.runStep(step, localStore);
    }

    await this.emit(RUNNER_EVENT.TEST_DONE, {
      info: "task end",
      id: task.id,
    });
  }

  private async runStep(
    step: StepCoreModel,
    localStore: { [key: string]: any }
  ) {
    await this.emitStepBegin(step);
    await this.emitStepAction(step);

    if (step.action == "Call" && step.target == "Api") {
      const api = this.model?.apis.find((x) => x.id == step.functionId);

      if (!api) {
        await this.emitRuntimeError("No api found with id " + step.functionId);
        return;
      }

      const apiTemplate = new ApiTemplate(this.dataStore);
      const response = await apiTemplate.callApi(api, localStore, step.params);

      this.capture(step, localStore, response);

      const checkResult = this.checkValidator(step, localStore, response);
      step.status = checkResult ? "PASSED" : "FAILED";
      // step.response = response.data;
      step.comments = checkResult ? "" : "Check failed";
    }

    await this.emitStepDone(step);
  }

  private checkValidator(
    step: StepCoreModel,
    localStore: { [key: string]: any },
    response: AxiosResponse<any, any>
  ) {
    if (!!step.check) {
      const checkValidator = new CheckValidator(this);
      const overallCheckResult = checkValidator.validate(
        step.check,
        step.id,
        localStore
      );
      console.log("overallCheckResult", overallCheckResult);
      return overallCheckResult;
    } else {
      return CheckValidator.validateResponseStatus(response.status);
    }
  }

  private capture(
    step: StepCoreModel,
    localStore: { [key: string]: any },
    response: AxiosResponse<any, any>
  ) {
    if (!!step.capture) {
      for (const c of step.capture) {
        localStore[`Step.${step.id}.${c.key}`] = StringUtil.getValueByPath(
          response.data,
          c.value
        );
      }
    }
    localStore[`$.body`] = response.data || null;
    localStore[`$.status`] = response.status;
  }

  private resolveDataStore() {
    this.dataStore =
      this.model?.variables?.reduce(
        (acc, v) => {
          if (v.valueType == "LITERAL") {
            acc[v.statement] = v.value;
          }
          if (v.valueType == "IDENTIFIER") {
            // TODO  - resolve identifier
          }
          return acc;
        },
        {} as { [key: string]: string }
      ) || {};
  }

  private updateDataStore(key: string, value: any, scope: string) {
    this.dataStore[key] = value;
  }

  public getModel(): CoreModel | null {
    return this.model;
  }

  private async emit(eventName: string, payload: any) {
    await emitEvent(this.events, eventName, payload);
  }

  public emitRuntimeError(message: string) {
    this.emit(RUNNER_EVENT.ERROR, new RuntimeError(message));
  }

  private async emitTaskOverview(model: CoreModel) {
    let p = {
      apis: model.apis.length,
      tasks: model.tasks?.length || 0,
      variables: model.variables?.length || 0,
      environments: model.environments?.length || 0,
      overview: {
        tasks: this.model?.tasks?.map((x) => {
          return {
            id: x.id,
            stepsCount: x.steps?.length,
            title: x.title || x.id,
            steps: x.steps?.map((y) => {
              return {
                id: y.id,
                title: y.title || y.id,
                action: y.action,
                target: y.target,
                functionId: y.functionId,
                status: "PENDING",
              };
            }),
          };
        }),
      },
    };

    await this.emit(RUNNER_EVENT.TASK_OVERVIEW, p);
  }

  private async emitTaskBegin(task: { id: string; title: string }) {
    await this.emit(RUNNER_EVENT.TEST_BEGIN, {
      info: "task begin",
      id: task.id,
      title: task.title,
    });
  }

  private async emitStepBegin(step: { id: string; title: string }) {
    await this.emit(RUNNER_EVENT.STEP_BEGIN, {
      info: "step begin",
      id: step.id,
      title: step.title,
    });
  }
  private async emitStepDone(step: StepCoreModel) {
    await this.emit(RUNNER_EVENT.STEP_DONE, {
      info: "step End",
      id: step.id,
      status: step.status,
      comments: step.comments,
    });
  }

  private async emitStepAction(step: {
    id: string;
    action: string;
    target: string;
    functionId: string;
  }) {
    await this.emit(RUNNER_EVENT.CONSOLE, {
      info: "step action",
      id: step.id,
      action: step.action,
      target: step.target,
      functionId: step.functionId,
    });
  }
}
