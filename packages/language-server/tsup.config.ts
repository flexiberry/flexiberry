import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: true,
  treeshake: true,
  target: 'es2022',
  outDir: 'dist',
  external: [
    'vscode-languageserver',
    'vscode-languageserver-textdocument',
    '@flexiberry/berrycore'
  ]
});
