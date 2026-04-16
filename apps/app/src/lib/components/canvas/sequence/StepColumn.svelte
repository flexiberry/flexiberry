<script lang="ts">
  import type { StepBlockNode } from "@flexiberry/berrycore";
  import StepBlock from "./StepBlock.svelte";
  import SubBlock from "./SubBlock.svelte";

  export let step: StepBlockNode;
</script>

<div class="flex flex-col">
  <!-- Step Header (Sits on Runway) -->
  <StepBlock {step} on:change />

  <!-- Step Body (Hangs below Runway) -->
  <div class="flex flex-col gap-0 mt-[10px] relative">
    <!-- Connecting line from runway to sub-blocks -->
    <div
      class="absolute -top-[20px] left-1/2 w-[2px] h-[20px] bg-border -translate-x-1/2"
    ></div>

    <SubBlock title="Params" node={step.params} color="violet" on:change />
    <SubBlock title="Capture" node={step.capture} color="blue" on:change />
    <SubBlock title="Check" node={step.check} color="amber" on:change />
  </div>

  <!-- Vertical Pillar extending deep into canvas -->
  <!-- <div class="w-[2px] h-[1000px] bg-white/5 mx-auto"></div> -->
</div>
