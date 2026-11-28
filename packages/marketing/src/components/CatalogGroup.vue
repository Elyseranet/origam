<template>
  <section
    :id="id"
    class="catalog-group"
    :aria-labelledby="titleDomId"
    :data-cy="id"
  >
    <header
      v-if="title"
      class="catalog-group__header"
    >
      <origam-title
        :id="titleDomId"
        tag="h2"
        class="catalog-group__title"
      >
        {{ title }}
      </origam-title>

      <span
        v-if="count !== undefined"
        class="catalog-group__count"
      >
        {{ count }}
      </span>
    </header>

    <origam-grid
      tag="ul"
      columns="repeat(auto-fill, minmax(260px, 1fr))"
      gap="0.875rem"
      class="catalog-group__grid"
    >
      <slot name="default" />
    </origam-grid>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ICatalogGroupProps, ICatalogGroupSlots } from '~/interfaces/catalog-index.interface'

/*********************************************************
 * Props, emits & slots
 *
 * @description
 * Un groupe du catalogue : h2 + compteur, puis la grille de cartes
 * (`auto-fill minmax(260px, 1fr)`). Sans `title`, seulement la grille.
 ********************************************************/
const props = withDefaults(defineProps<ICatalogGroupProps>(), {
    title: undefined,
    id: undefined,
    count: undefined
})

defineEmits([])

defineSlots<ICatalogGroupSlots>()

/*********************************************************
 * Titre
 *
 * @description
 * `aria-labelledby` ne pointe que si le titre existe.
 ********************************************************/
const titleDomId = computed(() => (props.title && props.id ? `${props.id}-title` : undefined))

/*********************************************************
 * Expose
 *
 * @description
 * Rien à piloter depuis l'extérieur.
 ********************************************************/
defineExpose({})
</script>

<style scoped lang="scss">
.catalog-group {
    scroll-margin-block-start: var(--origam-space---24, 6rem);

    &__header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-block-end: 18px;
    }

    &__title {
        --origam-title---font-size: clamp(1.4rem, 2.2vw, 1.75rem);
        --origam-title---font-weight: 700;
        --origam-title---letter-spacing: -0.03em;
        --origam-title---line-height: 1.1;

        margin: 0;
        color: var(--origam-color__text---primary);
    }

    &__count {
        padding: 2px 10px;
        border: 1px solid var(--origam-color__border---default);
        border-radius: var(--origam-radius---pill, 9999px);
        font-size: 13px;
        font-weight: 600;
        line-height: 1.1;
        color: var(--origam-color__text---source);
    }

    &__grid {
        margin: 0;
        padding: 0;
        list-style: none;
    }
}
</style>
