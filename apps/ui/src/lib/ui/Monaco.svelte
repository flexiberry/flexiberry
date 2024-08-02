<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import * as monaco from "./../../../node_modules/monaco-editor";
  import editorWorker from "./../../../node_modules/monaco-editor/esm/vs/editor/editor.worker?worker";
  import jsonWorker from "./../../../node_modules/monaco-editor/esm/vs/language/json/json.worker?worker";
  import cssWorker from "./../../../node_modules/monaco-editor/esm/vs/language/css/css.worker?worker";
  import htmlWorker from "./../../../node_modules/monaco-editor/esm/vs/language/html/html.worker?worker";
  import tsWorker from "./../../../node_modules/monaco-editor/esm/vs/language/typescript/ts.worker?worker";

  let editorElement: HTMLDivElement;
  let editor: monaco.editor.IStandaloneCodeEditor;
  let model: monaco.editor.ITextModel;

  function loadCode(code: string, language: string) {
    model = monaco.editor.createModel(code, language);

    editor.setModel(model);
  }

  onMount(async () => {
    self.MonacoEnvironment = {
      getWorker: function (_: any, label: string) {
        if (label === "json") {
          return new jsonWorker();
        }
        if (label === "css" || label === "scss" || label === "less") {
          return new cssWorker();
        }
        if (label === "html" || label === "handlebars" || label === "razor") {
          return new htmlWorker();
        }
        if (label === "typescript" || label === "javascript") {
          return new tsWorker();
        }
        return new editorWorker();
      },
    };

    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

    editor = monaco.editor.create(editorElement, {
      automaticLayout: true,
      theme: "vs-dark",
    });
  });

  onDestroy(() => {
    monaco?.editor.getModels().forEach((model) => model.dispose());
    editor?.dispose();
  });
</script>

<div class="flex h-screen w-full flex-col">
  <div class="flex-grow" bind:this={editorElement} />
</div>
