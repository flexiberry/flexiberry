import { writable } from 'svelte/store';
// import { AstEngine } from '@flexiberry/berrycore';

export const berryCode = writable(``);

// Example of derived state tracking AST nodes (in future)
export const berryNodes = writable([]);
export const berryEdges = writable([]);
