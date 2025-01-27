import { NodeType, Step } from "../../lang/ast/Ast";
import { StepCoreModel } from "./core.model";
import { IProducer, ProducerError } from "./producer";

export class StepProducer implements IProducer<StepCoreModel, Step> {
  build(ast: Step, i?: number): StepCoreModel {
    if (ast.kind !== NodeType.Step)
      throw new ProducerError(
        "Invalid Node. expected node is " + NodeType[NodeType.Step]
      );

    const s: StepCoreModel = {
      action: ast.action,
      target: ast.target,
      functionId: ast.functionId,
      id: `${i}`,
      title: ast.title,

      //   captures: ast.capture.map(x=>x),
      //   checks: ast.checks.map(x=>x),
      //   params: ast.params,
    };
    return s;
  }
}
