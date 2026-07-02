<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import CodeMirror from "svelte-codemirror-editor";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { mode } from "mode-watcher";
  import { Play, Database, Code, CheckCircle, Trash2, Wand2 } from "lucide-svelte";
  import type { BerryBlock } from "$lib/utils/berryBlocks";
  import InteractiveWizard from "./InteractiveWizard.svelte";
  import { berryLanguage, berryDarkTheme, berryLightTheme } from "$lib/utils/berryLanguage";

  export let block: BerryBlock;
  export let index: number;

  const dispatch = createEventDispatcher();

  function handleDelete() {
    dispatch("delete", { id: block.id });
  }

  function handleRun() {
    dispatch("run", { id: block.id });
  }

  function toggleMode() {
    block.viewMode = block.viewMode === 'wizard' ? 'code' : 'wizard';
  }

  let wizardAnswers: Record<string, any> = {};

  function handleWizardComplete(e: CustomEvent<{ code: string, answers: Record<string, any> }>) {
    block.content = e.detail.code;
    block.viewMode = 'code';
    wizardAnswers = e.detail.answers;
  }

  // Icons based on block type
  $: typeIcon = 
    block.type === 'Api' ? Database :
    block.type === 'Var' ? Code :
    block.type === 'Env' ? Code :
    block.type === 'Step' ? CheckCircle :
    block.type === 'Task' ? CheckCircle : Code;
    
  $: typeColor = 
    block.type === 'Api' ? 'text-blue-500 bg-blue-500/10' :
    block.type === 'Var' ? 'text-purple-500 bg-purple-500/10' :
    block.type === 'Env' ? 'text-amber-500 bg-amber-500/10' :
    block.type === 'Step' ? 'text-rose-500 bg-rose-500/10' :
    block.type === 'Task' ? 'text-green-500 bg-green-500/10' : 'text-primary bg-primary/10';
</script>

<div class="berry-block-wrapper group relative flex flex-col w-full rounded-xl border border-border/40 bg-card shadow-sm hover:shadow-md transition-all duration-300">
  
  <!-- Block Header / Gutter -->
  <div class="flex items-center justify-between px-3 py-2 border-b border-border/20 bg-muted/20">
    <div class="flex items-center gap-2">
      <!-- Icon -->
      <div class="flex items-center justify-center w-6 h-6 rounded-md {typeColor}">
        <svelte:component this={typeIcon} class="w-3.5 h-3.5" />
      </div>
      <!-- Title -->
      <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {block.type}
      </span>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {#if block.type !== 'Code'}
        <button 
          class="w-7 h-7 flex items-center justify-center rounded {block.viewMode === 'wizard' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'} transition-colors"
          title="Toggle Wizard"
          on:click={toggleMode}
        >
          <Wand2 class="w-3.5 h-3.5" />
        </button>
      {/if}
      <button 
        class="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
        title="Run Block"
        on:click={handleRun}
      >
        <Play class="w-3.5 h-3.5" />
      </button>
      <button 
        class="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        title="Delete Block"
        on:click={handleDelete}
      >
        <Trash2 class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>

  <!-- Editor Content -->
  <div class="p-1 min-h-[40px] text-base">
    {#if block.viewMode === 'wizard' && block.type !== 'Code'}
      <div class="p-2">
        <InteractiveWizard 
          type={block.type} 
          initialAnswers={wizardAnswers}
          on:complete={handleWizardComplete} 
        />
      </div>
    {:else}
      <CodeMirror
        bind:value={block.content}
        theme={$mode === "dark" ? oneDark : null}
        lang={berryLanguage}
        extensions={[$mode === "dark" ? berryDarkTheme : berryLightTheme]}
        lineWrapping={true}
        styles={{
          "&": {
            backgroundColor: "transparent",
            fontSize: "14px"
          },
          ".cm-content": {
            padding: "8px 4px",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
          },
          ".cm-gutters": {
            backgroundColor: "transparent",
            borderRight: "none",
            color: "hsl(var(--muted-foreground) / 0.5)"
          },
          ".cm-activeLine": {
            backgroundColor: "hsl(var(--muted) / 0.3)"
          },
          ".cm-activeLineGutter": {
            backgroundColor: "transparent"
          }
        }}
      />
    {/if}
  </div>
</div>
