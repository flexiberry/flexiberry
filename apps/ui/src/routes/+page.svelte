<script lang="ts">
  import { onMount } from "svelte";
  import * as Resizable from "$lib/components/ui/resizable/index.js";
  import Header from "../lib/ui/Header.svelte";
  import FolderHierarchy from "../lib/ui/FolderHierarchy.svelte";

  let heightDifference = 0;
  onMount(() => {
    const setHeightDifference = () => {
      const headerHeight = document?.querySelector("Header")?.clientHeight || 0;
      const bodyHeight = window.innerHeight || 0;
      heightDifference = bodyHeight - headerHeight;

      console.log(heightDifference, bodyHeight, headerHeight);
    };

    setHeightDifference();

    window.addEventListener("resize", setHeightDifference);

    return () => {
      window.removeEventListener("resize", setHeightDifference);
    };
  });
</script>

<Header></Header>

<Resizable.PaneGroup
  direction="horizontal"
  style="height: {heightDifference}px;"
  class="h-100"
>
  <Resizable.Pane class="dark:bg-slate-950 bg-white" defaultSize={25}>
    <FolderHierarchy height={heightDifference}></FolderHierarchy>
  </Resizable.Pane>
  <Resizable.Handle withHandle />
  <Resizable.Pane class="dark:bg-slate-900 bg-gray-200" defaultSize={50}
  ></Resizable.Pane>
  <Resizable.Handle withHandle />

  <Resizable.Pane defaultSize={25}>
    <div class="flex h-[200px] items-center justify-center p-6">
      <span class="font-semibold">One</span>
    </div>
  </Resizable.Pane>
</Resizable.PaneGroup>
