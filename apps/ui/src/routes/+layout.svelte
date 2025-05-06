<script lang="ts">
  import BottomToolBar from "../lib/ui/shared/BottomToolBar.svelte";

  import { Toaster } from "svelte-sonner";
  import "../app.css";
  import { ModeWatcher } from "mode-watcher";
  import { onMount } from "svelte";
  import * as Resizable from "$lib/components/ui/resizable/index";
  import Header from "../lib/ui/shared/Header.svelte";
  import { Button } from "$lib/components/ui/button";
  import FolderHierarchy from "../lib/ui/folder/FolderHierarchy.svelte";
  import BerryConsole from "../lib/ui/console/BerryConsole.svelte";
  import { Folder, Plus, Search } from "lucide-svelte";
  import type { PaneAPI } from "paneforge";

  let heightDifference = 0;
  let showRightPane = true;
  let toolbarHeight = 28; // Height of the bottom toolbar
  let paneOne: PaneAPI;
  let resizeObserver: ResizeObserver;
  let collapsed = false;
  // Add these variables to track height

  onMount(() => {
    // Create ResizeObserver to watch container size changes

    resizeObserver = new ResizeObserver((entries) => {});

    const handleResize = () => {
      const headerHeight = document?.querySelector("Header")?.clientHeight || 0;
      const bodyHeight = window.innerHeight || 0;
      heightDifference = bodyHeight - headerHeight - toolbarHeight;

      // Update right pane visibility based on screen width
      showRightPane = window.innerWidth >= 700;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      // Cleanup
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener("resize", handleResize);
    };
  });

  function expandPane() {
    paneOne.expand();
    paneOne.resize(25);
  }
</script>

<!-- <SplashScreen duration={3000} /> -->

<!-- Show the splash screen for 3 seconds -->

<Toaster position="bottom-center" />
<ModeWatcher />

<Header></Header>

<Resizable.PaneGroup
  direction="horizontal"
  style="height: {heightDifference}px;"
>
  <Resizable.Pane
    class=" bg-primary/50 dark:bg-primary-foreground/20"
    defaultSize={25}
    bind:pane={paneOne}
    minSize={15}
    maxSize={30}
    collapsible={true}
    collapsedSize={4}
    onCollapse={() => (collapsed = true)}
    onExpand={() => (collapsed = false)}
  >
    <!-- <Separator></Separator> -->
    {#if !collapsed}
      <div class="px-2">
        <FolderHierarchy height={heightDifference} />
      </div>
    {:else}
      <div class="flex flex-col items-center py-4 gap-4 min-h-full">
        <Button on:click={expandPane} size="icon" variant="ghost"
          ><Search size={20} /></Button
        >
        <Button on:click={expandPane} size="icon" variant="ghost"
          ><Plus size={20} /></Button
        >
        <Button on:click={expandPane} size="icon" variant="ghost"
          ><Folder size={20} /></Button
        >
      </div>
    {/if}
  </Resizable.Pane>
  <Resizable.Handle withHandle />
  <Resizable.Pane class="bg-muted" defaultSize={showRightPane ? 50 : 75}>
    <slot></slot>
  </Resizable.Pane>
  {#if showRightPane}
    <Resizable.Handle withHandle />
    <Resizable.Pane
      minSize={15}
      maxSize={30}
      defaultSize={25}
      collapsible={true}
      collapsedSize={4}
    >
      <BerryConsole></BerryConsole>
    </Resizable.Pane>
  {/if}
</Resizable.PaneGroup>

<!-- Add the bottom toolbar -->
<div
  class="w-full border-t border-primary bg-background bg-opacity-100 p-1 flex items-center px-2 justify-between"
  style="height: {toolbarHeight}px"
>
  <BottomToolBar></BottomToolBar>
</div>
