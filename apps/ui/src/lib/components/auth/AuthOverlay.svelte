<script lang="ts">
  import { auth } from "../../firebase";
  import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { onMount } from "svelte";

  let email = "";
  let password = "";
  let isLogin = true;
  let errorMsg = "";
  let isAuthenticated = true; // Skipped for testing

  onMount(() => {
    // Listen for auth state changes (Disabled for testing)
    /* auth.onAuthStateChanged((user) => {
      isAuthenticated = !!user;
    }); */
  });

  async function handleAuth(e: Event) {
    e.preventDefault();
    errorMsg = "";
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      errorMsg = error.message;
    }
  }

  function logout() {
    auth.signOut();
  }
</script>

{#if !isAuthenticated}
<div class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
  <div class="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg">
    <div class="mb-6 flex flex-col space-y-2 text-center">
      <h1 class="text-2xl font-semibold tracking-tight">Flexiberry Auth</h1>
      <p class="text-sm text-muted-foreground">
        Enter your email below to {isLogin ? 'log into your account' : 'create a new account'}
      </p>
    </div>

    {#if errorMsg}
      <div class="mb-4 rounded bg-destructive/15 p-3 text-sm text-destructive">
        {errorMsg}
      </div>
    {/if}

    <form on:submit={handleAuth} class="space-y-4">
      <div class="space-y-2">
        <label for="email" class="text-sm font-medium leading-none">Email</label>
        <Input id="email" type="email" bind:value={email} placeholder="m@example.com" required />
      </div>
      <div class="space-y-2">
        <label for="password" class="text-sm font-medium leading-none">Password</label>
        <Input id="password" type="password" bind:value={password} required />
      </div>

      <Button type="submit" class="w-full">
        {isLogin ? 'Sign In' : 'Sign Up'}
      </Button>
    </form>

    <div class="mt-4 text-center text-sm">
      <button class="text-primary hover:underline hover:text-primary/80" on:click={() => isLogin = !isLogin}>
        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  </div>
</div>
{:else}
  <slot />
{/if}
