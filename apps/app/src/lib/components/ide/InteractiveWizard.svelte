<script lang="ts">
  import { apiFlow, varFlow, envFlow, taskFlow, stepFlow, buildCodeFromAnswers, type WizardStep } from './wizardFlows';
  import { onMount, tick, createEventDispatcher } from 'svelte';
  import { Check, ChevronRight } from 'lucide-svelte';
  import { berryBlocks } from "$lib/writable/berry.store";
  
  export let type: 'Api' | 'Var' | 'Task' | 'Env' | 'Step';
  export let blockId = "";
  export let initialAnswers: Record<string, any> = {};

  const dispatch = createEventDispatcher();

  function getApiPlaceholders(apiBlockContent: string): string[] {
    const urlLine = apiBlockContent.split('\n').find(line => line.trim().startsWith('Url'));
    if (!urlLine) return [];
    const regex = /\{\{?([\w-]+)\}?\}/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(urlLine)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }

  function getAvailableVariables(blocks: any[], currentBlockId: string): string[] {
    const vars: string[] = [];

    // 1. Parse Var blocks (Env level)
    blocks.forEach(b => {
      if (b.type === 'Var') {
        const lines = b.content.split('\n');
        lines.forEach((line: string) => {
          const match = line.trim().match(/^-\s+([\w-]+)\s*:/);
          if (match) {
            vars.push(match[1]);
          }
        });
      }
    });

    // 2. Parse preceding Step blocks inside the parent Task (Task level)
    const currentIdx = blocks.findIndex(b => b.id === currentBlockId);
    if (currentIdx !== -1) {
      let parentTaskIdx = -1;
      for (let i = currentIdx - 1; i >= 0; i--) {
        if (blocks[i].type === 'Task') {
          parentTaskIdx = i;
          break;
        }
      }

      if (parentTaskIdx !== -1) {
        let stepCounter = 0;
        for (let j = parentTaskIdx + 1; j < currentIdx; j++) {
          if (blocks[j].type === 'Step') {
            stepCounter++;
            const lines = blocks[j].content.split('\n');
            let insideCapture = false;
            lines.forEach((line: string) => {
              const trimmed = line.trim();
              if (trimmed.toLowerCase().startsWith('capture')) {
                insideCapture = true;
              } else if (insideCapture && trimmed.startsWith('-')) {
                const match = trimmed.match(/^-\s+([\w-]+)\s*:/);
                if (match) {
                  vars.push(`Step.${stepCounter}.${match[1]}`);
                }
              } else if (trimmed && !trimmed.startsWith('-') && !trimmed.toLowerCase().startsWith('capture')) {
                insideCapture = false;
              }
            });
          }
        }
      }
    }

    return Array.from(new Set(vars));
  }

  function getAvailableEnvironments(blocks: any[]): string[] {
    const envs: string[] = [];
    blocks.forEach(b => {
      if (b.type === 'Env') {
        const text = b.content.replace(/^Env\s+/i, '');
        const list = text.split(',').map((s: string) => s.trim().replace(/^-\s*/, '')).filter(Boolean);
        envs.push(...list);
      }
    });
    return Array.from(new Set(envs));
  }

  $: apiOptions = (() => {
    const list = $berryBlocks
      .filter(b => b.type === 'Api')
      .map(b => {
        const match = b.content.match(/#(\w+)/);
        return match ? match[1] : '';
      })
      .filter(Boolean)
      .map(name => ({ value: name, label: name }));
    return list.length > 0 ? list : [{ value: 'myApi', label: 'No APIs found (using default: myApi)' }];
  })();

  $: availableVars = getAvailableVariables($berryBlocks, blockId);

  let flow: WizardStep[] = [];
  $: flow = (() => {
    if (type !== 'Step') {
      return type === 'Api' ? apiFlow : 
             type === 'Var' ? varFlow : 
             type === 'Env' ? envFlow : taskFlow;
    }

    const baseFlow = [...stepFlow];
    if (answers.api) {
      const selectedApiName = answers.api;
      const apiBlock = $berryBlocks.find(b => {
        if (b.type !== 'Api') return false;
        const match = b.content.match(/#(\w+)/);
        return match && match[1] === selectedApiName;
      });

      if (apiBlock) {
        const placeholders = getApiPlaceholders(apiBlock.content);
        if (placeholders.length > 0) {
          const paramSteps: WizardStep[] = [];
          for (const param of placeholders) {
            paramSteps.push({
              id: `param_${param}`,
              type: 'text',
              message: `This API requires parameter "${param}". Please enter value:`,
              placeholder: `e.g. Store.stepId`,
              suggestions: availableVars
            });
          }
          baseFlow.splice(2, 0, ...paramSteps);
        }
      }
    }
    return baseFlow;
  })();

  let currentStepIndex = 0;
  let answers: Record<string, any> = { ...initialAnswers };
  
  // To show completed steps
  let completedLog: { step: WizardStep, answerDisplay: string }[] = [];

  $: availableEnvs = getAvailableEnvironments($berryBlocks);

  // Current active step
  $: activeStep = (() => {
    const step = flow[currentStepIndex];
    if (!step) return step;

    if (step.id === 'api') {
      return {
        ...step,
        options: apiOptions
      };
    }

    if (step.id === 'env') {
      return {
        ...step,
        suggestions: availableEnvs
      };
    }

    return step;
  })();

  // For text/select/confirm inputs
  let inputValue = '';
  let selectedIndex = 0;
  let suggestionIndex = -1;

  // Populate inputValue when step changes
  function loadStepValues() {
    suggestionIndex = -1;
    if (activeStep) {
      if (answers[activeStep.id] !== undefined) {
        if (activeStep.type === 'select') {
          const idx = activeStep.options?.findIndex(o => o.value === answers[activeStep.id]);
          selectedIndex = idx !== -1 ? idx! : 0;
        } else if (activeStep.type === 'confirm') {
          inputValue = answers[activeStep.id] ? 'y' : 'n';
        } else {
          inputValue = String(answers[activeStep.id]);
        }
      } else {
        inputValue = '';
        selectedIndex = 0;
      }
    }
  }

  $: currentStepIndex, loadStepValues();

  let inputRef: HTMLInputElement;

  async function nextStep() {
    if (!activeStep) return;

    let answerDisplay = '';
    
    if (activeStep.type === 'text') {
      if (!inputValue.trim() && activeStep.placeholder) {
         inputValue = activeStep.placeholder;
      }
      answers[activeStep.id] = inputValue;
      answerDisplay = inputValue;
    } else if (activeStep.type === 'select') {
      const opt = activeStep.options![selectedIndex];
      answers[activeStep.id] = opt.value;
      answerDisplay = opt.label;
    } else if (activeStep.type === 'confirm') {
      const isYes = inputValue.toLowerCase() === 'y' || inputValue.toLowerCase() === 'yes';
      answers[activeStep.id] = isYes;
      answerDisplay = isYes ? 'Yes' : 'No';
    }

    answers = { ...answers };

    completedLog = [...completedLog, { step: activeStep, answerDisplay }];
    inputValue = '';
    selectedIndex = 0;
    currentStepIndex++;

    // Skip conditional steps
    while (currentStepIndex < flow.length) {
      const nextActive = flow[currentStepIndex];
      if (nextActive.condition && !nextActive.condition(answers)) {
        currentStepIndex++;
      } else {
        break;
      }
    }

    if (currentStepIndex >= flow.length) {
      const code = buildCodeFromAnswers(type, answers);
      dispatch('complete', { code, answers: { ...answers } });
    } else {
      await tick();
      if (inputRef) inputRef.focus();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (activeStep?.type === 'select') {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % activeStep.options!.length;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + activeStep.options!.length) % activeStep.options!.length;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        nextStep();
      }
    } else if (activeStep?.type === 'confirm') {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (inputValue === '') inputValue = 'y'; // default yes
        nextStep();
      }
    } else {
      if (activeStep?.suggestions && activeStep.suggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          suggestionIndex = (suggestionIndex + 2) % (activeStep.suggestions.length + 1) - 1;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          suggestionIndex = (suggestionIndex + activeStep.suggestions.length + 1) % (activeStep.suggestions.length + 1) - 1;
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (suggestionIndex !== -1) {
            inputValue = activeStep.suggestions[suggestionIndex];
          }
          nextStep();
        }
      } else {
        if (e.key === 'Enter') {
          e.preventDefault();
          nextStep();
        }
      }
    }
  }

  onMount(() => {
    if (inputRef) inputRef.focus();
  });
