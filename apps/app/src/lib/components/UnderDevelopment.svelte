<script lang="ts">
  import { onMount } from "svelte";
  import {
    Construction,
    ArrowRight,
    Check,
    Sparkles,
    Lock,
    Cpu,
    Code2,
    Layers,
  } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent } from "$lib/components/ui/card";
  import berry from "$lib/assets/berry.png";

  // Callback to signal layout to bypass
  export let onBypass: () => void;

  let email = "";
  let isSubmitted = false;
  let isSubmitting = false;

  let showDevAccess = false;
  let devCode = "";
  let devError = "";

  const handleSubscribe = async (e: Event) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    isSubmitting = true;
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));
    isSubmitting = false;
    isSubmitted = true;
    toast.success("Welcome aboard! We'll keep you updated.");
  };

  const handleDevSubmit = (e: Event) => {
    e.preventDefault();
    const cleanCode = devCode.trim().toLowerCase();
    if (
      cleanCode === "berry" ||
      cleanCode === "berrydev" ||
      cleanCode === "flexiberry"
    ) {
      toast.success("Developer Access Granted!");
      localStorage.setItem("flexiberry_dev_bypass", "true");
      onBypass();
    } else {
      devError = "Invalid access code. Please try again.";
      toast.error("Access denied");
      setTimeout(() => {
        devError = "";
      }, 3000);
    }
  };

  // Animated text/status rotations
  let currentStatusIndex = 0;
  const statuses = [
    "Refining the visual compiler engine...",
    "Perfecting real-time workspace sync...",
    "Crafting the ultimate developer sandbox...",
  ];

  onMount(() => {
    const interval = setInterval(() => {
      currentStatusIndex = (currentStatusIndex + 1) % statuses.length;
    }, 4000);
    return () => clearInterval(interval);
  });
</script>

<div
  class="relative min-h-screen w-full flex items-center justify-center bg-background text-foreground overflow-hidden font-sans select-none"
