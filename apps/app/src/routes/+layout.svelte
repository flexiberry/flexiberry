<script lang="ts">
  import BottomToolBar from "$lib/ui/shared/BottomToolBar.svelte";
  import { Toaster } from "svelte-sonner";
  import "../app.css";
  import { ModeWatcher } from "mode-watcher";
  import Header from "$lib/ui/shared/Header.svelte";
  import AuthOverlay from "$lib/components/auth/AuthOverlay.svelte";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import UnderDevelopment from "$lib/components/UnderDevelopment.svelte";

  let isUnderDevelopmentDomain = false;
  let bypass = false;
  let checked = false;

  onMount(() => {
    isUnderDevelopmentDomain =
      window.location.hostname === "app.flexiberry.dev";
    bypass = localStorage.getItem("flexiberry_dev_bypass") === "true";

    const params = new URLSearchParams(window.location.search);
    if (params.has("bypass")) {
      const val = params.get("bypass");
      if (val === "true") {
        localStorage.setItem("flexiberry_dev_bypass", "true");
        bypass = true;
      } else if (val === "false") {
        localStorage.removeItem("flexiberry_dev_bypass");
        bypass = false;
      }
    }
    checked = true;
  });

  const handleBypass = () => {
    bypass = true;
  };
</script>

<Toaster position="bottom-center" />
<ModeWatcher />

{#if checked && isUnderDevelopmentDomain && !bypass}
  <UnderDevelopment onBypass={handleBypass} />
{:else}
  <div
    class="flex h-screen flex-col overflow-hidden bg-background text-foreground"
  >
    <AuthOverlay>
      <main class="flex-1 overflow-hidden">
        <slot></slot>
      </main>

      <div
        class="w-full border-t border-primary/20 bg-background flex items-center px-2 justify-between"
        style="height: 28px;"
      >
        <BottomToolBar />
      </div>
    </AuthOverlay>
  </div>
{/if}
