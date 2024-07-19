import {
  TestSuite,
  Environment,
  Scenarios,
  TestCase,
  Step,
  HttpApiConfig,
  Validation,
  Comparison,
} from "../../types/types"; // Assuming this file is named types.ts

/**
 * Validates whether an object conforms to the TestSuite type.
 * @param obj Object to validate.
 * @returns True if the object conforms to TestSuite type, false otherwise.
 */
function isTestSuite(obj: any): obj is TestSuite {
  return (
    typeof obj === "object" &&
    typeof obj.title === "string" &&
    (typeof obj.description === "string" ||
      typeof obj.description === undefined) &&
    Array.isArray(obj.scenarios) &&
    obj.scenarios.every(isScenarios) &&
    Array.isArray(obj.environment) &&
    obj.environment.every(isEnvironment) &&
    (typeof obj.inputData === "object" || typeof obj.inputData === undefined)
  );
}

/**
 * Validates whether an object conforms to the Environment type.
 * @param obj Object to validate.
 * @returns True if the object conforms to Environment type, false otherwise.
 */
function isEnvironment(obj: any): obj is Environment {
  return (
    (typeof obj === "object" &&
      typeof obj.env === "string" &&
      typeof obj.globalVariables === "object") ||
    typeof obj.globalVariables === undefined
  );
}

/**
 * Validates whether an object conforms to the Scenarios type.
 * @param obj Object to validate.
 * @returns True if the object conforms to Scenarios type, false otherwise.
 */
function isScenarios(obj: any): obj is Scenarios {
  return (
    typeof obj === "object" &&
    typeof obj.title === "string" &&
    typeof obj.description === "string" &&
    Array.isArray(obj.testCase) &&
    obj.testCase.every(isTestCase)
  );
}

/**
 * Validates whether an object conforms to the TestCase type.
 * @param obj Object to validate.
 * @returns True if the object conforms to TestCase type, false otherwise.
 */
function isTestCase(obj: any): obj is TestCase {
  return (
    typeof obj === "object" &&
    typeof obj.title === "string" &&
    typeof obj.description === "string" &&
    Array.isArray(obj.steps) &&
    obj.steps.every(isStep) &&
    typeof obj.expected === "boolean" &&
    typeof obj.variables === "object"
  );
}

/**
 * Validates whether an object conforms to the Step type.
 * @param obj Object to validate.
 * @returns True if the object conforms to Step type, false otherwise.
 */
function isStep(obj: any): obj is Step {
  return (
    typeof obj === "object" &&
    typeof obj.title === "string" &&
    typeof obj.id === "string" &&
    isHttpApiConfig(obj.http) &&
    typeof obj.capture === "object" &&
    isValidation(obj.validation) &&
    (typeof obj.goto === "undefined" || typeof obj.goto === "string")
  );
}

/**
 * Validates whether an object conforms to the HttpApiConfig type.
 * @param obj Object to validate.
 * @returns True if the object conforms to HttpApiConfig type, false otherwise.
 */
function isHttpApiConfig(obj: any): obj is HttpApiConfig {
  return (
    typeof obj === "object" &&
    typeof obj.endpoint === "string" &&
    typeof obj.method === "string" &&
    (typeof obj.headers === "undefined" ||
      (typeof obj.headers === "object" &&
        Object.values(obj.headers).every(
          (value) => typeof value === "string"
        ))) &&
    (typeof obj.body === "undefined" || typeof obj.body === "object")
  );
}

/**
 * Validates whether an object conforms to the Validation type.
 * @param obj Object to validate.
 * @returns True if the object conforms to Validation type, false otherwise.
 */
function isValidation(obj: any): obj is Validation {
  return (
    typeof obj === "object" &&
    typeof obj.status === "string" &&
    (typeof obj.body === "undefined" || typeof obj.body === "object") &&
    (typeof obj.compare === "undefined" || isComparison(obj.compare))
  );
}

/**
 * Validates whether an object conforms to the Comparison type.
 * @param obj Object to validate.
 * @returns True if the object conforms to Comparison type, false otherwise.
 */
function isComparison(obj: any): obj is Comparison {
  return (
    typeof obj === "object" &&
    typeof obj.lhs === "string" &&
    typeof obj.rhs === "string" &&
    typeof obj.operator === "string"
  );
}
