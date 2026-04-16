<script lang="ts">
</script>

<svg
  width="100"
  height="40"
  viewBox="0 0 100 40"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class="w-full h-full opacity-60 hover:opacity-100 transition-opacity duration-500"
>
  <!-- Connector Path -->
  <path
    d="M0 20 H85"
    stroke="currentColor"
    stroke-width="1.5"
    class="text-muted-foreground/30"
  />
  
  <!-- Arrow Head -->
  <path
    d="M82 14 L92 20 L82 26"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="text-muted-foreground/40"
  />
  
  <!-- Subtle Pulse -->
  <circle r="2" fill="currentColor" class="text-muted-foreground/20">
    <animateMotion
      dur="6s"
      repeatCount="indefinite"
      path="M0 20 H90"
    />
    <animate
      attributeName="opacity"
      values="0;0.5;0"
      dur="6s"
      repeatCount="indefinite"
    />
  </circle>
</svg>
