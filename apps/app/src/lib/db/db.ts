import Dexie, { type EntityTable } from "dexie";
import type { FolderModel } from "../types/folder.model";

// ─── Interfaces ────────────────────────────────────────────────

/** A top-level isolated namespace that groups files and folders. */
export interface Workspace {
  id: string;
  name: string;
  emoji: string; // e.g. "🚀", "🔬", "📦"
  createdAt: Date;
}

export interface folderTable {
  id: string;
  data: FolderModel[];
  workspaceId: string; // links to Workspace.id
}

export interface fileStore {
  id: string;
  name: string;
  data: Blob;
  createdAt: Date;
  workspaceId: string; // links to Workspace.id
  folderId?: string | null;
}

// ─── Database ──────────────────────────────────────────────────

const db = new Dexie("folderTable") as Dexie & {
  workspaces: EntityTable<Workspace, "id">;
  folderTable: EntityTable<folderTable, "id">;
  fileStore: EntityTable<fileStore, "id">;
};

// Version 1: original schema (kept for existing users)
db.version(1).stores({
  folderTable: "++id",
  fileStore: "++id,name,createdAt",
});

// Version 2: add workspaces table + workspaceId index on existing tables.
// The upgrade function migrates all pre-existing records to the "default" workspace
// so no data is lost.
db.version(2)
  .stores({
    workspaces: "id,name,createdAt",
    folderTable: "++id,workspaceId",
    fileStore: "++id,name,createdAt,workspaceId",
  })
  .upgrade(async (tx) => {
    // Seed the default workspace if not yet present
    const existing = await tx.table("workspaces").get("default");
    if (!existing) {
      await tx.table("workspaces").add({
        id: "default",
        name: "My Workspace",
        emoji: "🚀",
        createdAt: new Date(),
      });
    }

    // Tag all existing folders with the default workspace
    await tx
      .table("folderTable")
      .toCollection()
      .modify({ workspaceId: "default" });

    // Tag all existing files with the default workspace
    await tx
      .table("fileStore")
      .toCollection()
      .modify({ workspaceId: "default" });
  });

// Seed default workspace if missing on database ready
db.on("ready", async () => {
  try {
    const existing = await db.workspaces.get("default");
    if (!existing) {
      await db.workspaces.add({
        id: "default",
        name: "My Workspace",
        emoji: "🚀",
        createdAt: new Date(),
      });
    }
  } catch (e) {
    console.error("Error seeding default workspace:", e);
  }
});

export { db };
