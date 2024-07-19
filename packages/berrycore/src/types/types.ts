import { ComparisonOperator } from "../enum/ComparisonOperator";
import { HttpMethod } from "../enum/HttpMethod";

// Test Suite Structure:
// TestSuite: Represents a collection of test scenarios, typically used to group tests by feature or functionality.
// Scenarios: Each TestSuite contains multiple Scenarios, each representing a specific flow or feature to test.
// TestCase: Under each Scenario, there are multiple TestCases, defining the conditions and environment for each test.
// Step: Each TestCase includes several Steps, where each Step defines an individual operation or action in the test.

/**
 * Represents a collection of test scenarios.
 */
export type TestSuite = {
  title: string; // The title of the test suite.
  description: string; // A brief description of what the test suite covers.
  scenarios: Scenarios[]; // An array of scenarios within the test suite.
  environment: Environment[]; // An array of environment configurations applicable to the test suite.
  inputData: Record<string, any>; // A dictionary of input data used across the test suite.
};

/**
 * Represents the environment settings for a TestSuite.
 *
 * @property {string} env - The name of the environment (e.g., 'development', 'production').
 * @property {Record<string, any>} globalVariables - A collection of key-value pairs representing global variables for the environment.
 */
export type Environment = {
  env: string; // The name of the environment (e.g., 'development', 'production').
  globalVariables: Record<string, any>; // Key-value pairs of global variables specific to the environment.
};

/**
 * Represents a specific flow or feature to test within a TestSuite.
 */
export type Scenarios = {
  title: string; // The title of the scenario.
  description: string; // A brief description of the scenario's purpose.
  testCase: TestCase[]; // An array of test cases that are part of the scenario.
};

/**
 * Defines the conditions and environment for a test within a Scenario.
 */
export type TestCase = {
  title: string; // The title of the test case.
  description: string; // A brief description of what the test case will validate.
  steps: Step[]; // An array of steps to be executed in the test case.
  expected: Boolean; // The expected outcome (pass/fail) of the test case.
  variables: Record<string, any>; // Variables specific to the test case.
};

/**
 * Defines an individual operation or action within a TestCase.
 */
export type Step = {
  title: string; // The title of the step.
  id: string; // A unique identifier for the step.
  http: HttpApiConfig; // Configuration for an HTTP API call.
  capture: Record<string, any>; // Data captured during the step execution.
  validation: Validation; // Validation criteria to assess the step's outcome.
  goto?: string; // Optional: ID of the next step to execute if conditions are met.
};

/**
 * Configuration for an HTTP API call within a Step.
 */
export type HttpApiConfig = {
  endpoint: string; // URL endpoint for the HTTP call.
  method: HttpMethod; // HTTP method to be used (GET, POST, etc.).
  headers?: Record<string, string>; // Optional HTTP headers.
  body?: Record<string, any>; // Optional body of the HTTP request.
  params?: Record<string, string>; // Optional body of the HTTP request.
};

/**
 * Validation criteria for the outcome of a Step.
 */
export type Validation = {
  status: string; // Expected HTTP status code.
  body?: Record<string, any>; // Optional expected body content for further validation.
  compare?: Comparison; // Optional comparison operation to perform additional checks.
};

/**
 * Defines a comparison operation to be performed as part of a Validation.
 */
export type Comparison = {
  lhs: string; // Left-hand side of the comparison.
  rhs: string; // Right-hand side of the comparison.
  operator: ComparisonOperator; // Operator to apply in the comparison (e.g., EQUALS, NOT_EQUALS).
};
