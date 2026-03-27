// import { NodeType, type Variable } from "./../../lang/ast/ast-node-type";
// import type { VarCoreModel } from "./core.model";
// import { type IProducer, ProducerError } from "./producer";

// /**
//  * EnvProducer class responsible for producing environment models from AST.
//  */
// export class VarProducer implements IProducer<VarCoreModel[], Variable> {
//   build(ast: Variable | undefined): VarCoreModel[] {
//     if (ast === undefined) return [];

//     if (ast.kind !== NodeType.Variable)
//       throw new ProducerError(
//         "Invalid Node. expected node is " + NodeType[NodeType.Variable]
//       );

//     return ast.value.map((x: { key: any; value: any; dataType: string; }) => {
//       const t: VarCoreModel = {
//         comments: ast.comments,
//         id: ast.identifier,
//         key: x.key,
//         pointer: ast.pointer,
//         scope: ast.pointer ? "ENVIRONMENT" : "GLOBAL",
//         value: x.value,
//         valueType: x.dataType == "identifier" ? "IDENTIFIER" : "LITERAL",
//         dataType: x.dataType,
//         statement: ast.pointer ? `Var.${ast.pointer}.${x.key}` : `Var.${x.key}`,
//       };
//       return t;
//     });
//   }
// }
