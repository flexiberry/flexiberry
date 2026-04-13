<script lang="ts">
  import * as Resizable from "$lib/components/ui/resizable/index";
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import BerryEditor from "$lib/components/editor/BerryEditor.svelte";
  import NodeCanvas from "$lib/components/canvas/NodeCanvas.svelte";
  import ApiAssistant from "$lib/components/editor/ApiAssistant.svelte";
  import Header from "../../lib/ui/shared/Header.svelte";

  import { page } from "$app/stores";
  import { getFile, saveFile } from "../../lib/writable/File";
  import { berryCode } from "$lib/writable/berry.store";
  import { toast } from "svelte-sonner";

  $: currentFile = $page.params.tabs?.split("/").pop() || "";

  $: if (currentFile) {
    getFile(currentFile).then((x) => {
      $berryCode = x;
    });
  }
</script>

<div
  class="h-full w-full bg-background text-foreground overflow-hidden font-sans relative"
>
  <!-- Absolute Canvas Background -->
  <div class="absolute inset-0 z-0">
    <NodeCanvas />
  </div>

  <!-- UI Overlay -->
  <div class="absolute inset-0 z-10 p-2 pointer-events-none flex flex-col">
    <Resizable.PaneGroup direction="horizontal" class="h-full w-full gap-1">
      <!-- LEFT & CENTER: Canvas + Bottom Consoles -->
      <Resizable.Pane defaultSize={75} class="flex flex-col gap-1">
        <div class="pointer-events-auto shrink-0 relative z-20">
          <Header />
        </div>
        <Resizable.PaneGroup direction="vertical" class="gap-1">
          <!-- TOP: Canvas Interaction Area (Transparent) -->
          <Resizable.Pane defaultSize={65} class="relative">
            <div class="absolute bottom-4 left-4 z-10 pointer-events-none">
              <Card.Root
                class="p-1 px-2 shadow-md flex gap-1 items-center pointer-events-auto bg-card/90 backdrop-blur"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  class="w-8 h-8 text-muted-foreground hover:text-foreground"
                  >⬡</Button
                >
                <Button
                  variant="secondary"
                  size="icon"
                  class="w-8 h-8 text-blue-500 bg-blue-500/10 hover:bg-blue-500/20"
                  >■</Button
                >
                <Button
                  variant="ghost"
                  size="icon"
                  class="w-8 h-8 text-muted-foreground hover:text-foreground"
                  >⌘</Button
                >
                <Button
                  variant="ghost"
                  size="icon"
                  class="w-8 h-8 text-muted-foreground hover:text-foreground"
                  >N</Button
                >
                <Button
                  variant="ghost"
                  size="icon"
                  class="w-8 h-8 text-muted-foreground hover:text-foreground"
                  >🐦</Button
                >
              </Card.Root>
            </div>
          </Resizable.Pane>

          <Resizable.Handle
            class="bg-transparent hover:bg-primary/50 active:bg-primary/50 hover:shadow-[0_0_5px_hsl(var(--primary))] active:shadow-[0_0_5px_hsl(var(--primary))] transition-all duration-300 ease-out w-full h-0.5 pointer-events-auto relative z-10 cursor-row-resize"
          />

          <!-- BOTTOM: Editor and Debug -->
          <Resizable.Pane defaultSize={35}>
            <Resizable.PaneGroup direction="horizontal" class="gap-1 h-full">
              <!-- Bottom Left: Code Editor -->

              <Resizable.Pane
                defaultSize={60}
                class="pointer-events-auto rounded-xl overflow-hidden border bg-card/95 backdrop-blur text-card-foreground shadow-sm flex flex-col relative z-20"
              >
                <div
                  class="flex items-center justify-between p-3 border-b border-border/50 bg-muted/20"
                >
                  <span class="text-xs font-semibold flex items-center gap-2">
                    Debug running <span
                      class="text-[10px] text-muted-foreground font-normal"
                      >In progress</span
                    >
                  </span>
                  <div class="flex items-center gap-4">
                    <label
                      class="flex items-center gap-2 text-[10px] text-muted-foreground cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        class="rounded border-border accent-primary w-3 h-3"
                      />
                      Select object(s)
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      class="text-[10px] uppercase tracking-wider text-muted-foreground h-6 px-2 hover:bg-transparent hover:text-foreground"
                      >Clear</Button
                    >
                  </div>
                </div>
                <ScrollArea class="flex-1 p-4">
                  <div
                    class="font-mono text-[11px] leading-relaxed text-muted-foreground space-y-1"
                  >
                    <div class="text-pink-500">
                      {"{14:22:49:720}"} Debug running
                    </div>
                    <div class="text-emerald-500">
                      let customView = UIView()
                    </div>
                    <div>
                      <span class="text-pink-500">•</span> customView.frame = CGRect(x:
                      0, y: 0, width: 56, height: 56)
                    </div>
                    <div>
                      customView.layer.backgroundColor = UIColor(red: 0.163,
                      green: 0.174, blue: 0.196, alpha: 1).cgColor
                    </div>
                    <div>customView.layer.cornerRadius = 16</div>
                    <div>customView.layer.borderWidth = 1</div>
                    <div>
                      <span class="text-pink-500">•</span> customView.layer.borderColor
                      = UIColor(...).cgColor
                    </div>
                    <div>let mainView = self.view!</div>
                  </div>
                </ScrollArea>
              </Resizable.Pane>
              <Resizable.Handle
                class="bg-transparent hover:bg-primary/50 active:bg-primary/50 hover:shadow-[0_0_5px_hsl(var(--primary))] active:shadow-[0_0_5px_hsl(var(--primary))] transition-all duration-300 ease-out w-0.5 h-full pointer-events-auto relative z-10 cursor-col-resize"
              />

              <!-- Bottom Right: Debug Console -->
              <Resizable.Pane
                defaultSize={40}
                class="pointer-events-auto shadow-sm rounded-xl overflow-hidden border bg-card/95 backdrop-blur text-card-foreground flex flex-col relative z-20"
              >
                <div
                  class="flex items-center justify-between p-3 border-b border-border/50 bg-muted/20"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-xs font-semibold">Code</span>
                    {#if currentFile}
                      <span
                        class="text-[10px] text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full font-mono"
                        >{currentFile}</span
                      >
                    {/if}
                  </div>
                  <div class="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      class="text-[10px] uppercase font-bold tracking-wider h-6 px-3 text-muted-foreground hover:text-foreground"
                      on:click={() => {
                        if (currentFile) {
                          const blob = new Blob([$berryCode], {
                            type: "text/plain",
                          });
                          saveFile(currentFile, blob);
                          toast.success("File Saved");
                        }
                      }}>Save</Button
                    >
                    <Button
                      variant="secondary"
                      size="sm"
                      class="text-[10px] uppercase font-bold tracking-wider h-6 px-4"
                      >Run</Button
                    >
                  </div>
                </div>
                <div class="flex-1 relative">
                  <BerryEditor />
                </div>
              </Resizable.Pane>
            </Resizable.PaneGroup>
          </Resizable.Pane>
        </Resizable.PaneGroup>
      </Resizable.Pane>

      <Resizable.Handle
        class="bg-transparent hover:bg-primary/50 active:bg-primary/50 hover:shadow-[0_0_5px_hsl(var(--primary))] active:shadow-[0_0_5px_hsl(var(--primary))] transition-all duration-300 ease-out w-0.5 h-full pointer-events-auto relative z-10 cursor-col-resize"
      />

      <!-- RIGHT: Inspector Panel -->
      <Resizable.Pane
        defaultSize={25}
        class="pointer-events-auto gap-1 rounded-xl border border-border bg-card/95 backdrop-blur text-card-foreground shadow-sm overflow-hidden flex flex-col relative z-20"
      >
        <!-- Api Assistant Conversational UI -->
        <ApiAssistant />
      </Resizable.Pane>
    </Resizable.PaneGroup>
  </div>
</div>