>
  <!-- Glowing Mesh Gradient Background -->
  <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <div
      class="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 dark:bg-primary/10 blur-[150px] animate-pulse"
      style="animation-duration: 8s;"
    ></div>
    <div
      class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] animate-pulse"
      style="animation-duration: 12s; animation-delay: 2s;"
    ></div>
    <div
      class="absolute top-[30%] right-[20%] w-[40%] h-[40%] rounded-full bg-violet-600/5 dark:bg-violet-600/5 blur-[130px] animate-pulse"
      style="animation-duration: 10s; animation-delay: 4s;"
    ></div>

    <!-- Premium Grid Overlay -->
    <div
      class="absolute inset-0 bg-[radial-gradient(hsl(var(--primary)/0.08)_1px,transparent_1px)] bg-[size:24px_24px] opacity-60"
    ></div>
  </div>

  <div
    class="relative z-10 max-w-xl w-full px-6 py-12 flex flex-col items-center"
  >
    <!-- Brand / Logo -->
    <div class="flex items-center gap-3 mb-8 animate-fade-in">
      <div
        class="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 shadow-sm overflow-hidden group"
      >
        <div
          class="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        ></div>
        <img
          src={berry}
          alt="Flexiberry Logo"
          class="w-8 h-8 object-contain relative z-10 animate-bounce-slow"
        />
      </div>
      <div class="text-left">
        <h1 class="text-2xl font-bold tracking-tight text-foreground">
          Flexiberry
        </h1>
        <p
          class="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold"
        >
          Visual Coding Ecosystem
        </p>
      </div>
    </div>

    <!-- Main Card -->
    <Card
      class="w-full bg-card/60 backdrop-blur-xl border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-primary/25 transition-all duration-500"
    >
      <!-- Glow effect top border -->
      <div
        class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      ></div>

      <!-- Content -->
      <CardContent class="p-0 text-center">
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-6"
        >
          <Construction size={12} class="animate-spin-slow" />
          Under Construction
        </span>

        <h2
          class="text-3xl font-extrabold tracking-tight text-card-foreground mb-3 leading-snug"
        >
          Crafting the Future of Api Testing framework.
        </h2>

        <p
          class="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto mb-8"
        >
          We're building the next generation of flexiberry script editor
        </p>

        <!-- Animated Progress / Status Bar -->
        <div
          class="mb-8 p-4 bg-muted/60 dark:bg-muted/30 border border-border rounded-2xl text-left"
        >
          <div class="flex justify-between items-center mb-2">
            <span
              class="text-xs font-semibold text-primary flex items-center gap-1"
            >
              <Sparkles size={12} />
              Phase 1 Development
            </span>
            <span class="text-xs font-bold text-foreground">85% Complete</span>
          </div>
          <div class="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
            <div
              class="h-full w-[85%] bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.3)]"
            ></div>
          </div>
          <div
            class="h-5 flex items-center justify-between text-[11px] text-muted-foreground transition-all duration-300"
          >
            <span class="truncate italic">{statuses[currentStatusIndex]}</span>
            <span class="shrink-0 text-muted-foreground/60 ml-2"
              >v0.1.2-alpha</span
            >
          </div>
        </div>

        <!-- System Stats Grid -->
        <div class="grid grid-cols-3 gap-3 mb-8">
          <div
            class="p-3 bg-muted/40 border border-border/80 rounded-xl flex flex-col items-center"
          >
            <Cpu size={16} class="text-primary mb-1" />
            <span class="text-[10px] text-muted-foreground font-medium"
              >Core Engine</span
            >
            <span class="text-xs font-bold text-foreground mt-0.5">90%</span>
          </div>
          <div
            class="p-3 bg-muted/40 border border-border/80 rounded-xl flex flex-col items-center"
          >
            <Code2 size={16} class="text-primary mb-1" />
            <span class="text-[10px] text-muted-foreground font-medium"
              >Visual IDE</span
            >
            <span class="text-xs font-bold text-foreground mt-0.5">80%</span>
          </div>
          <div
            class="p-3 bg-muted/40 border border-border/80 rounded-xl flex flex-col items-center"
          >
            <Layers size={16} class="text-primary mb-1" />
            <span class="text-[10px] text-muted-foreground font-medium"
              >Berrycore</span
            >
            <span class="text-xs font-bold text-foreground mt-0.5">95%</span>
          </div>
        </div>

        <!-- Subscription / Form -->
        {#if !isSubmitted}
          <form
            on:submit={handleSubscribe}
            class="relative flex items-center p-1 rounded-2xl bg-background border border-input focus-within:border-primary/50 transition-all duration-300"
          >
            <div class="flex-1 flex items-center pl-3">
              <span class="text-muted-foreground mr-2 text-sm">@</span>
              <input
                type="email"
                bind:value={email}
                placeholder="Enter your email for early access"
                class="w-full bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground text-foreground py-2 focus:ring-0 focus:outline-none"
                required
                disabled={isSubmitting}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              class="h-9 px-4 rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all"
              disabled={isSubmitting}
            >
              {#if isSubmitting}
                <span
                  class="animate-spin inline-block w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full"
                ></span>
                Sending...
              {:else}
                Notify Me
                <ArrowRight size={12} />
              {/if}
            </Button>
          </form>
        {:else}
          <div
            class="py-4 px-6 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center gap-2.5 text-primary animate-scale-up"
          >
            <Check
              size={16}
              class="bg-primary text-primary-foreground rounded-full p-0.5"
            />
            <span class="text-xs font-semibold"
              >You're on the list! We'll notify you soon.</span
            >
          </div>
        {/if}
      </CardContent>
    </Card>

    <!-- Developer Access Section -->
    <div
      class="mt-8 text-center w-full max-w-xs animate-fade-in"
      style="animation-delay: 500ms;"
    >
      {#if !showDevAccess}
        <button
          on:click={() => (showDevAccess = true)}
          class="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 mx-auto font-medium py-1 px-3 rounded-full hover:bg-muted/50 cursor-pointer"
        >
          <Lock size={12} />
          Developer Access
        </button>
      {:else}
        <form
          on:submit={handleDevSubmit}
          class="flex items-center gap-2 p-1.5 bg-background border border-border rounded-xl w-full animate-slide-down"
        >
          <input
            type="password"
            bind:value={devCode}
            placeholder="Access code"
            class="flex-1 bg-transparent border-0 outline-none text-xs text-foreground px-2 py-1 placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none"
            required
            autoFocus
          />
          <Button
            type="submit"
            size="sm"
            class="h-7 px-3 text-[10px] font-bold rounded-lg transition-all"
          >
            Verify
          </Button>
          <button
            type="button"
            on:click={() => {
              showDevAccess = false;
              devCode = "";
            }}
            class="text-[10px] text-muted-foreground hover:text-foreground px-1 py-1"
          >
            Cancel
          </button>
        </form>
        {#if devError}
          <p
            class="text-[10px] text-destructive mt-1.5 font-medium animate-pulse"
          >
            {devError}
          </p>
        {/if}
      {/if}
    </div>

    <!-- Footer -->
    <div
      class="mt-16 text-center text-[11px] text-muted-foreground/60 tracking-wider"
    >
      &copy; {new Date().getFullYear()} FLEXIBERRY. ALL RIGHTS RESERVED.
    </div>
  </div>
</div>

<style>
  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes bounce-slow {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes scale-up {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }
  .animate-bounce-slow {
    animation: bounce-slow 3s ease-in-out infinite;
  }
  .animate-fade-in {
    animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .animate-scale-up {
    animation: scale-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  .animate-slide-down {
    animation: slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>
