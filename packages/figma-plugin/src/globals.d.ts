// Build-time constants injected by esbuild's `define` (see esbuild.config.mjs).

declare const __PLUGIN_VERSION__: string

// Allow `import './ui.css'` and similar CSS side-effect imports.
declare module '*.css'
