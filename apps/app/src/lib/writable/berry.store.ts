import { writable } from "svelte/store";
import type { BerryBlock } from "$lib/utils/berryBlocks";

export const berryCode = writable(``);
export const berryBlocks = writable<BerryBlock[]>([]);

// Example of derived state tracking AST nodes (in future)
export const berryNodes = writable([]);
export const berryEdges = writable([]);
