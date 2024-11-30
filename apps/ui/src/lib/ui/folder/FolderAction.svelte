<script lang="ts">
  import { Copy, Share, Trash } from "lucide-svelte";
  import { FolderPlus } from "lucide-svelte";
  import { FilePlus } from "lucide-svelte";

  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { EllipsisVertical } from "lucide-svelte";

  import { v4 as uuidv4 } from "uuid";

  import { createEventDispatcher } from "svelte";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import type { FolderModel } from "../../types/folder.model";
  import Button from "../../components/ui/button/button.svelte";

  export let folder: FolderModel;

  let onDelete: boolean = false;

  const dispatch = createEventDispatcher();

  function addFolder(type: "folder" | "file") {
    if (!folder.subfolders) folder.subfolders = [];
    folder.expand = true;
    folder.subfolders.unshift({
      name: "",
      subfolders: [],
      type: type,
      rename: true,
      remove: false,
      expand: false,
      uid: uuidv4().toString(),
    });
    dispatch("folderUpdate", {
      fld: folder,
    });
  }
  function removeFolder() {
    onDelete = false;
    folder.remove = true;
    console.log("remove");

    dispatch("folderUpdate", {
      fld: folder,
    });
  }
</script>

<div class="inline-flex">
  {#if folder.type == "folder"}
    <button
      on:click={() => addFolder("folder")}
      class=" px-1 group-hover:opacity-100 opacity-0 rounded-sm"
    >
      <FolderPlus size={14}></FolderPlus>
    </button>
    <button
      on:click={() => addFolder("file")}
      class=" px-1 group-hover:opacity-100 opacity-0 rounded-sm"
    >
      <FilePlus size={14}></FilePlus>
    </button>
  {:else}
    <button
      on:click={() => {
        onDelete = true;
      }}
      class=" px-1 group-hover:opacity-100 opacity-0 hover:bg-muted rounded-sm"
    >
      <Trash class="text-red-500" size={14}></Trash>
    </button>
  {/if}
  <div class="group-hover:opacity-100 opacity-20">
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild let:builder>
        <Button class="px-1" builders={[builder]} variant="link" style="icon">
          <EllipsisVertical size={14}></EllipsisVertical>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {#if folder.type == "folder"}
          <DropdownMenu.DropdownMenuItem
            class="cursor-pointer"
            data-alert-dialog-trigger
            on:click={() => (onDelete = true)}
          >
            <Trash class="text-red-500" size={16}></Trash>
            <span class="px-3">Delete </span>
          </DropdownMenu.DropdownMenuItem>
          <DropdownMenu.DropdownMenuItem class="cursor-pointer">
            <Share size={16}></Share>
            <span class="px-3">Export </span>
          </DropdownMenu.DropdownMenuItem>
        {:else}
          <DropdownMenu.DropdownMenuItem class="cursor-pointer">
            <Share size={16}></Share>
            <span class="px-3">Export </span>
          </DropdownMenu.DropdownMenuItem>
          <DropdownMenu.DropdownMenuItem class="cursor-pointer">
            <Copy size={16}></Copy>
            <span class="px-3">Duplicate </span>
          </DropdownMenu.DropdownMenuItem>
        {/if}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
</div>

<AlertDialog.Root bind:open={onDelete}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
      <AlertDialog.Description>
        This action cannot be undone. This will permanently delete from your
        system.
        <p class="text-red-500">{folder.type} : {folder.name}</p>
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel on:click={() => (onDelete = false)}
        >Cancel</AlertDialog.Cancel
      >
      <AlertDialog.Action on:click={removeFolder}>Continue</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
