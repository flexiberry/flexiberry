import { db } from "$lib/db/db";
import { activeWorkspaceId } from "$lib/writable/workspace.store";
import { saasApiClient } from "./saasApiClient";
import { toast } from "svelte-sonner";

/**
 * Computes SHA-256 hash string for text content
 */
async function computeSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Syncs the current active Dexie workspace to Cloudflare SaaS backend
 */
export async function syncActiveWorkspaceToCloud(): Promise<boolean> {
  const currentWsId = activeWorkspaceId.current;
  
  // Query workspace details from Dexie
  const ws = await db.workspaces.get(currentWsId);
  const wsName = ws ? ws.name : "Default Workspace";

  // Query all files for this workspace
  const files = await db.fileStore.where("workspaceId").equals(currentWsId).toArray();

  if (files.length === 0) {
    toast.info("No files found in workspace to sync.");
    return true;
  }

  const syncFiles: Array<{
    relativePath: string;
    contentHash: string;
    sizeBytes: number;
    content?: string;
  }> = [];

  for (const fileRecord of files) {
    let content = "";
    if (fileRecord.data instanceof Blob) {
      content = await fileRecord.data.text();
    } else if (typeof fileRecord.data === "string") {
      content = fileRecord.data;
    }

    const hash = await computeSha256(content);
    syncFiles.push({
      relativePath: fileRecord.name,
      contentHash: hash,
      sizeBytes: content.length,
      content,
    });
  }

  try {
    toast.loading("Syncing workspace folder to Cloudflare...", { id: "cloud-sync" });

    const result = await saasApiClient.syncWorkspace({
      workspaceId: currentWsId,
      workspaceName: wsName,
      files: syncFiles,
    });

    toast.success(`Cloud Sync Complete! (${result.syncedFilesCount} files synced)`, {
      id: "cloud-sync",
    });
    return true;
  } catch (err: any) {
    toast.error(`Cloud Sync Failed: ${err.message}`, { id: "cloud-sync" });
    return false;
  }
}
