/**
 * Environment — Scoped Variable Store
 *
 * Maintains a chain of scopes: global → task → step.
 * Each scope is a Map<string, RuntimeValue>.
 * Lookup walks up the parent chain.
 */

import { RuntimeValue } from "./interpreter.types";
import { VariableNotFoundError } from "./errors";

export class Environment {
  private readonly store: Map<string, RuntimeValue> = new Map();
  private readonly parent: Environment | null;

  constructor(parent: Environment | null = null) {
    this.parent = parent;
  }

  /**
   * Declare a new variable in this scope.
   * Overwrites if it already exists in this scope.
   */
  declare(name: string, value: RuntimeValue): void {
    this.store.set(name, value);
  }

  /**
   * Look up a variable, walking up the scope chain.
   * Throws VariableNotFoundError if not found in any scope.
   */
  lookup(name: string): RuntimeValue {
    if (this.store.has(name)) {
      return this.store.get(name)!;
    }
    if (this.parent) {
      return this.parent.lookup(name);
    }
    throw new VariableNotFoundError(name);
  }

  /**
   * Try to look up a variable without throwing.
   * Returns undefined if not found.
   */
  tryLookup(name: string): RuntimeValue | undefined {
    if (this.store.has(name)) {
      return this.store.get(name)!;
    }
    if (this.parent) {
      return this.parent.tryLookup(name);
    }
    return undefined;
  }

  /**
   * Assign a value to an existing variable in the nearest scope.
   * If not found, declares it in this scope.
   */
  assign(name: string, value: RuntimeValue): void {
    if (this.store.has(name)) {
      this.store.set(name, value);
      return;
    }
    if (this.parent) {
      try {
        this.parent.lookup(name); // check if exists in parent
        this.parent.assign(name, value);
        return;
      } catch {
        // not in parent, declare locally
      }
    }
    this.store.set(name, value);
  }

  /**
   * Create a child scope inheriting from this environment.
   */
  createChild(): Environment {
    return new Environment(this);
  }

  /**
   * Get all variables in this scope (not parents).
   */
  getOwnEntries(): ReadonlyMap<string, RuntimeValue> {
    return this.store;
  }

  /**
   * Get all variables including parent scopes (closest wins).
   */
  getAllEntries(): Map<string, RuntimeValue> {
    const merged = new Map<string, RuntimeValue>();
    if (this.parent) {
      for (const [k, v] of this.parent.getAllEntries()) {
        merged.set(k, v);
      }
    }
    for (const [k, v] of this.store) {
      merged.set(k, v);
    }
    return merged;
  }
}
