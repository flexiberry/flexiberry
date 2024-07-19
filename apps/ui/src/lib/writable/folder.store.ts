import { derived, writable } from "svelte/store";
import type { Folder } from "../types/folder.model";

export const savedFolders = writable<Folder[]>([]);

export function updateFolder(folder: Folder[]) {
  savedFolders.update((f) => folder);
}

export function getFolder() {
  return derived(savedFolders, (s) => s);
}
