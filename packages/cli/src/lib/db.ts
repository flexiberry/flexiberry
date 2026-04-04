/**
 * db.ts
 *
 * A lightweight JSON file-based key-value store.
 * Replaces the `file-system-db` (FSDB) dependency.
 *
 * Supports get / set / delete / has operations with optional pretty formatting.
 * All mutations are written synchronously so CLI commands are always consistent.
 */

import * as fs from "fs";
import * as path from "path";

export class FileDB {
  private readonly filePath: string;
  /** In-memory cache of the entire JSON document. */
  private data: Record<string, unknown>;

  /**
   * @param filePath  Absolute or relative path to the JSON backing file.
   *                  The parent directory is created automatically if absent.
   * @param pretty    When true, the JSON file is written with 2-space indent.
   */
  constructor(filePath: string, pretty: boolean = false) {
    this.filePath = path.resolve(filePath);
    this.data = this.load();
    // Keep a reference to pretty for writes
    Object.defineProperty(this, "_pretty", { value: pretty, writable: false });
  }

  private get pretty(): boolean {
    return (this as unknown as Record<string, boolean>)["_pretty"];
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /** Read + parse the JSON file from disk. Returns {} on missing/corrupt file. */
  private load(): Record<string, unknown> {
    try {
      if (!fs.existsSync(this.filePath)) return {};
      const raw = fs.readFileSync(this.filePath, "utf8").trim();
      if (!raw) return {};
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  /** Serialise + write the in-memory cache to disk. */
  private save(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      this.filePath,
      this.pretty ? JSON.stringify(this.data, null, 2) : JSON.stringify(this.data),
      "utf8"
    );
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Retrieve a stored value by key.
   * Returns `null` when the key does not exist (matching FSDB behaviour).
   */
  get<T = unknown>(key: string): T | null {
    return key in this.data ? (this.data[key] as T) : null;
  }

  /**
   * Store a value under `key`.  Writes to disk immediately.
   */
  set<T = unknown>(key: string, value: T): void {
    this.data[key] = value;
    this.save();
  }

  /**
   * Remove a key from the store.  No-op when key is absent.
   */
  delete(key: string): void {
    if (key in this.data) {
      delete this.data[key];
      this.save();
    }
  }

  /** Returns `true` when the key exists (even if the value is null/undefined). */
  has(key: string): boolean {
    return key in this.data;
  }

  /** Returns every top-level key currently stored. */
  keys(): string[] {
    return Object.keys(this.data);
  }

  /** Wipes all stored data and persists the empty state to disk. */
  clear(): void {
    this.data = {};
    this.save();
  }
}
