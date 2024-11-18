<script lang="ts">
  import CodeMirror from "svelte-codemirror-editor";
  import {
    EditorView,
    ViewPlugin,
    Decoration,
    WidgetType,
    ViewUpdate,
  } from "@codemirror/view";
  import SuggestionWidget from "./SuggestionWidget.svelte";

  let value = "";

  class ApiSuggestionWidget extends WidgetType {
    constructor(private view: EditorView) {
      super();
    }

    toDOM() {
      const wrapper = document.createElement("div");
      wrapper.className = "api-suggestion-widget";

      // Mount the Svelte component
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
        },
      });

      return wrapper;
    }

    destroy(dom: HTMLElement) {
      // Clean up the Svelte component if needed
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
        if (update.docChanged || update.selectionSet) {
          this.decorations = this.checkForApi(update.view);
        }
      }
    },
    {
      decorations: (v) => v.decorations,
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
    apiDetectorPlugin,
    EditorView.theme({
      ".api-suggestion-widget": {
        position: "relative",
        display: "inline-block",
      },
    }),
  ];
</script>

<div class="relative h-full">
  <CodeMirror bind:value {extensions} class="editor" />
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
