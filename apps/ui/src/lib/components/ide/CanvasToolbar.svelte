<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
</script>

<!--
  CanvasToolbar
  Floating pill of canvas-mode action buttons pinned to the bottom-left
  of the transparent canvas pane.
-->
<div class="absolute bottom-4 left-4 z-10 pointer-events-none">
  <Card.Root
    class="p-1 px-2 shadow-md flex gap-1 items-center pointer-events-auto bg-card/90 backdrop-blur"
  >
    <Button
      variant="ghost"
      size="icon"
      class="w-8 h-8 text-muted-foreground hover:text-foreground"
      title="Hex view">⬡</Button
    >
    <Button
      variant="secondary"
      size="icon"
      class="w-8 h-8 text-blue-500 bg-blue-500/10 hover:bg-blue-500/20"
      title="Select mode">■</Button
    >
    <Button
      variant="ghost"
      size="icon"
      class="w-8 h-8 text-muted-foreground hover:text-foreground"
      title="Command palette">⌘</Button
    >
    <Button
      variant="ghost"
      size="icon"
      class="w-8 h-8 text-muted-foreground hover:text-foreground"
      title="New node">N</Button
    >
    <Button
      variant="ghost"
      size="icon"
      class="w-8 h-8 text-muted-foreground hover:text-foreground"
      title="Berry mode">🐦</Button
    >
  </Card.Root>
</div>
