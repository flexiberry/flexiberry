<script lang="ts">
  import { liveQuery } from "dexie";
  import { db, type Workspace } from "$lib/db/db";
  import {
    activeWorkspaceId,
    createWorkspace,
    deleteWorkspace,
  } from "$lib/writable/workspace.store";
  import { ChevronDown, Plus, Check, Trash2 } from "lucide-svelte";
  import { toast } from "svelte-sonner";

  // shadcn-svelte components
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";
  import * as Separator from "$lib/components/ui/separator";
  import DeleteConfirmDialog from "$lib/components/dashboard/DeleteConfirmDialog.svelte";

  // ─── State ─────────────────────────────────────────────────────
  let open = false;
  let creatingNew = false;
  let newName = "";
  let newEmoji = "📁";
  let inputEl: HTMLInputElement;
  // Workspace delete confirmation
  let deleteDialogOpen = false;
  let pendingDeleteWs: Workspace | null = null;

  // ─── Live data ─────────────────────────────────────────────────
  const workspacesStore = liveQuery(() => db.workspaces.toArray());
  $: workspaces = ($workspacesStore ?? []).sort((a, b) =>
    a.createdAt < b.createdAt ? -1 : 1,
  );

  $: activeWorkspace = workspaces.find((w) => w.id === $activeWorkspaceId);
  $: displayName = activeWorkspace?.name ?? "My Workspace";
  $: displayEmoji = activeWorkspace?.emoji ?? "🚀";

  // ─── Handlers ──────────────────────────────────────────────────
  function switchWorkspace(id: string) {
    activeWorkspaceId.switchTo(id);
  }

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    try {
      await createWorkspace(name, newEmoji);
      toast.success(`Workspace "${name}" created`);
    } catch {
      toast.error("Failed to create workspace");
    }
    newName = "";
    newEmoji = "📁";
    creatingNew = false;
  }

  // Open the confirm dialog instead of deleting immediately
  function requestDelete(e: Event, ws: Workspace) {
    e.stopPropagation();
    if (ws.id === "default") {
      toast.error("Cannot delete the default workspace");
      return;
    }
    pendingDeleteWs = ws;
    deleteDialogOpen = true;
  }

  // Executed after user confirms
  async function confirmDeleteWs() {
    if (!pendingDeleteWs) return;
    try {
      await deleteWorkspace(pendingDeleteWs.id);
      toast.success(`Workspace "${pendingDeleteWs.name}" removed`);
    } catch {
      toast.error("Failed to delete workspace");
    }
    pendingDeleteWs = null;
  }

  function startCreating() {
    creatingNew = true;
    open = true;
    setTimeout(() => inputEl?.focus(), 50);
  }

  // Reactive guard: if bits-ui tries to close the dropdown while the create
  // form is active, immediately re-open it (runs synchronously, no visible flicker)
  $: if (!open && creatingNew) open = true;

  const EMOJIS = ["🚀", "🔬", "📦", "🎨", "🌐", "💡"];
</script>

<DropdownMenu.Root bind:open>
  <!-- ─── Trigger ──────────────────────────────────────────────── -->
  <DropdownMenu.Trigger asChild let:builder>
    <button
      use:builder.action
      {...builder}
      class="flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors text-foreground bg-muted/60 hover:bg-muted h-7 text-sm font-medium"
      title="Switch workspace"
    >
      <span class="leading-none">{displayEmoji}</span>
      <span class="whitespace-nowrap max-w-[120px] truncate">{displayName}</span
      >
      <ChevronDown
        class="w-3 h-3 text-muted-foreground/60 ml-0.5 transition-transform"
      />
    </button>
  </DropdownMenu.Trigger>

  <!-- ─── Panel ───────────────────────────────────────────────── -->
  <DropdownMenu.Content
    class="w-64 p-0 rounded-xl shadow-xl overflow-hidden"
    sideOffset={6}
    align="start"
  >
    <!-- Panel header -->
    <DropdownMenu.Label
      class="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border"
    >
      Workspaces
    </DropdownMenu.Label>

    <!-- Workspace list -->
    <div class="py-1 max-h-52 overflow-y-auto">
      {#each workspaces as ws (ws.id)}
        <DropdownMenu.Item
          class="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-none group focus:bg-muted/60"
          on:click={() => switchWorkspace(ws.id)}
        >
          <span class="text-base leading-none w-5 text-center shrink-0"
            >{ws.emoji}</span
          >
          <span
            class="flex-1 text-sm font-medium truncate {ws.id ===
            $activeWorkspaceId
              ? 'text-primary'
              : 'text-foreground'}">{ws.name}</span
          >
          {#if ws.id === $activeWorkspaceId}
            <Check class="w-3.5 h-3.5 text-primary shrink-0" />
          {:else}
            <button
              class="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:text-destructive hover:bg-destructive/10 shrink-0"
              on:click={(e) => requestDelete(e, ws)}
              title="Remove workspace"
            >
              <Trash2 class="w-3 h-3" />
            </button>
          {/if}
        </DropdownMenu.Item>
      {/each}

      {#if workspaces.length === 0}
        <p class="text-xs text-muted-foreground px-3 py-3 text-center">
          No workspaces yet.
        </p>
      {/if}
    </div>

    <DropdownMenu.Separator />

    <!-- New Workspace section -->
    {#if creatingNew}
      <!-- Inline create form — stops dropdown from closing on click inside -->
      <div
        class="px-3 py-2.5 flex flex-col gap-2"
        on:mousedown|stopPropagation
        on:click|stopPropagation
      >
        <!-- Emoji picker -->
        <div class="flex gap-1 flex-wrap">
          {#each EMOJIS as e}
            <button
              class="text-sm p-1 rounded-md transition-colors hover:bg-muted {newEmoji ===
              e
                ? 'bg-primary/10 ring-1 ring-primary/40'
                : ''}"
              on:click|stopPropagation={() => (newEmoji = e)}>{e}</button
            >
          {/each}
        </div>
        <!-- Name input row: selected emoji + full-width input -->
        <div class="flex items-center gap-1.5">
          <span class="text-base shrink-0">{newEmoji}</span>
          <input
            bind:this={inputEl}
            bind:value={newName}
            placeholder="Workspace name..."
            class="h-8 text-sm px-2 flex-1 min-w-0 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            on:keydown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") {
                creatingNew = false;
                newName = "";
              }
            }}
          />
        </div>
        <!-- Action row -->
        <div class="flex items-center justify-end gap-1.5">
          <button
            class="h-7 px-2.5 text-xs rounded-md text-muted-foreground hover:bg-muted transition-colors"
            on:click|stopPropagation={() => {
              creatingNew = false;
              newName = "";
            }}>Cancel</button
          >
          <Button
            size="sm"
            class="h-7 px-3 text-xs"
            on:click={(e) => {
              e.stopPropagation();
              handleCreate();
            }}
          >
            Create
          </Button>
        </div>
      </div>
    {:else}
      <button
        class="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        on:click={startCreating}
      >
        <Plus class="w-4 h-4" />
        <span>New Workspace</span>
      </button>
    {/if}
  </DropdownMenu.Content>
</DropdownMenu.Root>

<!-- Workspace Delete Confirmation -->
<DeleteConfirmDialog
  bind:open={deleteDialogOpen}
  itemName={pendingDeleteWs?.name ?? ""}
  itemType="workspace"
  on:confirm={confirmDeleteWs}
/>
