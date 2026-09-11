import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    // color.ts is a pure module — no Figma API involved.
    // Spec files are intentionally excluded from the main tsconfig.json
    // (which injects @figma/plugin-typings globals) and use tsconfig.test.json.
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
  },
})
