<script lang="ts">
  import Button from "../components/ui/button/button.svelte";
  import * as Command from "$lib/components/ui/command";
  import { Input } from "../components/ui/input";
  import { Moon, Sun } from "lucide-svelte";
  import { LifeBuoy, Cherry } from "lucide-svelte";
  import { Github } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import { toggleMode } from "mode-watcher";
  import Separator from "../components/ui/separator/separator.svelte";

  let bookmarks = false;
  let fullUrls = true;

  const profileRadioValue = "benoit";
</script>

<header
  class="border-b-2 dark:border-b-2 dark:border-slate-800 border-black border-opacity-10"
>
  <div class="logo">
    <Cherry></Cherry>
    <h1 class="font-extrabold pl-3">FlexiBerry</h1>
  </div>
  <div>
    <form
      style="min-width: 20vw;"
      class="flex w-full max-w-sm items-center space-x-1"
    >
      <Input
        type="search"
        class="m-1 focus-visible:ring-0 bg-slate-200 dark:bg-slate-800 "
        placeholder=" Search here..."
      />
    </form>
  </div>
  <div>
    <nav class=" flex align-middle">
      <Button class="mr-2" size="icon" variant="outline">
        <LifeBuoy strokeWidth={1}></LifeBuoy>
      </Button>
      <Button class="mr-2" size="icon" variant="outline">
        <Github strokeWidth={1}></Github>
      </Button>
      <Button class="mr-2" on:click={toggleMode} variant="outline" size="icon">
        <Sun
          class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        />
        <Moon
          class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />
        <span class="sr-only">Toggle theme</span>
      </Button>
      <div
        class=" border-l-2 border-opacity-15 mr-1 border-l-slate-500 h-100"
      ></div>
      <Button
        class="mr-4"
        color="primary"
        on:click={() => toast("Hello world")}
        variant="default">Login</Button
      >
    </nav>
  </div>
</header>

<style>
  /* Add styles for your header here */
  header {
    padding: 0.15rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .logo {
    display: flex;
  }
</style>
