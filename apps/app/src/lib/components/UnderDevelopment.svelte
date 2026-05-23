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
    Layers
  } from "lucide-svelte";
  import { toast } from "svelte-sonner";
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
    if (cleanCode === "berry" || cleanCode === "berrydev" || cleanCode === "flexiberry") {
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
    "Optimizing Svelte 5 component rendering...",
    "Crafting the ultimate developer sandbox..."
  ];

  onMount(() => {
    const interval = setInterval(() => {
      currentStatusIndex = (currentStatusIndex + 1) % statuses.length;
    }, 4000);
    return () => clearInterval(interval);
  });
</script>

<div class="relative min-h-screen w-full flex items-center justify-center bg-[#030712] text-slate-100 overflow-hidden font-sans">
  <!-- Glowing Mesh Gradient Background -->
  <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <div class="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[150px] animate-pulse" style="animation-duration: 8s;"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[120px] animate-pulse" style="animation-duration: 12s; animation-delay: 2s;"></div>
    <div class="absolute top-[30%] right-[20%] w-[40%] h-[40%] rounded-full bg-violet-600/5 blur-[130px] animate-pulse" style="animation-duration: 10s; animation-delay: 4s;"></div>
    
    <!-- Premium Grid Overlay -->
    <div class="absolute inset-0 bg-[radial-gradient(hsl(158_64%_52%/0.05)_1px,transparent_1px)] bg-[size:24px_24px] opacity-60"></div>
  </div>

  <div class="relative z-10 max-w-xl w-full px-6 py-12 flex flex-col items-center">
    <!-- Brand / Logo -->
    <div class="flex items-center gap-3 mb-8 animate-fade-in">
      <div class="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/5 overflow-hidden group">
        <div class="absolute inset-0 bg-gradient-to-tr from-emerald-500/30 to-teal-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <img src={berry} alt="Flexiberry Logo" class="w-8 h-8 object-contain relative z-10 animate-bounce-slow" />
      </div>
      <div class="text-left">
        <h1 class="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
          Flexiberry
        </h1>
        <p class="text-[10px] uppercase tracking-[0.2em] text-emerald-400/60 font-semibold">Visual Coding Ecosystem</p>
      </div>
    </div>

    <!-- Main Card -->
    <div class="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-500">
      <!-- Glow effect top border -->
      <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>
      
      <!-- Content -->
      <div class="text-center">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
          <Construction size={12} class="animate-spin-slow" />
          Under Construction
        </span>

        <h2 class="text-3xl font-extrabold tracking-tight text-white mb-3 leading-snug">
          Crafting the Future of Web Development
        </h2>
        
        <p class="text-slate-400 text-sm leading-relaxed max-w-md mx-auto mb-8">
          We're building an ultra-premium visual IDE and compiler ecosystem that will redefine how Svelte apps are built. Something beautiful is on its way.
        </p>

        <!-- Animated Progress / Status Bar -->
        <div class="mb-8 p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-left">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <Sparkles size={12} />
              Phase 1 Development
            </span>
            <span class="text-xs font-bold text-slate-300">85% Complete</span>
          </div>
          <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
            <div class="h-full w-[85%] bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          </div>
          <div class="h-5 flex items-center justify-between text-[11px] text-slate-400 transition-all duration-300">
            <span class="truncate italic">{statuses[currentStatusIndex]}</span>
            <span class="shrink-0 text-slate-500 ml-2">v0.1.2-alpha</span>
          </div>
        </div>

        <!-- System Stats Grid -->
        <div class="grid grid-cols-3 gap-3 mb-8">
          <div class="p-3 bg-slate-950/40 border border-slate-800/50 rounded-xl flex flex-col items-center">
            <Cpu size={16} class="text-emerald-400 mb-1" />
            <span class="text-[10px] text-slate-500 font-medium">Core Engine</span>
            <span class="text-xs font-bold text-slate-200 mt-0.5">90%</span>
          </div>
          <div class="p-3 bg-slate-950/40 border border-slate-800/50 rounded-xl flex flex-col items-center">
            <Code2 size={16} class="text-emerald-400 mb-1" />
            <span class="text-[10px] text-slate-500 font-medium">Visual IDE</span>
            <span class="text-xs font-bold text-slate-200 mt-0.5">80%</span>
          </div>
          <div class="p-3 bg-slate-950/40 border border-slate-800/50 rounded-xl flex flex-col items-center">
            <Layers size={16} class="text-emerald-400 mb-1" />
            <span class="text-[10px] text-slate-500 font-medium">Berrycore</span>
            <span class="text-xs font-bold text-slate-200 mt-0.5">95%</span>
          </div>
        </div>

        <!-- Subscription / Form -->
        {#if !isSubmitted}
          <form on:submit={handleSubscribe} class="relative flex items-center p-1 rounded-2xl bg-slate-950/80 border border-slate-800 focus-within:border-emerald-500/50 transition-all duration-300">
            <div class="flex-1 flex items-center pl-3">
              <span class="text-slate-500 mr-2">@</span>
              <input 
                type="email" 
                bind:value={email} 
                placeholder="Enter your email for early access" 
                class="w-full bg-transparent border-0 outline-none text-sm placeholder-slate-500 text-slate-200 py-2 focus:ring-0 focus:outline-none"
                required
                disabled={isSubmitting}
              />
            </div>
            <button 
              type="submit" 
              class="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
              disabled={isSubmitting}
            >
              {#if isSubmitting}
                <span class="animate-spin inline-block w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full"></span>
                Sending...
              {:else}
                Notify Me
                <ArrowRight size={12} />
              {/if}
            </button>
          </form>
        {:else}
          <div class="py-4 px-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center gap-2.5 text-emerald-400 animate-scale-up">
            <Check size={16} class="bg-emerald-500 text-slate-950 rounded-full p-0.5" />
            <span class="text-xs font-semibold">You're on the list! We'll notify you soon.</span>
          </div>
        {/if}
      </div>
    </div>

    <!-- Developer Access Section -->
    <div class="mt-8 text-center w-full max-w-xs animate-fade-in" style="animation-delay: 500ms;">
      {#if !showDevAccess}
        <button 
          on:click={() => showDevAccess = true} 
          class="text-xs text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5 mx-auto font-medium py-1 px-3 rounded-full hover:bg-slate-900/50 cursor-pointer"
        >
          <Lock size={12} />
          Developer Access
        </button>
      {:else}
        <form on:submit={handleDevSubmit} class="flex items-center gap-2 p-1.5 bg-slate-950/60 border border-slate-800 rounded-xl w-full animate-slide-down">
          <input 
            type="password" 
            bind:value={devCode} 
            placeholder="Access code" 
            class="flex-1 bg-transparent border-0 outline-none text-xs text-slate-200 px-2 py-1 placeholder-slate-600 focus:ring-0 focus:outline-none"
            required
            autoFocus
          />
          <button 
            type="submit" 
            class="px-3 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold rounded-lg text-[10px] transition-all cursor-pointer"
          >
            Verify
          </button>
          <button 
            type="button" 
            on:click={() => { showDevAccess = false; devCode = ""; }} 
            class="text-[10px] text-slate-500 hover:text-slate-300 px-1 py-1"
          >
            Cancel
          </button>
        </form>
        {#if devError}
          <p class="text-[10px] text-rose-500 mt-1.5 font-medium animate-pulse">{devError}</p>
        {/if}
      {/if}
    </div>

    <!-- Footer -->
    <div class="mt-16 text-center text-[11px] text-slate-600 tracking-wider">
      &copy; {new Date().getFullYear()} FLEXIBERRY. ALL RIGHTS RESERVED.
    </div>
  </div>
</div>

<style>
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scale-up {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes slide-down {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
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
