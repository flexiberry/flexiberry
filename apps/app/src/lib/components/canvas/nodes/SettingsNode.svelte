<script lang="ts">
  import { Handle, Position } from '@xyflow/svelte';
  import { Plus, Star, Scissors, Zap, Variable, Music, GripVertical, ChevronDown } from 'lucide-svelte';

  const settings = [
    { id: 'mode', label: 'Mode', value: 'Fun', icon: Star, color: 'text-[#ef4444]', grad: 'via-[#ef4444]' },
    { id: 'trim', label: 'Trim', value: 'Auto', icon: Scissors, color: 'text-[#f59e0b]', grad: 'via-[#f59e0b]' },
    { id: 'think', label: 'Think', value: 'Fast', icon: Zap, color: 'text-[#10b981]', grad: 'via-[#10b981]' },
    { id: 'voice', label: 'Voice', value: 'Happy', icon: Variable, color: 'text-[#a855f7]', grad: 'via-[#a855f7]' },
    { id: 'music', label: 'Music', value: 'Piano', icon: Music, color: 'text-[#38bdf8]', grad: 'via-[#38bdf8]' }
  ];
</script>

<div class="relative w-[320px] bg-[#1a1b1e] border border-white/10 rounded-[24px] p-5 shadow-2xl text-white font-sans overflow-visible z-10">
  <!-- Header -->
  <div class="flex items-center justify-between mb-5">
    <span class="text-[11px] font-bold tracking-widest text-[#a1a1aa] uppercase">Settings</span>
    <Plus class="w-5 h-5 text-[#a1a1aa]" />
  </div>

  <!-- Settings List -->
  <div class="flex flex-col gap-2 relative">
    {#each settings as setting}
      <div class="relative flex items-center justify-between h-[52px] bg-[rgba(34,35,40,0.6)] border border-white/5 hover:border-white/10 transition-colors rounded-[14px] px-3.5 group overflow-hidden shadow-inner">
        <!-- Colored edge gradient illusion -->
        <div class="absolute inset-x-0 bottom-0 h-[4px] opacity-[0.15] bg-gradient-to-r from-transparent {setting.grad} to-transparent blur-[3px]"></div>
        <div class="absolute inset-x-0 bottom-0 h-[1.5px] opacity-40 bg-gradient-to-r from-transparent {setting.grad} to-transparent"></div>
        
        <div class="flex items-center gap-3.5 relative z-10">
          <svelte:component this={setting.icon} class="w-[18px] h-[18px] {setting.color}" strokeWidth={2.5} />
          <span class="text-[13px] text-white/90 font-medium tracking-wide">{setting.label}</span>
        </div>
        
        <div class="flex items-center gap-1.5 relative z-10">
          <!-- Mock Select -->
          <button class="flex items-center justify-between w-[86px] h-[34px] px-3 bg-[#111113] border border-white/10 rounded-[10px] text-[13px] text-white/90 hover:text-white hover:bg-black transition-colors shadow-sm">
            {setting.value}
            <ChevronDown class="w-3.5 h-3.5 opacity-40" />
          </button>
          <!-- Grip -->
          <div class="w-6 h-8 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity cursor-grab">
            <GripVertical class="w-[18px] h-[18px]" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Bottom dots decoration -->
  <div class="flex justify-center mt-5 gap-[3px]">
    <div class="w-1 h-1 rounded-full bg-white/20"></div>
    <div class="w-1 h-1 rounded-full bg-white/20"></div>
    <div class="w-1 h-1 rounded-full bg-white/20"></div>
  </div>

  <!-- Left Input Handle Block -->
  <div class="absolute -left-[16px] top-[40%] -translate-y-1/2 w-4 h-28 bg-[#1a1b1e] border-l border-y border-white/10 rounded-l-lg z-[-2] flex items-center justify-start pl-[2px]">
    <Handle 
      type="target" 
      position={Position.Left} 
      class="w-3 h-3 bg-white border-2 border-[#1a1b1e] !left-[-4px]" 
      style="bottom: auto; top: auto;"
    />
  </div>

  <!-- Bottom Output Handle -->
  <Handle 
    type="source" 
    position={Position.Bottom} 
    class="w-[22px] h-[22px] bg-transparent border-2 border-[#a1a1aa] flex items-center justify-center rounded-full !bottom-[-26px] z-10" 
  >
    <div class="absolute w-2 h-2 text-[#a1a1aa] flex items-center justify-center"><Plus strokeWidth={2.5} class="w-3 h-3"/></div>
  </Handle>
</div>
