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
  import { Lexer } from "berrycore";
  import {
    apiDetectorPlugin,
    customLanguage,
    myCustomLanguageSupport,
  } from "../util/codemirrorConfig";
  import { gridTheme } from "../util/CMTheme";

  export let value = "";

  let heightDifference = 0;
  let toolbarHeight = 28;

  onMount(() => {
    // const tkn = new Lexer(value).tokenize();
    // console.log(tkn);

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

  const extensions = [
    myCustomLanguageSupport,
    apiDetectorPlugin,
    customLanguage,
    gridTheme,
    EditorView.theme({
      ".api-suggestion-widget": {
        position: "relative",
        display: "inline-block",
      },
    }),
  ];
</script>

<div class="relative" style="height: {heightDifference}px;">
  <CodeMirror bind:value {extensions} lineWrapping={false} class="editor" />
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
  :global(.editor .customTag) {
    color: blue; /* Change the color to your desired style */
    font-weight: bold; /* Make the text bold */
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
