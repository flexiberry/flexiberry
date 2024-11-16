<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  // You might want to maintain a store of open files/tabs
  let files = new Set<string>();

  $: {
    // Update files set when URL changes
    const tabs = $page.params.tabs?.split("/") || [];
    tabs.forEach((tab) => files.add(tab));
  }
</script>

<slot />