</script>

<div 
  class="flex flex-col p-4 bg-background text-foreground font-mono text-sm rounded-lg border border-border/40 w-full min-h-[140px] shadow-sm relative overflow-hidden" 
  on:click={() => inputRef?.focus()}
  role="button"
  tabindex="0"
  on:keydown={(e) => e.key === 'Enter' && inputRef?.focus()}
>
  
  {#each completedLog as log}
    <div class="flex items-start gap-3 mb-3 opacity-80">
      <Check class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
      <div class="flex flex-col">
        <span class="font-medium">{log.step.message}</span>
        <span class="text-muted-foreground text-xs">{log.answerDisplay}</span>
      </div>
    </div>
  {/each}

  {#if activeStep}
    <div class="flex flex-col gap-2 mt-2">
      <div class="flex items-center gap-2">
        <ChevronRight class="w-4 h-4 text-primary shrink-0" />
        <span class="font-medium">{activeStep.message}</span>
        {#if activeStep.type === 'confirm'}
          <span class="text-xs text-muted-foreground">(Y/n)</span>
        {/if}
      </div>

      <div class="ml-6 flex flex-col items-start w-full">
        {#if activeStep.type === 'text' || activeStep.type === 'confirm'}
          <input
            bind:this={inputRef}
            bind:value={inputValue}
            on:keydown={handleKeydown}
            class="bg-transparent border-none outline-none text-foreground w-full placeholder:text-muted-foreground/40 font-mono text-sm"
            placeholder={activeStep.placeholder || ''}
            autocomplete="off"
            spellcheck="false"
          />
          {#if activeStep.suggestions && activeStep.suggestions.length > 0}
            <div class="flex flex-col gap-1 mt-3 w-full max-w-md border border-border/40 rounded-lg bg-card/50 overflow-hidden shadow-md divide-y divide-border/20" on:click|stopPropagation>
              <div class="px-3 py-1.5 bg-muted/40 text-[10px] font-black text-muted-foreground/60 uppercase tracking-wider flex justify-between items-center">
                <span>Suggestions</span>
                <span class="text-[9px] lowercase italic text-muted-foreground/40 font-medium">use ↑/↓ arrow keys, enter to pick</span>
              </div>
              <div class="flex flex-col max-h-[160px] overflow-y-auto">
                {#each activeStep.suggestions as sug, i}
                  <button
                    type="button"
                    class="flex items-center justify-between px-3 py-2 text-xs font-mono text-left w-full transition-colors cursor-pointer {i === suggestionIndex ? 'bg-violet-600/25 text-violet-300 font-bold' : 'hover:bg-muted/30 text-foreground'}"
                    on:click={() => {
                      inputValue = sug;
                      suggestionIndex = i;
                      inputRef?.focus();
                    }}
                  >
                    <div class="flex items-center gap-2">
                      {#if i === suggestionIndex}
                        <span class="text-violet-500 font-black">❯</span>
                      {:else}
                        <span class="w-2.5"></span>
                      {/if}
                      <span>{sug}</span>
                    </div>
                    
                    <span class="text-[9px] uppercase font-black px-1.5 py-0.5 rounded tracking-wider {sug.startsWith('Step.') ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}">
                      {sug.startsWith('Step.') ? 'Task Capture' : 'Env Var'}
                    </span>
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        {:else if activeStep.type === 'select'}
          <input
            bind:this={inputRef}
            on:keydown={handleKeydown}
            class="opacity-0 w-0 h-0 absolute"
            aria-hidden="true"
          />
          <div class="flex flex-col gap-1 w-full max-w-sm mt-1">
            {#each activeStep.options || [] as opt, i}
              <div 
                class="flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors {i === selectedIndex ? 'bg-primary/20 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/50'}"
              >
                <span class="w-4 text-center">{i === selectedIndex ? '❯' : ''}</span>
                <span>{opt.label}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}

</div>
