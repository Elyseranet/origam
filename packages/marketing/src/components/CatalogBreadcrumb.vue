<template>
  <origam-breadcrumb
    class="catalog-breadcrumb"
    :items="items"
    divider="/"
    :border="0"
    :data-cy="`${kind}-breadcrumb`"
  >
    <template #[familySlotName]>
      <origam-menu location="bottom">
        <template #activator="{ props: menuProps }">
          <origam-btn
            variant="text"
            size="small"
            :elevation="0"
            :append-icon="MDI_ICONS.CHEVRON_DOWN"
            :aria-label="familyMenuLabel"
            :data-cy="`${kind}-breadcrumb-catalog`"
            v-bind="menuProps"
          >
            {{ familyLabel }}
          </origam-btn>
        </template>

        <template #default>
          <origam-list nav>
            <origam-list-item
              v-for="item in CATALOG_FAMILIES"
              :key="item.kind"
              :title="t(item.labelKey, item.labelFallback)"
              link
              :to="localeHref(item.route)"
              :active="item.kind === kind"
              :data-cy="`breadcrumb-family-${item.kind}`"
            />
          </origam-list>
        </template>
      </origam-menu>
    </template>
  </origam-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MDI_ICONS } from 'origam/enums'

import { useLocaleHref } from '~/composables/useLocaleHref'
import { useT } from '~/composables/useT'

import { CATALOG_FAMILIES } from '~/consts/catalog-family.const'
import { CATALOG_BREADCRUMB_FAMILY_SLOT } from '~/consts/catalog-detail-nav.const'

import type { ICatalogBreadcrumbProps, ICatalogDetailNavEmits, ICatalogDetailNavSlots } from '~/interfaces/catalog-detail-nav.interface'

const props = withDefaults(defineProps<ICatalogBreadcrumbProps>(), {
    parent: null
})

defineEmits<ICatalogDetailNavEmits>()

defineSlots<ICatalogDetailNavSlots>()

/*********************************************************
 * Famille
 *
 * @description
 * Le premier maillon est un menu : on change de famille sans repasser par
 * l'index. Les libellés sont les noms COMPLETS (`nav.*`), ceux de l'app bar.
 ********************************************************/
const { t } = useT()
const { localeHref } = useLocaleHref()

const familySlotName = CATALOG_BREADCRUMB_FAMILY_SLOT

const family = computed(() => CATALOG_FAMILIES.find(f => f.kind === props.kind))

const familyLabel = computed(() => (family.value ? t(family.value.labelKey, family.value.labelFallback) : props.kind))

const familyMenuLabel = computed(() => t('catalog_nav.family_menu_label', 'Change family — current: {name}', { name: familyLabel.value }))

/*********************************************************
 * Maillons
 *
 * @description
 * Le maillon 0 est rendu par le slot (le menu) ; son `title` ne sert qu'à
 * garder une entrée valide pour le composant si le slot venait à manquer.
 ********************************************************/
const items = computed(() => {
    const crumbs: Array<Record<string, string>> = [{ title: familyLabel.value, to: localeHref(family.value?.route ?? '/') }]

    if (props.parent) {
        crumbs.push({
            title: props.parent.name,
            to: localeHref(`${family.value?.route ?? ''}/${props.parent.slug}`),
            'data-cy': `${props.kind}-breadcrumb-parent-${props.parent.slug}`
        })
    }

    crumbs.push({ title: props.name, 'data-cy': `${props.kind}-breadcrumb-current` })

    return crumbs
})
</script>

<style scoped lang="scss">
.catalog-breadcrumb {
    padding-block-start: var(--origam-space---5, 1.25rem);
}
</style>
