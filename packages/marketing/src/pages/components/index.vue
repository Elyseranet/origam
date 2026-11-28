<template>
  <catalog-index-layout
    :title="pageTitle"
    :intro="t('components.hero.subtitle', 'Every component in origam is accessible, token-driven and themeable. Explore them by category, read the API and see them in action.')"
    :current="t('nav.components', 'Components')"
    title-id="components-title"
    data-cy="components"
  >
    <catalog-index-tools
      v-model="searchQuery"
      :placeholder="t('components.hero.search_placeholder', 'Search components…')"
      :label="t('components.hero.search_label', 'Filter components by name or category')"
      :count="countLabel"
      :jump-label="t('catalog_index.jump_label', 'Categories')"
      :anchors="anchors"
      data-cy="components"
    />

    <catalog-index-empty
      v-if="isFiltering && filteredCount === 0"
      :title="t('components.catalog.empty_title', 'No components found')"
      :description="emptyDescription"
      data-cy="components-empty"
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
          :to="`/components/${entry.slug}`"
          :name="entry.name"
          :description="t(entry.descriptionKey, entry.descriptionFallback)"
          :data-cy="`components-card-${entry.slug}`"
        >
          <template
            v-if="entry.family.length > 0"
            #meta
          >
            <origam-chip
              v-for="member in entry.family.slice(0, 3)"
              :key="member.slug"
              size="x-small"
              pill
            >
              {{ member.name }}
            </origam-chip>

            <origam-chip
              v-if="entry.family.length > 3"
              size="x-small"
              pill
            >
              +{{ entry.family.length - 3 }}
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
import { useReferenceCatalog, useReferenceCategories } from '~/composables/useApiReference'
import type { IComponentEntry } from '~/interfaces/components-catalog.interface'
import { categoryAnchor } from '~/utils/components-catalog.util'

const { t } = useT()

useSeoMeta({
    title: () => t('components.meta.title', 'Components · origam design system'),
    description: () => t('components.meta.description', 'Browse 218 accessible, token-driven Vue 3 components grouped by category. Click any component to see its API, props, emits, slots and live examples.'),
    ogTitle: () => t('components.meta.title', 'Components · origam design system'),
    ogDescription: () => t('components.meta.description', 'Browse 218 accessible, token-driven Vue 3 components grouped by category.')
})

const { data: catalogData } = await useReferenceCatalog<IComponentEntry>('component')
const componentsCatalog = computed<IComponentEntry[]>(() => catalogData.value ?? [])

const { data: catsData } = await useReferenceCategories('component')
const componentsCategories = computed<string[]>(() => catsData.value ?? [])

const searchQuery = ref('')

const topLevelEntries = computed(() =>
    componentsCatalog.value.filter(entry => !entry.parentSlug)
)

const filteredEntries = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return topLevelEntries.value
    return topLevelEntries.value.filter(entry => {
        const nameMatch = entry.name.toLowerCase().includes(query)
        const categoryMatch = entry.category.toLowerCase().includes(query)
        const descMatch = entry.descriptionFallback.toLowerCase().includes(query)
        const familyMatch = entry.family.some(m => m.name.toLowerCase().includes(query))
        return nameMatch || categoryMatch || descMatch || familyMatch
    })
})

const groupedByCategory = computed(() => {
    return componentsCategories.value.map(category => ({
        category,
        entries: filteredEntries.value.filter(e => e.category === category)
    })).filter(group => group.entries.length > 0)
})

const totalCount = computed(() => topLevelEntries.value.length)
const filteredCount = computed(() => filteredEntries.value.length)
const isFiltering = computed(() => searchQuery.value.trim().length > 0)

/*********************************************************
 * En-tête et outils
 *
 * @description
 * Les textes existent déjà (`components.hero.*`) : le gabarit commun les reçoit
 * traduits. La ligne de compte est composée ici, comme l'ancien en-tête.
 ********************************************************/
const pageTitle = computed(() => `${t('components.hero.title_line1', 'Component')} ${t('components.hero.title_line2', 'catalogue.')}`)

const emptyDescription = computed(() => t('components.catalog.empty_desc', 'No component matches "{query}". Try a different term.', { query: searchQuery.value }))

const countLabel = computed(() => isFiltering.value
    ? `${filteredCount.value} ${t('components.hero.count_filtered_of', 'of')} ${totalCount.value} ${t('components.hero.count_filtered_match', 'components match')}`
    : `${totalCount.value} ${t('components.hero.count_families', 'component families across')} ${componentsCategories.value.length} ${t('components.hero.count_categories', 'categories')}`)

/*********************************************************
 * Ancres
 *
 * @description
 * Une puce par groupe affiché ; l'identifiant sert aussi de cible au groupe.
 ********************************************************/
const groupId = categoryAnchor

const anchors = computed(() => groupedByCategory.value.map(group => ({ id: groupId(group.category), label: group.category })))
</script>
