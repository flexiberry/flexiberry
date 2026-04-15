<script lang="ts">
    import CodeMirror from "svelte-codemirror-editor";
    import { oneDark } from "@codemirror/theme-one-dark";
    import { berryCode } from "$lib/writable/berry.store";
    import { mode } from "mode-watcher";
</script>

<div class="h-full w-full overflow-auto text-base">
    <CodeMirror
        bind:value={$berryCode}
        theme={$mode === "dark" ? oneDark : null}
        lineWrapping={true}
        styles={{
            "&": { height: "100%", width: "100%", fontSize: "14px" },
            ".cm-scroller": {
                fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            },
        }}
    />
</div>
