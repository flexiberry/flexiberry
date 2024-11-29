<script>
  import { Settings } from "lucide-svelte";
  import Button from "../components/ui/button/button.svelte";
</script>

<div class="flex items-center gap-2">
  <Button variant="ghost" size="sm" class="">Status: Connected</Button>
</div>
<div class="flex items-center gap-2">
  <Button variant="ghost" size="xs" class="">Docs</Button>
  <Button variant="ghost" size="xs" class="">
    <Settings size={14}></Settings>
    Settings</Button
  >
</div>
