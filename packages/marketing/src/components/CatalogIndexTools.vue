<template>
  <div
    class="catalog-tools"
    :data-cy="`${dataCy}-tools`"
  >
    <origam-text-field
      v-model="query"
      class="catalog-tools__search"
      prepend-inner-icon="mdi-magnify"
      :placeholder="placeholder"
      :aria-label="label"
      clearable
      rounded="lg"
      variant="outlined"
      density="comfortable"
      hide-details
      :data-cy="`${dataCy}-search`"
    />

    <p
      class="catalog-tools__count"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ count }}
    </p>

    <origam-select
      v-if="hasSelect"
      class="catalog-tools__jump-select"
      :model-value="null"
      :items="selectItems"
      :label="selectLabel"
      rounded="lg"
      variant="outlined"
      density="comfortable"
      hide-details
      :data-cy="`${dataCy}-jump-select`"
      @update:model-value="handleJump"
    />

    <nav
      v-if="hasChips"
      :aria-label="jumpLabel"
    >
      <ul class="catalog-tools__jump">
        <li
          v-for="anchor in anchors"
          :key="anchor.id"
        >
          <origam-chip
            class="catalog-tools__jump-link"
            :href="`#${anchor.id}`"
            size="large"
            color="var(--origam-color__text---primary)"
            pill
            border
            border-color="var(--origam-color__border---default)"
            :data-cy="`${anchor.id}-jump`"
          >
            {{ anchor.label }}
          </origam-chip>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useT } from '~/composables/useT'
import { CATALOG_INDEX_MAX_ANCHORS } from '~/consts/catalog-index.const'
import type {
    ICatalogIndexToolsEmits,
    ICatalogIndexToolsProps,
    ICatalogIndexToolsSlots
} from '~/interfaces/catalog-index.interface'

/*********************************************************
 * Props, emits & slots
 *
 * @description
 * Recherche, ligne de compte et puces d'ancrage par catégorie (maquette
 * `catalogue.html`). Les puces ne s'affichent que si la page a des groupes, et
 * pas plus de `CATALOG_INDEX_MAX_ANCHORS` ; au-delà (jusqu'à 155 groupes sur
 * /interfaces) un menu « Aller à… » prend le relais (décision du propriétaire).
 ********************************************************/
const props = defineProps<ICatalogIndexToolsProps>()

const emits = defineEmits<ICatalogIndexToolsEmits>()

defineSlots<ICatalogIndexToolsSlots>()

/*********************************************************
 * Recherche
 *
 * @description
 * `v-model` relayé : la page garde la source de vérité du filtre.
 ********************************************************/
const query = computed({
    get: () => props.modelValue,
    set: (value: string | null) => emits('update:modelValue', value ?? '')
})

const hasChips = computed(() => props.anchors.length > 0 && props.anchors.length <= CATALOG_INDEX_MAX_ANCHORS)
const hasSelect = computed(() => props.anchors.length > CATALOG_INDEX_MAX_ANCHORS)

/*********************************************************
 * Menu « Aller à… »
 *
 * @description
 * Au-delà de `CATALOG_INDEX_MAX_ANCHORS` groupes, les puces feraient un mur :
 * un `origam-select` (clavier, thème et mode du DS) les remplace. Choisir un
 * groupe pose le `hash` : le navigateur défile (sans animation JS), respecte
 * `scroll-margin` du groupe et l'URL reste partageable.
 ********************************************************/
const { t } = useT()

const selectLabel = computed(() => t('catalog_index.jump_select_label', 'Jump to…'))
const selectItems = computed(() => props.anchors.map(anchor => ({ title: anchor.label, value: anchor.id })))

const handleJump = (id: string | null) => {
    if (id) window.location.hash = id
}

/*********************************************************
 * Expose
 *
 * @description
 * Rien à piloter depuis l'extérieur.
 ********************************************************/
defineExpose({})
</script>

<style scoped lang="scss">
.catalog-tools {
    display: grid;
    gap: 14px;

    &__search,
    &__jump-select {
        --origam-input---density-comfortable-density: 12px;
        --origam-field---font-size: 15px;
        --origam-field---border-radius: 12px;
        --origam-field---border-color: var(--origam-color__border---default);
        --origam-field---border-opacity: 1;
        --origam-field---border-opacity-outlined: 1;
        --origam-field---background-color: var(--origam-color__surface---raised);

        inline-size: min(100%, 520px);
        font-family: inherit;

        :deep(input) {
            font: inherit;
        }
    }

    &__count {
        margin: 0;
        font-size: 14px;
        color: var(--origam-color__text---source);
    }

    &__jump-link {
        --origam-chip---background-color: transparent;
        --origam-chip---font-size: 13.5px;
        --origam-chip---font-weight: 600;
        --origam-chip---height-lg: 38px;
    }

    &__jump {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 0;
        padding: 0;
        list-style: none;
    }
}
</style>
