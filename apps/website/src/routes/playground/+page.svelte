<script lang="ts">
  import { onMount } from "svelte";
  import { Navigation, Footer } from "$lib";
  
  // Dynamic import of @flexiberry/berrycore to prevent SSR issues on the server
  let BerryCoreClass: any = $state(null);
  let InterpreterEventEnum: any = $state(null);
  let ExecutionStatusEnum: any = $state(null);
  let BerryFormatterClass: any = $state(null);

  // Preset Codes
  const presets = {
    "petstore": `## ---------------------------------------------------------
## SWAGGER PETSTORE SEQUENCE EXAMPLE
## ---------------------------------------------------------

Var @UAT Petstore Settings
- baseUrl: "https://petstore.swagger.io/v2"
- petId: "123456789"

Api POST #addPet Add a new pet to the store
Url {{baseUrl}}/pet
Header
- "Content-Type": "application/json"
Body JSON \`
{
  "id": {{petId}},
  "name": "BerryDoggie",
  "status": "available"
}
\`

Api GET #getPetById Find pet by ID
Url {{baseUrl}}/pet/{{petId}}
Header
- "Accept": "application/json"

Task Add Pet and Find Sequence

Step Call Api addPet
Capture
- createdId: response.id
- createdName: response.name
Check
- $.status == 200 OR $.status == 201
- createdId != null
- createdName == "BerryDoggie"

Step Call Api getPetById
Params
- petId: Step.1.createdId
Capture
- petName: response.name
Check
- $.status == 200
- petName == Step.1.createdName
`,
    "kitchen-sink": `## ---------------------------------------------------------
## FLEXIBERRY KITCHEN SINK DEMONSTRATION FILE
## ---------------------------------------------------------

Var @Config Dev Env Settings
- name: "Integrator"
- env: "development"
- durationSec: 15

Api POST #simplePost Send dynamic parameters
Url https://httpbin.org/post
Header
- "Content-Type": "application/json"
Body JSON \`
{
  "sender": "{{name}}",
  "environment": "{{env}}",
  "duration": {{durationSec}}
}
\`

Task API Post Scenario

Step Call Api simplePost
Params
- name: secure.name
Check
- $.status == 200
- response.body.json.sender == "Integrator"
- response.body.json.secure == null
`,
    "auth-decryption": `## ---------------------------------------------------------
## SECURE AUTHENTICATION & DECRYPTION FLOW
## ---------------------------------------------------------

Var @UAT secure credentials
- name: "Integrator"
- apiKeyEncrypted: "U0ZMVVdFUkJFUlJZMjAyNg==" Decrypt

Api POST #validateSecureGateway Secure connection
Url https://httpbin.org/post
Header
- "Content-Type": "application/json"
- "X-API-KEY": "{{apiKeyEncrypted}}"
Body JSON \`
{
  "sender": "{{name}}",
  "secure": true
}
\`

Task Secure Endpoint Verification

Step Call Api validateSecureGateway
Params
- name: secure.name
- apiKeyEncrypted: secure.apiKeyEncrypted
Capture
- parsedKey: response.json.headers.X-Api-Key
- receivedSender: response.json.json.sender
Check
- $.status == 200
- parsedKey == secure.apiKeyEncrypted
- receivedSender == "Integrator"
`
  };

  // State Management (Svelte 5 Runes)
  let codeContent = $state(presets.petstore);
  let isRunning = $state(false);
  let executionMode = $state("dry"); // "dry" (dry run, simulated calls) or "live" (axios calls)
  let currentPreset = $state("petstore");
  let logs = $state<{ id: string; type: string; message: string; timestamp: string }[]>([]);
  let taskResults = $state<any[]>([]);
  let executionSummary = $state<{ total: number; passed: number; failed: number; duration: number }>({
    total: 0,
    passed: 0,
    failed: 0,
    duration: 0
  });
  let activeTabRight = $state("terminal"); // "terminal" or "results"

  let coreInstance: any = null;
  let termEl: HTMLDivElement | null = $state(null);

  onMount(async () => {
    // Check URL parameters for preset preloading
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const presetParam = urlParams.get("preset");
      if (presetParam && presetParam in presets) {
        currentPreset = presetParam;
        codeContent = presets[presetParam as keyof typeof presets];
      }
    }

    try {
      // Dynamic import of @flexiberry/berrycore to bypass SSR issues
      const coreModule = await import("@flexiberry/berrycore");
      BerryCoreClass = coreModule.BerryCore;
      InterpreterEventEnum = coreModule.InterpreterEvent;
      ExecutionStatusEnum = coreModule.ExecutionStatus;
      BerryFormatterClass = coreModule.BerryFormatter;
      
      addLog("system", "Flexiberry Compiler & Interpreter loaded. Ready.");
    } catch (e) {
      console.error(e);
      addLog("error", "Failed to load @flexiberry/berrycore. Running in sandbox simulated mode.");
    }
  });

  // Automatically scroll terminal to bottom
  $effect(() => {
    if (logs.length && termEl) {
      setTimeout(() => {
        termEl!.scrollTop = termEl!.scrollHeight;
      }, 50);
    }
  });

  // Load a selected preset
  function handlePresetChange(presetName: string) {
    currentPreset = presetName;
    if (presetName in presets) {
      codeContent = presets[presetName as keyof typeof presets];
      addLog("system", `Loaded preset: ${presetName}`);
    }
  }

  // Format Code Helper
  function formatCode() {
    if (BerryFormatterClass) {
      try {
        const formatted = BerryFormatterClass.format(codeContent);
        codeContent = formatted;
        addLog("system", "Code formatted successfully.");
      } catch (err: any) {
        addLog("error", `Format Error: ${err.message || err}`);
      }
    } else {
      // Fallback: simple trim/clean if core is not loaded
      codeContent = codeContent.split("\n").map(l => l.trimEnd()).join("\n");
      addLog("system", "Cleaned spacing formatting.");
    }
  }

  // Add Terminal Log helper
  function addLog(type: string, message: string) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    logs.push({
      id: Math.random().toString(),
      type,
      message,
      timestamp: time
    });
    logs = [...logs]; // enforce reactivity
  }

  // Run Test Script Command
  async function runScript() {
    if (isRunning) return;
    
    // Clear previous runs
    isRunning = true;
    logs = [];
    taskResults = [];
    executionSummary = { total: 0, passed: 0, failed: 0, duration: 0 };
    activeTabRight = "terminal";

    addLog("system", `Starting execution in ${executionMode.toUpperCase()} mode...`);

    const runStart = Date.now();

    // Fallback if @flexiberry/berrycore failed to load
    if (!BerryCoreClass) {
      simulateExecution();
      return;
    }

    try {
      // Instantiate BerryCore
      coreInstance = new BerryCoreClass(codeContent, {
        interpreterOptions: {
          dryRun: executionMode === "dry",
          apiTimeout: 10000,
          continueOnError: true
        }
      });

      // Hook events
      coreInstance.on(InterpreterEventEnum.Start, (payload: any) => {
        addLog("info", `🚀 Executing Script. Plan: ${payload.totalTasks} Tasks, ${payload.totalApis} APIs registered.`);
      });

      coreInstance.on(InterpreterEventEnum.Log, (payload: any) => {
        addLog(payload.level, payload.message);
      });

      coreInstance.on(InterpreterEventEnum.Error, (payload: any) => {
        addLog("error", `[Line ${payload.line ?? "?"}] ${payload.message}`);
      });

      coreInstance.on(InterpreterEventEnum.ApiCallBegin, (payload: any) => {
        addLog("api", `⚡ Calling API #${payload.apiName}: ${payload.method} ${payload.url}`);
      });

      coreInstance.on(InterpreterEventEnum.ApiCallDone, (payload: any) => {
        addLog("api", `   └─ API #${payload.apiName} returned status ${payload.status} (${payload.duration}ms)`);
      });

      coreInstance.on(InterpreterEventEnum.TaskBegin, (payload: any) => {
        addLog("task", `━━━━━━━━ Task [${payload.index + 1}] "${payload.title || "(unnamed)"}" beginning ━━━━━━━━`);
      });

      coreInstance.on(InterpreterEventEnum.TaskDone, (payload: any) => {
        // Collect results in state
        taskResults.push(payload);
        taskResults = [...taskResults];

        const icon = payload.status === ExecutionStatusEnum.Pass ? "✓" : "✗";
        const colorType = payload.status === ExecutionStatusEnum.Pass ? "system" : "error";
        addLog(colorType, `${icon} Task Done: "${payload.title}" Status: ${payload.status}`);
      });

      coreInstance.on(InterpreterEventEnum.StepDone, (payload: any) => {
        const icon = payload.status === ExecutionStatusEnum.Pass ? "✓" : "✗";
        const level = payload.status === ExecutionStatusEnum.Pass ? "info" : "warn";
        addLog(level, `   ${icon} Step [${payload.targetName}] Completed: ${payload.status}`);
      });

      // Run
      await coreInstance.run();

      // Complete Summary
      const elapsed = Date.now() - runStart;
      const passedCount = taskResults.filter(t => t.status === ExecutionStatusEnum.Pass).length;
      const failedCount = taskResults.filter(t => t.status !== ExecutionStatusEnum.Pass).length;

      executionSummary = {
        total: taskResults.length,
        passed: passedCount,
        failed: failedCount,
        duration: elapsed
      };

      addLog("system", `Execution finished in ${elapsed}ms. Passed: ${passedCount}/${taskResults.length}`);
      
      // Auto-switch tab to Results to show visual detail
      activeTabRight = "results";

    } catch (e: any) {
      console.error(e);
      addLog("error", `Execution crashed: ${e.message || e}`);
    } finally {
      isRunning = false;
      coreInstance = null;
    }
  }

  // Force Kill execution
  function killScript() {
    if (coreInstance) {
      try {
        coreInstance.kill();
        addLog("error", "💀 Execution force killed by user.");
      } catch (e) {
        addLog("error", "Failed to force kill runner.");
      }
    }
    isRunning = false;
  }

  // Fallback simulator for demo if package has error in browser sandbox
  function simulateExecution() {
    setTimeout(() => {
      addLog("info", "🚀 Executing in local browser sandbox emulator.");
      setTimeout(() => {
        addLog("task", "━━━━━━━━ Task [1] 'Pet store sequence' beginning ━━━━━━━━");
        setTimeout(() => {
          addLog("api", "⚡ Calling API #addPet: POST https://petstore.swagger.io/v2/pet");
          setTimeout(() => {
            addLog("api", "   └─ API #addPet returned status 200 (150ms)");
            addLog("info", "   ✓ Step [addPet] Completed: PASS");
            setTimeout(() => {
              addLog("api", "⚡ Calling API #getPetById: GET https://petstore.swagger.io/v2/pet/123456789");
              setTimeout(() => {
                addLog("api", "   └─ API #getPetById returned status 200 (95ms)");
                addLog("info", "   ✓ Step [getPetById] Completed: PASS");
                
                taskResults = [{
                  title: "Pet store sequence",
                  status: "PASS",
                  steps: [
                    { targetName: "addPet", status: "PASS", error: null, checksPassed: true, response: { status: 200, headers: {}, body: { id: 123456789, name: "BerryDoggie" } } },
                    { targetName: "getPetById", status: "PASS", error: null, checksPassed: true, response: { status: 200, headers: {}, body: { id: 123456789, name: "BerryDoggie" } } }
                  ]
                }];
                executionSummary = { total: 1, passed: 1, failed: 0, duration: 850 };
                addLog("system", "✓ Execution finished in 850ms. Passed: 1/1");
                isRunning = false;
                activeTabRight = "results";
              }, 200);
            }, 150);
          }, 200);
        }, 150);
      }, 100);
    }, 50);
  }
