<script lang="ts">
  import { Folder } from "lucide-svelte";

  import { FolderOpen } from "lucide-svelte";
  import { FileCode } from "lucide-svelte";

  import type { FolderModel } from "../types/folder.model";

  import { Input } from "$lib/components/ui/input/index.js";

  import { createEventDispatcher } from "svelte";
  export let folder: FolderModel;

  const toggle = () => {
    folder.expand = !folder.expand;
    dispatch("folderUpdate", {
      fld: folder,
    });
  };

  const dispatch = createEventDispatcher();

  function handleKey(e: KeyboardEvent): void {
    if (e.key === "Enter" || e.key === "Escape") {
      if (folder.name === "") {
        alert("Please rename the folder");
        folder.rename = true;
      } else {
        folder.rename = false;
        dispatch("folderUpdate", {
          fld: folder,
        });
      }
    }
  }
</script>

<button
  on:click={toggle}
  class="flex flex-auto group-hover:bg-none h-100 items-center ring-0 border-0 align-middle"
>
  <div class="flex-none">
    {#if folder.type == "folder"}
      {#if !folder.expand}
        <Folder size={20}></Folder>
      {:else}
        <FolderOpen size={20}></FolderOpen>
      {/if}
    {:else}
      <FileCode class="text-secondary" size={20}></FileCode>
    {/if}
  </div>

  {#if folder.rename}
    <div class="ml-3">
      <Input
        type="text"
        class=" h-6 bg-primary  rounded bg-opacity-50 focus-visible:ring-0 focus-visible:ring-offset-0 border-none"
        bind:value={folder.name}
        on:keydown={handleKey}
        on:focusout={() => {
          if (folder.name != "") folder.rename = false;
        }}
        placeholder="Enter {folder.type} name"
      />
    </div>
  {:else if folder.type === "file"}
    <a href={folder.uid} class="ml-2 flex-none">{folder.name}</a>
  {:else}
    <span class="ml-2 flex-none">{folder.name}</span>
  {/if}
</button>

<style>
</style>
