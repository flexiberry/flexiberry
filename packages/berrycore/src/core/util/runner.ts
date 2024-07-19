import { RUNNER_EVENT } from "../../enum/runner.event";
import { TestSuite } from "../../types/types";

export class BerryRunner {
  private events: { [key: string]: Function } = {};

  // Subscribe to an event
  on(eventName: string, callback: Function): BerryRunner {
    this.events[eventName] = callback;
    return this;
  }

  async run(
    testSuite?: TestSuite,
    env?: string,
    input?: Record<string, any>
  ): Promise<void> {
    await this.emit(RUNNER_EVENT.START, { start: "started" }); // Await the execution of each handler

    let environments = testSuite?.environment.find((x) => x.env === env);

    let inputData = input || testSuite?.inputData;

    let scenarios = testSuite?.scenarios;

    // TODO: extract environment variables
    // TODO: extract gobalVariables
    // TODO: extract test suite variables
    // TODO: build and call api
    // TODO: capture the response
    // TODO: compare and validate
    // result

    await this.emit(RUNNER_EVENT.COMPLETED, { status: "COMPLETED" }); // Await the execution of each handler
  }

  async emit(event: string, data: any) {
    if (!!this.events[event]) await this.events[event](data); // Await the execution of each handler
  }
}
