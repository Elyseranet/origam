<template>
  <span
    class="enso-backdrop enso-art"
    :style="artVars"
    aria-hidden="true"
    data-cy="enso-backdrop"
  />
</template>

<script setup lang="ts">
import type { IEnsoBackdropProps } from '~/interfaces/enso-backdrop.interface'
import { ensoArtVars } from '~/utils/enso.util'

/*********************************************************
 * Props, emits & slots
 *
 * @description
 * Fond de section du kit, posé en bas du parent POSITIONNÉ (position: relative,
 * overflow: hidden) et derrière son contenu. Décoratif : `aria-hidden`.
 ********************************************************/
const props = withDefaults(defineProps<IEnsoBackdropProps>(), {
    width: 1440
})

defineEmits([])

defineSlots<Record<string, never>>()

/*********************************************************
 * Illustration
 *
 * @description
 * Les deux variantes du fond, choisies selon le mode par `.enso-art`.
 ********************************************************/
const artVars = ensoArtVars(props.art, props.width)

/*********************************************************
 * Expose
 *
 * @description
 * Rien à piloter depuis l'extérieur.
 ********************************************************/
defineExpose({})
</script>

<style scoped lang="scss">
.enso-backdrop {
    position: absolute;
    inset-inline: 0;
    inset-block-end: 0;
    z-index: -1;
    aspect-ratio: var(--enso-art-ratio);
    background: var(--enso-art) center / 100% 100% no-repeat;
    opacity: var(--enso-backdrop---opacity, 0.7);
    transform: translateY(calc(var(--enso-backdrop---sink, 0.15) * 100%));
    mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent), linear-gradient(to right, transparent, black 12%, black 88%, transparent);
    mask-composite: intersect;
    pointer-events: none;
}
</style>
