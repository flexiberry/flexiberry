<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button";
  import { Trash2 } from "lucide-svelte";

  /** Controls dialog visibility — bind this in the parent */
  export let open = false;
  /** The name of the item being deleted (shown in the dialog body) */
  export let itemName = "";
  /** The kind of item: "file", "folder", or "workspace" */
  export let itemType: "file" | "folder" | "workspace" = "file";

  const dispatch = createEventDispatcher<{ confirm: void; cancel: void }>();

  function handleConfirm() {
    open = false;
    dispatch("confirm");
  }

  function handleCancel() {
    open = false;
    dispatch("cancel");
  }
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Portal>
    <!-- <AlertDialog.Overlay /> -->
    <AlertDialog.Content class="rounded-md">
      <AlertDialog.Header>
        <!-- Icon + Title row -->
        <div class="flex items-center gap-2 mb-1">
          <div
            class="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10 shrink-0"
          >
            <Trash2 class="w-5 h-5 text-destructive" />
          </div>
          <AlertDialog.Title class="text-base font-semibold leading-tight">
            Delete {itemType === "file"
              ? "File"
              : itemType === "folder"
                ? "Folder"
                : "Workspace"}?
          </AlertDialog.Title>
        </div>

        <AlertDialog.Description
          class="text-sm text-muted-foreground leading-relaxed"
        >
          {#if itemType === "workspace"}
            <strong class="text-foreground font-medium">"{itemName}"</strong> will
            be removed. Files and folders inside it will remain in the database but
            will no longer be accessible.
          {:else}
            <strong class="text-foreground font-medium">"{itemName}"</strong> will
            be permanently deleted. This action cannot be undone.
          {/if}
        </AlertDialog.Description>
      </AlertDialog.Header>

      <AlertDialog.Footer class="mt-2 gap-1">
        <AlertDialog.Cancel asChild>
          <Button
            variant="outline"
            class="flex-1 sm:flex-none"
            on:click={handleCancel}
          >
            Cancel
          </Button>
        </AlertDialog.Cancel>
        <AlertDialog.Action asChild>
          <Button
            variant="destructive"
            class="flex-1 sm:flex-none gap-1.5"
            on:click={handleConfirm}
          >
            <Trash2 class="w-3.5 h-3.5" />
            Delete
          </Button>
        </AlertDialog.Action>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
