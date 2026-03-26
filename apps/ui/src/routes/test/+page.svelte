<script lang="ts">
  import AutoScrollViewPort from "../../lib/ui/components/AutoScrollViewPort.svelte";
  import Blocks from "../../lib/ui/components/Blocks.svelte";

  // Block z-index management
  let blockZIndices = [1, 2, 3];
  let selectedBlock: number | null = null;

  function bringToFront(index: number) {
    if (selectedBlock === index) return;
    selectedBlock = index;
    const maxZIndex = Math.max(...blockZIndices) + 1;
    blockZIndices = blockZIndices.map((z, i) => (i === index ? maxZIndex : z));
  }
</script>

<div class="w-full h-screen bg-gray-50 overflow-hidden">
  <AutoScrollViewPort  scrollSpeed={30} edgeThreshold={40} smoothScroll={true}>
    <!-- Block 1: Simple Text Content -->
    <Blocks
      id="block-1"
      zIndex={blockZIndices[0]}
      onSelect={() => bringToFront(0)}
    >
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-2">Simple Text Block</h3>
        <p class="mb-2">This block contains simple text content.</p>
      </div>
    </Blocks>

    <Blocks
      id="block-2"
      zIndex={blockZIndices[1]}
      onSelect={() => bringToFront(1)}
    >
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-3">Form Example</h3>
        <form class="space-y-3">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700"
              >Name</label
            >
            <input
              id="name"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700"
              >Email</label
            >
            <input
              id="email"
              type="email"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <button
            type="button"
            class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
      </div>
    </Blocks>

    <Blocks
      id="block-3"
      zIndex={blockZIndices[2]}
      onSelect={() => bringToFront(2)}
    >
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-3">Data Display</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">Users Online:</span>
            <span class="font-medium">1,234</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Active Sessions:</span>
            <span class="font-medium">89</span>
          </div>
          <div class="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
            <div class="h-full bg-green-500" style="width: 65%"></div>
          </div>
        </div>
      </div>
    </Blocks>
  </AutoScrollViewPort>
</div>
