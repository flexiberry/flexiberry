export enum RUNNER_EVENT {
  START = "start",
  COMPLETED = "completed",
  ERROR = "error",

  STEP_DONE = "step_done",
  STEP_BEGIN = "step_begin",

  TEST_DONE = "test_done",
  TEST_BEGIN = "test_begin",

  SCENARIO_DONE = "scenario_done",
  SCENARIO_BEGIN = "scenario_begin",
  PARSED = "PARSED",
  CONSOLE = "CONSOLE",
}
