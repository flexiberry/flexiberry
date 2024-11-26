import { RUNNER_EVENT } from "../../enum/runner.event";

export class BerryRunner {
  private events: { [key: string]: Function } = {};

  // Subscribe to an event
  on(eventName: string, callback: Function): BerryRunner {
    this.events[eventName] = callback;
    return this;
  }

  async run(
    testSuite?: any,
    env?: string,
    input?: Record<string, any>
  ): Promise<void> {
    await this.emit(RUNNER_EVENT.START, { start: "started" }); // Await the execution of each handler

    await this.emit(RUNNER_EVENT.COMPLETED, { status: "COMPLETED" }); // Await the execution of each handler
  }

  async emit(event: string, data: any) {
    if (!!this.events[event]) await this.events[event](data); // Await the execution of each handler
  }
}
