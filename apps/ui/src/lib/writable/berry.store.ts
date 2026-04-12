import { writable } from 'svelte/store';
// import { AstEngine } from '@flexiberry/berrycore';

export const berryCode = writable(`Var @EnvironmentConfig Production Settings
- envName: "production"
- timeout_ms: 5000

Api POST #authenticateUser Login to the system
Url https://api.example.com/v1/auth/login
Header
- "Content-Type": "application/json"
Body JSON \`
{
  "username": "{{username}}",
  "password": "{{password}}"
}
\`

Task Complete User Lifecycle Flow
Step Call Api authenticateUser
`);

// Example of derived state tracking AST nodes (in future)
export const berryNodes = writable([]);
export const berryEdges = writable([]);

// Subscription that watches for berryCode changes to parse AST and update graph nodes
berryCode.subscribe((code) => {
    try {
        // const ast = AstEngine.parse(code);
        // Map ast blocks to SvelteFlow nodes...
    } catch (error) {
        // Handle parsing errors inside UI
    }
});
