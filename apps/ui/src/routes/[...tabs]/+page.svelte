<script lang="ts">
  import CustomCodeMirror from "../../lib/ui/CustomCodeMirror.svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  // Extract tabs from the URL
  $: currentTabs = $page.params.tabs?.split("/") || [];

  function closeTab(tabToClose: string) {
    const newTabs = currentTabs.filter((tab) => tab !== tabToClose);
    goto(newTabs.length ? `/${newTabs.join("/")}` : "/");
  }
</script>

<div class="h-full flex flex-col">
  <div class="tabs-container flex bg-primary/10 border-b border-primary/20">
    {#each currentTabs as tab}
      <div
        class="tab group relative flex items-center px-4 py-2 border-r border-primary/20"
      >
        <span class="max-w-[150px] truncate">{tab}</span>
        <button
          class="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
          on:click|preventDefault={() => closeTab(tab)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <!-- Active tab indicator -->
        {#if tab === currentTabs[currentTabs.length - 1]}
          <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="flex-1">
    <CustomCodeMirror />
  </div>
</div>

<style>
  .tab {
    height: 36px;
    background-color: hsl(var(--primary) / 0.05);
  }

  .tab:hover {
    background-color: hsl(var(--primary) / 0.1);
  }

  /* Style for the active tab */
  .tab:has(.bg-primary) {
    background-color: hsl(var(--primary) / 0.15);
  }
</style>
