import { Producer } from "../producer/producer";
import type { ProgramBody } from "../../lang/ast/ast-node-type";
import { CoreModel } from "../producer/core.model";
import { RuntimeError } from "./runtime.error";
import { RUNNER_EVENT } from "../../enum/runner.event";
import { emitEvent } from "../util/event-utils";
import { ApiTemplate } from "./apitemplate.runtime";

export class Runtime {
  private model: CoreModel | null = null;
  private events: { [key: string]: Function };

  constructor(model: CoreModel, events: { [key: string]: Function }) {
    this.model = model;
    this.events = events;
  }
  private async emit(eventName: string, payload: any) {
    await emitEvent(this.events, eventName, payload);
  }
  /**
   * Executes the loaded program
   * @returns A promise that resolves when execution is complete
   * @throws RuntimeError if no program is loaded or execution fails
   */
  public async execute(): Promise<void> {
    if (!this.model) {
      await this.emit(RUNNER_EVENT.ERROR, {
        info: "Runtime execution Error",
      });
      return;
    }

    try {
      if (!this.model.tasks || this.model.tasks.length === 0) {
        await this.emit(RUNNER_EVENT.ERROR, {
          info: "No tasks found in the program.",
        });
        return;
      }

      for (const task of this.model.tasks) {
        await this.emit(RUNNER_EVENT.TEST_BEGIN, {
          info: "task begin",
          id: task.id,
          title: task.title,
        });

        if (!task.steps || task.steps.length === 0) {
          await this.emit(RUNNER_EVENT.ERROR, {
            info: "No steps found in the task.",
          });
          return;
        }

        for (const step of task.steps) {
          await this.emit(RUNNER_EVENT.STEP_BEGIN, {
            info: "step begin",
            id: step.id,
            title: step.title,
          });

          await this.emit(RUNNER_EVENT.CONSOLE, {
            info: "step action",
            id: step.id,
            action: step.action,
            target: step.target,
            functionId: step.functionId,
          });

          if (step.action == "Call" && step.target == "Api") {
            const api = this.model.apis.find((x) => x.id == step.functionId);
            if (!api) {
              await this.emit(RUNNER_EVENT.ERROR, {
                info: "No api found with id " + step.functionId,
              });
              return;
            }

            const apiTemplate = new ApiTemplate(
              this.model.variables,
              step.params
            );
            const response = await apiTemplate.callApi(api);
            if (response.status >= 200 && response.status < 300) {
              await this.emit(RUNNER_EVENT.CONSOLE, {
                info: "step action",
                id: step.id,
                action: step.action,
                target: step.target,
                functionId: step.functionId,
                response: response,
              });
            } else {
              await this.emit(RUNNER_EVENT.ERROR, {
                info: "step action",
                id: step.id,
                action: step.action,
                target: step.target,
                functionId: step.functionId,
                response: response,
              });
            }
          }

          await this.emit(RUNNER_EVENT.STEP_DONE, {
            info: "step end",
            id: step.id,
          });
        }

        await this.emit(RUNNER_EVENT.TEST_DONE, {
          info: "task end",
          id: task.id,
        });
      }

      // this.model.tasks.forEach((task) => {
      //   // if (!task.steps) {
      //   //   await this.emit(RUNNER_EVENT.ERROR, { info: "No steps found in the task." });
      //   //   return;
      //   // }
      //   // task.steps.forEach((step) => {
      //   //   console.log("Executing step: " + step.title);
      //   // });
      // });
    } catch (error) {
      if (error instanceof Error) {
        await this.emit(RUNNER_EVENT.ERROR, {
          info: `Execution failed: ${error.message}`,
        });
      }
      await this.emit(RUNNER_EVENT.ERROR, {
        info: "Execution failed: Unknown error",
      });
    }
  }

  /**
   * Gets the loaded CoreModel
   * @returns The loaded CoreModel or null if not loaded
   */
  public getModel(): CoreModel | null {
    return this.model;
  }
}
