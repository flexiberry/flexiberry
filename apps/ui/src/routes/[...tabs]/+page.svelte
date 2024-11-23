<script lang="ts">
  import CustomCodeMirror from "../../lib/ui/CustomCodeMirror.svelte";
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
    MoreHorizontal,
    Pause,
    Play,
    PlayCircle,
    PlayIcon,
    PlaySquare,
  } from "lucide-svelte";

  // Get current file name from URL
  $: currentFile = $page.params.tabs?.split("/").pop() || "";
</script>

<div class="h-full flex flex-col">
  <!-- <div
    class="flex items-center justify-between px-4 py-2 border-b border-primary/20"
  >
    <div class="flex items-center">
      <span class="text-sm font-medium truncate max-w-[400px]"
        >{currentFile}</span
      >
    </div>

    <div class="flex items-center gap-2">
      <Button variant="ghost" class=" p-0 ">
        <Play></Play>
      </Button>

      <Button variant="ghost" class=" p-0 ">
        <Pause></Pause>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" class=" p-0 ">
            <MoreHorizontal></MoreHorizontal>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Save</DropdownMenuItem>
          <DropdownMenuItem>Format</DropdownMenuItem>
          <DropdownMenuItem>Close</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div> -->

  <div class="flex-1">
    <CustomCodeMirror />
  </div>
</div>

<style>
  :global(.no-hover) {
    transition: none !important;
  }

  :global(.no-hover:hover) {
    background-color: transparent !important;
  }
</style>
