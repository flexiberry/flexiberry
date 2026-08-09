<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { saasApiClient } from "$lib/services/saasApiClient";
  import { db } from "$lib/db/db";
  import { activeWorkspaceId } from "$lib/writable/workspace.store";
  import { toast } from "svelte-sonner";
  import {
    Activity,
    Cloud,
    CheckCircle2,
    XCircle,
    Clock,
    RefreshCw,
    Play,
    Calendar,
    Trash2,
    X,
    Cpu,
    Sparkles,
    BarChart3,
    Terminal,
    FileCode2,
    Folder,
  } from "lucide-svelte";

  export var open: boolean = false;
  export var onClose: () => void = () => {};

  let activeTab: "metrics" | "runs" | "scheduler" = "metrics";
  let loading = false;

  let metricsData: any = null;
  let runsData: any[] = [];
  let schedulesData: any[] = [];

  let selectedRunId: string | null = null;
  let selectedRunDetails: any = null;
  let wsLogs: any[] = [];
  let activeWs: WebSocket | null = null;

  interface WorkspaceFileOption {
    id: string;
    name: string;
    folderName?: string;
  }
  let localWorkspaceFiles: WorkspaceFileOption[] = [];
  let isCustomScriptInput = false;

  // New Schedule form inputs
  let newScheduleScriptId = "";
  let newScheduleCron = "*/5 * * * *";

  $: if (open) {
    loadData();
    loadLocalWorkspaceFiles();
  }

  async function loadData() {
    loading = true;
    try {
      metricsData = await saasApiClient.getMonitoringMetrics();
      const runsRes = await saasApiClient.getExecutionRuns();
      runsData = runsRes.runs || [];
      const schedRes = await saasApiClient.getSchedules();
      schedulesData = schedRes.schedules || [];
    } catch (err: any) {
      toast.error(`Failed to load cloud monitoring data: ${err.message}`);
    } finally {
      loading = false;
    }
  }

  async function loadLocalWorkspaceFiles() {
    try {
      const wsId = activeWorkspaceId.current;
      const files = await db.fileStore.where("workspaceId").equals(wsId).toArray();
      const folders = await db.folderTable.where("workspaceId").equals(wsId).toArray();

      const folderMap = new Map<string, string>();
      for (const f of folders) {
        if (f.data && f.data.length > 0) {
          folderMap.set(f.id, f.data[0].name);
        }
      }

      localWorkspaceFiles = files.map((f) => ({
        id: f.name,
        name: f.name,
        folderName: f.folderId ? folderMap.get(f.folderId) : undefined,
      }));

      if (localWorkspaceFiles.length > 0 && !newScheduleScriptId) {
        newScheduleScriptId = localWorkspaceFiles[0].name;
      }
    } catch (err) {
      console.error("Failed to query workspace files:", err);
    }
  }

  async function inspectRun(runId: string) {
    selectedRunId = runId;
    wsLogs = [];
    try {
      const details = await saasApiClient.getRunDetails(runId);
      selectedRunDetails = details;

      if (details.run?.status === "running") {
        connectWs(runId);
      }
    } catch (err: any) {
      toast.error(`Failed to load run details: ${err.message}`);
    }
  }

  function connectWs(runId: string) {
    if (activeWs) activeWs.close();
    activeWs = saasApiClient.connectExecutionWebSocket(runId, (evt) => {
      wsLogs = [...wsLogs, evt];
    });
  }

  async function createSchedule() {
    if (!newScheduleScriptId || !newScheduleCron) {
      toast.error("Please select a file and enter a Cron Expression");
      return;
    }
    try {
      await saasApiClient.createSchedule(newScheduleScriptId, newScheduleCron);
      toast.success(`Schedule created for ${newScheduleScriptId}!`);
      loadData();
    } catch (err: any) {
      toast.error(`Failed to create schedule: ${err.message}`);
    }
  }

  async function deleteSchedule(scheduleId: string) {
    try {
      await saasApiClient.deleteSchedule(scheduleId);
      toast.success("Schedule deleted");
      loadData();
    } catch (err: any) {
      toast.error(`Failed to delete schedule: ${err.message}`);
    }
  }

  function handleOpenChange(val: boolean) {
    open = val;
    if (!val) onClose();
  }
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
  <Dialog.Content class="max-w-4xl h-[85vh] bg-popover border-border shadow-2xl rounded-2xl flex flex-col p-0 overflow-hidden text-foreground">
    
    <!-- Header -->
    <div class="px-6 py-4 border-b border-border/40 flex items-center justify-between bg-card/50">
      <div class="flex items-center gap-3">
        <div class="p-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl">
          <Cloud class="w-5 h-5" />
        </div>
        <div>
          <Dialog.Title class="text-base font-bold flex items-center gap-2 text-foreground">
            Flexiberry Cloud Monitoring
            {#if metricsData}
              <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full
                {metricsData.planTier === 'pro' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20' : 'bg-primary/15 text-primary border border-primary/20'}">
                {metricsData.planTier} Plan
              </span>
            {/if}
          </Dialog.Title>
          <Dialog.Description class="text-xs text-muted-foreground mt-0.5">
            Serverless edge metrics, execution logs, & scheduled test suites
          </Dialog.Description>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex border-b border-border/40 px-6 bg-muted/30 gap-4 text-xs font-semibold">
      <button
        on:click={() => (activeTab = "metrics")}
        class="py-3 border-b-2 flex items-center gap-2 transition {activeTab === 'metrics' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}"
      >
        <BarChart3 class="w-3.5 h-3.5" /> Overview & Metrics
      </button>
      <button
        on:click={() => (activeTab = "runs")}
        class="py-3 border-b-2 flex items-center gap-2 transition {activeTab === 'runs' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}"
      >
        <Activity class="w-3.5 h-3.5" /> Execution Runs ({runsData.length})
      </button>
      <button
        on:click={() => (activeTab = "scheduler")}
        class="py-3 border-b-2 flex items-center gap-2 transition {activeTab === 'scheduler' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}"
      >
        <Calendar class="w-3.5 h-3.5" /> Berry Scheduler ({schedulesData.length})
      </button>

      <button on:click={loadData} class="ml-auto my-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition">
        <RefreshCw class="w-3.5 h-3.5 {loading ? 'animate-spin' : ''}" /> Refresh
      </button>
    </div>

    <!-- Content Area -->
    <div class="p-6 overflow-y-auto flex-1 space-y-6 bg-background">

      {#if activeTab === "metrics"}
        {#if metricsData}
          <!-- Quota Usage Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 bg-card border border-border/50 rounded-xl space-y-2.5 shadow-sm">
              <div class="flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span class="flex items-center gap-1.5"><Cpu class="w-4 h-4 text-primary" /> Cloud Berry Runs</span>
                <span class="font-mono text-foreground font-bold">{metricsData.quotas.monthlyRunsUsed} / {metricsData.quotas.monthlyRunsLimit}</span>
              </div>
              <div class="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div
                  class="bg-primary h-full transition-all"
                  style="width: {Math.min(100, (metricsData.quotas.monthlyRunsUsed / metricsData.quotas.monthlyRunsLimit) * 100)}%"
                ></div>
              </div>
            </div>

            <div class="p-4 bg-card border border-border/50 rounded-xl space-y-2.5 shadow-sm">
              <div class="flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span class="flex items-center gap-1.5"><Sparkles class="w-4 h-4 text-purple-500" /> AI Copilot Queries</span>
                <span class="font-mono text-foreground font-bold">{metricsData.quotas.monthlyCopilotUsed} / {metricsData.quotas.monthlyCopilotLimit}</span>
              </div>
              <div class="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div
                  class="bg-purple-500 h-full transition-all"
                  style="width: {Math.min(100, (metricsData.quotas.monthlyCopilotUsed / metricsData.quotas.monthlyCopilotLimit) * 100)}%"
                ></div>
              </div>
            </div>

            <div class="p-4 bg-card border border-border/50 rounded-xl space-y-2.5 shadow-sm">
              <div class="flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span class="flex items-center gap-1.5"><Cloud class="w-4 h-4 text-emerald-500" /> Synced Workspaces</span>
                <span class="font-mono text-foreground font-bold">1 / {metricsData.quotas.syncedWorkspacesLimit}</span>
              </div>
              <div class="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full" style="width: 100%"></div>
              </div>
            </div>
          </div>

          <!-- Global Metrics Cards -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="p-4 bg-card border border-border/50 rounded-xl text-center shadow-sm">
              <div class="text-2xl font-extrabold text-foreground">{metricsData.metrics.totalRuns}</div>
              <div class="text-xs text-muted-foreground font-medium mt-1">Total Executions</div>
            </div>
            <div class="p-4 bg-card border border-border/50 rounded-xl text-center shadow-sm">
              <div class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{metricsData.metrics.passRatePercent}%</div>
              <div class="text-xs text-muted-foreground font-medium mt-1">Pass Rate</div>
            </div>
            <div class="p-4 bg-card border border-border/50 rounded-xl text-center shadow-sm">
              <div class="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{metricsData.metrics.passedRuns}</div>
              <div class="text-xs text-muted-foreground font-medium mt-1">Passed Runs</div>
            </div>
            <div class="p-4 bg-card border border-border/50 rounded-xl text-center shadow-sm">
              <div class="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{metricsData.metrics.failedRuns}</div>
              <div class="text-xs text-muted-foreground font-medium mt-1">Failed Runs</div>
            </div>
          </div>
        {/if}

      {:else if activeTab === "runs"}
        <div class="space-y-4">
          {#if runsData.length === 0}
            <div class="text-center py-12 text-muted-foreground text-sm">No cloud execution runs recorded yet.</div>
          {:else}
            <div class="border border-border/50 rounded-xl overflow-hidden bg-card shadow-sm">
              <table class="w-full text-left text-xs text-foreground">
                <thead class="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold">
                  <tr>
                    <th class="px-4 py-3">Run ID</th>
                    <th class="px-4 py-3">Status</th>
                    <th class="px-4 py-3">Source</th>
                    <th class="px-4 py-3">Duration</th>
                    <th class="px-4 py-3">Started</th>
                    <th class="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border/40 font-medium">
                  {#each runsData as run}
                    <tr class="hover:bg-muted/30 transition-colors">
                      <td class="px-4 py-3 font-mono text-xs text-primary font-bold">{run.id}</td>
                      <td class="px-4 py-3">
                        {#if run.status === 'passed'}
                          <span class="px-2.5 py-0.5 text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full font-bold">Passed</span>
                        {:else if run.status === 'failed'}
                          <span class="px-2.5 py-0.5 text-[10px] bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-full font-bold">Failed</span>
                        {:else}
                          <span class="px-2.5 py-0.5 text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full font-bold animate-pulse">{run.status}</span>
                        {/if}
                      </td>
                      <td class="px-4 py-3 uppercase text-[10px] text-muted-foreground font-bold">{run.trigger_source}</td>
                      <td class="px-4 py-3 font-mono text-xs">{run.duration_ms || 0} ms</td>
                      <td class="px-4 py-3 text-xs text-muted-foreground">{new Date(run.started_at).toLocaleTimeString()}</td>
                      <td class="px-4 py-3">
                        <button
                          on:click={() => inspectRun(run.id)}
                          class="text-xs text-primary font-semibold hover:underline"
                        >
                          Inspect Logs
                        </button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}

          {#if selectedRunDetails}
            <div class="p-4 bg-card border border-border/50 rounded-xl space-y-3 shadow-sm mt-4">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-foreground">
                  <Terminal class="w-4 h-4 text-primary" /> Step Logs: {selectedRunId}
                </h4>
                <button on:click={() => (selectedRunDetails = null)} class="text-xs text-muted-foreground hover:text-foreground font-medium">Close Logs</button>
              </div>
              <div class="bg-muted/40 border border-border/40 p-3 rounded-xl font-mono text-xs text-foreground max-h-48 overflow-y-auto space-y-1.5">
                {#each selectedRunDetails.stepLogs as step}
                  <div class="flex items-center justify-between border-b border-border/30 pb-1">
                    <span>Step {step.step_number}: {step.step_name}</span>
                    <span class="{step.status === 'passed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} font-bold">{step.status}</span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>

      {:else if activeTab === "scheduler"}
        <div class="space-y-6">
          <!-- Create Schedule Form -->
          <div class="p-4 bg-card border border-border/50 rounded-xl space-y-4 shadow-sm">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-foreground">
                <Calendar class="w-4 h-4 text-primary" /> Schedule New Test Run
              </h4>
              <button
                on:click={() => (isCustomScriptInput = !isCustomScriptInput)}
                class="text-[11px] text-primary hover:underline font-medium"
              >
                {isCustomScriptInput ? "Choose from Workspace Files" : "Custom Script Name"}
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              {#if !isCustomScriptInput && localWorkspaceFiles.length > 0}
                <div class="flex flex-col gap-1">
                  <label class="text-[10px] font-bold uppercase text-muted-foreground">Workspace File</label>
                  <select
                    bind:value={newScheduleScriptId}
                    class="h-9 px-3 bg-muted/40 border border-border/50 rounded-lg text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {#each localWorkspaceFiles as file}
                      <option value={file.name}>
                        {file.folderName ? `${file.folderName} / ${file.name}` : file.name}
                      </option>
                    {/each}
                  </select>
                </div>
              {:else}
                <div class="flex flex-col gap-1">
                  <label class="text-[10px] font-bold uppercase text-muted-foreground">Script ID / Path</label>
                  <Input
                    type="text"
                    placeholder="e.g. petstore.berry"
                    bind:value={newScheduleScriptId}
                    class="h-9 text-xs font-mono"
                  />
                </div>
              {/if}

              <div class="flex flex-col gap-1">
                <label class="text-[10px] font-bold uppercase text-muted-foreground">Cron Expression</label>
                <Input
                  type="text"
                  placeholder="*/5 * * * *"
                  bind:value={newScheduleCron}
                  class="h-9 text-xs font-mono"
                />
              </div>

              <div class="flex flex-col justify-end">
                <Button
                  on:click={createSchedule}
                  class="h-9 text-xs font-semibold"
                >
                  Create Schedule
                </Button>
              </div>
            </div>
          </div>

          <!-- Active Schedules Table -->
          <div class="border border-border/50 rounded-xl overflow-hidden bg-card shadow-sm">
            <table class="w-full text-left text-xs text-foreground">
              <thead class="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold">
                <tr>
                  <th class="px-4 py-3">Schedule ID</th>
                  <th class="px-4 py-3">Script File</th>
                  <th class="px-4 py-3">Cron Expression</th>
                  <th class="px-4 py-3">Next Run</th>
                  <th class="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border/40 font-medium">
                {#each schedulesData as sched}
                  <tr class="hover:bg-muted/30 transition-colors">
                    <td class="px-4 py-3 font-mono text-xs text-primary font-bold">{sched.id}</td>
                    <td class="px-4 py-3 text-xs flex items-center gap-1.5">
                      <FileCode2 class="w-3.5 h-3.5 text-indigo-400" />
                      <span class="font-mono">{sched.script_id}</span>
                    </td>
                    <td class="px-4 py-3 font-mono text-xs text-amber-600 dark:text-amber-400 font-bold">{sched.cron_expression}</td>
                    <td class="px-4 py-3 text-xs text-muted-foreground">{new Date(sched.next_run_at).toLocaleString()}</td>
                    <td class="px-4 py-3 text-right">
                      <button on:click={() => deleteSchedule(sched.id)} class="p-1 hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-lg transition">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}

    </div>
  </Dialog.Content>
</Dialog.Root>
