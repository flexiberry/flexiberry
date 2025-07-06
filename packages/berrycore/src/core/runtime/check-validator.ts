import { CheckCoreModel, ConditionCoreModel } from "../producer/core.model";
import { RuntimeInterface } from "./runtime.types";

export class CheckValidator {
  private static readonly OPERATORS = {
    EQUAL: "==",
    STRICT_EQUAL: "===",
    NOT_EQUAL: "!=",
    STRICT_NOT_EQUAL: "!==",
    GREATER_THAN: ">",
    GREATER_THAN_OR_EQUAL: ">=",
    LESS_THAN: "<",
    LESS_THAN_OR_EQUAL: "<=",
    CONTAINS: "contains",
    STARTS_WITH: "startsWith",
    ENDS_WITH: "endsWith",
  } as const;

  private static readonly LOGICAL_OPERATORS = {
    AND: "AND",
    OR: "OR",
  } as const;

  constructor(private runtime: RuntimeInterface) {}

  /**
   * Evaluates an operand based on its type and returns its value
   * @param operand The operand to evaluate
   * @param operandType The type of the operand ('LITERAL' or 'IDENTIFIER')
   * @param stepId The ID of the current step
   * @param localStore The local store containing variables
   * @returns The evaluated value of the operand
   */
  public evaluateOperand(
    operand: any,
    operandType: "LITERAL" | "IDENTIFIER",
    stepId: string,
    localStore: { [key: string]: any }
  ): any {
    if (operand === "null") {
      return null;
    }

    if (operand === "undefined") {
      return undefined;
    }

    if (operandType === "LITERAL") {
      return operand;
    }

    if (operandType === "IDENTIFIER") {
      // Handle response body access like 'response.body'
      if (typeof operand === "string" && operand.startsWith("response.")) {
        const key = operand.split(".").slice(1).join(".");
        return localStore[`$.${key}`] !== undefined
          ? localStore[`$.${key}`]
          : undefined;
      }
      // Handle direct variable references
      else if (typeof operand === "string" && operand.startsWith("$")) {
        const key = operand.split(".").slice(1).join(".");
        return localStore[`$.${key}`] !== undefined
          ? localStore[`$.${key}`]
          : undefined;
      } else if (typeof operand === "string" && !operand.includes(".")) {
        const key = operand;
        return localStore[`Step.${stepId}.${key}`] !== undefined
          ? localStore[`Step.${stepId}.${key}`]
          : undefined;
      } else if (
        typeof operand === "string" &&
        (operand.includes("Step") ||
          operand.includes("Var") ||
          operand.includes("$."))
      ) {
        const key = operand;
        return localStore[key] !== undefined ? localStore[key] : undefined;
      }
    }
    return operand; // Return as is if it's a literal or unhandled case
  }

  /**
   * Validates all checks for a step
   * @param checks Array of checks to validate
   * @param stepId Current step ID
   * @param localStore Local store for variable evaluation
   * @returns boolean indicating if all checks passed
   */
  validate(
    checks: CheckCoreModel[],
    stepId: string,
    localStore: Record<string, any>
  ): boolean {
    return checks.every((c) => this.evaluateCheck(c, stepId, localStore));
  }

  /**
   * Evaluates a single check with all its conditions
   */
  private evaluateCheck(
    check: CheckCoreModel,
    stepId: string,
    localStore: Record<string, any>
  ): boolean {
    let finalResult = true;
    let previousResult: boolean | null = null;

    for (const condition of check.conditions) {
      // Skip if required fields are missing
      if (this.isValidCondition(condition)) {
        this.runtime.emitRuntimeError("Incomplete condition in check");
        continue;
      }

      const leftValue = this.evaluateOperand(
        condition.leftOperand,
        condition.leftOperandType,
        stepId,
        localStore
      );

      const rightValue = this.evaluateOperand(
        condition.rightOperand,
        condition.rightOperandType,
        stepId,
        localStore
      );

      const currentResult = this.evaluateCondition(
        condition,
        leftValue,
        rightValue
      );

      finalResult =
        previousResult === null
          ? currentResult
          : this.performLogicalOperation(condition, finalResult, currentResult);

      previousResult = currentResult;

      // Short-circuit evaluation
      if (
        !finalResult &&
        condition.logicalOperator === CheckValidator.LOGICAL_OPERATORS.AND
      ) {
        return finalResult;
      }
      if (
        finalResult &&
        condition.logicalOperator === CheckValidator.LOGICAL_OPERATORS.OR
      ) {
        return finalResult;
      }
    }

    return finalResult;
  }

  private isValidCondition(condition: ConditionCoreModel) {
    return (
      condition.leftOperand === undefined ||
      condition.leftOperandType === undefined ||
      condition.operator === undefined ||
      condition.rightOperand === undefined ||
      condition.rightOperandType === undefined
    );
  }

  /**
   * Evaluates a single condition
   */
  private evaluateCondition(
    condition: ConditionCoreModel,
    leftValue: any,
    rightValue: any
  ): boolean {
    switch (condition.operator) {
      case CheckValidator.OPERATORS.EQUAL:
        return leftValue == rightValue;
      case CheckValidator.OPERATORS.STRICT_EQUAL:
        return leftValue === rightValue;
      case CheckValidator.OPERATORS.NOT_EQUAL:
        return leftValue != rightValue;
      case CheckValidator.OPERATORS.STRICT_NOT_EQUAL:
        return leftValue !== rightValue;
      case CheckValidator.OPERATORS.GREATER_THAN:
        return leftValue > rightValue;
      case CheckValidator.OPERATORS.GREATER_THAN_OR_EQUAL:
        return leftValue >= rightValue;
      case CheckValidator.OPERATORS.LESS_THAN:
        return leftValue < rightValue;
      case CheckValidator.OPERATORS.LESS_THAN_OR_EQUAL:
        return leftValue <= rightValue;
      case CheckValidator.OPERATORS.CONTAINS:
        return String(leftValue).includes(String(rightValue));
      case CheckValidator.OPERATORS.STARTS_WITH:
        return String(leftValue).startsWith(String(rightValue));
      case CheckValidator.OPERATORS.ENDS_WITH:
        return String(leftValue).endsWith(String(rightValue));
      default:
        this.runtime.emitRuntimeError(
          `Unsupported operator: ${condition.operator}`
        );
        return false;
    }
  }

  /**
   * Validates HTTP response status code
   * @param status HTTP status code
   * @returns boolean indicating if status is successful (2xx)
   */
  static validateResponseStatus(status: number): boolean {
    return status >= 200 && status < 300;
  }
  performLogicalOperation(
    condition: ConditionCoreModel,
    finalResult: boolean,
    currentResult: boolean
  ): boolean {
    return condition.logicalOperator === CheckValidator.LOGICAL_OPERATORS.AND
      ? finalResult && currentResult
      : finalResult || currentResult;
  }
}
