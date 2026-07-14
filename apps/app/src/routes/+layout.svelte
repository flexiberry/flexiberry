<script lang="ts">
  import BottomToolBar from "$lib/ui/shared/BottomToolBar.svelte";
  import { Toaster } from "svelte-sonner";
  import { ModeWatcher, mode } from "mode-watcher";
  import AuthOverlay from "$lib/components/auth/AuthOverlay.svelte";
  import GlobalAssistantPanel from "$lib/components/ide/GlobalAssistantPanel.svelte";
  import { themeIntensity } from "$lib/writable/theme.store";
  import { assistantOpen } from "$lib/writable/assistant.store";
  import "../app.css";

  // Compute dynamic HSL lightness for background based on intensity (0-100)
  function getBgLightness(isDark: boolean, intensity: number): string {
    if (isDark) {
      // Map 0 -> 12% (greyish), 50 -> 4% (default dark), 100 -> 0% (pure black)
      if (intensity <= 50) {
        return (12 - (intensity / 50) * 8).toFixed(1) + "%";
      } else {
        return (4 - ((intensity - 50) / 50) * 4).toFixed(1) + "%";
      }
    } else {
      // Map 0 -> 80% (darker light grey), 50 -> 90% (default light), 100 -> 100% (pure white)
      if (intensity <= 50) {
        return (80 + (intensity / 50) * 10).toFixed(1) + "%";
      } else {
        return (90 + ((intensity - 50) / 50) * 10).toFixed(1) + "%";
      }
    }
  }

  // Compute dynamic HSL lightness for card/popover elements
  function getCardLightness(isDark: boolean, bgLightVal: string): string {
    const bgNum = parseFloat(bgLightVal);
    if (isDark) {
      return (bgNum + 3).toFixed(1) + "%";
    } else {
      return (bgNum + (100 - bgNum) * 0.7).toFixed(1) + "%";
    }
  }

  import { browser } from "$app/environment";

  $: bgLightness = getBgLightness($mode === "dark", $themeIntensity);
  $: cardLightness = getCardLightness($mode === "dark", bgLightness);

  $: if (browser) {
    document.documentElement.style.setProperty("--bg-lightness", bgLightness);
    document.documentElement.style.setProperty("--card-lightness", cardLightness);
  }
</script>

<Toaster position="bottom-center" />
<ModeWatcher />

<div
  class="flex h-screen flex-col overflow-hidden bg-background text-foreground transition-colors duration-150"
  style="--bg-lightness: {bgLightness}; --card-lightness: {cardLightness};"
>
  <AuthOverlay>
    <div class="flex-1 flex overflow-hidden w-full relative">
      <main class="flex-1 overflow-hidden h-full relative">
        <slot></slot>
      </main>

      {#if $assistantOpen}
        <GlobalAssistantPanel />
      {/if}
    </div>

    <div
      class="w-full border-t border-primary/20 bg-background flex items-center px-2 justify-between shrink-0 z-50"
      style="height: 28px;"
    >
      <BottomToolBar />
    </div>
  </AuthOverlay>
</div>
