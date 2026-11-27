<template>
  <origam-grid-item
    tag="li"
    class="catalog-card-item"
  >
    <origam-card
      :to="to"
      class="catalog-card"
      rounded="lg"
      elevation="none"
      border
      border-color="var(--origam-color__border---default)"
      hover
      :data-cy="dataCy"
    >
      <origam-title
        tag="h3"
        class="catalog-card__name"
      >
        {{ name }}
      </origam-title>

      <p class="catalog-card__desc">
        {{ description }}
      </p>

      <div
        v-if="hasMeta"
        class="catalog-card__meta"
      >
        <slot name="meta" />
      </div>
    </origam-card>
  </origam-grid-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ICatalogCardProps, ICatalogCardSlots } from '~/interfaces/catalog-index.interface'

/*********************************************************
 * Props, emits & slots
 *
 * @description
 * Carte d'une entrée du catalogue : nom (h3), description sur trois lignes,
 * et un slot `meta` pour les puces propres à la page (famille, type, lien
 * associé). La carte EST le lien : une seule cible, un seul nom accessible.
 ********************************************************/
defineProps<ICatalogCardProps>()

defineEmits([])

const slots = defineSlots<ICatalogCardSlots>()

const hasMeta = computed(() => Boolean(slots.meta))

/*********************************************************
 * Expose
 *
 * @description
 * Rien à piloter depuis l'extérieur.
 ********************************************************/
defineExpose({})
</script>

<style scoped lang="scss">
.catalog-card-item {
    display: flex;
    flex-direction: column;
    list-style: none;
}

.catalog-card {
    display: grid;
    align-content: start;
    gap: 6px;
    block-size: 100%;
    padding: 18px 18px 20px;

    &__name {
        --origam-title---font-size: 16px;
        --origam-title---font-weight: 700;
        --origam-title---letter-spacing: normal;
        --origam-title---line-height: 1.6;

        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--origam-color__text---primary);
    }

    &__desc {
        display: -webkit-box;
        margin: 0;
        overflow: hidden;
        font-size: 13.5px;
        line-height: 1.55;
        color: var(--origam-color__text---source);
        -webkit-line-clamp: 3;
        line-clamp: 3;
        -webkit-box-orient: vertical;
    }

    &__meta {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-block-start: 6px;
    }
}
</style>
