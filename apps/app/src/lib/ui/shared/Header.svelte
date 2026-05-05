<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    Home,
    Github,
    BookOpen,
    TerminalSquare,
    Plus,
    Play,
    Menu,
    Star,
    Sun,
    Moon,
  } from "lucide-svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { toggleMode } from "mode-watcher";
  import berry from "$lib/assets/berry.png";
  import { LayoutDashboard, Terminal } from "lucide-svelte";

  // ─── Props ────────────────────────────────────────────────────────
  export let mode: "visual" | "assistant" = "visual";
  export let onToggle: ((newMode: "visual" | "assistant") => void) | undefined =
    undefined;

  function handleModeSwitch() {
    if (!onToggle) return;
    onToggle(mode === "visual" ? "assistant" : "visual");
  }
</script>

<header
  class="flex items-center justify-between px-1 py-1 bg-transparent w-full shrink-0"
>
  <!-- LEFT: Navigation block -->
  <div class="flex items-center gap-6">
    <!-- Main Logo Block -->
    <Button
      variant="outline"
      class="w-12 h-12 p-0 bg-primary/10 border-primary/20 rounded-[14px] flex items-center justify-center text-primary hover:bg-primary/20 transition-colors shadow-sm"
    >
      <span class="font-bold text-xl tracking-tighter">
        <img
          src={berry}
          height={"38px"}
          class="h-[38px] flex-shrink-0 transition-transform duration-200"
          alt="FlexiBerry Logo"
        />
      </span>
    </Button>

    <!-- Central Icons Pill -->
    <div
      class="flex items-center h-12 px-1.5 bg-card border border-border shadow-sm rounded-xl gap-1"
    >
      <Button
        variant="ghost"
        size="icon"
        class="w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground"
      >
        <Home class="w-[18px] h-[18px]" strokeWidth={1.5} />
      </Button>
      <Button
        variant="ghost"
        class="h-9 px-2.5 rounded-lg text-muted-foreground hover:text-foreground flex items-center gap-2"
      >
        <Github class="w-[16px] h-[16px]" strokeWidth={1.5} />
        <span class="text-xs font-medium">Github</span>
        <div
          class="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded text-[10px] text-foreground"
        >
          <Star class="w-[10px] h-[10px] fill-current" strokeWidth={1.5} /> 1.2k
        </div>
      </Button>
      <Button
        variant="ghost"
        class="h-9 px-2.5 rounded-lg text-muted-foreground hover:text-foreground flex items-center gap-2"
      >
        <BookOpen class="w-[16px] h-[16px]" strokeWidth={1.5} />
      </Button>
      <Button
        variant="ghost"
        class="h-9 px-2.5 rounded-lg text-muted-foreground hover:text-foreground flex items-center gap-2"
      >
        <TerminalSquare class="w-[16px] h-[16px]" strokeWidth={1.5} />
        <span class="text-xs font-medium">CLI Docs</span>
      </Button>
      <div class="w-[1px] h-5 bg-border mx-1"></div>
      <Button
        on:click={toggleMode}
        variant="ghost"
        size="icon"
        class="w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground relative"
      >
        <Sun
          class="w-[18px] h-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          strokeWidth={1.5}
        />
        <Moon
          class="absolute w-[18px] h-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          strokeWidth={1.5}
        />
        <span class="sr-only">Toggle theme</span>
      </Button>
      <!-- <Button
        variant="secondary"
        class="h-9 px-3 rounded-lg text-foreground hover:bg-secondary/80 flex items-center gap-1.5 shadow-sm"
      >
        <Plus class="w-[16px] h-[16px]" strokeWidth={2} />
        <span class="text-xs font-medium tracking-wide">New Project</span>
      </Button> -->
    </div>
  </div>

  <!-- RIGHT: Action block -->
  <div class="flex items-center gap-6">
    <div
      class="flex items-center h-12 px-1.5 bg-card border border-border shadow-sm rounded-xl gap-1"
    >
      <Button
        variant="ghost"
        size="icon"
        class="w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground"
      >
        <Play class="w-[18px] h-[18px] ml-0.5" strokeWidth={1.5} />
      </Button>
      <div class="w-[1px] h-5 bg-border mx-1"></div>
      <Button
        variant="ghost"
        class="h-9 px-1.5 rounded-lg text-muted-foreground hover:text-primary flex items-center gap-2 transition-all hover:bg-primary/10"
        on:click={handleModeSwitch}
      >
        {#if mode === "visual"}
          <Terminal class="w-[18px] h-[18px]" strokeWidth={1.5} />
          <span class="text-[10px] font-bold uppercase tracking-wider">Assistant</span>
        {:else}
          <LayoutDashboard class="w-[18px] h-[18px]" strokeWidth={1.5} />
          <span class="text-[10px] font-bold uppercase tracking-wider">Visual</span>
        {/if}
      </Button>
    </div>

    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild let:builder>
        <div
          use:builder.action
          {...builder}
          class="flex items-center gap-3 pl-2 pr-4 h-12 bg-card border border-border rounded-full shadow-sm hover:bg-muted/50 transition-colors cursor-pointer select-none outline-none"
        >
          <div
            class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0"
          >
            R
          </div>
          <div class="flex flex-col truncate min-w-[120px] max-w-[150px]">
            <span class="text-sm font-semibold leading-tight truncate"
              >Rintu Raj</span
            >
            <span class="text-[10px] text-muted-foreground truncate"
              >rintu@flexiberry.com</span
            >
          </div>
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content class="w-56" align="end" sideOffset={8}>
        <DropdownMenu.Label class="font-normal">
          <div class="flex flex-col space-y-1">
            <p class="text-sm font-medium leading-none">Rintu Raj</p>
            <p class="text-xs leading-none text-muted-foreground">
              rintu@flexiberry.com
            </p>
          </div>
        </DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Item>Profile</DropdownMenu.Item>
          <DropdownMenu.Item>Billing</DropdownMenu.Item>
          <DropdownMenu.Item>Settings</DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          class="text-red-500 focus:bg-red-500/10 focus:text-red-500"
          >Log out</DropdownMenu.Item
        >
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
</header>
