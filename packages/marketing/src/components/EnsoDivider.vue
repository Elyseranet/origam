<template>
  <origam-responsive
    class="enso-divider enso-art"
    :aspect-ratio="brushRatio"
    :style="brushVars"
    aria-hidden="true"
    data-cy="enso-divider"
  />
</template>

<script setup lang="ts">
import { ENSO_BRUSH, ENSO_DIVIDER_BRUSH_WIDTH } from '~/consts/enso.const'
import { ensoArtVars } from '~/utils/enso.util'

/*********************************************************
 * Props, emits & slots
 *
 * @description
 * Séparateur décoratif au pinceau, entre deux sections : la signature du kit
 * (violet terminé en doré). Purement visuel, donc `aria-hidden` et pas de
 * `<hr>` — une rupture thématique annoncée aux lecteurs d'écran serait fausse.
 ********************************************************/
defineEmits([])

defineSlots<Record<string, never>>()

/*********************************************************
 * Pinceau
 *
 * @description
 * Ratio d'origine du trait (OrigamResponsive l'applique) et ses deux variantes.
 ********************************************************/
const brushRatio = ENSO_BRUSH.width / ENSO_BRUSH.height

const brushVars = ensoArtVars(ENSO_BRUSH, ENSO_DIVIDER_BRUSH_WIDTH)

/*********************************************************
 * Expose
 *
 * @description
 * Rien à piloter depuis l'extérieur.
 ********************************************************/
defineExpose({})
</script>

<style scoped lang="scss">
.enso-divider {
    inline-size: min(100%, var(--enso-divider---max-width, 36rem));
    margin-inline: var(--enso-divider---margin-inline, auto);
    background: var(--enso-art) center / contain no-repeat;
    pointer-events: none;
}
</style>
