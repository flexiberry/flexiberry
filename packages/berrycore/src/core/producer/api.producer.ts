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

    let interPolation: string[] = [];
    if (ast.sturct.body !== undefined) {
      interPolation.push(...this.extractInterpolation(ast.sturct.body));
    }
    if (ast.sturct.url !== undefined) {
      interPolation.push(...this.extractInterpolation(ast.sturct.url));
    }
    if (ast.sturct.header !== undefined) {
      for (const key in ast.sturct.header) {
        interPolation.push(
          ...this.extractInterpolation(ast.sturct.header[key])
        );
      }
    }

    const a: ApiCoreModel = {
      body: ast.sturct.body,
      bodyType: ast.sturct.type,
      url: ast.sturct.url,
      header: ast.sturct.header,
      method: ast.method,
      params: undefined,
      interpolation: interPolation,
      id: ast.identifier,
      title: ast.title,
    };

    return a;
  }
  extractInterpolation(input: string): string[] {
    const regex = /{{(.*?)}}/g;
    const keys: string[] = [];
    let match;

    while ((match = regex.exec(input)) !== null) {
      keys.push(match[1]); // Extract the key from the match
    }

    return keys;
  }
}
