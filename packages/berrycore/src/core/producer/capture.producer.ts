// import { type Capture, NodeType } from "../../lang/ast/ast-node-type";
// import { SequenceGenerator } from "../util/sequence-generator";
// import type { CaptureCoreModel } from "./core.model";
// import { type IProducer, ProducerError } from "./producer";

// export class CaptureProducer implements IProducer<CaptureCoreModel, Capture> {
//   build(ast: Capture, i?: number): CaptureCoreModel {
//     if (ast.kind !== NodeType.Capture)
//       throw new ProducerError(
//         "Invalid Node. expected node is " + NodeType[NodeType.Capture]
//       );

//     const c: CaptureCoreModel = {
//       id: SequenceGenerator.getNext("CAPTURE").toString(),
//       key: ast.key,
//       value: ast.value,
//       type: ast.type,
//     };
//     return c;
//   }
// }
