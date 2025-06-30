import { type ApiStatement, NodeType } from "../../lang/ast/ast-node-type";
import type { ApiCoreModel } from "./core.model";
import { type IProducer, ProducerError } from "./producer";
import { InterpolationUtil } from "../util/interpolations";

export class ApiProducer implements IProducer<ApiCoreModel, ApiStatement> {
  build(ast: ApiStatement): ApiCoreModel {
    if (ast.kind !== NodeType.ApiFunction)
      throw new ProducerError(
        "Invalid Node. expected node is " + NodeType[NodeType.ApiFunction]
      );

    const interPolation: string[] = [];
    if (ast.sturct.body !== undefined) {
      interPolation.push(
        ...InterpolationUtil.extractInterpolation(ast.sturct.body)
      );
    }
    if (ast.sturct.url !== undefined) {
      interPolation.push(
        ...InterpolationUtil.extractInterpolation(ast.sturct.url)
      );
    }
    if (ast.sturct.header !== undefined) {
      for (const key in ast.sturct.header) {
        interPolation.push(
          ...InterpolationUtil.extractInterpolation(ast.sturct.header[key])
        );
      }
    }

    const a: ApiCoreModel = {
      body: ast.sturct.body,
      bodyType: ast.sturct.type,
      url: ast.sturct.url,
      header: ast.sturct.header,
      method: ast.method,
      interpolation: interPolation,
      id: ast.identifier,
      title: ast.title,
    };

    return a;
  }
}
