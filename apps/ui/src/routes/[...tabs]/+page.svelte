<script lang="ts">
  import Monaco from "../../lib/ui/Monaco.svelte";
  import CodeMirror from "svelte-codemirror-editor";
  import {
    EditorView,
    ViewPlugin,
    Decoration,
    WidgetType,
  } from "@codemirror/view";
  import { Button } from "$lib/components/ui/button";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "$lib/components/ui/dropdown-menu";

  let value = " eubrjk";

  // Custom theme extension for grid lines
  const gridTheme = EditorView.theme({
    "&": {
      backgroundColor: "hsl(var(--primary) / 0.2)",
    },

    ".cm-content": {
      backgroundImage: `
        linear-gradient(to right, hsl(var(--secondary) / 0.095) 1px, transparent 1px),
        linear-gradient(to bottom, hsl(var(--secondary) / 0.095) 1px, transparent 1px)
      `,
      backgroundSize: "10px 10px",
    },
    ".cm-line": {
      padding: "0 1px",
      backgroundColor: "hsl(var(--secondary) / 0.2)",
    },
    ".cm-gutters": {
      backgroundColor: "hsl(var(--primary) / 1.0)",
    },
  });

  const extensions = [gridTheme];
</script>

<CodeMirror bind:value {extensions} class="editor" />

<style>
  :global(.editor) {
    height: 100%;
    width: 100%;
  }

  :global(.editor .cm-editor) {
    height: 100%;
  }

  :global(.editor .cm-scroller) {
    overflow: auto;
  }

  :global(.add-button-widget) {
    display: inline-block;
    margin-left: 4px;
    vertical-align: middle;
  }

  :global(.add-button-widget button) {
    opacity: 0.5;
    transition: opacity 0.2s;
  }

  :global(.add-button-widget button:hover) {
    opacity: 1;
  }
</style>
