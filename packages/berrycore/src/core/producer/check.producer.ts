import { Check, Condition, NodeType } from "../../lang/ast/Ast";
import { SequenceGenerator } from "../util/SequenceGenerator";
import { CheckCoreModel, ConditionCoreModel } from "./core.model";
import { IProducer, ProducerError } from "./producer";

export class CheckProducer implements IProducer<CheckCoreModel, Check> {
  build(ast: Check): CheckCoreModel {
    if (ast.kind !== NodeType.Check)
      throw new ProducerError(
        "Invalid Node. expected node is " + NodeType[NodeType.Check]
      );

    const c: CheckCoreModel = {
      id: SequenceGenerator.getNext("check").toString(),
      conditions: ast.conditions.map((x) => x),
    };
    return c;
  }
}

export class CondotionsProducer
  implements IProducer<ConditionCoreModel, Condition>
{
  build(ast: Condition): ConditionCoreModel {
    if (ast.kind !== NodeType.Check)
      throw new ProducerError(
        "Invalid Node. expected node is " + NodeType[NodeType.Check]
      );

    const c: ConditionCoreModel = {
      operator: ast.operator,
      leftOperand: ast.leftOperand,
      rightOperand: ast.rightOperand,
      logicalOperator: ast.logicalOperator,
    };
    return c;
  }
}
