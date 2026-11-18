<template>
  <nav
    v-if="hasNeighbours"
    class="catalog-prev-next"
    :aria-label="t('catalog_nav.prev_next_label', 'Previous and next in this family')"
    data-cy="catalog-prev-next"
  >
    <div class="catalog-prev-next__cell catalog-prev-next__cell--prev">
      <origam-btn
        v-if="prev"
        :href="prev.href"
        rel="prev"
        variant="outlined"
        :elevation="0"
        :prepend-icon="MDI_ICONS.ARROW_LEFT"
        class="catalog-prev-next__btn"
        data-cy="catalog-prev"
      >
        <span class="catalog-prev-next__text">
          <span class="catalog-prev-next__hint">{{ t('catalog_nav.previous', 'Previous') }}</span>
          <span class="catalog-prev-next__name">{{ prev.name }}</span>
        </span>
      </origam-btn>
    </div>

    <div class="catalog-prev-next__cell catalog-prev-next__cell--next">
      <origam-btn
        v-if="next"
        :href="next.href"
        rel="next"
        variant="outlined"
        :elevation="0"
        :append-icon="MDI_ICONS.ARROW_RIGHT"
        class="catalog-prev-next__btn"
        data-cy="catalog-next"
      >
        <span class="catalog-prev-next__text">
          <span class="catalog-prev-next__hint">{{ t('catalog_nav.next', 'Next') }}</span>
          <span class="catalog-prev-next__name">{{ next.name }}</span>
        </span>
      </origam-btn>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MDI_ICONS } from 'origam/enums'

import { useCatalogNeighbours } from '~/composables/useApiReference'
import { useLocaleHref } from '~/composables/useLocaleHref'
import { useT } from '~/composables/useT'

import { CATALOG_FAMILIES } from '~/consts/catalog-family.const'

import type { ICatalogDetailNavEmits, ICatalogDetailNavProps, ICatalogDetailNavSlots } from '~/interfaces/catalog-detail-nav.interface'
import type { ICatalogNeighbourLink } from '~/interfaces/catalog-neighbours.interface'

const props = defineProps<ICatalogDetailNavProps>()

defineEmits<ICatalogDetailNavEmits>()

defineSlots<ICatalogDetailNavSlots>()

/*********************************************************
 * Voisins
 *
 * @description
 * L'ordre vient du serveur, qui le calcule une fois pour l'index ET pour
 * cette navigation : la page ne trie rien.
 ********************************************************/
const { t } = useT()
const { localeHref } = useLocaleHref()

const slug = computed(() => props.slug)

const { data: neighbours } = useCatalogNeighbours(props.kind, slug)

const route = computed(() => CATALOG_FAMILIES.find(f => f.kind === props.kind)?.route ?? '')

const withHref = (link: ICatalogNeighbourLink | null | undefined) => (
    link ? { name: link.name, href: localeHref(`${route.value}/${link.slug}`) } : null
)

const prev = computed(() => withHref(neighbours.value?.prev))
const next = computed(() => withHref(neighbours.value?.next))

const hasNeighbours = computed(() => prev.value !== null || next.value !== null)
</script>

<style scoped lang="scss">
.catalog-prev-next {
    display: grid;
    inline-size: 100%;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--origam-space---4, 1rem);
    padding-block: var(--origam-space---8, 2rem);

    &__cell {
        display: flex;
        min-inline-size: 0;

        &--next {
            grid-column: 2;
            justify-content: flex-end;
        }
    }

    &__btn {
        max-inline-size: 100%;
        block-size: auto;
        min-block-size: 44px;
    }

    &__text {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        min-inline-size: 0;
        text-align: start;
    }

    &__cell--next &__text {
        align-items: flex-end;
        text-align: end;
    }

    &__hint {
        line-height: 1.4;
        font-size: var(--origam-font__size---xs, 0.75rem);
        color: var(--origam-color__text---tertiary, #737373);
    }

    &__name {
        line-height: 1.4;
        font-family: var(--origam-font__family---mono, monospace);
        overflow-wrap: anywhere;
    }
}
</style>
