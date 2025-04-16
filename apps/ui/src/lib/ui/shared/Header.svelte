<script lang="ts">
  import Button from "../../components/ui/button/button.svelte";
  import { Input } from "../../components/ui/input";
  import { Moon, Plus, Sun, Upload } from "lucide-svelte";
  import { LifeBuoy } from "lucide-svelte";
  import { Github } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import { toggleMode } from "mode-watcher";
  import berry from "$lib/assets/berry-fotor-2024090211181.png";
  import { onMount } from "svelte";
  import { fade, slide } from "svelte/transition";

  // Add version from package.json
  // @ts-ignore
  const version = "v " + APP_VERSION;

  let logoContainer: Element;
  let showFullLogo = true;
  let showOnlyIcon = false;
  /**
   * @type {ResizeObserver}
   */
  let resizeObserver: ResizeObserver;

  // Add these variables to track height

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
      // heightDifference = bodyHeight - headerHeight - toolbarHeight;

      // Update right pane visibility based on screen width
      // showRightPane = window.innerWidth >= 700;
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

<header class="border-b-2 bg-primary/90 drop-shadow-lg">
  <div class=" ">
    <nav class=" flex align-middle items-center">
      <div
        bind:this={logoContainer}
        class="logo flex px-2 align-middle py-2 items-center justify-between"
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
      </div>
    </nav>
  </div>
  <div class="logo flex align-middle items-center">
    <!-- <img src={berry} height={"40px"} class="h-10" alt="" srcset="" />
    <h1 class="font-extrabold pl-3">FlexiBerry</h1> -->
  </div>
  <div>
    <nav class=" flex align-middle items-center">
      <span
        class="text-lg font-thin text-muted-foreground mr-2"
        in:fade={{ duration: 150, delay: 100 }}
        out:fade={{ duration: 150 }}
      >
        {version}
      </span>
      <Button class="mr-2" size="icon" variant="outline">
        <LifeBuoy strokeWidth={1}></LifeBuoy>
      </Button>
      <Button class="mr-2" size="icon" variant="outline">
        <Github strokeWidth={1}></Github>
      </Button>
      <Button class="mr-2" on:click={toggleMode} variant="outline" size="icon">
        <Sun
          class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        />
        <Moon
          class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />
        <span class="sr-only">Toggle theme</span>
      </Button>
      <div class=" border-l-2 border-opacity-15 mr-1 h-100"></div>
      <Button
        class="mr-4"
        color="primary"
        on:click={() => toast("Hello world")}
        variant="default">Login</Button
      >
    </nav>
  </div>
</header>

<style>
  /* Add styles for your header here */
  header {
    padding: 0.15rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .logo {
    display: flex;
  }
</style>
