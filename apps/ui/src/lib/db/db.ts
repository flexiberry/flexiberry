import Dexie, { type EntityTable, type Table } from "dexie";

interface folderTable {
  id: string;
  data: any;
}

const db = new Dexie("folderTable") as Dexie & {
  folderTable: EntityTable<
    folderTable,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  folderTable: "++id, data", // primary key "id" (for the runtime!)
});

export type { folderTable };
export { db };
