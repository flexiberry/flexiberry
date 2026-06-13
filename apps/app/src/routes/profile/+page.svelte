<script lang="ts">
  import { user } from "$lib/writable/auth.store";
  import { db } from "$lib/db/db";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import { 
    ArrowLeft, 
    Download, 
    Upload, 
    Shield, 
    Calendar, 
    Mail, 
    User as UserIcon, 
    Database, 
    AlertTriangle,
    RefreshCw
  } from "lucide-svelte";
  import { onMount } from "svelte";

  let exporting = false;
  let importing = false;
  let fileInput: HTMLInputElement;
  
  // Import modal state
  let showImportModal = false;
  let importedData: any = null;
  let importStrategy: "merge" | "overwrite" = "merge";

  // Navigation back helper
  function goBack() {
    goto("/");
  }

  // Helper: Convert Blob to Base64
  async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Helper: Convert Base64 back to Blob
  function base64ToBlob(base64: string, mimeType = 'text/plain'): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  // Handle Export Backup
  async function handleExport() {
    exporting = true;
    try {
      // 1. Fetch all records from local DB
      const workspaces = await db.workspaces.toArray();
      const folders = await db.folderTable.toArray();
      const files = await db.fileStore.toArray();

      // 2. Serialize files by reading Blob data as Base64 strings
      const serializedFiles = await Promise.all(
        files.map(async (file) => {
          const base64 = await blobToBase64(file.data);
          return {
            id: file.id,
            name: file.name,
            createdAt: file.createdAt.toISOString(),
            workspaceId: file.workspaceId,
            folderId: file.folderId || null,
            base64Data: base64,
            mimeType: file.data.type || 'text/plain'
          };
        })
      );

      // 3. Compile backup payload
      const backupPayload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        exportedBy: $user?.email || "anonymous",
        workspaces,
        folders,
        files: serializedFiles
      };

      // 4. Generate JSON download
      const jsonString = JSON.stringify(backupPayload, null, 2);
      const backupBlob = new Blob([jsonString], { type: "application/json" });
      const downloadUrl = URL.createObjectURL(backupBlob);
      
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `flexiberry_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      // Cleanup
      URL.revokeObjectURL(downloadUrl);
      toast.success("Workspace backup exported successfully!");
    } catch (e: any) {
      console.error(e);
      toast.error(`Export failed: ${e.message || e}`);
    } finally {
      exporting = false;
    }
  }

  // Handle File Input Selection
  function triggerFileInput() {
    fileInput.click();
  }

  // Read selected backup JSON file
  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    importing = true;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        
        // Basic schema validation
        if (!parsed.workspaces || !parsed.folders || !parsed.files) {
          throw new Error("Invalid backup file structure. Missing key tables.");
        }
        
        importedData = parsed;
        showImportModal = true;
      } catch (err: any) {
        toast.error(`Invalid backup file: ${err.message || err}`);
      } finally {
        importing = false;
        // Reset file input
        target.value = "";
      }
    };
    reader.readAsText(file);
  }

  // Execute Database Restore/Import
  async function executeImport() {
    if (!importedData) return;
    
    showImportModal = false;
    const toastId = toast.loading("Restoring workspace data...");

    try {
      const workspaces = importedData.workspaces;
      const folders = importedData.folders;
      const files = importedData.files;

      // Restructure files back into local Blobs
      const restoredFiles = files.map((f: any) => ({
        id: f.id,
        name: f.name,
        createdAt: new Date(f.createdAt),
        workspaceId: f.workspaceId,
        folderId: f.folderId || null,
        data: base64ToBlob(f.base64Data, f.mimeType)
      }));

      // Perform DB Operations
      if (importStrategy === "overwrite") {
        await db.transaction("rw", [db.workspaces, db.folderTable, db.fileStore], async () => {
          await db.workspaces.clear();
          await db.folderTable.clear();
          await db.fileStore.clear();

          await db.workspaces.bulkPut(workspaces);
          await db.folderTable.bulkPut(folders);
          await db.fileStore.bulkPut(restoredFiles);
        });
        toast.success("Database overwritten and restored successfully!", { id: toastId });
      } else {
        // Merge mode: put items (which overwrites matching keys but preserves non-overlapping keys)
        await db.transaction("rw", [db.workspaces, db.folderTable, db.fileStore], async () => {
          await db.workspaces.bulkPut(workspaces);
          await db.folderTable.bulkPut(folders);
          await db.fileStore.bulkPut(restoredFiles);
        });
        toast.success("Database merged and restored successfully!", { id: toastId });
      }
      
      // Delay slightly and reload home to sync workspace states
      setTimeout(() => {
        goto("/");
      }, 1000);
    } catch (e: any) {
      console.error(e);
      toast.error(`Import failed: ${e.message || e}`, { id: toastId });
    } finally {
      importedData = null;
    }
  }

  // Get display name & details
  $: displayName = $user?.isAnonymous 
    ? "Guest User" 
    : ($user?.displayName || $user?.email?.split("@")[0] || "Developer");
  
  $: email = $user?.isAnonymous 
    ? "No email bound (Guest)" 
    : ($user?.email || "No email available");

  $: provider = $user?.isAnonymous
    ? "Anonymous (Guest Mode)"
    : ($user?.providerData?.[0]?.providerId === "google.com" 
      ? "Google Account" 
      : ($user?.providerData?.[0]?.providerId === "github.com" 
        ? "GitHub Account" 
        : "Email/Password"));

  $: creationDate = $user?.metadata?.creationTime
    ? new Date($user.metadata.creationTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : "Unknown date";
    
  $: avatarInitial = ($user?.isAnonymous ? "G" : (displayName?.[0] || "D")).toUpperCase();
</script>

<div class="h-full w-full bg-background text-foreground flex flex-col font-sans overflow-hidden relative">
  <!-- Animated Background Orbs (matches +page.svelte dashboard) -->
  <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-background">
    <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 dark:bg-primary/10 rounded-full blur-[100px] animate-blob"></div>
    <div class="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
    <div class="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] bg-violet-500/20 dark:bg-violet-500/10 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
    <div class="absolute inset-0 opacity-50" style="background-image: radial-gradient(hsl(var(--muted-foreground)/0.2) 1px, transparent 1px); background-size: 10px 10px;"></div>
  </div>

  <div class="flex flex-col h-full w-full relative z-10 overflow-y-auto">
    <!-- Top Nav Header -->
    <div class="max-w-[70rem] mx-auto w-full px-8 pt-6">
      <button 
        class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground bg-card border border-border/80 px-3.5 py-2 rounded-xl transition-all duration-200 shadow-sm hover:scale-[0.98]"
        on:click={goBack}
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </button>
    </div>

    <!-- Main Container -->
    <div class="max-w-[70rem] mx-auto w-full px-8 py-8 flex-1 flex flex-col gap-8">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-foreground">Developer Settings</h1>
        <p class="text-sm text-muted-foreground mt-1">Manage your active authentication session and workspace backups.</p>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        <!-- Left: Profile Info Card -->
        <div class="md:col-span-1 bg-card/85 dark:bg-card/75 border border-border/70 backdrop-blur-md rounded-2xl p-6 shadow-lg flex flex-col items-center text-center">
          <!-- User Profile Picture -->
          {#if $user?.photoURL}
            <img 
              src={$user.photoURL} 
              alt={displayName} 
              class="w-20 h-20 rounded-2xl object-cover border border-primary/20 shadow-md mb-4"
              referrerpolicy="no-referrer"
            />
          {:else}
            <div class="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-2xl shadow-sm mb-4">
              {avatarInitial}
            </div>
          {/if}

          <!-- User Details -->
          <h2 class="text-lg font-bold text-foreground leading-snug">{displayName}</h2>
          <span class="text-xs text-muted-foreground mt-0.5 truncate max-w-full px-2">{email}</span>

          <div class="w-full border-t border-border/60 my-5"></div>

          <!-- Attributes metadata list -->
          <div class="w-full space-y-3.5 text-left text-xs font-semibold">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground flex items-center gap-1.5">
                <Shield size={13} />
                Provider
              </span>
              <span class="text-foreground">{provider}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground flex items-center gap-1.5">
                <Calendar size={13} />
                Created
              </span>
              <span class="text-foreground">{creationDate}</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-muted-foreground flex items-center gap-1.5">
                <Database size={13} />
                Cache Location
              </span>
              <span class="text-foreground bg-primary/15 text-primary px-1.5 py-0.5 rounded uppercase tracking-widest text-[9px]">IndexedDB</span>
            </div>
          </div>
        </div>

        <!-- Right: Backup & Migration Panel -->
        <div class="md:col-span-2 flex flex-col gap-6">
          <!-- Export Section -->
          <div class="bg-card/85 dark:bg-card/75 border border-border/70 backdrop-blur-md rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row gap-5 items-start justify-between">
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-foreground font-bold">
                <Download size={18} class="text-primary" />
                <h3>Export System Backup</h3>
              </div>
              <p class="text-xs text-muted-foreground max-w-lg leading-relaxed">
                Download a complete offline copy of your databases. This generates a single, portable JSON backup file containing all workspace definitions, directories, and code script binaries.
              </p>
            </div>
            <button 
              class="w-full sm:w-auto px-5 h-11 text-xs font-bold uppercase tracking-wider rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 hover:scale-[0.98] active:scale-[0.96] transition-all flex items-center justify-center gap-2 shrink-0 self-center shadow-sm disabled:opacity-50"
              on:click={handleExport}
              disabled={exporting}
            >
              {#if exporting}
                <RefreshCw size={14} class="animate-spin" />
                Exporting...
              {:else}
                <Download size={14} />
                Export JSON
              {/if}
            </button>
          </div>

          <!-- Import Section -->
          <div class="bg-card/85 dark:bg-card/75 border border-border/70 backdrop-blur-md rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row gap-5 items-start justify-between">
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-foreground font-bold">
                <Upload size={18} class="text-indigo-500" />
                <h3>Restore System Backup</h3>
              </div>
              <p class="text-xs text-muted-foreground max-w-lg leading-relaxed">
                Restore files and folder workspaces from an exported backup file. Upload your previously exported `.json` file to restore or merge your files back into your local developer database.
              </p>
            </div>
            
            <input 
              type="file" 
              accept=".json" 
              bind:this={fileInput} 
              on:change={handleFileSelect} 
              class="hidden"
            />
            
            <button 
              class="w-full sm:w-auto px-5 h-11 text-xs font-bold uppercase tracking-wider rounded-xl border border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 hover:border-indigo-500 hover:scale-[0.98] active:scale-[0.96] transition-all flex items-center justify-center gap-2 shrink-0 self-center shadow-sm disabled:opacity-50"
              on:click={triggerFileInput}
              disabled={importing}
            >
              {#if importing}
                <RefreshCw size={14} class="animate-spin" />
                Reading...
              {:else}
                <Upload size={14} />
                Import JSON
              {/if}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>

<!-- Custom Restore Strategy Confirmation Modal -->
{#if showImportModal && importedData}
  <div class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-card border border-border shadow-2xl rounded-2xl p-6 max-w-md w-full relative z-10 transition-all duration-300">
      
      <!-- Warning Header -->
      <div class="flex items-start gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shrink-0">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h3 class="text-base font-bold text-foreground">Confirm Restore Strategy</h3>
          <p class="text-xs text-muted-foreground mt-0.5">
            A valid backup file containing {importedData.workspaces.length} workspaces and {importedData.files.length} files was parsed.
          </p>
        </div>
      </div>

      <!-- Strategy Selector -->
      <div class="space-y-3 my-5">
        <!-- Option 1: Merge -->
        <label 
          class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer hover:bg-accent/40 transition-colors {importStrategy === 'merge' ? 'border-primary bg-primary/5' : ''}"
        >
          <input 
            type="radio" 
            name="strategy" 
            value="merge" 
            bind:group={importStrategy}
            class="mt-1 h-3.5 w-3.5 text-primary focus:ring-primary focus:ring-offset-background"
          />
          <div class="flex flex-col text-xs leading-normal">
            <span class="font-bold text-foreground">Merge Backup Data (Recommended)</span>
            <span class="text-[11px] text-muted-foreground mt-0.5">
              Keep current local workspaces and import new backup rows. Matching workspace/file IDs will be updated.
            </span>
          </div>
        </label>

        <!-- Option 2: Overwrite -->
        <label 
          class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer hover:bg-accent/40 transition-colors {importStrategy === 'overwrite' ? 'border-destructive bg-destructive/5' : ''}"
        >
          <input 
            type="radio" 
            name="strategy" 
            value="overwrite" 
            bind:group={importStrategy}
            class="mt-1 h-3.5 w-3.5 text-destructive focus:ring-destructive focus:ring-offset-background"
          />
          <div class="flex flex-col text-xs leading-normal">
            <span class="font-bold text-destructive">Overwrite Database</span>
            <span class="text-[11px] text-muted-foreground mt-0.5">
              Permanently clear your local database and restore only the workspaces and files from the backup.
            </span>
          </div>
        </label>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center justify-end gap-2.5">
        <button 
          class="px-4 h-9 text-xs font-semibold text-muted-foreground hover:bg-accent rounded-lg transition-colors border border-border/80"
          on:click={() => { showImportModal = false; importedData = null; }}
        >
          Cancel
        </button>
        <button 
          class="px-4.5 h-9 text-xs font-bold uppercase tracking-wider rounded-lg text-primary-foreground transition-all shadow-sm {importStrategy === 'merge' ? 'bg-primary hover:bg-primary/95' : 'bg-destructive hover:bg-destructive/95'}"
          on:click={executeImport}
        >
          Restore Backup
        </button>
      </div>

    </div>
  </div>
{/if}

<style>
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
  .animate-blob {
    animation: blob 12s infinite alternate ease-in-out;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
</style>
