/**
 * A static class for generating and managing sequence numbers across the application.
 */

const SEQUENCE_NAMES = {
  TASK: "task",
  CAPTURE: "capture",
  STEP: "step",
  PARAMS: "params",
  CHECK: "check",
} as const;

export class SequenceGenerator {
  private static sequences: Map<string, number> = new Map();

  /**
   * Get the next number in a sequence
   * @param sequenceName - The name/identifier of the sequence
   * @param startFrom - Optional starting number for new sequences (default: 1)
   * @returns The next number in the sequence
   */
  public static getNext(
    sequenceName: keyof typeof SEQUENCE_NAMES,
    startFrom: number = 1
  ): number {
    if (!this.sequences.has(sequenceName)) {
      this.sequences.set(sequenceName, startFrom - 1);
    }

    const nextValue = this.sequences.get(sequenceName)! + 1;
    this.sequences.set(sequenceName, nextValue);
    return nextValue;
  }

  /**
   * Get the current number in a sequence without incrementing
   * @param sequenceName - The name/identifier of the sequence
   * @returns The current number in the sequence, or 0 if sequence doesn't exist
   */
  public static getCurrent(sequenceName: keyof typeof SEQUENCE_NAMES): number {
    return this.sequences.get(sequenceName) || 0;
  }

  /**
   * Reset a specific sequence to a given value
   * @param sequenceName - The name/identifier of the sequence
   * @param value - The value to reset to (default: 0)
   */
  public static reset(sequenceName: string, value: number = 0): void {
    this.sequences.set(sequenceName, value);
  }

  /**
   * Reset all sequences
   */
  public static resetAll(): void {
    this.sequences.clear();
  }

  /**
   * Check if a sequence exists
   * @param sequenceName - The name/identifier of the sequence
   * @returns boolean indicating if the sequence exists
   */
  public static hasSequence(
    sequenceName: keyof typeof SEQUENCE_NAMES
  ): boolean {
    return this.sequences.has(sequenceName);
  }
}
