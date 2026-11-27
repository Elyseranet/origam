<template>
  <origam-sheet
    :tag="tag"
    :border="false"
    class="enso-paper enso-art"
    :style="paperVars"
    data-cy="enso-paper"
  >
    <template #default>
      <slot name="default" />
    </template>
  </origam-sheet>
</template>

<script setup lang="ts">
import type { IEnsoPaperProps, IEnsoPaperSlots } from '~/interfaces/enso.interface'
import { ensoPaperVars } from '~/utils/enso.util'

/*********************************************************
 * Props, emits & slots
 *
 * @description
 * Surface papier washi : la couleur reste le token de surface (papier en
 * clair, encre en sombre), la texture du kit est posée par-dessus en mosaïque
 * via le canal `--origam-sheet---background` d'OrigamSheet. Le mode est lu sur
 * l'ancêtre `data-mode` le plus proche (classe globale `.enso-art`). `border`
 * explicite : le thème `origam` pose `border: true` sur tous les OrigamSheet.
 ********************************************************/
withDefaults(defineProps<IEnsoPaperProps>(), {
    tag: 'div'
})

defineEmits([])

defineSlots<IEnsoPaperSlots>()

/*********************************************************
 * Texture
 *
 * @description
 * Variables CSS des deux variantes de la texture ; une tuile de 512 px CSS.
 ********************************************************/
const paperVars = ensoPaperVars()

/*********************************************************
 * Expose
 *
 * @description
 * Rien à piloter depuis l'extérieur.
 ********************************************************/
defineExpose({})
</script>

<style scoped lang="scss">
.enso-paper {
    --origam-sheet---background: var(--enso-art) 0 0 / var(--enso-paper---tile, 512px) repeat, var(--origam-color__surface---default);
}
</style>
