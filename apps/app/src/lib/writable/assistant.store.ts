import { writable } from "svelte/store";

/** Tracks if the global assistant drawer is open. */
export const assistantOpen = writable(false);

/** Binds to dashboard's file/folder filter. */
export const dashboardSearchQuery = writable("");

/** Tracks current active directory in the dashboard. */
export const dashboardCurrentFolderId = writable<string | null>(null);
