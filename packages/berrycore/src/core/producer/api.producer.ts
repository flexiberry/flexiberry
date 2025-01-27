import { title } from "process";
import { ApiStatement, NodeType } from "../../lang/ast/Ast";
import { ApiCoreModel } from "./core.model";
import { IProducer, ProducerError } from "./producer";

export class ApiProducer implements IProducer<ApiCoreModel, ApiStatement> {
  build(ast: ApiStatement): ApiCoreModel {
    if (ast.kind !== NodeType.ApiFunction)
      throw new ProducerError(
        "Invalid Node. expected node is " + NodeType[NodeType.ApiFunction]
      );

    const a: ApiCoreModel = {
      body: ast.sturct.body,
      bodyType: ast.sturct.type,
      url: ast.sturct.url,
      header: ast.sturct.header,
      methode: ast.method,
      params: undefined,
      interpolation: undefined,
      id: ast.identifier,
      title: ast.title,
    };

    return a;
  }
}
