import {
  type Environment,
  NodeType,
  type VariableKv,
} from "../../lang/ast/ast-node-type";
import type { EnvCoreModel, VarCoreModel } from "./core.model";
import { type IProducer, ProducerError } from "./producer";

/**
 * EnvProducer class responsible for producing environment models from AST.
 */
export class EnvProducer implements IProducer<EnvCoreModel[], Environment> {
  build(ast: Environment | undefined): EnvCoreModel[] {
    if (ast === undefined) return [];
    if (ast?.kind != NodeType.Environment)
      throw new ProducerError(
        "Invalid Node. expected node is " + NodeType[NodeType.Environment]
      );

    return ast.value.map((x) => {
      const t: EnvCoreModel = {
        scope: "GLOBAL",
        values: x,
      };
      return t;
    });
  }
}
