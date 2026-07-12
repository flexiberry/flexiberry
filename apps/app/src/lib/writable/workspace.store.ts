import { writable, get } from "svelte/store";
import { liveQuery } from "dexie";
import { db, type Workspace } from "$lib/db/db";

// ─── Active Workspace (persists in localStorage) ───────────────

const STORAGE_KEY = "flexiberry:activeWorkspaceId";

function createWorkspaceStore() {
  const stored =
    typeof localStorage !== "undefined"
      ? (localStorage.getItem(STORAGE_KEY) ?? "default")
      : "default";

  const { subscribe, set } = writable<string>(stored);

  return {
    subscribe,
    /** Switch to a different workspace by ID. */
    switchTo(id: string) {
      set(id);
      localStorage.setItem(STORAGE_KEY, id);
    },
    /** Get the current value synchronously. */
    get current() {
      return get({ subscribe });
    },
  };
}

export const activeWorkspaceId = createWorkspaceStore();

// ─── Workspace CRUD helpers ────────────────────────────────────

export async function createWorkspace(
  name: string,
  emoji = "📁",
): Promise<string> {
  const id = `ws-${Date.now()}`;
  await db.workspaces.add({ id, name, emoji, createdAt: new Date() });
  activeWorkspaceId.switchTo(id);
  return id;
}

export async function renameWorkspace(id: string, name: string, emoji: string) {
  await db.workspaces.update(id, { name, emoji });
}

export async function deleteWorkspace(id: string) {
  // Only delete the workspace record. Files/folders are left in place
  // (tagged with the workspaceId) for potential recovery.
  await db.workspaces.delete(id);

  // If we just deleted the active workspace, fall back to "default"
  if (activeWorkspaceId.current === id) {
    activeWorkspaceId.switchTo("default");
  }
}
