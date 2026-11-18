import type { CSSProperties } from 'vue'

/**
 * HomePlayground — static showcase. The snippet below and the preview in
 * HomePlayground.vue are built from the same sample strings and the same
 * component props, so the preview renders exactly what the code shows.
 * The sample is code, so it is intentionally not translated.
 */
export const PLAYGROUND_SAMPLE = {
    title: 'Hello Origam',
    text: 'The Vue 3 design system that just works.',
    cta: 'Get started'
} as const

export const PLAYGROUND_SNIPPET = `<script setup lang="ts">
import { OrigamCard, OrigamTitle, OrigamBtn } from 'origam'
</script>

<template>
  <OrigamCard rounded="lg" border>
    <OrigamTitle tag="h3">${PLAYGROUND_SAMPLE.title}</OrigamTitle>
    <p>${PLAYGROUND_SAMPLE.text}</p>
    <OrigamBtn color="primary" append-icon="mdi-arrow-right">
      ${PLAYGROUND_SAMPLE.cta}
    </OrigamBtn>
  </OrigamCard>
</template>
`

/**
 * Editor-frame chrome (browser window) instance overrides for <OrigamSheet>.
 *
 * `bgColor`/`rounded` reject `var(--origam-…)` (they expect a TIntent / a
 * radius literal, and warn+deprecate a raw var). The frame surface/radius are
 * non-intent semantic tokens, so — per the project color policy — we paint
 * the sheet's public bg/radius custom-props with the sobre tokens directly.
 * Border colour/width still ride the Sheet's typed `border`/`borderColor`
 * props in the template.
 *
 *   bg     #fafafa → --origam-color__surface---raised (sobre)
 *   shadow         → --origam-shadow---card-elevated (marketing display token)
 *
 * Radius rides the typed `rounded="var(--origam-radius---lg)"` prop now
 * (useRounded accepts custom-property refs since the v2.6 DS fix). The shadow
 * is set on the BASE `--origam-sheet---box-shadow` custom-prop: since the v2.6
 * Sheet fix, the `.origam-sheet--border` rule reads
 * `var(--origam-sheet--border---box-shadow, var(--origam-sheet---box-shadow))`,
 * so the base var is honoured even when `border` is active (border no longer
 * clobbers the elevation).
 */
export const PLAYGROUND_FRAME_RADIUS = 'var(--origam-radius---lg, 14px)'

export const PLAYGROUND_FRAME_VARS: CSSProperties = {
    '--origam-sheet---background': 'var(--origam-color__surface---raised, #fafafa)',
    '--origam-sheet---box-shadow': 'var(--origam-shadow---card-elevated)'
} as CSSProperties

