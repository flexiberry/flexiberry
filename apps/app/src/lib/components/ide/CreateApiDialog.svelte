<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { createEventDispatcher } from "svelte";
  import { Plus, Globe, Tag, Braces } from "lucide-svelte";

  export let open = false;

  const dispatch = createEventDispatcher();
  
  let name = "";
  let method = "GET";
  let url = "";
  let title = "";

  const methods = [
    { value: "GET", label: "GET" },
    { value: "POST", label: "POST" },
    { value: "PUT", label: "PUT" },
    { value: "DELETE", label: "DELETE" },
    { value: "PATCH", label: "PATCH" }
  ];

  function handleSubmit() {
    if (!name || !url) return;
    
    dispatch("submit", {
      name: name.trim().replace(/\s+/g, "_"),
      method,
      url: url.trim(),
      title: title.trim()
    });
    
    // Reset
    name = "";
    url = "";
    title = "";
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-[425px] bg-popover border-border shadow-2xl rounded-2xl">
    <Dialog.Header>
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <Plus class="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <Dialog.Title class="text-lg font-black tracking-tight uppercase">Create New API</Dialog.Title>
          <Dialog.Description class="text-xs text-muted-foreground font-medium">
            Define a new API endpoint to use in your sequences.
          </Dialog.Description>
        </div>
      </div>
    </Dialog.Header>

    <div class="grid gap-5 py-6">
      <!-- Name -->
      <div class="space-y-2">
        <label for="name" class="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] block ml-1 flex items-center gap-2">
          <Tag class="w-3 h-3" />
          API Identifier (#name)
        </label>
        <Input
          id="name"
          bind:value={name}
          placeholder="e.g. login_user"
          class="h-10 bg-muted/20 border-border/50 text-foreground font-mono text-sm focus:ring-emerald-500/20"
        />
      </div>

      <!-- Method & Title row -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <label for="method" class="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] block ml-1">Method</label>
          <select 
            bind:value={method}
            class="w-full h-10 bg-muted/20 border border-border/50 rounded-lg px-3 text-sm font-bold focus:ring-emerald-500/20 outline-none appearance-none"
          >
            {#each methods as m}
              <option value={m.value}>{m.label}</option>
            {/each}
          </select>
        </div>
        <div class="space-y-2">
          <label for="title" class="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] block ml-1">Short Title</label>
          <Input
            id="title"
            bind:value={title}
            placeholder="User Authentication"
            class="h-10 bg-muted/20 border-border/50 text-foreground text-sm focus:ring-emerald-500/20"
          />
        </div>
      </div>

      <!-- URL -->
      <div class="space-y-2">
        <label for="url" class="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] block ml-1 flex items-center gap-2">
          <Globe class="w-3 h-3" />
          Endpoint URL
        </label>
        <Input
          id="url"
          bind:value={url}
          placeholder="https://api.example.com/v1/..."
          class="h-10 bg-muted/20 border-border/50 text-foreground font-mono text-sm focus:ring-emerald-500/20"
        />
      </div>
    </div>

    <Dialog.Footer>
      <Button variant="ghost" on:click={() => (open = false)} class="rounded-lg text-xs font-bold uppercase tracking-widest h-10 px-6">
        Cancel
      </Button>
      <Button 
        on:click={handleSubmit} 
        disabled={!name || !url}
        class="rounded-lg h-10 px-6 bg-emerald-500 hover:bg-emerald-600 text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
      >
        <Braces class="w-4 h-4 mr-2" />
        Create API Block
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
