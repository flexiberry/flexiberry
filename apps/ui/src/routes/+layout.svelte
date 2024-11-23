<script>
  import { Toaster } from "svelte-sonner";
  import "../app.css";
  import { ModeWatcher } from "mode-watcher";
  import { onMount, afterUpdate } from "svelte";
  import * as Resizable from "$lib/components/ui/resizable/index";
  import Header from "../lib/ui/Header.svelte";
  import FolderHierarchy from "../lib/ui/FolderHierarchy.svelte";
  import berry from "$lib/assets/berry-fotor-2024090211181.png";
  import Separator from "../lib/components/ui/separator/separator.svelte";
  import { fade, slide } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";

  let heightDifference = 0;
  let showRightPane = true;

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
  let toolbarHeight = 28; // Height of the bottom toolbar

  const updateLogoVisibility = () => {
    if (!logoContainer) return;
    const containerWidth = logoContainer.clientWidth;

    // Show only icon if width is less than 100px
    // Show only title if width is less than 200px
    // Show everything if width is greater than 200px
    showOnlyIcon = containerWidth < 50;
    showFullLogo = containerWidth >= 200;
  };

  onMount(() => {
    // Create ResizeObserver to watch container size changes
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === logoContainer) {
          updateLogoVisibility();
        }
      }
    });

    // Start observing the logo container
    if (logoContainer) {
      resizeObserver.observe(logoContainer);
    }

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
  <Resizable.Pane class=" bg-opacity-10" defaultSize={25}>
    <div
      bind:this={logoContainer}
      class="logo flex px-2 align-middle bg-opacity-10 bg-secondary py-2 items-center justify-between"
    >
      <div class="flex items-center overflow-hidden">
        <img
          src={berry}
          height={"28px"}
          class="h-[28px] flex-shrink-0 transition-transform duration-200"
          class:scale-110={showOnlyIcon}
          alt="FlexiBerry Logo"
        />
        {#if !showOnlyIcon}
          <div
            class="pl-3 overflow-hidden"
            in:slide={{ duration: 200, axis: "x" }}
            out:slide={{ duration: 200, axis: "x" }}
          >
            <h1
              class="font-extrabold text-lg tracking-tight leading-none truncate"
            >
              FlexiBerry
            </h1>
            {#if showFullLogo}
              <p
                class="text-xs text-muted-foreground truncate"
                in:fade={{ duration: 150, delay: 100 }}
                out:fade={{ duration: 150 }}
              >
                Your flexible api testing companion
              </p>
            {/if}
          </div>
        {/if}
      </div>
      {#if showFullLogo}
        <span
          class="text-xs text-muted-foreground ml-2"
          in:fade={{ duration: 150, delay: 100 }}
          out:fade={{ duration: 150 }}
        >
          {version}
        </span>
      {/if}
    </div>
    <Separator></Separator>
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
      <div class="flex h-[200px] items-center justify-center p-6">
        <span class="font-semibold">One</span>
      </div>
    </Resizable.Pane>
  {/if}
</Resizable.PaneGroup>

<!-- Add the bottom toolbar -->
<div
  class="w-full border-t bg-primary-foreground bg-opacity-50 p-1 flex items-center px-2 justify-between"
  style="height: {toolbarHeight}px"
>
  <div class="flex items-center gap-2">
    <Button variant="ghost" size="sm" class="h-6">Status: Connected</Button>
  </div>
  <div class="flex items-center gap-2">
    <Button variant="ghost" size="sm" class="h-6">Docs</Button>
    <Button variant="ghost" size="sm" class="h-6">Settings</Button>
  </div>
</div>
