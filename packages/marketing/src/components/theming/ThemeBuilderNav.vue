<template>
  <nav
    class="tb-nav"
    :aria-label="navLabel"
    data-cy="theming-nav"
  >
    <div class="tb-nav__search-wrap">
      <origam-text-field
        v-model="query"
        type="search"
        variant="outlined"
        density="compact"
        hide-details
        prepend-inner-icon="mdi-magnify"
        :placeholder="searchLabel"
        :aria-label="searchLabel"
        class="tb-nav__search"
        data-cy="theming-nav-search"
      />
    </div>

    <div
      class="tb-nav__scroll"
      data-cy="theming-nav-scroll"
    >
      <p
        v-if="filteredCategories.length === 0"
        class="tb-nav__empty"
        data-cy="theming-nav-empty"
      >
        {{ t('theming.nav.no_result', 'No component matches “{query}”.', { query }) }}
      </p>

      <section
        v-for="cat in filteredCategories"
        :key="cat.meta.id"
        class="tb-nav__cat"
        :class="{ 'tb-nav__cat--open': isOpen(cat.meta.id) }"
        :data-cy="`theming-nav-cat-${cat.meta.id}`"
      >
        <button
          type="button"
          class="tb-nav__cat-toggle"
          :aria-expanded="isOpen(cat.meta.id)"
          :data-cy="`theming-nav-cat-toggle-${cat.meta.id}`"
          @click="toggleCategory(cat.meta.id)"
        >
          <span class="tb-nav__cat-count">{{ cat.components.length }}</span>
          <span class="tb-nav__cat-name">{{ catLabel(cat) }}</span>
          <origam-icon
            icon="mdi-chevron-right"
            size="x-small"
            class="tb-nav__cat-chevron"
          />
        </button>

        <ul
          v-show="isOpen(cat.meta.id)"
          class="tb-nav__items"
        >
          <li
            v-for="entry in cat.components"
            :key="entry.slug"
          >
            <button
              type="button"
              class="tb-nav__item"
              :class="{ 'tb-nav__item--active': entry.slug === activeSlug }"
              :aria-current="entry.slug === activeSlug ? 'true' : undefined"
              :data-cy="`theming-nav-item-${entry.slug}`"
              @click="onSelect(entry)"
            >
              <origam-icon
                :icon="entry.icon"
                size="x-small"
                class="tb-nav__item-icon"
              />
              <span class="tb-nav__item-name">{{ entry.name }}</span>
              <span
                v-if="entry.previewable"
                class="tb-nav__item-flag"
                :aria-label="t('theming.nav.previewable', 'Live preview available')"
                :title="t('theming.nav.previewable', 'Live preview available')"
              />
            </button>
          </li>
        </ul>
      </section>
    </div>

    <p class="tb-nav__footer">
      {{ t('theming.nav.total', '{count} components', { count: totalCount }) }}
    </p>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { useT } from '~/composables/useT'
import type {
  IThemeBuilderComponentEntry,
  IThemeBuilderNavCategory, IThemeBuilderNavEmits, IThemeBuilderNavProps
} from '~/interfaces/theme-builder.interface'

const props = withDefaults(defineProps<IThemeBuilderNavProps>(), {})

const emit = defineEmits<IThemeBuilderNavEmits>()

const { t } = useT()

const query = ref<string>('')

const normalisedQuery = computed(() => query.value.trim().toLowerCase())

const filteredCategories = computed(() => {
    const q = normalisedQuery.value
    if (!q) return props.categories
    return props.categories
        .map(cat => ({
            ...cat,
            components: cat.components.filter(c => c.name.toLowerCase().includes(q))
        }))
        .filter(cat => cat.components.length > 0)
})

const totalCount = computed(() =>
    props.categories.reduce((n, c) => n + c.components.length, 0)
)

const activeCategoryId = computed(() => {
    for (const cat of props.categories) {
        if (cat.components.some(c => c.slug === props.activeSlug)) return cat.meta.id
    }
    return ''
})

const manuallyClosed = ref<Set<string>>(new Set())
const manuallyOpened = ref<Set<string>>(new Set())

const isOpen = (id: string): boolean => {
    if (normalisedQuery.value) return true
    if (manuallyOpened.value.has(id)) return true
    if (manuallyClosed.value.has(id)) return false
    return id === activeCategoryId.value
}

const toggleCategory = (id: string): void => {
    const open = isOpen(id)
    const nextOpened = new Set(manuallyOpened.value)
    const nextClosed = new Set(manuallyClosed.value)
    if (open) {
        nextOpened.delete(id)
        nextClosed.add(id)
    } else {
        nextClosed.delete(id)
        nextOpened.add(id)
    }
    manuallyOpened.value = nextOpened
    manuallyClosed.value = nextClosed
}

const onSelect = (entry: IThemeBuilderComponentEntry): void => {
    emit('select', entry.slug)
}

const catLabel = (cat: IThemeBuilderNavCategory): string =>
    cat.meta.labelKey ? t(cat.meta.labelKey, cat.meta.labelFallback) : cat.meta.labelFallback

const searchLabel = computed(() => t('theming.nav.search', 'Search component…'))
const navLabel = computed(() => t('theming.nav.label', 'Components'))
</script>

