<script lang="ts">
  import { Handle, Position } from '@xyflow/svelte';
  import { Moon } from 'lucide-svelte';
</script>

<div class="relative w-[280px] bg-[#1a1b1e] border border-white/10 rounded-2xl p-4 shadow-xl text-white font-sans overflow-visible">
  <!-- Header -->
  <div class="flex items-center justify-between mb-4">
    <span class="text-[10px] font-bold tracking-widest text-[#a1a1aa] uppercase">Ideas</span>
    <Moon class="w-4 h-4 text-[#a1a1aa]" />
  </div>

  <!-- Content -->
  <p class="text-[13px] leading-snug text-[#d4d4d8] font-mono whitespace-pre-wrap tracking-wide">
    3D stylized cartoon boy character, slightly short proportions, full body, big round glasses, spiky dark brown hair <span class="inline-block w-2 h-4 bg-[#c084fc] align-middle animate-pulse ml-0.5"></span>
  </p>

  <!-- Bottom dots decoration -->
  <div class="flex justify-center mt-5 gap-[3px]">
    <div class="w-1 h-1 rounded-full bg-white/20"></div>
    <div class="w-1 h-1 rounded-full bg-white/20"></div>
    <div class="w-1 h-1 rounded-full bg-white/20"></div>
  </div>

  <!-- Handle Block -->
  <div class="absolute -right-[15px] top-1/2 -translate-y-1/2 w-[18px] h-12 bg-[#1a1b1e] border-r border-y border-white/10 rounded-r-lg z-[-1] flex items-center justify-end pr-[2px]">
    <Handle 
      type="source" 
      position={Position.Right} 
      class="w-3 h-3 bg-[#febb4c] border-2 border-[#1a1b1e] !right-[-4px]" 
      style="bottom: auto; top: auto;"
    />
  </div>
</div>
