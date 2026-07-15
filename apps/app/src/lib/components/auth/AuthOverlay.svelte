<script lang="ts">
  import { auth } from "../../firebase";
  import { user, authLoading } from "../../writable/auth.store";
  import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInAnonymously,
    sendPasswordResetEmail,
  } from "firebase/auth";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { toast } from "svelte-sonner";
  import berry from "$lib/assets/berry.png";

  let email = "";
  let password = "";
  let isLogin = true;
  let isResettingPassword = false;
  let submitting = false;
  let errorMsg = "";
  let showPassword = false;

  async function handleEmailAuth(e: Event) {
    e.preventDefault();
    if (!email || (!isResettingPassword && !password)) return;
    errorMsg = "";
    submitting = true;

    try {
      if (isResettingPassword) {
        await sendPasswordResetEmail(auth, email);
        toast.success("Password reset email sent. Please check your inbox!");
        isResettingPassword = false;
      } else if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Signed in successfully!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created successfully!");
      }
    } catch (error: any) {
      console.error(error);
      errorMsg = getFriendlyErrorMessage(error.code) || error.message;
      toast.error(errorMsg);
    } finally {
      submitting = false;
    }
  }

  async function loginWithGoogle() {
    errorMsg = "";
    submitting = true;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Signed in with Google!");
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        console.error(error);
        errorMsg = getFriendlyErrorMessage(error.code) || error.message;
        toast.error(errorMsg);
      }
    } finally {
      submitting = false;
    }
  }

  async function loginWithGitHub() {
    errorMsg = "";
    submitting = true;
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Signed in with GitHub!");
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        console.error(error);
        errorMsg = getFriendlyErrorMessage(error.code) || error.message;
        toast.error(errorMsg);
      }
    } finally {
      submitting = false;
    }
  }

  async function loginAnonymously() {
    errorMsg = "";
    submitting = true;
    try {
      await signInAnonymously(auth);
      toast.success("Signed in as Guest!");
    } catch (error: any) {
      console.error(error);
      errorMsg = getFriendlyErrorMessage(error.code) || error.message;
      toast.error(errorMsg);
    } finally {
      submitting = false;
    }
  }

  function getFriendlyErrorMessage(code: string): string {
    switch (code) {
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/user-disabled":
        return "This user account has been disabled.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/email-already-in-use":
        return "An account already exists with this email address.";
      case "auth/weak-password":
        return "Password is too weak. Must be at least 6 characters.";
      case "auth/invalid-credential":
        return "Invalid email or password.";
      case "auth/operation-not-allowed":
        return "This operation is not enabled.";
      case "auth/popup-blocked":
        return "Sign-in popup was blocked by the browser.";
      default:
        return "";
    }
  }
</script>

