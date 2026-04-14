<script lang="ts">
  import { Search, Layers, Clock, FileCode2 } from "lucide-svelte";
  import { Input } from "$lib/components/ui/input";

  export let scrollY: number;
  export let currentFolderId: string | null;
  export let folderName: string;
  export let searchQuery: string;

  // Derive a date-based greeting for the workspace header
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
</script>

<div
  class="flex flex-col pt-6 pb-2 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] {scrollY >
  60
    ? 'opacity-0 -translate-y-6 pointer-events-none lg:-mt-24'
    : 'opacity-100 translate-y-0 lg:mt-0'}"
>
  <!-- App-style Workspace Header -->
  <div class="flex items-start justify-between mb-6 w-full">
    <div class="flex flex-col gap-1.5">
      <!-- Context Label -->
      <div class="flex items-center gap-2">
        <span
          class="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60"
        >
          <Layers class="w-3.5 h-3.5" />
          {currentFolderId ? "Directory" : "Workspace"}
        </span>
        <!-- Live status indicator -->
        <span
          class="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
          ></span>
          Active
        </span>
      </div>

      <!-- Primary Title (compact, left-aligned) -->
      <h1
        class="text-2xl sm:text-3xl font-bold tracking-tight {currentFolderId
          ? 'text-primary'
          : 'text-foreground'} transition-colors duration-300"
      >
        {currentFolderId ? folderName : greeting + ", Developer"}
      </h1>

      <!-- Subtitle (date + context, not a tagline) -->
      <p class="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
        <Clock class="w-3.5 h-3.5 shrink-0" />
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
        <span class="opacity-30">·</span>
        <span class="text-muted-foreground/70">
          {currentFolderId ? `Inside ${folderName}` : "Flexiberry Workspace"}
        </span>
      </p>
    </div>

    <!-- Quick Stats Chips -->
    <div class="hidden sm:flex items-center gap-2 mt-1 shrink-0">
      <div
        class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/40 border border-border/40 rounded-xl px-3 py-1.5 backdrop-blur-sm"
      >
        <FileCode2 class="w-3.5 h-3.5 text-primary" />
        .berry
      </div>
      <div
        class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/40 border border-border/40 rounded-xl px-3 py-1.5 backdrop-blur-sm"
      >
        <Layers class="w-3.5 h-3.5 text-indigo-500" />
        {currentFolderId ? "Folder View" : "Root"}
      </div>
    </div>
  </div>

  <!-- Search Bar -->
  <div
    class="w-full relative shadow-[0_4px_24px_rgb(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgb(0,0,0,0.2)] rounded-xl group"
  >
    <div
      class="absolute inset-0 bg-primary/8 blur-xl rounded-full transition-opacity group-focus-within:opacity-100 opacity-0 z-0"
    ></div>
    <Search
      class="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground/40 group-focus-within:text-primary transition-colors z-20 pointer-events-none"
    />
    <Input
      bind:value={searchQuery}
      placeholder="Search files, folders..."
      class="pl-12 h-11 text-[15px] rounded-xl bg-background/60 dark:bg-muted/30 backdrop-blur-xl border border-border/50 dark:border-white/10 hover:bg-background/80 group-focus-within:bg-background focus-visible:ring-1 focus-visible:ring-primary/40 relative z-10 font-normal transition-all duration-200"
    />
  </div>
</div>
