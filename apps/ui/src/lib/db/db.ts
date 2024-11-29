import Dexie, { type EntityTable, type Table } from "dexie";
import type { FolderModel } from "../types/folder.model";

interface folderTable {
  id: string;
  data: FolderModel[];
}

interface fileStore {
  id: string;
  name: string;
  data: Blob;
  createdAt: Date;
}

const db = new Dexie("folderTable") as Dexie & {
  folderTable: EntityTable<folderTable, "id">;
  fileStore: EntityTable<fileStore, "id">;
};

// Schema declaration:
db.version(1).stores({
  folderTable: "++id", // primary key "id" (for the runtime!)
  fileStore: "++id,name,createdAt", // primary key "id" (for the runtime!)
});

export type { folderTable, fileStore };
export { db };
