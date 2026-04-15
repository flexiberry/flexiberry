import { derived, writable } from "svelte/store";
import type { FolderModel } from "../types/folder.model";
import { db, type folderTable } from "$lib/db/db";
import { removeIfFileNameisEmpty } from "../util/util";

export const savedFolders = writable<FolderModel[]>([]);

export async function updateFolder(folder: FolderModel[]) {
  removeIfFileNameisEmpty(folder);
  savedFolders.update((f) => folder);
  const count = await db.folderTable.count();
  //   if (count > 0) {
  //     db.folderTable.update("folder", {
  //       data: folder,
  //       id: "folder",
  //     });
  //   } else {
  //     db.folderTable.add({
  //       data: folder,
  //       id: "folder",
  //     });
  //   }
}
