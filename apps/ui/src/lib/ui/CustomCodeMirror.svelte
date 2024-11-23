<script lang="ts">
  import CodeMirror from "svelte-codemirror-editor";
  import {
    EditorView,
    ViewPlugin,
    Decoration,
    WidgetType,
    ViewUpdate,
    keymap,
  } from "@codemirror/view";
  import { StateEffect } from "@codemirror/state";
  import SuggestionWidget from "./SuggestionWidget.svelte";
  import { onMount } from "svelte";

  let value = "";

  let heightDifference = 0;

  let toolbarHeight = 28; // Height of the bottom toolbar

  onMount(() => {
    // Create ResizeObserver to watch container size changes

    const handleResize = () => {
      const headerHeight = document?.querySelector("Header")?.clientHeight || 0;
      const bodyHeight = window.innerHeight || 0;
      heightDifference = bodyHeight - headerHeight - toolbarHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  // Define the clear effect
  const clearSuggestionEffect = StateEffect.define<boolean>();

  class ApiSuggestionWidget extends WidgetType {
    constructor(private view: EditorView) {
      super();
    }

    toDOM() {
      const wrapper = document.createElement("div");
      wrapper.className = "api-suggestion-widget";

      new SuggestionWidget({
        target: wrapper,
        props: {
          onInsert: (template: string) => {
            const transaction = this.view.state.update({
              changes: {
                from: this.view.state.selection.main.head,
                insert: template,
              },
            });
            this.view.dispatch(transaction);
          },
          onClose: () => {
            const transaction = this.view.state.update({
              effects: clearSuggestionEffect.of(true),
            });
            this.view.dispatch(transaction);
          },
        },
      });

      return wrapper;
    }
  }

  // Plugin to detect "api" text
  const apiDetectorPlugin = ViewPlugin.fromClass(
    class {
      decorations: any;

      constructor(view: EditorView) {
        this.decorations = this.checkForApi(view);
      }

      checkForApi(view: EditorView) {
        const doc = view.state.doc;
        const cursorPos = view.state.selection.main.head;
        const line = doc.lineAt(cursorPos);
        const lineText = line.text;

        if (lineText.includes("api")) {
          return Decoration.set([
            Decoration.widget({
              widget: new ApiSuggestionWidget(view),
              side: 1,
            }).range(line.from + lineText.indexOf("api") + 3),
          ]);
        }
        return Decoration.none;
      }

      update(update: ViewUpdate) {
        // Check for clear effect
        for (let tr of update.transactions) {
          for (let effect of tr.effects) {
            if (effect.is(clearSuggestionEffect)) {
              this.decorations = Decoration.none;
              return;
            }
          }
        }

        if (update.docChanged || update.selectionSet) {
          this.decorations = this.checkForApi(update.view);
        }
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );

  // // Add escape key handling
  // const escapeKeymap = keymap.of([
  //   {
  //     key: "Escape",
  //     run: (view) => {
  //       // console.log(view);
  //       // if (view.state.field(apiDetectorPlugin.decorations)) {
  //       //   view.dispatch({
  //       //     effects: clearSuggestionEffect.of(true),
  //       //   });
  //       //   return true;
  //       // }
  //       return false;
  //     },
  //   },
  // ]);

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
    apiDetectorPlugin,
    // escapeKeymap,
    EditorView.theme({
      ".api-suggestion-widget": {
        position: "relative",
        display: "inline-block",
      },
    }),
  ];
</script>

<div class="relative" style="height: {heightDifference}px;">
  <CodeMirror bind:value {extensions} class="editor" />
</div>

<style>
  :global(.editor) {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  :global(.editor .cm-editor) {
    height: 100%;
    overflow: auto;
  }

  :global(.api-suggestion-widget) {
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
