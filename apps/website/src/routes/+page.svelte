<script lang="ts">
  import { onMount } from "svelte";
  import { fly, fade } from "svelte/transition";

  // Navigation items
  const navItems = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "Playground", href: "#playground" },
    { name: "Documentation", href: "#docs" },
    { name: "Community", href: "#community" },
  ];

  // Code example
  const codeExample = `// Example of your custom language
  function fibonacci(n) {
    if n <= 1 {
      return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
  }
  
  // Print the first 10 Fibonacci numbers
  for i in range(10) {
    print(fibonacci(i))
  }`;

  // Features
  const features = [
    {
      title: "Intuitive Syntax",
      description:
        "Clean, readable code that focuses on developer experience and productivity.",
      icon: "code",
    },
    {
      title: "High Performance",
      description:
        "Optimized runtime with minimal overhead for maximum execution speed.",
      icon: "zap",
    },
    {
      title: "Type Safety",
      description:
        "Strong typing system that catches errors at compile time, not runtime.",
      icon: "shield",
    },
    {
      title: "Cross-Platform",
      description:
        "Write once, run anywhere with native support for all major platforms.",
      icon: "globe",
    },
  ];

  let mobileMenuOpen = false;
  let currentSection = "home";

  // Handle scroll to update active section
  onMount(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section");
      let current: null | string = "";

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 100) {
          current = section.getAttribute("id");
        }
      });

      if (current !== currentSection) {
        currentSection = current;
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    mobileMenuOpen = false;
  }
</script>

