import { type IOAdapter, ExecutionCommand } from "@flexiberry/berrycore";

export class WebUIAdapter implements IOAdapter {
  private onPrompt: (message: string) => Promise<string>;
  private onCommandCallback?: (cmd: ExecutionCommand) => void;

  constructor(onPrompt: (message: string) => Promise<string>) {
    this.onPrompt = onPrompt;
  }

  prompt(message: string): Promise<string> {
    return this.onPrompt(message);
  }

  async confirm(message: string): Promise<boolean> {
    const res = await this.prompt(message + " (y/n)");
    return res.toLowerCase() === "y" || res.toLowerCase() === "yes";
  }

  onCommand(handler: (cmd: ExecutionCommand) => void): void {
    this.onCommandCallback = handler;
  }

  triggerCommand(cmd: ExecutionCommand): void {
    this.onCommandCallback?.(cmd);
  }
}
