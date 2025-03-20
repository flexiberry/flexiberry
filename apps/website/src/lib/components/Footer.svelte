<script>
  let currentYear = new Date().getFullYear();
</script>

<!-- Footer -->
<footer class="bg-gray-900 py-12 border-t border-gray-800">
  <div class="container mx-auto px-6">
    <div class="flex flex-col md:flex-row justify-between items-center">
      <div class="flex items-center mb-6 md:mb-0">
        <div
          class="w-8 h-8 bg-emerald-500 rounded-md flex items-center justify-center mr-3"
        >
          <span class="text-gray-900 font-bold">F</span>
        </div>
        <span class="text-xl font-bold">Flexiberry</span>
      </div>

      <div class="flex space-x-6">
        <a
          href="#"
          class="text-gray-400 hover:text-emerald-400 transition-colors"
          >GitHub</a
        >
        <a
          href="#"
          class="text-gray-400 hover:text-emerald-400 transition-colors"
          >Twitter</a
        >
        <a
          href="#"
          class="text-gray-400 hover:text-emerald-400 transition-colors"
          >Discord</a
        >
        <a
          href="#"
          class="text-gray-400 hover:text-emerald-400 transition-colors">Blog</a
        >
      </div>
    </div>
    <div class="mt-8 text-center text-gray-500 text-sm">
      © {currentYear} Flexiberry. All rights reserved.
    </div>
  </div>
</footer>