<div class="min-h-screen bg-gray-900 text-gray-100">
  <!-- Navigation -->
  <nav
    class="fixed w-full bg-gray-900 bg-opacity-90 backdrop-blur-sm z-50 border-b border-gray-800"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0 flex items-center">
            <span class="text-2xl font-bold text-purple-500"
              >Lang<span class="text-teal-400">X</span></span
            >
          </div>
          <div class="hidden md:ml-10 md:flex md:space-x-8">
            {#each navItems as item}
              <button
                on:click={() => scrollToSection(item.href.substring(1))}
                class="px-3 py-2 text-sm font-medium {currentSection ===
                item.href.substring(1)
                  ? 'text-purple-400 border-b-2 border-purple-500'
                  : 'text-gray-300 hover:text-white'}"
              >
                {item.name}
              </button>
            {/each}
          </div>
        </div>
        <div class="flex items-center">
          <a
            href="#"
            class="hidden md:block px-4 py-2 text-sm font-medium rounded-md bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Get Started
          </a>
          <button
            on:click={toggleMobileMenu}
            class="md:hidden p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
          >
            <svg
              class="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d={mobileMenuOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    {#if mobileMenuOpen}
      <div class="md:hidden" transition:fly={{ y: -20, duration: 200 }}>
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {#each navItems as item}
            <button
              on:click={() => scrollToSection(item.href.substring(1))}
              class="block px-3 py-2 rounded-md text-base font-medium {currentSection ===
              item.href.substring(1)
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'}"
            >
              {item.name}
            </button>
          {/each}
          <a
            href="#"
            class="block px-3 py-2 rounded-md text-base font-medium bg-purple-600 hover:bg-purple-700 text-white"
          >
            Get Started
          </a>
        </div>
      </div>
    {/if}
  </nav>

  <!-- Hero Section -->
  <section id="home" class="pt-24 pb-16 md:pt-32 md:pb-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="lg:grid lg:grid-cols-12 lg:gap-8">
        <div class="lg:col-span-6 xl:col-span-5">
          <h1
            class="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl"
          >
            <span class="block">The next generation</span>
            <span
              class="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400"
              >programming language</span
            >
          </h1>
          <p class="mt-6 text-xl text-gray-300">
            A modern, intuitive, and powerful language designed for the
            challenges of tomorrow's software development.
          </p>
          <div class="mt-10 flex gap-4">
            <a
              href="#"
              class="px-8 py-3 text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 md:py-4 md:text-lg md:px-10"
            >
              Get Started
            </a>
            <a
              href="#playground"
              class="px-8 py-3 text-base font-medium rounded-md text-purple-600 bg-gray-800 hover:bg-gray-700 md:py-4 md:text-lg md:px-10"
            >
              Try Online
            </a>
          </div>
        </div>
        <div class="mt-12 lg:mt-0 lg:col-span-6 xl:col-span-7">
          <div
            class="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700"
          >
            <div
              class="flex items-center px-4 py-3 bg-gray-900 border-b border-gray-700"
            >
              <div class="flex space-x-2">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div class="ml-4 text-sm text-gray-400">example.langx</div>
            </div>
            <pre class="p-4 text-sm text-gray-300 overflow-x-auto"><code
                >{codeExample}</code
              ></pre>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="py-16 bg-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-white sm:text-4xl">
          Powerful Features
        </h2>
        <p class="mt-4 max-w-2xl text-xl text-gray-300 mx-auto">
          Everything you need to build modern, efficient applications
        </p>
      </div>

      <div class="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {#each features as feature}
          <div
            class="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300"
            transition:fade
          >
            <div
              class="w-12 h-12 rounded-full bg-purple-900 flex items-center justify-center mb-4"
            >
              {#if feature.icon === "code"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              {:else if feature.icon === "zap"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              {:else if feature.icon === "shield"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              {:else if feature.icon === "globe"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              {/if}
            </div>
            <h3 class="text-xl font-bold text-white">{feature.title}</h3>
            <p class="mt-2 text-gray-400">{feature.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Playground Section -->
  <section id="playground" class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-white sm:text-4xl">
          Try It Online
        </h2>
        <p class="mt-4 max-w-2xl text-xl text-gray-300 mx-auto">
          Experience the language directly in your browser
        </p>
      </div>

      <div
        class="mt-12 bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700"
      >
        <div
          class="flex items-center px-4 py-3 bg-gray-900 border-b border-gray-700"
        >
          <div class="flex space-x-2">
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div class="ml-4 text-sm text-gray-400">playground.langx</div>
          <button
            class="ml-auto px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 rounded-md"
            >Run</button
          >
        </div>
        <div class="grid md:grid-cols-2">
          <div class="p-4 border-r border-gray-700">
            <pre class="text-sm text-gray-300 h-64 overflow-y-auto"><code
                >{codeExample}</code
              ></pre>
          </div>
          <div class="p-4 bg-black">
            <pre class="text-sm text-green-400 h-64 overflow-y-auto"><code
                >0
  1
  1
  2
  3
  5
  8
  13
  21
  34</code
              ></pre>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Documentation Section -->
  <section id="docs" class="py-16 bg-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-white sm:text-4xl">
          Comprehensive Documentation
        </h2>
        <p class="mt-4 max-w-2xl text-xl text-gray-300 mx-auto">
          Everything you need to know to master the language
        </p>
      </div>

      <div class="mt-12 grid gap-8 md:grid-cols-3">
        <div
          class="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300"
        >
          <h3 class="text-xl font-bold text-white">Getting Started</h3>
          <p class="mt-2 text-gray-400">
            Learn the basics and set up your development environment.
          </p>
          <a
            href="#"
            class="mt-4 inline-flex items-center text-purple-400 hover:text-purple-300"
          >
            Read more
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="ml-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>

        <div
          class="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300"
        >
          <h3 class="text-xl font-bold text-white">Language Reference</h3>
          <p class="mt-2 text-gray-400">
            Detailed documentation of syntax, types, and standard library.
          </p>
          <a
            href="#"
            class="mt-4 inline-flex items-center text-purple-400 hover:text-purple-300"
          >
            Read more
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="ml-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>

        <div
          class="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300"
        >
          <h3 class="text-xl font-bold text-white">Tutorials & Examples</h3>
          <p class="mt-2 text-gray-400">
            Step-by-step guides and real-world examples to learn by doing.
          </p>
          <a
            href="#"
            class="mt-4 inline-flex items-center text-purple-400 hover:text-purple-300"
          >
            Read more
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="ml-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Community Section -->
  <section id="community" class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-white sm:text-4xl">
          Join Our Community
        </h2>
        <p class="mt-4 max-w-2xl text-xl text-gray-300 mx-auto">
          Connect with other developers and get help when you need it
        </p>
      </div>

      <div class="mt-12 grid gap-8 md:grid-cols-3">
        <div
          class="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300"
        >
          <div
            class="w-12 h-12 rounded-full bg-purple-900 flex items-center justify-center mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-white">Discord</h3>
          <p class="mt-2 text-gray-400">
            Join our Discord server to chat with other developers and get
            real-time help.
          </p>
          <a
            href="#"
            class="mt-4 inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white"
          >
            Join Discord
          </a>
        </div>

        <div
          class="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300"
        >
          <div
            class="w-12 h-12 rounded-full bg-purple-900 flex items-center justify-center mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-white">GitHub</h3>
          <p class="mt-2 text-gray-400">
            Contribute to the language, report issues, or explore the source
            code.
          </p>
          <a
            href="#"
            class="mt-4 inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white"
          >
            View GitHub
          </a>
        </div>

        <div
          class="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300"
        >
          <div
            class="w-12 h-12 rounded-full bg-purple-900 flex items-center justify-center mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-white">Newsletter</h3>
          <p class="mt-2 text-gray-400">
            Stay updated with the latest news, releases, and tutorials.
          </p>
          <form class="mt-4 flex">
            <input
              type="email"
              placeholder="Your email"
              class="flex-1 px-4 py-2 rounded-l-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-r-md text-white"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-gray-900 border-t border-gray-800">
    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3
            class="text-sm font-semibold text-gray-400 tracking-wider uppercase"
          >
            Product
          </h3>
          <ul class="mt-4 space-y-4">
            <li>
              <a href="#" class="text-base text-gray-300 hover:text-white"
                >Features</a
              >
            </li>
            <li>
              <a href="#" class="text-base text-gray-300 hover:text-white"
                >Playground</a
              >
            </li>
            <li>
              <a href="#" class="text-base text-gray-300 hover:text-white"
                >Documentation</a
              >
            </li>
            <li>
              <a href="#" class="text-base text-gray-300 hover:text-white"
                >Releases</a
              >
            </li>
          </ul>
        </div>
        <div>
          <h3
            class="text-sm font-semibold text-gray-400 tracking-wider uppercase"
          >
            Resources
          </h3>
          <ul class="mt-4 space-y-4">
            <li>
              <a href="#" class="text-base text-gray-300 hover:text-white"
                >Getting Started</a
              >
            </li>
            <li>
              <a href="#" class="text-base text-gray-300 hover:text-white"
                >Tutorials</a
              >
            </li>
            <li>
              <a href="#" class="text-base text-gray-300 hover:text-white"
                >Examples</a
              >
            </li>
            <li>
              <a href="#" class="text-base text-gray-300 hover:text-white"
                >Blog</a
              >
            </li>
          </ul>
        </div>
        <div>
          <h3
            class="text-sm font-semibold text-gray-400 tracking-wider uppercase"
          >
            Community
          </h3>
          <ul class="mt-4 space-y-4">
            <li>
              <a href="#" class="text-base text-gray-300 hover:text-white"
                >Discord</a
              >
            </li>
            <li>
              <a href="#" class="text-base text-gray-300 hover:text-white"
                >GitHub</a
              >
            </li>
            <li>
              <a href="#" class="text-base text-gray-300 hover:text-white"
                >Twitter</a
              >
            </li>
            <li>
              <a href="#" class="text-base text-gray-300 hover:text-white"
                >YouTube</a
              >
            </li>
          </ul>
        </div>
        <div>
          <h3
            class="text-sm font-semibold text-gray-400 tracking-wider uppercase"
          >
            Company
          </h3>
          <ul class="mt-4 space-y-4">
            <li>
              <a href="#" class="text-base text-gray-300 hover:text-white"
                >About</a
              >
            </li>
            <li>
              <a href="#" class="text-base text-gray-300 hover:text-white"
                >Team</a
              >
            </li>
            <li>
              <a href="#" class="text-base text-gray-300 hover:text-white"
                >Careers</a
              >
            </li>
            <li>
              <a href="#" class="text-base text-gray-300 hover:text-white"
                >Contact</a
              >
            </li>
          </ul>
        </div>
      </div>
      <div
        class="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between"
      >
        <p class="text-base text-gray-400">
          &copy; 2025 LangX. All rights reserved.
        </p>
        <div class="flex space-x-6 mt-4 md:mt-0">
          <a href="#" class="text-gray-400 hover:text-gray-300">
            <span class="sr-only">GitHub</span>
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                fill-rule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clip-rule="evenodd"
              />
            </svg>
          </a>
          <a href="#" class="text-gray-400 hover:text-gray-300">
            <span class="sr-only">Twitter</span>
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"
              />
            </svg>
          </a>
          <a href="#" class="text-gray-400 hover:text-gray-300">
            <span class="sr-only">Discord</span>
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3847-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</div>

<style>
  /* Add custom styles here if needed */
  :global(html) {
    scroll-behavior: smooth;
  }

  /* Code highlighting */
  pre {
    font-family: "Fira Code", monospace;
  }
</style>
