import { type Check, type Condition, NodeType } from "./ast-node-type";
import { TokenType } from "../tokenizer/tokenType";
import { BaseParser } from "./base-parser";

export class CheckParser extends BaseParser {
  parseCheck(): Check[] {
    // Expect and consume Check token
    this.expect(TokenType.Check, "Expected check keyword");
    const checkList: Check[] = [];
    // Parse conditions until next block or EOF
    while (this.at().type === TokenType.Hyphen) {
      const check: Check = {
        kind: NodeType.Check,
        conditions: [],
      };
      this.eat(); // Consume hyphen
      const condition = this.parseCondition();
      check.conditions.push(...condition);

      checkList.push(check);
    }

    return checkList;
  }

  private parseCondition(): Condition[] {
    const conditionList: Condition[] = [];

    let hasLogicalOperator: boolean = false;
    do {
      const condition: Condition = {
        kind: NodeType.Check,
        operator: undefined,
        leftOperand: undefined,
        rightOperand: undefined,
        logicalOperator: undefined,
      };
      if (this.at().type === TokenType.Lhs) {
        const lhs = this.at();
        condition.leftOperand = lhs.value;
        condition.leftOperandType = lhs.value.match(
          /\s*([a-zA-Z_\.\-][a-zA-Z0-9_\.\-]*)/
        )
          ? "IDENTIFIER"
          : "LITERAL";
      }
      this.eat();
      // Parse operator
      if (this.at().type === TokenType.Operator) {
        condition.operator = this.eat().value;
      }

      // Parse right operand
      const rhs = this.expect(TokenType.Rhs, "Expected right operand");
      condition.rightOperand = rhs.value;
      condition.rightOperandType = rhs.value.match(
        /\s*([a-zA-Z_\.\-][a-zA-Z0-9_\.\-]*)/
      )
        ? "IDENTIFIER"
        : "LITERAL";

      // Parse logical operator if present (AND/OR)
      if (this.at().type === TokenType.And || this.at().type === TokenType.Or) {
        condition.logicalOperator = this.eat().value;
        hasLogicalOperator = true;
      } else {
        hasLogicalOperator = false;
      }
      conditionList.push(condition);
    } while (hasLogicalOperator);

    return conditionList;
  }
}