</script>

<svelte:head>
  <title>Flexiberry · Interactive Playground</title>
  <meta name="description" content="Type, format, and execute Berry API scripts in real-time. View logs and assertion outcomes directly in your web browser." />
</svelte:head>

<div class="min-h-screen bg-gray-950 text-gray-100 font-mono flex flex-col justify-between">
  <div>
    <!-- Navigation header -->
    <Navigation />

    <!-- Playground Workspace -->
    <section class="pt-24 pb-12 px-6 max-w-1200 mx-auto w-full">
      
      <!-- Toolbar Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 bg-gray-900/60 border border-white/5 rounded-2xl p-4 mb-6 backdrop-blur-md">
        
        <!-- Dropdown preset -->
        <div class="flex items-center gap-3">
          <span class="text-xs text-slate-500 font-bold uppercase tracking-wider">Preset:</span>
          <select 
            value={currentPreset}
            onchange={(e) => handlePresetChange((e.target as HTMLSelectElement).value)}
            class="bg-gray-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="petstore">Swagger Petstore Flow</option>
            <option value="kitchen-sink">Kitchen Sink Demo</option>
            <option value="auth-decryption">Secure Auth Decryption</option>
          </select>
        </div>

        <!-- Mode selector -->
        <div class="flex items-center gap-3 border-l border-white/5 pl-4">
          <span class="text-xs text-slate-500 font-bold uppercase tracking-wider">Runner Mode:</span>
          <div class="flex bg-gray-950 border border-white/10 rounded-lg p-0.5">
            <button 
              onclick={() => executionMode = "dry"}
              class="px-3 py-1 text-[10px] uppercase font-bold rounded-md transition {executionMode === 'dry' ? 'bg-emerald-500 text-gray-950 shadow-[0_0_10px_rgba(52,211,153,0.3)]' : 'text-slate-400 hover:text-white'}"
            >
              Dry (Simulated)
            </button>
            <button 
              onclick={() => executionMode = "live"}
              class="px-3 py-1 text-[10px] uppercase font-bold rounded-md transition {executionMode === 'live' ? 'bg-emerald-500 text-gray-950 shadow-[0_0_10px_rgba(52,211,153,0.3)]' : 'text-slate-400 hover:text-white'}"
            >
              Live (Axios)
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 ml-auto">
          <button 
            onclick={formatCode}
            class="bg-white/5 border border-white/10 hover:bg-white/10 text-xs px-4 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5"
            title="Auto-format code spacing"
          >
            Format
          </button>
          
          {#if isRunning}
            <button 
              onclick={killScript}
              class="bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-400 text-xs px-5 py-1.5 rounded-lg font-bold transition animate-pulse"
            >
              Kill Run
            </button>
          {:else}
            <button 
              onclick={runScript}
              class="bg-gradient-to-r from-emerald-400 to-emerald-600 text-gray-950 text-xs px-6 py-1.5 rounded-lg font-bold transition hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(52,211,153,0.3)] flex items-center gap-1.5"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <path d="M2 1 L8 5 L2 9 Z"/>
              </svg>
              Run Script
            </button>
          {/if}
        </div>
      </div>

      <!-- Main Columns -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        <!-- Left: Code Editor -->
        <div class="lg:col-span-6 flex flex-col bg-[#0d1117] border border-white/5 rounded-2xl overflow-hidden shadow-2xl min-h-[500px]">
          
          <!-- Editor Title -->
          <div class="flex items-center gap-2 px-5 py-3 bg-[#161b22] border-bottom border-white/5">
            <div class="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
            <span class="ml-3 text-[0.7rem] text-slate-500 font-mono tracking-tight uppercase">
              scratchpad.berry
            </span>
          </div>

          <!-- Textarea Editor -->
          <div class="flex-1 flex relative">
            <textarea
              bind:value={codeContent}
              placeholder="Write your .berry script here..."
              spellcheck="false"
              class="flex-1 w-full bg-transparent p-6 text-[12.5px] leading-6 font-mono text-emerald-400/90 focus:text-white border-none outline-none resize-none custom-scroll focus:ring-0 placeholder-slate-700"
            ></textarea>
          </div>

        </div>

        <!-- Right: Output Terminal & Status -->
        <div class="lg:col-span-6 flex flex-col bg-gray-900/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          
          <!-- Terminal Tabs -->
          <div class="flex bg-gray-950/80 border-b border-white/5">
            <button 
              onclick={() => activeTabRight = "terminal"}
              class="px-5 py-3 text-xs uppercase font-bold tracking-wider border-b-2 transition {activeTabRight === 'terminal' ? 'border-emerald-500 text-white bg-white/[0.02]' : 'border-transparent text-slate-500 hover:text-slate-300'}"
            >
              Console Output
            </button>
            <button 
              onclick={() => activeTabRight = "results"}
              class="px-5 py-3 text-xs uppercase font-bold tracking-wider border-b-2 transition relative {activeTabRight === 'results' ? 'border-emerald-500 text-white bg-white/[0.02]' : 'border-transparent text-slate-500 hover:text-slate-300'}"
            >
              Execution Summary
              {#if taskResults.length > 0}
                <span class="absolute right-2 top-2.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              {/if}
            </button>
          </div>

          <!-- Tab Content Terminal -->
          {#if activeTabRight === 'terminal'}
            <div 
              bind:this={termEl}
              class="flex-1 p-6 bg-gray-950/60 font-mono text-xs leading-5 overflow-y-auto max-h-[500px] min-h-[420px] custom-scroll flex flex-col gap-1.5"
            >
              {#if logs.length === 0}
                <div class="text-slate-600 italic select-none py-10 text-center">
                  Terminal idle. Click "Run Script" to start execution logs.
                </div>
              {:else}
                {#each logs as log (log.id)}
                  <div class="flex items-start gap-3 hover:bg-white/[0.01] rounded py-0.5 px-1">
                    <span class="text-[10px] text-slate-600 select-none mt-0.5">{log.timestamp}</span>
                    <span class="flex-1 whitespace-pre-wrap select-text {
                      log.type === 'error' ? 'text-red-400 font-bold' :
                      log.type === 'warn' ? 'text-amber-400' :
                      log.type === 'system' ? 'text-cyan-400 font-semibold' :
                      log.type === 'task' ? 'text-purple-400 font-bold' :
                      log.type === 'api' ? 'text-emerald-400/80' : 'text-slate-300'
                    }">{log.message}</span>
                  </div>
                {/each}
              {/if}
            </div>
          {:else}
            <!-- Tab Content: Summary Results Widget -->
            <div class="flex-1 p-6 bg-gray-950/30 flex flex-col gap-6 overflow-y-auto max-h-[500px] min-h-[420px] custom-scroll">
              
              {#if taskResults.length === 0}
                <div class="text-slate-600 italic select-none py-12 text-center">
                  No visual execution results yet. Run a script successfully to view metric outcomes.
                </div>
              {:else}
                <!-- Grid metrics -->
                <div class="grid grid-cols-4 gap-4">
                  <div class="bg-gray-950/50 border border-white/5 rounded-xl p-3 text-center">
                    <span class="block text-[10px] text-slate-500 uppercase font-bold mb-1">Total Tasks</span>
                    <span class="text-lg font-extrabold text-white">{executionSummary.total}</span>
                  </div>
                  <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                    <span class="block text-[10px] text-emerald-400 uppercase font-bold mb-1">Passed</span>
                    <span class="text-lg font-extrabold text-emerald-400">{executionSummary.passed}</span>
                  </div>
                  <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                    <span class="block text-[10px] text-red-400 uppercase font-bold mb-1">Failed</span>
                    <span class="text-lg font-extrabold text-red-400">{executionSummary.failed}</span>
                  </div>
                  <div class="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
                    <span class="block text-[10px] text-purple-400 uppercase font-bold mb-1">Duration</span>
                    <span class="text-xs font-extrabold text-purple-300 mt-1.5 block">{executionSummary.duration}ms</span>
                  </div>
                </div>

                <!-- Visual tasks list -->
                <div class="flex flex-col gap-4">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 border-b border-white/5 pb-2">Scenarios Detail</h4>
                  
                  {#each taskResults as task}
                    <div class="bg-gray-950/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
                      
                      <!-- Task main info -->
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-sm text-white">Task: "{task.title || '(unnamed)'}"</span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase {task.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}">{task.status}</span>
                      </div>

                      <!-- Steps inside Task -->
                      <div class="flex flex-col gap-2 border-t border-white/5 pt-3">
                        {#each task.steps as step}
                          <div class="flex flex-col gap-1.5 bg-black/20 p-2.5 rounded-lg border border-white/[0.02]">
                            <div class="flex items-center justify-between text-xs">
                              <span class="text-slate-300 font-mono">Step: <span class="text-emerald-400">Call Api {step.targetName}</span></span>
                              <span class="font-bold text-[9px] uppercase {step.status === 'PASS' ? 'text-emerald-400' : 'text-amber-400'}">{step.status}</span>
                            </div>

                            {#if step.response}
                              <div class="flex items-center gap-3 text-[10px] text-slate-500 font-mono bg-[#0d1117]/60 px-2 py-1 rounded">
                                <span>Status: <strong class="text-white">{step.response.status}</strong></span>
                                {#if step.response.body}
                                  <span class="truncate">Body preview: <code class="text-emerald-400/90 font-mono">{JSON.stringify(step.response.body).substring(0, 40)}...</code></span>
                                {/if}
                              </div>
                            {/if}

                            {#if step.error}
                              <div class="text-[10px] text-red-400 italic px-1">
                                Error: {step.error}
                              </div>
                            {/if}
                          </div>
                        {/each}
                      </div>

                    </div>
                  {/each}
                </div>
              {/if}

            </div>
          {/if}

        </div>

      </div>

    </section>

  </div>

  <!-- Navigation Footer -->
  <Footer />
</div>

<style>
  .max-w-1200 {
    max-width: 1200px;
  }
  
  /* Textarea line numbers placeholder style */
  textarea {
    box-sizing: border-box;
  }
  
  .custom-scroll::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 9999px;
  }
  .custom-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(52, 211, 153, 0.3);
  }
  
  /* Smooth transitions */
  button, select {
    transition: all 0.2s ease;
  }
</style>
