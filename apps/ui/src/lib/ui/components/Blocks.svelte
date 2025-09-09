<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  // State
  let width = 400;
  let height = 300;
  let x = 0;
  let y = 0;
  let isResizing = false;
  let isDragging = false;
  let resizeDirection = "";
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;
  let startLeft = 0;
  let startTop = 0;
  let dragStartX: number;
  let dragStartY: number;

  // Resize handler configurations
  const resizeHandlers = [
    { position: "top-left", cursor: "nwse-resize" },
    { position: "top", cursor: "ns-resize" },
    { position: "top-right", cursor: "nesw-resize" },
    { position: "right", cursor: "ew-resize" },
    { position: "bottom-right", cursor: "nwse-resize" },
    { position: "bottom", cursor: "ns-resize" },
    { position: "bottom-left", cursor: "nesw-resize" },
    { position: "left", cursor: "ew-resize" },
  ];

  // Resize handlers
  function handleResizeStart(e: MouseEvent, direction: string) {
    e.preventDefault();
    e.stopPropagation();

    isResizing = true;
    resizeDirection = direction;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = width;
    startHeight = height;
    startLeft = x;
    startTop = y;

    document.addEventListener("mousemove", handleResizing);
    document.addEventListener("mouseup", handleResizeEnd, { once: true });
  }

  function handleResizing(e: MouseEvent) {
    if (!isResizing) return;

    e.preventDefault();

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // Apply resizing based on direction
    if (resizeDirection.includes("right")) {
      width = Math.max(100, startWidth + dx);
    }
    if (resizeDirection.includes("left")) {
      const newWidth = Math.max(100, startWidth - dx);
      x = startLeft + (startWidth - newWidth);
      width = newWidth;
    }
    if (resizeDirection.includes("bottom")) {
      height = Math.max(100, startHeight + dy);
    }
    if (resizeDirection.includes("top")) {
      const newHeight = Math.max(100, startHeight - dy);
      y = startTop + (startHeight - newHeight);
      height = newHeight;
    }
  }

  function handleResizeEnd() {
    isResizing = false;
    resizeDirection = "";
    document.removeEventListener("mousemove", handleResizing);
  }

  // Drag handlers
  function handleDragStart(e: MouseEvent) {
    e.preventDefault();
    isDragging = true;
    dragStartX = e.clientX - x;
    dragStartY = e.clientY - y;
    window.addEventListener("mousemove", handleDragging);
    window.addEventListener("mouseup", handleDragEnd, { once: true });
  }

  function handleDragging(e: MouseEvent) {
    if (!isDragging) return;
    x = e.clientX - dragStartX;
    y = e.clientY - dragStartY;
  }

  function handleDragEnd() {
    isDragging = false;
    window.removeEventListener("mousemove", handleDragging);
  }

  // Window resize handler
  function handleWindowResize() {
    width = Math.min(width, window.innerWidth - x);
    height = Math.min(height, window.innerHeight - y);
  }

  // Lifecycle
  onMount(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
      window.removeEventListener("mousemove", handleResizing);
      window.removeEventListener("mousemove", handleDragging);
    };
  });
</script>

<div
  class="relative bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300 select-none"
  style="width: {width}px; height: {height}px; left: {x}px; top: {y}px;"
>
  <!-- Header -->
  <div
    class="bg-gray-100 p-2 cursor-move border-b border-gray-200"
    role="none"
    on:mousedown|preventDefault|stopPropagation={handleDragStart}
  >
    Drag me
  </div>

  <!-- Content -->
  <div class="p-4">
    <slot>Your Window Content</slot>
  </div>

  {#each resizeHandlers as { position, cursor } (position)}
    {#key position}
      <div
        class="absolute z-10 hover:bg-blue-400/50 transition-colors"
        class:top-0={position.startsWith("top")}
        class:bottom-0={position.startsWith("bottom")}
        class:left-0={position.endsWith("left")}
        class:right-0={position.endsWith("right")}
        class:left-1={position === "top" || position === "bottom"}
        class:w-full={position === "top" || position === "bottom"}
        class:top-1={position === "left" || position === "right"}
        class:h-full={position === "left" || position === "right"}
        class:-translate-x-1={position === "top" || position === "bottom"}
        class:-translate-y-1={position === "left" || position === "right"}
        class:w-2.5={!position.includes("-")}
        class:h-2.5={!position.includes("-")}
        class:w-6={position.includes("-")}
        class:h-6={position.includes("-")}
        class:rounded-full={!position.includes("-")}
        class:rounded-sm={position.includes("-")}
        style="cursor: {cursor}"
        role="none"
        on:mousedown|stopPropagation={(e) => handleResizeStart(e, position)}
      ></div>
    {/key}
  {/each}
</div>
