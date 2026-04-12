<script lang="ts">
  import Header from "$lib/ui/shared/Header.svelte";
  import { Button } from "$lib/components/ui/button";
  import { SquareTerminal, FolderOpen } from "lucide-svelte";
</script>

<div class="h-full w-full bg-background text-foreground flex flex-col font-sans relative overflow-hidden">
  <div class="px-2 pt-2 relative z-20">
    <Header />
  </div>

  <div class="flex-1 flex flex-col items-center justify-center p-8 relative">
    <!-- Glowing backdrop illusion -->
    <div class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-primary/10 to-transparent z-0 blur-[100px] pointer-events-none"></div>

    <div class="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-10">
      
      <!-- Brand icon big -->
      <div class="w-24 h-24 bg-card border border-border shadow-2xl rounded-[32px] flex items-center justify-center -rotate-3 hover:rotate-0 transition-transform duration-500 ease-out">
         <span class="text-5xl font-serif font-black bg-gradient-to-tr from-sky-400 via-primary to-purple-400 bg-clip-text text-transparent">Fb</span>
      </div>

      <div class="space-y-4">
        <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight">Welcome to Flexiberry</h1>
        <p class="text-muted-foreground text-lg px-8">Your next-generation visual programming environment powered by Berry Language architecture.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full sm:w-4/5 pt-6">
         <Button variant="outline" class="w-full h-20 flex items-center justify-start gap-5 px-6 bg-card/60 hover:bg-card border-border/50 hover:border-primary/30 transition-all shadow-sm rounded-xl hover:shadow-md">
            <div class="bg-primary/10 p-2.5 rounded-lg text-primary">
               <SquareTerminal class="w-6 h-6" strokeWidth={2}/>
            </div>
            <div class="flex flex-col items-start gap-1">
               <span class="font-semibold text-sm">New Script</span>
               <span class="text-[11px] text-muted-foreground">Start an empty diagram</span>
            </div>
         </Button>

         <Button variant="outline" class="w-full h-20 flex items-center justify-start gap-5 px-6 bg-card/60 hover:bg-card border-border/50 hover:border-emerald-500/30 transition-all shadow-sm rounded-xl hover:shadow-md">
            <div class="bg-emerald-500/10 p-2.5 rounded-lg text-emerald-400">
               <FolderOpen class="w-6 h-6" strokeWidth={2}/>
            </div>
            <div class="flex flex-col items-start gap-1">
               <span class="font-semibold text-sm">Open Workspace</span>
               <span class="text-[11px] text-muted-foreground">Browse local .berry files</span>
            </div>
         </Button>
      </div>

    </div>
  </div>
</div>
