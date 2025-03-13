import { NodeType, type Task } from "../../lang/ast/ast-node-type";
import { SequenceGenerator } from "../util/sequence-generator";
import type { TaskCoreModel } from "./core.model";
import { type IProducer, ProducerError } from "./producer";
import { StepProducer } from "./step.producer";

export class TaskProducer implements IProducer<TaskCoreModel, Task> {
  private stepProducer: StepProducer = new StepProducer();

  build(ast: Task, i?: number): TaskCoreModel {
    if (ast.kind !== NodeType.Task)
      throw new ProducerError(
        "Invalid Node. expected node is " + NodeType[NodeType.Task]
      );

    const t: TaskCoreModel = {
      title: ast.title,
      steps: ast.steps.map((x) => this.stepProducer.build(x)),
      id: SequenceGenerator.getNext("TASK").toString(),
    };
    return t;
  }
}
