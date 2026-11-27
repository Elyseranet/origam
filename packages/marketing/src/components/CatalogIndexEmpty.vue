<template>
  <div
    class="catalog-empty"
    role="status"
    :data-cy="dataCy"
  >
    <origam-icon
      icon="mdi-magnify-remove-outline"
      class="catalog-empty__icon"
      aria-hidden="true"
    />

    <origam-title
      tag="h2"
      class="catalog-empty__title"
    >
      {{ title }}
    </origam-title>

    <p class="catalog-empty__desc">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { ICatalogIndexEmptyProps } from '~/interfaces/catalog-index.interface'

/*********************************************************
 * Props, emits & slots
 *
 * @description
 * État « aucun résultat » d'un index de catalogue, annoncé par `role="status"`.
 ********************************************************/
defineProps<ICatalogIndexEmptyProps>()

defineEmits([])

defineSlots<Record<string, never>>()

/*********************************************************
 * Expose
 *
 * @description
 * Rien à piloter depuis l'extérieur.
 ********************************************************/
defineExpose({})
</script>

<style scoped lang="scss">
.catalog-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--origam-space---3, 0.75rem);
    padding-block: var(--origam-space---12, 3rem);
    text-align: center;

    &__icon {
        font-size: 3rem;
        color: var(--origam-color__text---source);
    }

    &__title {
        --origam-title---font-size: 1.125rem;

        margin: 0;
        color: var(--origam-color__text---primary);
    }

    &__desc {
        margin: 0;
        color: var(--origam-color__text---source);
    }
}
</style>
