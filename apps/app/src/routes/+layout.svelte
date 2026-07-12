<script lang="ts">
  import BottomToolBar from "$lib/ui/shared/BottomToolBar.svelte";
  import { Toaster } from "svelte-sonner";
  import { ModeWatcher } from "mode-watcher";
  import AuthOverlay from "$lib/components/auth/AuthOverlay.svelte";
</script>

<Toaster position="bottom-center" />
<ModeWatcher />

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
