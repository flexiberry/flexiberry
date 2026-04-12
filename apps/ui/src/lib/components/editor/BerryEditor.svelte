<script lang="ts">
    import CodeMirror from 'svelte-codemirror-editor';
    import { javascript } from '@codemirror/lang-javascript';
    import { oneDark } from '@codemirror/theme-one-dark';
    import { berryCode } from '$lib/writable/berry.store';
</script>

<div class="h-full w-full overflow-auto text-base">
    <CodeMirror
        bind:value={$berryCode}
        lang={javascript()}
        theme={oneDark}
        lineWrapping={true}
        styles={{
            "&": { height: "100%", width: "100%", fontSize: "14px" },
            ".cm-scroller": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }
        }}
    />
</div>
