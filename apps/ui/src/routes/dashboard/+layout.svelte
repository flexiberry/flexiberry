<script lang="ts">
  import { Toaster } from "$lib/components/ui/sonner";
  import { ModeWatcher } from "mode-watcher";
</script>

<Toaster position="bottom-center" />
<ModeWatcher />

<slot />
