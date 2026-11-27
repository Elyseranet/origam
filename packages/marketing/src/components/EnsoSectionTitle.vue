<template>
  <origam-title
    :id="id"
    :tag="tag"
    class="enso-section-title"
    data-cy="enso-section-title"
  >
    <template #default>
      <slot name="default" />
    </template>
  </origam-title>
</template>

<script setup lang="ts">
import type { IEnsoSectionTitleProps, IEnsoSectionTitleSlots } from '~/interfaces/enso.interface'

/*********************************************************
 * Props, emits & slots
 *
 * @description
 * Titre de section de la home enso. Le soulignement au pinceau a disparu
 * (#1592) : l'accent est la marque dorée de l'eyebrow (`.home-eyebrow`).
 ********************************************************/
withDefaults(defineProps<IEnsoSectionTitleProps>(), {
    tag: 'h2',
    id: undefined
})

defineEmits([])

defineSlots<IEnsoSectionTitleSlots>()

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
    font-size: var(--enso-section-title---font-size, var(--home-fs-h2));
}
</style>
