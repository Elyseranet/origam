<template>
  <origam-title
    :id="id"
    :tag="tag"
    class="enso-section-title enso-art"
    :style="brushVars"
    data-cy="enso-section-title"
  >
    <template #default>
      <slot name="default" />
    </template>
  </origam-title>
</template>

<script setup lang="ts">
import { ENSO_BRUSH, ENSO_TITLE_BRUSH_WIDTH } from '~/consts/enso.const'
import type { IEnsoSectionTitleProps, IEnsoSectionTitleSlots } from '~/interfaces/enso.interface'
import { ensoArtVars } from '~/utils/enso.util'

/*********************************************************
 * Props, emits & slots
 *
 * @description
 * Titre de section souligné au pinceau (violet terminé en doré sur papier,
 * ivoire terminé en doré sur encre). Le trait est un fond CSS du `::after` :
 * décoratif par construction, absent de l'arbre d'accessibilité.
 ********************************************************/
withDefaults(defineProps<IEnsoSectionTitleProps>(), {
    tag: 'h2',
    id: undefined
})

defineEmits([])

defineSlots<IEnsoSectionTitleSlots>()

/*********************************************************
 * Pinceau
 *
 * @description
 * Les deux variantes du trait, choisies selon le mode par `.enso-art`.
 ********************************************************/
const brushVars = ensoArtVars(ENSO_BRUSH, ENSO_TITLE_BRUSH_WIDTH)

/*********************************************************
 * Expose
 *
 * @description
 * Rien à piloter depuis l'extérieur.
 ********************************************************/
defineExpose({})
</script>

<style scoped lang="scss">
.enso-section-title {
    position: relative;
    isolation: isolate;
    font-size: var(--enso-section-title---font-size, var(--home-fs-h2));
    padding-block-end: calc(var(--enso-section-title---brush-width, 9rem) / (var(--enso-art-ratio)) * var(--enso-section-title---brush-reserve, 0.8));

    &::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        inset-block-end: 0;
        z-index: -1;
        inline-size: min(100%, var(--enso-section-title---brush-width, 9rem));
        aspect-ratio: var(--enso-art-ratio);
        margin-inline: var(--enso-section-title---brush-margin-inline, 0 auto);
        background: var(--enso-art) center / contain no-repeat;
        pointer-events: none;
    }
}
</style>
