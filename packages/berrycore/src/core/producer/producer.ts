import { ProgramBody } from "../../lang/ast/Ast";
import { ApiProducer } from "./api.producer";
import { CoreModel } from "./core.model";
import { EnvProducer } from "./env.producer";
import { VarProducer } from "./var.producer";

export interface IProducer<T, V> {
  build(ast: V): T;
}

export class ProducerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProducerError";
  }
}

export class Producer implements IProducer<CoreModel, ProgramBody> {
  private envProducer: EnvProducer = new EnvProducer();
  private varProducer: VarProducer = new VarProducer();
  private apiProducer: ApiProducer = new ApiProducer();

  /**
   * Builds a CoreModel from the given ProgramBody AST.
   * @param ast - The ProgramBody AST to build the CoreModel from.
   * @returns The constructed CoreModel.
   * @throws ProducerError if the AST is invalid or not set.
   */
  build(ast: ProgramBody): CoreModel {
    if (!ast || typeof ast !== "object") {
      throw new ProducerError("Invalid AST: Programs are not set or invalid.");
    }

    let e = this.envProducer.build(ast.environment);
    let v = (ast.variables ?? [])
      .map((x) => this.varProducer.build(x))
      .flatMap((x) => x);
    let a = ast.api.map((x) => this.apiProducer.build(x));

    let core: CoreModel = {
      apis: a,
      environments: e,
      variables: v,
    };

    return core;
  }
}
