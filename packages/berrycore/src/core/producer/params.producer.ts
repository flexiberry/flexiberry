// import { NodeType, type Params } from "../../lang/ast/ast-node-type";
// import { SequenceGenerator } from "../util/sequence-generator";
// import type { ParamsCoreModel } from "./core.model";
// import { type IProducer, ProducerError } from "./producer";

// export class ParamsProducer implements IProducer<ParamsCoreModel, Params> {
//   build(ast: Params): ParamsCoreModel {
//     if (ast.kind !== NodeType.Params)
//       throw new ProducerError(
//         "Invalid Node. expected node is " + NodeType[NodeType.Params]
//       );

//     const p: ParamsCoreModel = {
//       id: SequenceGenerator.getNext("PARAMS").toString(),
//       value: ast.value,
//       key: ast.key,
//       type: ast.type,
//     };
//     return p;
//   }
// }
