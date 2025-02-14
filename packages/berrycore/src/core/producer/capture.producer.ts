import { Capture, NodeType } from "../../lang/ast/Ast";
import { SequenceGenerator } from "../util/SequenceGenerator";
import { CaptureCoreModel } from "./core.model";
import { IProducer, ProducerError } from "./producer";

export class CaptureProducer implements IProducer<CaptureCoreModel, Capture> {
  build(ast: Capture, i?: number): CaptureCoreModel {
    if (ast.kind !== NodeType.Capture)
      throw new ProducerError(
        "Invalid Node. expected node is " + NodeType[NodeType.Capture]
      );

    const c: CaptureCoreModel = {
      id: SequenceGenerator.getNext("capture").toString(),
      key: ast.key,
      value: ast.value,
      type: ast.type,
    };
    return c;
  }
}
