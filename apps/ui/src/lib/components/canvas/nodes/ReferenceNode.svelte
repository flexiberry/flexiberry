<script lang="ts">
  import { Handle, Position } from '@xyflow/svelte';
  import { X } from 'lucide-svelte';
</script>

<div class="relative w-[300px] bg-[#1a1b1e] border border-white/10 rounded-[24px] p-5 shadow-xl text-white font-sans overflow-visible z-10 group">
  <!-- Glowing backdrop glow effect wrapper -->
  <div class="absolute -inset-[3px] rounded-[26px] bg-gradient-to-tr from-[#38bdf8] via-[#2dd4bf] to-transparent opacity-40 blur-[4px] z-[-1]"></div>
  <div class="absolute inset-0 rounded-[24px] bg-[#1a1b1e] z-[-1]"></div>

  <!-- Header -->
  <div class="flex items-center justify-between mb-5">
    <span class="text-[11px] font-bold tracking-widest text-[#a1a1aa] uppercase">References</span>
    <div class="w-2.5 h-2.5 rounded-full bg-[#10b981] border border-[#1a1b1e] ring-2 ring-[#10b981]/30"></div>
  </div>

  <!-- Image Block -->
  <div class="relative w-full h-[240px] bg-[#2a2b30] rounded-2xl overflow-hidden border border-white/10">
    <!-- Using a generic placeholder image representation -->
    <div class="w-full h-full bg-gradient-to-t from-[#0f172a] to-[#334155] flex flex-col items-center justify-end relative shadow-inner">
       
       <!-- Character Mockup -->
       <div class="w-32 h-[170px] bg-emerald-100 rounded-t-[50px] rounded-b-[20px] shadow-lg relative flex flex-col items-center">
            <div class="absolute top-6 w-24 h-24 bg-amber-50 rounded-[40px] z-10 flex justify-center items-center">
                <!-- Glasses mock -->
                <div class="flex gap-2 relative top-2">
                    <div class="w-8 h-8 rounded-full border-4 border-black"></div>
                    <div class="w-8 h-8 rounded-full border-4 border-black"></div>
                    <!-- Bridge --><div class="absolute w-3 h-1 bg-black top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                </div>
            </div>
            <!-- Body Mock -->
            <div class="absolute bottom-0 w-28 h-20 bg-lime-400 rounded-t-3xl text-center"></div>
       </div>

    </div>
    
    <!-- Close icon overlay -->
    <div class="absolute top-3 right-3 w-8 h-8 bg-[#1a1b1e]/60 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:bg-black transition-colors">
      <X class="w-4 h-4 text-white/80" strokeWidth={2.5} />
    </div>
  </div>

  <!-- Bottom dots decoration -->
  <div class="flex justify-center mt-5 gap-[3px]">
    <div class="w-1 h-1 rounded-full bg-white/20"></div>
    <div class="w-1 h-1 rounded-full bg-white/20"></div>
    <div class="w-1 h-1 rounded-full bg-white/20"></div>
  </div>

  <!-- Handle Block -->
  <div class="absolute -right-[15px] top-2/3 -translate-y-1/2 w-[18px] h-12 bg-[#1a1b1e] border-r border-y border-white/10 rounded-r-lg z-[-2] flex items-center justify-end pr-[2px]">
    <Handle 
      type="source" 
      position={Position.Right} 
      class="w-3 h-3 bg-[#38bdf8] border-2 border-[#1a1b1e] !right-[-4px]" 
      style="bottom: auto; top: auto;"
    />
  </div>
</div>
