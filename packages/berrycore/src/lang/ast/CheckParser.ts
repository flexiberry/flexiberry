import { Check, Condition, NodeType } from "./Ast";
import { TokenType } from "../tokenizer/tokenType";
import { BaseParser } from "./BaseParser";

export class CheckParser extends BaseParser {
  parseCheck(): Check[] {
    // Expect and consume Check token
    this.expect(TokenType.Check, "Expected check keyword");
    let checkList: Check[] = [];
    // Parse conditions until next block or EOF
    while (this.at().type === TokenType.Hyphen) {
      const check: Check = {
        kind: NodeType.Check,
        conditions: [],
      };
      this.eat(); // Consume hyphen
      const condition = this.parseCondition();
      check.conditions.push(...condition);
      console.log(check);

      checkList.push(check);
      console.log(this.at().value);
    }

    return checkList;
  }

  private parseCondition(): Condition[] {
    let conditionList: Condition[] = [];

    let hasLogicalOperator: boolean = false;
    do {
      const condition: Condition = {
        kind: NodeType.Check,
        operator: undefined,
        leftOperand: undefined,
        rightOperand: undefined,
        logicalOperator: undefined,
      };

      // Parse left operand if present
      if (this.at().type === TokenType.Lhs) {
        this.eat(); // Consume Lhs token
        if (this.at().type === TokenType.OperandsScalar) {
          condition.leftOperand = this.at().value;
          this.eat();
        } else {
          condition.leftOperand = this.expect(
            TokenType.Operands,
            "Expected left operand"
          ).value;
        }
      }

      // Parse operator
      if (this.at().type === TokenType.Operator) {
        condition.operator = this.eat().value;
      }

      // Parse right operand
      if (this.at().type === TokenType.Rhs) {
        this.eat(); // Consume Rhs token
        if (this.at().type === TokenType.OperandsScalar) {
          condition.rightOperand = this.at().value;
          this.eat();
        } else {
          condition.rightOperand = this.expect(
            TokenType.Operands,
            "Expected right operand"
          ).value;
        }
      }

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
