<script>
  import BottomToolBar from "../lib/ui/shared/BottomToolBar.svelte";

  import { Toaster } from "svelte-sonner";
  import "../app.css";
  import { ModeWatcher } from "mode-watcher";
  import { onMount, afterUpdate } from "svelte";
  import * as Resizable from "$lib/components/ui/resizable/index";
  import Header from "../lib/ui/shared/Header.svelte";
  import berry from "$lib/assets/berry-fotor-2024090211181.png";
  import Separator from "../lib/components/ui/separator/separator.svelte";
  import { fade, slide } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import FolderHierarchy from "../lib/ui/folder/FolderHierarchy.svelte";
  import BerryConsole from "../lib/ui/console/BerryConsole.svelte";

  let heightDifference = 0;
  let showRightPane = true;
  let toolbarHeight = 28; // Height of the bottom toolbar

  // Add version from package.json
  // @ts-ignore
  const version = "v" + APP_VERSION;

  /**
   * @type {HTMLDivElement}
   */
  let logoContainer;
  let showFullLogo = true;
  let showOnlyIcon = false;
  /**
   * @type {ResizeObserver}
   */
  let resizeObserver;

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
  <Resizable.Pane class=" bg-primary/50" defaultSize={25}>
    <!-- <Separator></Separator> -->
    <div class=" px-2">
      <FolderHierarchy height={heightDifference}></FolderHierarchy>
    </div>
  </Resizable.Pane>
  <Resizable.Handle withHandle />
  <Resizable.Pane class="bg-muted" defaultSize={showRightPane ? 50 : 75}>
    <slot></slot>
  </Resizable.Pane>
  {#if showRightPane}
    <Resizable.Handle withHandle />
    <Resizable.Pane defaultSize={25}>
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