<style scoped lang="scss">
.tb-nav {
    display: flex;
    flex-direction: column;
    min-height: 0;
    background-color: var(--origam-color-surface-default);
    border-inline-end: 1px solid var(--origam-color-border-subtle, var(--origam-color-border-default));

    &__search-wrap {
        flex: 0 0 auto;
        padding: var(--origam-spacing-2, 0.5rem);
        border-block-end: 1px solid var(--origam-color-border-subtle, var(--origam-color-border-default));
        --origam-field---font-size: 0.75rem;
        --origam-field---padding-top: 0px;
        --origam-field---padding-bottom: 0px;
        --origam-input---font-size: 0.75rem;
        --origam-input__control---height-sm: 28px;

        :deep(.origam-field) {
            font-size: 0.75rem;
        }

        :deep(.origam-field__input) {
            min-height: 28px;
            padding-top: 5px;
            padding-bottom: 5px;
        }

        :deep(.origam-input__control) {
            font-size: 0.75rem;
        }
    }

    &__scroll {
        flex: 1 1 auto;
        min-height: 14rem;
        overflow-y: visible;
        padding-block: var(--origam-spacing-1, 0.25rem) var(--origam-spacing-3, 0.75rem);
    }

    &__empty {
        margin: 0;
        padding: var(--origam-spacing-4, 1rem);
        font-size: var(--origam-font-size-xs, 0.75rem);
        color: var(--origam-color-text-subtle);
    }

    &__cat {
        margin-block-end: 1px;
    }

    &__cat-toggle {
        display: flex;
        align-items: center;
        gap: var(--origam-spacing-2, 0.5rem);
        inline-size: 100%;
        padding: var(--origam-spacing-1, 0.25rem) var(--origam-spacing-3, 0.75rem);
        min-height: 1.75rem;
        background: transparent;
        border: none;
        cursor: pointer;
        text-align: start;
        font-size: 0.625rem;
        font-weight: var(--origam-font-weight-bold, 700);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--origam-color-text-subtle);
        border-radius: var(--origam-radius-sm, 0.25rem);
        transition: background-color 0.15s ease, color 0.15s ease;

        &:hover {
            background-color: var(--origam-color-surface-subtle, var(--origam-color-surface-raised));
            color: var(--origam-color-text-default);
        }
    }

    &__cat-count {
        flex: 0 0 auto;
        min-inline-size: 1.25rem;
        padding: 1px 5px;
        font-size: 0.5625rem;
        font-weight: var(--origam-font-weight-bold, 700);
        text-align: center;
        border-radius: var(--origam-radius-pill, 9999px);
        background-color: var(--origam-color-surface-subtle, var(--origam-color-surface-raised));
        border: 1px solid var(--origam-color-border-subtle, var(--origam-color-border-default));
        color: var(--origam-color-text-subtle);
        font-variant-numeric: tabular-nums;
    }

    &__cat-name {
        flex: 1 1 auto;
        min-inline-size: 0;
    }

    &__cat-chevron {
        flex: 0 0 auto;
        transition: transform 0.15s ease;
        color: var(--origam-color-text-subtle);
    }

    &__cat--open &__cat-chevron {
        transform: rotate(90deg);
    }

    &__items {
        margin: 0;
        padding: 2px var(--origam-spacing-2, 0.5rem) var(--origam-spacing-1, 0.25rem);
        list-style: none;
    }

    &__item {
        display: flex;
        align-items: center;
        gap: var(--origam-spacing-2, 0.5rem);
        inline-size: 100%;
        padding: var(--origam-spacing-1, 0.25rem) var(--origam-spacing-2, 0.5rem);
        min-height: 1.75rem;
        background: transparent;
        border: none;
        cursor: pointer;
        text-align: start;
        font-size: var(--origam-font-size-sm, 0.8125rem);
        color: var(--origam-color-text-subtle);
        border-radius: var(--origam-radius-md, 0.375rem);
        transition: background-color 0.15s ease, color 0.15s ease;

        &:hover {
            background-color: var(--origam-color-surface-subtle, var(--origam-color-surface-raised));
            color: var(--origam-color-text-default);
        }

        &--active {
            background-color: color-mix(in srgb, var(--origam-color__action--primary---bg, #7c3aed) 14%, var(--origam-color-surface-default));
            color: var(--origam-color__action--primary---bgHover, #6d28d9);
            font-weight: var(--origam-font-weight-bold, 700);
        }
    }

    &__item-icon {
        flex: 0 0 auto;
        color: currentColor;
    }

    &__item-name {
        flex: 1 1 auto;
        min-inline-size: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__item-flag {
        flex: 0 0 auto;
        inline-size: 5px;
        block-size: 5px;
        border-radius: 50%;
        background-color: var(--origam-color-feedback-success-bg, #4ade80);
    }

    &__footer {
        flex: 0 0 auto;
        margin: 0;
        padding: var(--origam-spacing-2, 0.5rem) var(--origam-spacing-3, 0.75rem);
        border-block-start: 1px solid var(--origam-color-border-subtle, var(--origam-color-border-default));
        font-size: 0.625rem;
        color: var(--origam-color-text-subtle);
        font-variant-numeric: tabular-nums;
    }
}
</style>
