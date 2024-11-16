<script lang="ts">
  import CodeMirror from "svelte-codemirror-editor";
  import { EditorView, ViewPlugin, WidgetType } from "@codemirror/view";
  import { StateField, StateEffect } from "@codemirror/state";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";

  let value = "";
  let contextMenuPosition = { x: 0, y: 0 };
  let showContextMenu = false;
  let showApiCard = true;
  let apiCardPosition = { x: 0, y: 0 };

  class ApiSuggestionWidget extends WidgetType {
    constructor(readonly position: { x: number; y: number }) {
      super();
    }

    toDOM() {
      const dom = document.createElement("div");
      dom.className = "api-suggestion";
      dom.style.position = "absolute";
      dom.style.left = `${this.position.x}px`;
      dom.style.top = `${this.position.y}px`;
      return dom;
    }
  }

  // Effect to show context menu
  const showContextMenuEffect = StateEffect.define<{ x: number; y: number }>();

  // State field to track context menu
  const contextMenuField = StateField.define({
    create: () => ({ show: false, x: 0, y: 0 }),
    update(value, tr) {
      for (let e of tr.effects) {
        if (e.is(showContextMenuEffect)) {
          return { show: true, x: e.value.x, y: e.value.y };
        }
      }
      return value;
    },
  });

  // Plugin to handle right-click
  const contextMenuPlugin = ViewPlugin.fromClass(
    class {
      constructor(view: EditorView) {
        view.dom.addEventListener("contextmenu", (event: MouseEvent) => {
          event.preventDefault();
          const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
          if (pos) {
            contextMenuPosition = { x: event.clientX, y: event.clientY };
            showContextMenu = true;
          }
        });
      }

      destroy() {}
    }
  );

  // Plugin to detect "api" text and show card
  const apiDetectorPlugin = ViewPlugin.fromClass(
    class {
      constructor(view: EditorView) {
        this.checkForApi(view);
      }

      update(update: any) {
        if (update.docChanged) {
          this.checkForApi(update.view);
        }
      }

      checkForApi(view: EditorView) {
        const doc = view.state.doc;
        const cursorPos = view.state.selection.main.head;
        const line = doc.lineAt(cursorPos);
        const lineText = line.text;

        // Check if the current line contains "api"
        if (lineText.includes("api")) {
          const coords = view.coordsAtPos(line.from);
          if (coords) {
            showApiCard = true;
            // Position the card above the line
            apiCardPosition = {
              x: coords.left,
              y: coords.top - 120, // Adjust this value to position the card properly
            };
          }
        } else {
          showApiCard = false;
        }
      }
    }
  );

  // Custom theme extension for grid lines
  const gridTheme = EditorView.theme({
    "&": {
      backgroundColor: "hsl(var(--primary) / 0.2)",
    },
    ".cm-content": {
      backgroundImage: `
        linear-gradient(to right, hsl(var(--primary) / 0.095) 1px, transparent 1px),
        linear-gradient(to bottom, hsl(var(--primary) / 0.095) 1px, transparent 1px)
      `,
      backgroundSize: "10px 10px",
    },
    ".cm-line": {
      padding: "0 4px",
    },
    ".cm-gutters": {
      backgroundColor: "hsl(var(--primary) / 1.0)",
    },
  });

  const extensions = [
    gridTheme,
    contextMenuPlugin,
    contextMenuField,
    apiDetectorPlugin,
  ];

  function handleMenuItemClick(action: string) {
    // Handle different menu actions
    console.log(`Selected action: ${action}`);
    showContextMenu = false;
  }
</script>

<div class="relative h-full">
  <CodeMirror bind:value {extensions} class="editor" />

  {#if showApiCard}
    <div
      class="fixed z-50 transform -translate-y-full"
      style="left: {apiCardPosition.x}px; top: {apiCardPosition.y}px"
    >
      <Card class="w-[350px]">
        <CardHeader>
          <CardTitle>API Suggestion</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">GET /api/users</span>
              <button
                class="text-xs bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded"
                on:click={() => {
                  // Insert the API code at cursor position
                  const template = `fetch('/api/users')
  .then(response => response.json())
  .then(data => console.log(data));`;
                  // Add code to insert the template
                }}
              >
                Insert
              </button>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">POST /api/users</span>
              <button
                class="text-xs bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded"
                on:click={() => {
                  // Insert the API code at cursor position
                }}
              >
                Insert
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  {/if}

  {#if showContextMenu}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="fixed z-50"
      style="left: {contextMenuPosition.x}px; top: {contextMenuPosition.y}px"
      on:mouseleave={() => (showContextMenu = false)}
    >
      <div
        class="rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      >
        <div class="grid gap-1">
          <button
            class="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
            on:click={() => handleMenuItemClick("component")}
          >
            Add Component
          </button>
          <button
            class="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
            on:click={() => handleMenuItemClick("function")}
          >
            Add Function
          </button>
          <button
            class="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
            on:click={() => handleMenuItemClick("variable")}
          >
            Add Variable
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

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

  /* Add smooth transition for the API card */
  :global(.card) {
    transition: all 0.2s ease;
    animation: slideIn 0.2s ease;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
