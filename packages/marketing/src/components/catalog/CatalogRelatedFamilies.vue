<template>
  <aside
    v-if="hasRelated"
    class="catalog-related"
    :aria-labelledby="titleId"
    data-cy="catalog-related"
  >
    <origam-container>
      <origam-title
        :id="titleId"
        tag="h2"
        class="catalog-related__title"
      >
        {{ t('catalog_nav.related_title', 'Same subject in the other families') }}
      </origam-title>

      <ul class="catalog-related__groups">
        <li
          v-for="group in groups"
          :key="group.kind"
          class="catalog-related__group"
          :data-cy="`catalog-related-group-${group.kind}`"
        >
          <origam-title
            tag="h3"
            class="catalog-related__family"
          >
            {{ group.label }}
            <span class="catalog-related__count">{{ group.entries.length }}</span>
          </origam-title>

          <ul class="catalog-related__links">
            <li
              v-for="entry in group.entries"
              :key="entry.slug"
            >
              <origam-btn
                :href="entry.href"
                variant="tonal"
                size="small"
                :elevation="0"
                :data-cy="`catalog-related-link-${group.kind}-${entry.slug}`"
              >
                {{ entry.name }}
              </origam-btn>
            </li>
          </ul>
        </li>
      </ul>
    </origam-container>
  </aside>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

import { useCatalogNeighbours } from '~/composables/useApiReference'
import { useLocaleHref } from '~/composables/useLocaleHref'
import { useT } from '~/composables/useT'

import { CATALOG_FAMILIES } from '~/consts/catalog-family.const'

import type { ICatalogDetailNavEmits, ICatalogDetailNavProps, ICatalogDetailNavSlots } from '~/interfaces/catalog-detail-nav.interface'

const props = defineProps<ICatalogDetailNavProps>()

defineEmits<ICatalogDetailNavEmits>()

defineSlots<ICatalogDetailNavSlots>()

/*********************************************************
 * Données
 *
 * @description
 * Relations STOCKÉES uniquement, lues dans les deux sens par le serveur
 * (`/api/reference/neighbours`). Aucun rapprochement par le nom ici non plus :
 * la page ne fait que présenter ce que l'API a résolu.
 ********************************************************/
const { t } = useT()
const { localeHref } = useLocaleHref()

const titleId = `catalog-related-${useId()}`

const kind = computed(() => props.kind)
const slug = computed(() => props.slug)

const { data: neighbours } = useCatalogNeighbours(props.kind, slug)

const groups = computed(() => {
    const related = neighbours.value?.related ?? []

    return CATALOG_FAMILIES.flatMap((family) => {
        const group = related.find(g => g.kind === family.kind)

        if (!group || group.kind === kind.value) return []

        return [{
            kind: family.kind,
            label: t(family.labelKey, family.labelFallback),
            entries: group.entries.map(e => ({
                slug: e.slug,
                name: e.name,
                href: localeHref(`${family.route}/${e.slug}`)
            }))
        }]
    })
})

const hasRelated = computed(() => groups.value.length > 0)
</script>

<style scoped lang="scss">
.catalog-related {
    padding-block: var(--origam-space---4, 1rem);
    border-block-end: 1px solid var(--origam-color__border---subtle, rgba(0, 0, 0, 0.1));

    &__title {
        margin: 0 0 var(--origam-space---3, 0.75rem);
        font-size: var(--origam-font-size---sm, 0.875rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---secondary, #525252);
    }

    &__groups {
        display: flex;
        flex-wrap: wrap;
        gap: var(--origam-space---4, 1rem) var(--origam-space---6, 1.5rem);
        margin: 0;
        padding: 0;
        list-style: none;
    }

    &__group {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---2, 0.5rem);
        min-inline-size: 0;
    }

    &__family {
        display: flex;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
        margin: 0;
        font-size: var(--origam-font-size---xs, 0.75rem);
        font-weight: var(--origam-font__weight---medium, 500);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--origam-color__text---tertiary, #737373);
    }

    &__count {
        font-variant-numeric: tabular-nums;
    }

    &__links {
        display: flex;
        flex-wrap: wrap;
        gap: var(--origam-space---2, 0.5rem);
        margin: 0;
        padding: 0;
        list-style: none;
    }
}
</style>
