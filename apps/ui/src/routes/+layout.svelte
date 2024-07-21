<script>
  import { Toaster } from "svelte-sonner";
  import "../app.css";
  import { ModeWatcher } from "mode-watcher";
</script>

<Toaster position="bottom-center" />
<ModeWatcher />

<slot></slot>

<style></style>
