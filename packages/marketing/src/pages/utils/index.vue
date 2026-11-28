<template>
  <catalog-index-layout
    :title="pageTitle"
    :intro="t('utils.hero.subtitle', 'Every origam utility helper is documented with its real TypeScript signature, parameters and return value — sourced directly from the DS source code.')"
    :current="t('nav.utils', 'Utils')"
    title-id="utils-title"
    data-cy="utils"
  >
    <catalog-index-tools
      v-model="searchQuery"
      :placeholder="t('utils.hero.search_placeholder', 'Search utils…')"
      :label="t('utils.hero.search_label', 'Filter utils by name or category')"
      :count="countLabel"
      :jump-label="t('catalog_index.jump_label', 'Categories')"
      :anchors="anchors"
      data-cy="utils"
    />

    <catalog-index-empty
      v-if="isFiltering && filteredCount === 0"
      :title="t('utils.catalog.empty_title', 'No utils found')"
      :description="emptyDescription"
      data-cy="utils-empty"
    />

    <template #groups>
      <catalog-group
        v-for="group in groupedByCategory"
        :id="groupId(group.category)"
        :key="group.category"
        :title="group.category"
        :count="group.entries.length"
      >
        <catalog-card
          v-for="entry in group.entries"
          :key="entry.slug"
          :to="`/utils/${entry.slug}`"
          :name="entry.name"
          :description="entry.descriptionFallback"
          :data-cy="`utils-card-${entry.slug}`"
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
import { useReferenceCatalog, useReferenceCategories } from '~/composables/useApiReference'
import type { IUtilEntry } from '~/interfaces/utils-catalog.interface'

const { t } = useT()

useSeoMeta({
    title: () => t('utils.meta.title', 'Utils · origam design system'),
    description: () => t('utils.meta.description', 'Browse the origam utility helpers grouped by category. Each exposes a documented signature, parameters, return value and usage examples.'),
    ogTitle: () => t('utils.meta.title', 'Utils · origam design system'),
    ogDescription: () => t('utils.meta.description', 'Utility helpers used across the origam design system.')
})

const { data: catalogData } = await useReferenceCatalog<IUtilEntry>('util')

const utilsCatalog = computed<IUtilEntry[]>(() => catalogData.value ?? [])

const { data: catsData } = await useReferenceCategories('util')
const utilsCategories = computed<string[]>(() => catsData.value ?? [])

const searchQuery = ref('')

const filteredEntries = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return utilsCatalog.value
    return utilsCatalog.value.filter(entry => {
        const nameMatch = entry.name.toLowerCase().includes(query)
        const categoryMatch = entry.category.toLowerCase().includes(query)
        const descMatch = entry.descriptionFallback.toLowerCase().includes(query)
        return nameMatch || categoryMatch || descMatch
    })
})

const groupedByCategory = computed(() =>
    utilsCategories.value.map(category => ({
        category,
        entries: filteredEntries.value.filter(e => e.category === category),
    })).filter(g => g.entries.length > 0)
)

const totalCount = computed(() => utilsCatalog.value.length)
const filteredCount = computed(() => filteredEntries.value.length)
const isFiltering = computed(() => searchQuery.value.trim().length > 0)

/*********************************************************
 * En-tête et outils
 *
 * @description
 * Les textes existent déjà (`utils.hero.*`) : le gabarit commun les reçoit
 * traduits. La ligne de compte est composée ici, comme l'ancien en-tête.
 ********************************************************/
const pageTitle = computed(() => `${t('utils.hero.title_line1', 'Util')} ${t('utils.hero.title_line2', 'catalogue.')}`)

const emptyDescription = computed(() => t('utils.catalog.empty_desc', 'No util matches "{query}". Try a different term.', { query: searchQuery.value }))

const countLabel = computed(() => isFiltering.value
    ? `${filteredCount.value} ${t('utils.hero.count_filtered_of', 'of')} ${totalCount.value} ${t('utils.hero.count_filtered_match', 'utils match')}`
    : `${totalCount.value} ${t('utils.hero.count_total', 'utils across')} ${utilsCategories.value.length} ${t('utils.hero.count_categories', 'categories')}`)

/*********************************************************
 * Ancres
 *
 * @description
 * Une puce par groupe affiché ; l'identifiant sert aussi de cible au groupe.
 ********************************************************/
const groupId = (label: string) => catalogGroupId('utils-category', label)

const anchors = computed(() => groupedByCategory.value.map(group => ({ id: groupId(group.category), label: group.category })))
</script>
