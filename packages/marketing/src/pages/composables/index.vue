<template>
  <catalog-index-layout
    :title="pageTitle"
    :intro="t('composables.hero.subtitle', 'Every origam composable is documented with its real TypeScript signature, parameters and return values — sourced directly from the DS source code.')"
    :current="t('nav.composables', 'Composables')"
    title-id="composables-title"
    data-cy="composables"
  >
    <catalog-index-tools
      v-model="searchQuery"
      :placeholder="t('composables.hero.search_placeholder', 'Search composables…')"
      :label="t('composables.hero.search_label', 'Filter composables by name or domain')"
      :count="countLabel"
      :jump-label="t('catalog_index.jump_label', 'Categories')"
      :anchors="anchors"
      data-cy="composables"
    />

    <catalog-index-empty
      v-if="isFiltering && filteredCount === 0"
      :title="t('composables.catalog.empty_title', 'No composables found')"
      :description="emptyDescription"
      data-cy="composables-empty"
    />

    <template #groups>
      <catalog-group
        v-for="group in groupedByDomain"
        :id="groupId(group.domain)"
        :key="group.domain"
        :title="group.domain"
        :count="group.entries.length"
      >
        <catalog-card
          v-for="entry in group.entries"
          :key="entry.slug"
          :to="`/composables/${entry.slug}`"
          :name="entry.name"
          :description="entry.descriptionFallback"
          :data-cy="`composables-card-${entry.slug}`"
        >
          <template
            v-if="entry.related.length > 0"
            #meta
          >
            <origam-chip
              v-for="relSlug in entry.related.slice(0, 2)"
              :key="relSlug"
              size="x-small"
              pill
            >
              {{ relSlug }}
            </origam-chip>

            <origam-chip
              v-if="entry.related.length > 2"
              size="x-small"
              pill
            >
              +{{ entry.related.length - 2 }}
            </origam-chip>
          </template>
        </catalog-card>
      </catalog-group>
    </template>
  </catalog-index-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useT } from '~/composables/useT'
import { catalogGroupId } from '~/utils/catalog-index.util'
import { useReferenceCatalog } from '~/composables/useApiReference'
import type { IComposableEntry } from '~/interfaces/composables-catalog.interface'

const { t } = useT()

useSeoMeta({
    title: () => t('composables.meta.title', 'Composables · origam design system'),
    description: () => t('composables.meta.description', 'Browse 80+ composables grouped by domain. Each exposes a documented signature, parameters, return values and usage examples.'),
    ogTitle: () => t('composables.meta.title', 'Composables · origam design system'),
    ogDescription: () => t('composables.meta.description', 'Browse 80+ composables grouped by domain.')
})

const { data: catalogData } = await useReferenceCatalog<IComposableEntry>('composable')

const composablesCatalog = computed<IComposableEntry[]>(() => catalogData.value ?? [])

const composablesDomains = computed(() =>
    [...new Set(composablesCatalog.value.map(e => e.domain))].sort()
)

const searchQuery = ref('')

const filteredEntries = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return composablesCatalog.value
    return composablesCatalog.value.filter(entry => {
        const nameMatch = entry.name.toLowerCase().includes(query)
        const domainMatch = entry.domain.toLowerCase().includes(query)
        const descMatch = entry.descriptionFallback.toLowerCase().includes(query)
        return nameMatch || domainMatch || descMatch
    })
})

const groupedByDomain = computed(() =>
    composablesDomains.value.map(domain => ({
        domain,
        entries: filteredEntries.value.filter(e => e.domain === domain),
    })).filter(g => g.entries.length > 0)
)

const totalCount = computed(() => composablesCatalog.value.length)
const filteredCount = computed(() => filteredEntries.value.length)
const isFiltering = computed(() => searchQuery.value.trim().length > 0)

/*********************************************************
 * En-tête et outils
 *
 * @description
 * Les textes existent déjà (`composables.hero.*`) : le gabarit commun les reçoit
 * traduits. La ligne de compte est composée ici, comme l'ancien en-tête.
 ********************************************************/
const pageTitle = computed(() => `${t('composables.hero.title_line1', 'Composable')} ${t('composables.hero.title_line2', 'catalogue.')}`)

const emptyDescription = computed(() => t('composables.catalog.empty_desc', 'No composable matches "{query}". Try a different term.', { query: searchQuery.value }))

const countLabel = computed(() => isFiltering.value
    ? `${filteredCount.value} ${t('composables.hero.count_filtered_of', 'of')} ${totalCount.value} ${t('composables.hero.count_filtered_match', 'composables match')}`
    : `${totalCount.value} ${t('composables.hero.count_total', 'composables across')} ${composablesDomains.value.length} ${t('composables.hero.count_domains', 'domains')}`)

/*********************************************************
 * Ancres
 *
 * @description
 * Une puce par groupe affiché ; l'identifiant sert aussi de cible au groupe.
 ********************************************************/
const groupId = (label: string) => catalogGroupId('composables-domain', label)

const anchors = computed(() => groupedByDomain.value.map(group => ({ id: groupId(group.domain), label: group.domain })))
</script>
