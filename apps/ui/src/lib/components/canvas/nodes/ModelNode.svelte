<script lang="ts">
  import { Handle, Position } from '@xyflow/svelte';
  import { Plus } from 'lucide-svelte';
</script>

<div class="relative w-[320px] bg-[#1a1b1e] border border-white/10 rounded-[24px] p-5 shadow-2xl text-white font-sans overflow-visible z-10 mt-[26px]">
  
  <!-- Top Input Handle connecting to Plus from Settings -->
  <Handle 
    type="target" 
    position={Position.Top} 
    class="w-1.5 h-1.5 bg-white border-none rounded-full !top-[-4px]" 
  />

  <!-- Header -->
  <div class="flex items-center justify-between mb-5">
    <span class="text-[11px] font-bold tracking-widest text-[#a1a1aa] uppercase">AI Models</span>
    <Plus class="w-5 h-5 text-[#a1a1aa]" />
  </div>

  <!-- Model Selection -->
  <div class="flex items-center gap-3.5">
    <!-- Unselected colored placeholder -->
    <div class="flex-1 h-[80px] bg-[#222328] border border-white/5 rounded-[18px] flex items-center justify-center cursor-pointer hover:bg-[#2a2b30] transition-colors relative shadow-inner group">
      <div class="w-11 h-11 bg-gradient-to-tr from-[#10b981] via-[#38bdf8] to-[#ec4899] mask-star opacity-80 group-hover:opacity-100 transition-opacity" style="clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);"></div>
      
      <!-- Dots indicator corner details -->
      <div class="absolute top-2 left-2 w-1 h-1 rounded-full bg-white/20"></div>
      <div class="absolute top-2 right-2 w-1 h-1 rounded-full bg-white/20"></div>
      <div class="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-white/20"></div>
      <div class="absolute bottom-2 right-2 w-1 h-1 rounded-full bg-white/20"></div>
    </div>

    <!-- Selected Target (Seedance2) -->
    <div class="flex-[1.4] h-[80px] bg-[#1d1e23] border border-white/10 rounded-[18px] flex items-center justify-center cursor-pointer relative shadow-inner overflow-hidden group">
      
      <!-- Glowing inner border illusion -->
      <div class="absolute inset-[-1.5px] rounded-[20px] bg-gradient-to-tr from-[#2dd4bf] via-[#38bdf8] to-[#f59e0b] opacity-60 z-[-1]"></div>
      <div class="absolute inset-[1.5px] rounded-[16px] bg-[#222328] z-0"></div>

      <!-- Pill button inside -->
      <div class="relative z-10 px-5 py-2.5 rounded-[12px] border border-white/20 bg-black/60 text-[14px] font-semibold tracking-wide backdrop-blur-md text-white/95 group-hover:bg-black/40 transition-colors shadow-lg">
        Seedance2
      </div>

      <!-- Accent Dots indicator corner details -->
      <div class="absolute top-2 left-2 w-1 h-1 rounded-full bg-[#f59e0b]/70 z-10"></div>
      <div class="absolute top-2 right-2 w-1 h-1 rounded-full bg-[#38bdf8]/70 z-10"></div>
      <div class="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-white/30 z-10"></div>
      <div class="absolute bottom-2 right-2 w-1 h-1 rounded-full bg-white/30 z-10"></div>
    </div>
  </div>
</div>
