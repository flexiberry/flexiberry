import { db } from "../db/db";

// ─────────────────────────────────────────────────────────────────
// FileContext
// Encodes the full location of a file as parsed from the URL.
//
// URL forms:
//   /$workspaceId/$fileName           → root file
//   /$workspaceId/$folderId/$fileName → file inside a folder
//   /$fileName                        → legacy (no workspace)
// ─────────────────────────────────────────────────────────────────

export interface FileContext {
  workspaceId: string;
  folderId: string | null;
  fileName: string;
}

// ─── Parse URL param into a FileContext ──────────────────────────

export function parseFileContext(tabsParam: string): FileContext {
  const segments = (tabsParam ?? "").split("/").filter(Boolean);

  if (segments.length >= 3) {
    return {
      workspaceId: segments[0],
      folderId: segments[1],
      fileName: segments[2],
    };
  }

  if (segments.length === 2) {
    return {
      workspaceId: segments[0],
      folderId: null,
      fileName: segments[1],
    };
  }

  // Single segment — legacy format, treat as filename under "default" workspace
  return {
    workspaceId: "default",
    folderId: null,
    fileName: segments[0] ?? "",
  };
}

// ─── Build a goto-ready URL path ─────────────────────────────────

export function buildFilePath(
  workspaceId: string,
  fileName: string,
  folderId?: string | null,
): string {
  if (folderId) {
    return `/${workspaceId}/${folderId}/${fileName}`;
  }
  return `/${workspaceId}/${fileName}`;
}

// ─── Get a file's text content (workspace-aware) ─────────────────

export async function getFile(ctx: FileContext): Promise<string> {
  // Primary lookup: workspaceId + name + folderId match
  let record = await db.fileStore
    .where("workspaceId")
    .equals(ctx.workspaceId)
    .and(
      (f) =>
        f.name === ctx.fileName &&
        (f.folderId ?? null) === (ctx.folderId ?? null),
    )
    .first();

  // Fallback 1: Fallback to name-only within workspace (if folder movement happened)
  if (!record) {
    record = await db.fileStore
      .where("workspaceId")
      .equals(ctx.workspaceId)
      .and((f) => f.name === ctx.fileName)
      .first();
  }

  // Fallback 2: Legacy name-only (supports records without workspaceId)
  if (!record) {
    record = await db.fileStore.where("name").equals(ctx.fileName).first();
  }

  if (record?.data) {
    return blobToString(record.data);
  }
  return "";
}

// ─── Save / overwrite a file (workspace-aware) ───────────────────

export async function saveFile(
  ctx: FileContext,
  fileBlob: Blob,
): Promise<void> {
  // 1. Try to find the existing exact record to get its primary key (id)
  const existing = await db.fileStore
    .where("workspaceId")
    .equals(ctx.workspaceId)
    .and(
      (f) =>
        f.name === ctx.fileName &&
        (f.folderId ?? null) === (ctx.folderId ?? null),
    )
    .first();

  const fileData = {
    data: fileBlob,
    name: ctx.fileName,
    workspaceId: ctx.workspaceId,
    folderId: ctx.folderId ?? null,
    createdAt: existing?.createdAt ?? new Date(),
  };

  if (existing) {
    // 2. Overwrite the existing record using its auto-increment ID
    await db.fileStore.update(existing.id, fileData);
  } else {
    // 3. Create a new record
    await db.fileStore.add(fileData as any);
  }
}

// ─── Blob → string helper ─────────────────────────────────────────

function blobToString(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(blob);
  });
}
