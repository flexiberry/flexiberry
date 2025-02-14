import { NodeType, Step } from "../../lang/ast/Ast";
import { SequenceGenerator } from "../util/SequenceGenerator";
import { CaptureProducer } from "./capture.producer";
import { CheckProducer } from "./check.producer";
import { StepCoreModel } from "./core.model";
import { ParamsProducer } from "./params.producer";
import { IProducer, ProducerError } from "./producer";

export class StepProducer implements IProducer<StepCoreModel, Step> {
  private captureProducer: CaptureProducer = new CaptureProducer();
  private checkProducer: CheckProducer = new CheckProducer();
  private paramsProducer: ParamsProducer = new ParamsProducer();

  build(ast: Step): StepCoreModel {
    if (ast.kind !== NodeType.Step)
      throw new ProducerError(
        "Invalid Node. expected node is " + NodeType[NodeType.Step]
      );

    const s: StepCoreModel = {
      action: ast.action,
      target: ast.target,
      functionId: ast.functionId,
      id: SequenceGenerator.getNext("STEP").toString(),
      title: ast.title,
      capture: ast.capture.map((x) => this.captureProducer.build(x)),
      check: ast.check.map((x) => this.checkProducer.build(x)),
      params: ast.params.map((x) => this.paramsProducer.build(x)),
    };
    return s;
  }
}
