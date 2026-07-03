<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import CodeMirror from "svelte-codemirror-editor";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { mode } from "mode-watcher";
  import { slide } from "svelte/transition";
  import { 
    Play, 
    Database, 
    Code, 
    CheckCircle, 
    Trash2, 
    Wand2,
    ChevronDown
  } from "lucide-svelte";
  import type { BerryBlock } from "$lib/utils/berryBlocks";
  import InteractiveWizard from "./InteractiveWizard.svelte";
  import { berryLanguage, berryDarkTheme, berryLightTheme } from "$lib/utils/berryLanguage";
  import { berryBlocks } from "$lib/writable/berry.store";

  export let block: BerryBlock;
  export let index: number;
  export let allBlocks: BerryBlock[] = [];

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

  $: stepHeaderSummary = (() => {
    if (block.type !== 'Step') return '';
    const firstLine = block.content.trim().split('\n')[0] || '';
    return firstLine.replace(/^Step\b\s*/i, '');
  })();

  $: associatedSteps = (() => {
    if (block.type !== 'Task') return [];
    
    const myIndex = allBlocks.findIndex(b => b.id === block.id);
    if (myIndex === -1) return [];
    
    const steps: { id: string; name: string }[] = [];
    
    for (let i = myIndex + 1; i < allBlocks.length; i++) {
      const nextBlock = allBlocks[i];
      if (nextBlock.type === 'Step') {
        const firstLine = nextBlock.content.trim().split('\n')[0] || '';
        const name = firstLine.replace(/^Step\b\s*/i, '') || 'Unnamed Step';
        steps.push({ id: nextBlock.id, name });
      } else if (nextBlock.type === 'Code') {
        continue;
      } else {
        break;
      }
    }
    return steps;
  })();

  $: isLastStep = (() => {
    if (block.type !== 'Step') return false;
    const myIndex = allBlocks.findIndex(b => b.id === block.id);
    if (myIndex === -1 || myIndex === allBlocks.length - 1) return true;
    for (let i = myIndex + 1; i < allBlocks.length; i++) {
      const next = allBlocks[i];
      if (next.type === 'Step') return false;
      if (next.type === 'Code') continue;
      break;
    }
    return true;
  })();

  function scrollToAndExpandStep(stepId: string) {
    let wasCollapsed = false;
    berryBlocks.update(blocks => {
      return blocks.map(b => {
        if (b.id === stepId) {
          wasCollapsed = b.collapsed ?? false;
          return { ...b, collapsed: false };
        }
        return b;
      });
    });
    
    const delay = wasCollapsed ? 220 : 0;
    
    setTimeout(() => {
      const el = document.getElementById(`block-${stepId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight-flash');
        setTimeout(() => el.classList.remove('highlight-flash'), 1500);
      }
    }, delay);
  }

  function toggleCollapse() {
    const nextCollapsed = !block.collapsed;
    block.collapsed = nextCollapsed;
    
    if (block.type === 'Task' && nextCollapsed && associatedSteps.length > 0) {
      const stepIds = associatedSteps.map(s => s.id);
      berryBlocks.update(blocks => {
        return blocks.map(b => {
          if (stepIds.includes(b.id)) {
            return { ...b, collapsed: true };
          }
          return b;
        });
      });
    }
  }
</script>

<div 
  id="block-{block.id}"
  class="berry-block-wrapper group relative flex flex-col rounded-xl border border-border/40 bg-card shadow-sm hover:shadow-md transition-all duration-300"
  class:w-full={block.type !== 'Step'}
  class:w-[calc(100%-1rem)]={block.type === 'Step'}
  class:md:w-[calc(100%-2rem)]={block.type === 'Step'}
  class:ml-4={block.type === 'Step'}
  class:md:ml-8={block.type === 'Step'}
>
  <!-- Connector Lines for Step Blocks -->
  {#if block.type === 'Step'}
    <div 
      class="absolute left-[-12px] md:left-[-20px] top-[-32px] w-[2px] bg-border/60"
      class:bottom-0={!isLastStep}
      class:h-[52px]={isLastStep}
      aria-hidden="true"
    ></div>
    <div 
      class="absolute left-[-12px] md:left-[-20px] top-5 w-[12px] md:w-[20px] h-[2px] bg-border/60"
      aria-hidden="true"
    ></div>
  {/if}
  
  <!-- Block Header / Gutter -->
  <div class="flex items-center justify-between px-3 py-2 border-b border-border/20 bg-muted/20">
    <div class="flex items-center gap-2">
      <button 
        class="w-5 h-5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors shrink-0 cursor-pointer"
        on:click={toggleCollapse}
        title={block.collapsed ? "Expand Block" : "Collapse Block"}
      >
        <span 
          class="flex items-center justify-center transition-transform duration-200 transform" 
          class:rotate-[-90deg]={block.collapsed}
        >
          <ChevronDown class="w-3.5 h-3.5" />
        </span>
      </button>

      <!-- Icon -->
      <div class="flex items-center justify-center w-6 h-6 rounded-md {typeColor}">
        <svelte:component this={typeIcon} class="w-3.5 h-3.5" />
      </div>
      <!-- Title -->
      <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {block.type}
      </span>
      {#if block.collapsed && stepHeaderSummary}
        <span class="text-xs text-muted-foreground/80 font-mono bg-muted px-2 py-0.5 rounded border border-border/50 truncate max-w-[250px] md:max-w-[400px]">
          {stepHeaderSummary}
        </span>
      {/if}
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {#if block.type !== 'Code'}
        <button 
          class="w-7 h-7 flex items-center justify-center rounded {block.viewMode === 'wizard' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'} transition-colors cursor-pointer"
          title="Toggle Wizard"
          on:click={toggleMode}
        >
          <Wand2 class="w-3.5 h-3.5" />
        </button>
      {/if}
      <button 
        class="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
        title="Run Block"
        on:click={handleRun}
      >
        <Play class="w-3.5 h-3.5" />
      </button>
      <button 
        class="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
        title="Delete Block"
        on:click={handleDelete}
      >
        <Trash2 class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>

  <!-- Editor Content -->
  {#if !block.collapsed}
    <div 
      transition:slide={{ duration: 200 }}
      class="border-t border-border/10 overflow-hidden"
    >
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
  {/if}

  <!-- Task Steps Footer (always visible for Tasks) -->
  {#if block.type === 'Task' && associatedSteps.length > 0}
    <div class="border-t border-border/20 bg-muted/5 px-4 py-2.5 rounded-b-xl flex flex-col gap-1.5">
      <span class="text-[9px] font-extrabold text-muted-foreground/60 uppercase tracking-widest">
        Flow Steps:
      </span>
      <div class="flex flex-wrap gap-1.5">
        {#each associatedSteps as step}
          <button
            class="flex items-center gap-1.5 px-3 py-1 text-xs rounded-full border bg-background hover:bg-muted text-foreground font-mono transition-all shadow-sm hover:shadow-md hover:border-primary/30 active:scale-95 cursor-pointer"
            on:click={() => scrollToAndExpandStep(step.id)}
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {step.name}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  :global(.highlight-flash) {
    animation: flash-animation 1.5s ease-out;
  }
  @keyframes flash-animation {
    0% {
      border-color: hsl(var(--primary));
      box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
    }
    100% {
      border-color: hsl(var(--border) / 0.4);
      box-shadow: none;
    }
  }
</style>
