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
  import { user } from "$lib/writable/auth.store";
  import { auth } from "$lib/firebase";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  import { themeIntensity } from "$lib/writable/theme.store";
  import { assistantOpen } from "$lib/writable/assistant.store";

  let starCount = "";

  onMount(async () => {
    try {
      const res = await fetch(
        "https://api.github.com/repos/flexiberry/flexiberry",
      );
      if (res.ok) {
        const data = await res.json();
        const stars = data.stargazers_count;
        if (typeof stars === "number") {
          if (stars >= 1000) {
            starCount = `${(stars / 1000).toFixed(1)}k`;
          } else {
            starCount = stars.toString();
          }
        }
      }
    } catch (e) {
      // ignore and fall back
    }
  });

  function handleModeSwitch() {
    assistantOpen.update((o) => !o);
  }

  // Reactive user profile values
  $: displayName = $user?.isAnonymous
    ? "Guest User"
    : $user?.displayName || $user?.email?.split("@")[0] || "Developer";

  $: email = $user?.isAnonymous
    ? "guest@flexiberry.dev"
    : $user?.email || "developer@flexiberry.dev";

  $: avatarInitial = (
    $user?.isAnonymous ? "G" : displayName?.[0] || "D"
  ).toUpperCase();
</script>

<header
  class="flex items-center justify-between px-1 py-1 bg-transparent w-full shrink-0"
>
  <!-- LEFT: Navigation block -->
  <div class="flex items-center gap-6">
    <!-- Main Logo Block -->
    <Button
      on:click={() => goto("/")}
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
        on:click={() => goto("/")}
        variant="ghost"
        size="icon"
        class="w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground"
      >
        <Home class="w-[18px] h-[18px]" strokeWidth={1.5} />
      </Button>

      <a
        href="https://github.com/flexiberry/flexiberry"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-block"
      >
        <Button
          variant="ghost"
          class="h-9 px-2.5 rounded-lg text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          <Github class="w-[16px] h-[16px]" strokeWidth={1.5} />
          <span class="text-xs font-medium">Github</span>
          {#if starCount}
            <div
              class="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded text-[10px] text-foreground"
            >
              <Star class="w-[10px] h-[10px] fill-current" strokeWidth={1.5} />
              {starCount}
            </div>
          {/if}
        </Button>
      </a>

      <a
        href="https://docs.flexiberry.dev"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-block"
      >
        <Button
          variant="ghost"
          size="icon"
          class="w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground"
        >
          <BookOpen class="w-[16px] h-[16px]" strokeWidth={1.5} />
        </Button>
      </a>

      <a
        href="https://docs.flexiberry.dev/cli.html"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-block"
      >
        <Button
          variant="ghost"
          class="h-9 px-2.5 rounded-lg text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          <TerminalSquare class="w-[16px] h-[16px]" strokeWidth={1.5} />
          <span class="text-xs font-medium">CLI Docs</span>
        </Button>
      </a>

      <div class="w-[1px] h-5 bg-border mx-1"></div>

      <div class="flex items-center gap-2">
        <Button
          on:click={toggleMode}
          variant="ghost"
          size="icon"
          class="w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground relative shrink-0"
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

        <!-- Dynamic Theme Background Intensity Control Slider -->
        <div
          class="flex items-center px-1.5 h-8 bg-muted/30 rounded-lg border border-border/20"
        >
          <input
            type="range"
            min="0"
            max="100"
            bind:value={$themeIntensity}
            class="w-16 h-1 bg-muted-foreground/30 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none theme-slider"
            title="Adjust background intensity"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- RIGHT: Action block -->
  <div class="flex items-center gap-6">
    <div
      class="flex items-center h-12 px-1.5 bg-card border border-border shadow-sm rounded-xl gap-1"
    >
      <Button
        variant="ghost"
        class="h-9 px-1.5 rounded-lg text-muted-foreground hover:text-primary flex items-center gap-2 transition-all hover:bg-primary/10"
        on:click={handleModeSwitch}
      >
        {#if !$assistantOpen}
          <Terminal class="w-[18px] h-[18px]" strokeWidth={1.5} />
          <span class="text-[10px] font-bold uppercase tracking-wider"
            >Assistant</span
          >
        {:else}
          <LayoutDashboard class="w-[18px] h-[18px]" strokeWidth={1.5} />
          <span class="text-[10px] font-bold uppercase tracking-wider"
            >Visual</span
          >
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
          {#if $user?.photoURL}
            <img
              src={$user.photoURL}
              alt={displayName}
              class="w-8 h-8 rounded-full object-cover border border-border/80 shrink-0"
              referrerpolicy="no-referrer"
            />
          {:else}
            <div
              class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/20"
            >
              {avatarInitial}
            </div>
          {/if}
          <div class="flex flex-col truncate min-w-[120px] max-w-[150px]">
            <span class="text-sm font-semibold leading-tight truncate"
              >{displayName}</span
            >
            <span class="text-[10px] text-muted-foreground truncate"
              >{email}</span
            >
          </div>
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content class="w-56" align="end" sideOffset={8}>
        <DropdownMenu.Label class="font-normal">
          <div class="flex flex-col space-y-1">
            <p class="text-sm font-medium leading-none">{displayName}</p>
            <p class="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Item
            class="cursor-pointer"
            on:click={() => goto("/profile")}>Profile</DropdownMenu.Item
          >
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          class="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer"
          on:click={() => auth.signOut()}>Log out</DropdownMenu.Item
        >
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
</header>

<style>
  /* Premium styling for range input */
  .theme-slider {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
  }
  .theme-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 3px;
    background: hsl(var(--muted-foreground) / 0.2);
    border-radius: 9999px;
  }
  .theme-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    margin-top: -3.5px;
    background-color: hsl(var(--primary));
    height: 10px;
    width: 10px;
    border-radius: 9999px;
    cursor: pointer;
    transition:
      transform 0.1s ease,
      background-color 0.1s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  .theme-slider::-webkit-slider-thumb:hover {
    transform: scale(1.3);
    background-color: hsl(var(--primary) / 0.9);
  }
  .theme-slider::-moz-range-track {
    width: 100%;
    height: 3px;
    background: hsl(var(--muted-foreground) / 0.2);
    border-radius: 9999px;
  }
  .theme-slider::-moz-range-thumb {
    background-color: hsl(var(--primary));
    height: 10px;
    width: 10px;
    border: none;
    border-radius: 9999px;
    cursor: pointer;
    transition:
      transform 0.1s ease,
      background-color 0.1s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  .theme-slider::-moz-range-thumb:hover {
    transform: scale(1.3);
    background-color: hsl(var(--primary) / 0.9);
  }
</style>
