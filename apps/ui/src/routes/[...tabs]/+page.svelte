<script lang="ts">
  import CustomCodeMirror from "../../lib/ui/editor/CustomCodeMirror.svelte";
  import { page } from "$app/stores";
  import { Button } from "$lib/components/ui/button";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "$lib/components/ui/dropdown-menu";
  import {
    BugPlay,
    File,
    FileCode,
    MoreHorizontal,
    Pause,
    Play,
    PlayCircle,
    PlayIcon,
    PlaySquare,
    Save,
  } from "lucide-svelte";
  import { getFile, saveFile } from "../../lib/writable/File";
  import { toast } from "svelte-sonner";

  let code = "";

  // Get current file name from URL
  $: currentFile = $page.params.tabs?.split("/").pop() || "";

  $: if (currentFile) {
    getFile(currentFile).then((x) => {
      code = x;
    });
  }
</script>

<div class="h-full flex flex-col">
  <div
    class="flex items-center justify-between px-4 py-1 border-b border-primary/20"
  >
    <div class="flex items-center">
      <FileCode class="p-1"></FileCode>
      <span class="text-sm font-medium truncate max-w-[400px]"
        >{currentFile}</span
      >
    </div>

    <div class="flex items-center gap-1">
      <div>
        <Button variant="outline" size="icon">
          <Play size={16}></Play>
        </Button>
      </div>
      <div>
        <Button
          variant="outline"
          size="icon"
          on:click={() => {
            const blob = new Blob([code], { type: "text/plain" });
            saveFile(currentFile, blob);
            toast.success("File Saved", {
              cancel: {
                label: "close",
              },
            });
          }}
          class="p-1"
        >
          <Save size={16}></Save>
        </Button>
      </div>
    </div>
  </div>

  <div class="flex-1">
    <CustomCodeMirror bind:value={code} />
  </div>
</div>

<style>
</style>
