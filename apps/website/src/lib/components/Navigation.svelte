<script lang="ts">
  import berryIcon from "$lib/assets/icon.png";
</script>

<!-- Navigation -->
<nav class="fixed top-0 left-0 right-0 z-50 bg-gray-900/30 backdrop-blur-sm">
  <div class="container mx-auto px-6 py-4">
    <div class="flex justify-between items-center">
      <div class="flex items-center">
        <div class="w-10 h-10 rounded flex items-center justify-center mr-3">
          <img src={berryIcon} alt="" />
        </div>
        <span class="text-xl font-bold tracking-tight">Flexiberry</span>
      </div>
      <div class="hidden md:flex space-x-8">
        <a href="#features" class="hover:text-emerald-400 transition-colors"
          >Features</a
        >
        <a href="#docs" class="hover:text-emerald-400 transition-colors">Docs</a
        >
        <a href="#get-started" class="hover:text-emerald-400 transition-colors"
          >Get Started</a
        >
        <a
          href="https://github.com"
          class="hover:text-emerald-400 transition-colors">GitHub</a
        >
      </div>
    </div>
  </div>
</nav>