{#if $authLoading}
  <!-- Animated loading screen matching the app's visual style -->
  <div
    class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
  >
    <div
      class="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-background"
    >
      <div
        class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px] animate-pulse"
      ></div>
      <div
        class="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] bg-violet-500/10 rounded-full blur-[120px] animate-pulse"
      ></div>
    </div>
    <div class="relative z-10 flex flex-col items-center gap-4">
      <img src={berry} class="h-16 w-16 animate-bounce" alt="FlexiBerry Logo" />
      <div
        class="flex items-center gap-2 text-muted-foreground text-sm font-medium"
      >
        <svg
          class="animate-spin h-4 w-4 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span>Initializing workspace...</span>
      </div>
    </div>
  </div>
{:else if !$user}
  <!-- High fidelity auth overlay with frosted glass design -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-md overflow-y-auto p-4"
  >
    <!-- Animated Gradient Background Orbs -->
    <div
      class="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-background"
    >
      <div
        class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 dark:bg-primary/10 rounded-full blur-[100px] animate-blob"
      ></div>
      <div
        class="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[100px] animate-blob animation-delay-2000"
      ></div>
      <div
        class="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] bg-violet-500/20 dark:bg-violet-500/10 rounded-full blur-[120px] animate-blob animation-delay-4000"
      ></div>
      <div
        class="absolute inset-0 opacity-20"
        style="background-image: radial-gradient(hsl(var(--muted-foreground)/0.2) 1px, transparent 1px); background-size: 10px 10px;"
      ></div>
    </div>

    <!-- Auth Card Container -->
    <div
      class="relative z-10 w-full max-w-md bg-card/80 dark:bg-card/70 border border-border/60 shadow-2xl rounded-2xl p-8 backdrop-blur-xl transition-all duration-300"
    >
      <!-- Brand & Header -->
      <div class="mb-8 flex flex-col items-center text-center">
        <div
          class="w-16 h-16 p-2.5 bg-primary/10 border border-primary/25 rounded-2xl flex items-center justify-center text-primary hover:bg-primary/20 transition-all duration-300 shadow-sm mb-4"
        >
          <img
            src={berry}
            class="h-10 w-10 object-contain hover:scale-110 transition-transform duration-200"
            alt="FlexiBerry Logo"
          />
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground">
          {#if isResettingPassword}
            Reset Password
          {:else if isLogin}
            Welcome to FlexiBerry
          {:else}
            Create your account
          {/if}
        </h1>
        <p class="text-xs text-muted-foreground mt-1 max-w-[280px]">
          {#if isResettingPassword}
            Enter your email to receive a password reset link
          {:else if isLogin}
            The node-based system developer workspace
          {:else}
            Get started by creating your developer account
          {/if}
        </p>
      </div>

      <!-- Error Message Banner -->
      {#if errorMsg}
        <div
          class="mb-5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2"
        >
          <svg
            class="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>{errorMsg}</span>
        </div>
      {/if}

      {#if !isResettingPassword}
        <!-- Social Sign-in Buttons -->
        <div class="grid grid-cols-2 gap-3 mb-5">
          <Button
            variant="outline"
            class="w-full flex items-center justify-center gap-2 h-10 text-xs border-border/80 hover:bg-accent/50 dark:hover:bg-accent/20 rounded-xl"
            on:click={loginWithGoogle}
            disabled={submitting}
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>

          <Button
            variant="outline"
            class="w-full flex items-center justify-center gap-2 h-10 text-xs border-border/80 hover:bg-accent/50 dark:hover:bg-accent/20 rounded-xl"
            on:click={loginWithGitHub}
            disabled={submitting}
          >
            <svg
              class="h-4 w-4 fill-current text-foreground"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              />
            </svg>
            GitHub
          </Button>
        </div>

        <div class="relative flex py-3 items-center">
          <div class="flex-grow border-t border-border/60"></div>
          <span
            class="flex-shrink mx-4 text-muted-foreground text-[10px] uppercase font-bold tracking-widest"
            >or email & password</span
          >
          <div class="flex-grow border-t border-border/60"></div>
        </div>
      {/if}

      <!-- Login / Signup Form -->
      <form
        on:submit={isResettingPassword ? handleEmailAuth : handleEmailAuth}
        class="space-y-4"
      >
        <div class="space-y-1.5">
          <label
            for="email"
            class="text-xs font-semibold text-muted-foreground pl-0.5"
            >Email Address</label
          >
          <div class="relative">
            <span
              class="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/60"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            </span>
            <Input
              id="email"
              type="email"
              bind:value={email}
              placeholder="name@company.com"
              required
              disabled={submitting}
              class="pl-10 h-11 border-border/80 focus-visible:ring-primary rounded-xl"
            />
          </div>
        </div>

        {#if !isResettingPassword}
          <div class="space-y-1.5">
            <div class="flex justify-between items-center px-0.5">
              <label
                for="password"
                class="text-xs font-semibold text-muted-foreground"
                >Password</label
              >
              {#if isLogin}
                <button
                  type="button"
                  class="text-[10px] text-primary hover:underline font-semibold"
                  on:click={() => (isResettingPassword = true)}
                  tabindex="-1"
                >
                  Forgot Password?
                </button>
              {/if}
            </div>
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/60"
              >
                <svg
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                bind:value={password}
                required
                disabled={submitting}
                class="pl-10 pr-10 h-11 border-border/80 focus-visible:ring-primary rounded-xl"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground/60 hover:text-foreground"
                on:click={() => (showPassword = !showPassword)}
                tabindex="-1"
              >
                {#if showPassword}
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                {:else}
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                {/if}
              </button>
            </div>
          </div>
        {/if}

        <Button
          type="submit"
          class="w-full h-11 text-xs font-semibold rounded-xl mt-2 flex items-center justify-center gap-2"
          disabled={submitting}
        >
          {#if submitting}
            <svg
              class="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          {:else if isResettingPassword}
            Send Reset Link
          {:else if isLogin}
            Sign In to Workspace
          {:else}
            Create Account
          {/if}
        </Button>
      </form>

      <!-- Guest Sign in or back to sign in link -->
      <div class="mt-6 flex flex-col items-center gap-3.5 text-center text-xs">
        {#if isResettingPassword}
          <button
            class="text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1.5"
            on:click={() => {
              isResettingPassword = false;
              errorMsg = "";
            }}
            disabled={submitting}
          >
            <svg
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Sign In
          </button>
        {:else}
          <button
            class="text-primary hover:underline font-semibold"
            on:click={() => {
              isLogin = !isLogin;
              errorMsg = "";
            }}
            disabled={submitting}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <!-- Render app when authenticated -->
  <slot />
{/if}

<style>
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
  .animate-blob {
    animation: blob 12s infinite alternate ease-in-out;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
</style>
