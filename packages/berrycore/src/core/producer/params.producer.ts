import { NodeType, Params } from "../../lang/ast/Ast";
import { SequenceGenerator } from "../util/SequenceGenerator";
import { ParamsCoreModel } from "./core.model";
import { IProducer, ProducerError } from "./producer";

export class ParamsProducer implements IProducer<ParamsCoreModel, Params> {
  build(ast: Params): ParamsCoreModel {
    if (ast.kind !== NodeType.Params)
      throw new ProducerError(
        "Invalid Node. expected node is " + NodeType[NodeType.Params]
      );

    const p: ParamsCoreModel = {
      id: SequenceGenerator.getNext("params").toString(),
      value: ast.value,
      key: ast.key,
      type: ast.type,
    };
    return p;
  }
}
