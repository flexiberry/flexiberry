import { derived, writable } from "svelte/store";
import type { FolderModel } from "../types/folder.model";
import { db, type folderTable } from "$lib/db/db";
import { removeIfFileNameisEmpty } from "../util/util";

export const savedFolders = writable<FolderModel[]>([]);

export function updateFolder(folder: FolderModel[]) {
  removeIfFileNameisEmpty(folder);
  savedFolders.update((f) => folder);
  db.folderTable.update("folder", {
    data: folder,
    id: "folder",
  });
}

export function getFolder() {
  return derived(savedFolders, async (s) => {
    let d = await db.folderTable.get("folder");
    console.log(d);
    return d?.data || s;
  });
}
