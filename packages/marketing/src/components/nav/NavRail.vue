<template>
    <client-only>
        <div
            class="nav-rail-root"
            :style="railVars"
        >
            <nav
                v-if="showRail"
                class="nav-rail"
                :aria-label="railAriaLabel"
                data-cy="quick-rail"
            >
                <ul class="nav-rail__list">
                    <li
                        v-for="family in NAV_RAIL_FAMILIES"
                        :key="family.kind"
                        class="nav-rail__slot"
                    >
                        <origam-tooltip
                            location="left center"
                            :text="familyTooltip(family)"
                        >
                            <template #activator="{ props: tipProps }">
                                <origam-btn
                                    variant="text"
                                    :elevation="0"
                                    rounded="small"
                                    class="nav-rail__btn"
                                    :class="{ 'nav-rail__btn--here': isCurrentFamily(family) }"
                                    :aria-label="familyAriaLabel(family)"
                                    :aria-expanded="isFamilyOpen(family)"
                                    :aria-current="isCurrentFamily(family) ? 'true' : undefined"
                                    aria-controls="nav-rail-panel"
                                    :data-cy="`rail-family-${family.kind}`"
                                    v-bind="tipProps"
                                    @click="handleFamilyClick(family, $event)"
                                >
                                    <template #default>
                                        <span class="nav-rail__short">{{ familyShort(family) }}</span>
                                        <span
                                            v-if="countFor(family.kind) !== null"
                                            class="nav-rail__badge"
                                            aria-hidden="true"
                                        >{{ countFor(family.kind) }}</span>
                                    </template>
                                </origam-btn>
                            </template>
                        </origam-tooltip>
                    </li>
                </ul>

                <origam-divider class="nav-rail__rule"/>

                <ul class="nav-rail__list">
                    <li class="nav-rail__slot">
                        <origam-tooltip
                            location="left center"
                            :text="pagesLabel"
                        >
                            <template #activator="{ props: tipProps }">
                                <origam-btn
                                    variant="text"
                                    :elevation="0"
                                    rounded="small"
                                    class="nav-rail__btn"
                                    :icon="MDI_ICONS.MENU"
                                    :aria-label="pagesAriaLabel"
                                    :aria-expanded="isPagesOpen"
                                    aria-controls="nav-rail-panel"
                                    data-cy="rail-pages"
                                    v-bind="tipProps"
                                    @click="handlePagesClick"
                                />
                            </template>
                        </origam-tooltip>
                    </li>
                    <li class="nav-rail__slot">
                        <origam-tooltip
                            location="left center"
                            :text="searchLabel"
                        >
                            <template #activator="{ props: tipProps }">
                                <origam-btn
                                    variant="text"
                                    :elevation="0"
                                    rounded="small"
                                    class="nav-rail__btn"
                                    :icon="MDI_ICONS.MAGNIFY"
                                    :aria-label="searchAriaLabel"
                                    data-cy="rail-search"
                                    v-bind="tipProps"
                                    @click="handleSearchClick"
                                />
                            </template>
                        </origam-tooltip>
                    </li>
                </ul>
            </nav>

            <origam-btn
                v-if="showFab"
                class="nav-rail__fab"
                variant="elevated"
                rounded="pill"
                :aria-label="fabAriaLabel"
                :aria-expanded="isOpen"
                aria-controls="nav-rail-panel"
                data-cy="quick-rail-fab"
                @click="handleFabClick"
            >
                <template #default>
                    <span class="nav-rail__short">{{ fabShort }}</span>
                    <span
                        v-if="fabCount !== null"
                        class="nav-rail__badge"
                        aria-hidden="true"
                    >{{ fabCount }}</span>
                </template>
            </origam-btn>

            <button
                v-if="showScrim"
                type="button"
                class="nav-rail__scrim"
                :aria-label="closeLabel"
                data-cy="rail-scrim"
                @click="handleClose"
            />

            <component
                :is="panelComponent"
                id="nav-rail-panel"
                class="nav-rail__panel"
                :class="panelTierClass"
                v-bind="panelProps"
                :hidden="!isOpen || undefined"
                data-cy="rail-panel"
                @keydown="handlePanelKeydown"
            >
                <template #default>
                    <div
                        v-if="isOpen"
                        class="nav-rail__panel-inner"
                    >
                        <header class="nav-rail__head">
                            <origam-title
                                id="nav-rail-panel-title"
                                tag="h2"
                                class="nav-rail__title"
                                :text="panelTitle"
                            />
                            <span
                                v-if="panelCountLabel"
                                class="nav-rail__count"
                            >{{ panelCountLabel }}</span>
                            <origam-btn
                                variant="text"
                                :elevation="0"
                                rounded="small"
                                class="nav-rail__close"
                                :icon="MDI_ICONS.CLOSE"
                                :aria-label="closeLabel"
                                data-cy="rail-panel-close"
                                @click="handleClose"
                            />
                        </header>

                        <div
                            v-if="showFilter"
                            class="nav-rail__filter"
                        >
                            <origam-text-field
                                ref="filterRef"
                                v-model="query"
                                type="search"
                                density="compact"
                                :placeholder="filterPlaceholder"
                                :aria-label="filterAriaLabel"
                                aria-controls="nav-rail-results"
                                autocomplete="off"
                                data-cy="rail-panel-search"
                                @keydown="handleFilterKeydown"
                            />
                            <p
                                class="nav-rail__hint"
                                aria-live="polite"
                                data-cy="rail-panel-hint"
                            >{{ hintLabel }}</p>
                        </div>

                        <div
                            id="nav-rail-results"
                            ref="resultsRef"
                            class="nav-rail__body"
                        >
                            <p
                                v-if="isLoading"
                                class="nav-rail__state"
                                aria-busy="true"
                                data-cy="rail-panel-loading"
                            >{{ loadingLabel }}</p>

                            <p
                                v-else-if="isError"
                                class="nav-rail__state"
                                role="alert"
                                data-cy="rail-panel-error"
                            >{{ errorLabel }}</p>

                            <p
                                v-else-if="isEmptyResult"
                                class="nav-rail__state"
                                data-cy="rail-panel-empty"
                            >{{ emptyLabel }}</p>

                            <template v-else-if="isPagesOpen">
                                <section
                                    v-for="group in NAV_RAIL_PAGE_GROUPS"
                                    :key="group.titleKey"
                                    class="nav-rail__group"
                                >
                                    <origam-title
                                        tag="h3"
                                        class="nav-rail__group-title"
                                        :text="t(group.titleKey, group.titleFallback)"
                                    />
                                    <origam-list
                                        nav
                                        slim
                                        density="compact"
                                    >
                                        <origam-list-item
                                            v-for="link in group.links"
                                            :key="link.href"
                                            :title="t(link.i18nKey, link.i18nFallback)"
                                            :href="navLinkHref(link)"
                                            :target="link.external ? '_blank' : undefined"
                                            :rel="link.external ? 'noopener noreferrer' : undefined"
                                            :append-icon="link.external ? MDI_ICONS.OPEN_IN_NEW : undefined"
                                            :active="isPageActive(link)"
                                            :data-cy="`rail-page-${slugifyLabel(link.i18nFallback)}`"
                                        />
                                    </origam-list>
                                </section>
                            </template>

                            <template v-else-if="isFlatList">
                                <origam-list
                                    nav
                                    slim
                                    density="compact"
                                    :aria-label="panelTitle"
                                >
                                    <origam-list-item
                                        v-for="(entry, index) in visibleEntries"
                                        :id="entryDomId(entry)"
                                        :key="entry.slug"
                                        :title="entry.name"
                                        :href="entryHref(entry)"
                                        :active="isEntryCurrent(entry)"
                                        :class="{ 'nav-rail__item--cursor': cursor === index }"
                                        :data-cy="`rail-item-${entry.slug}`"
                                        @mouseenter="setCursor(index)"
                                    />
                                </origam-list>
                            </template>

                            <template v-else>
                                <section
                                    v-for="group in groups"
                                    :key="group.category"
                                    class="nav-rail__group"
                                >
                                    <origam-title
                                        tag="h3"
                                        class="nav-rail__group-title"
                                        :text="groupTitle(group)"
                                    />
                                    <origam-list
                                        nav
                                        slim
                                        density="compact"
                                    >
                                        <origam-list-item
                                            v-for="entry in group.entries"
                                            :id="entryDomId(entry)"
                                            :key="entry.slug"
                                            :title="entry.name"
                                            :href="entryHref(entry)"
                                            :active="isEntryCurrent(entry)"
                                            :class="{ 'nav-rail__item--cursor': isCursorEntry(entry) }"
                                            :data-cy="`rail-item-${entry.slug}`"
                                            @mouseenter="handleEntryHover(entry)"
                                        />
                                    </origam-list>
                                </section>
                            </template>
                        </div>

                        <footer class="nav-rail__foot">
                            <origam-btn
                                v-if="indexHref"
                                variant="text"
                                :elevation="0"
                                rounded="small"
                                class="nav-rail__foot-link"
                                :href="indexHref"
                                :append-icon="MDI_ICONS.ARROW_RIGHT"
                                data-cy="rail-panel-index"
                            >
                                <template #default>{{ indexLabel }}</template>
                            </origam-btn>
                            <origam-btn
                                variant="text"
                                :elevation="0"
                                rounded="small"
                                class="nav-rail__foot-link"
                                data-cy="rail-panel-escalate"
                                @click="handleSearchClick"
                            >
                                <template #default>{{ escalateLabel }}</template>
                            </origam-btn>
                        </footer>
                    </div>
                </template>
            </component>
        </div>
    </client-only>
</template>

<script setup lang="ts">
    import { computed, nextTick, ref, watch } from 'vue'
    import { MDI_ICONS } from 'origam/enums'

    import type { INavLink } from '~/interfaces/nav.interface'
    import type { INavRailEntry, INavRailFamily, INavRailGroup } from '~/interfaces/nav-rail.interface'

    import {
        NAV_RAIL_FAMILIES,
        NAV_RAIL_GUTTER,
        NAV_RAIL_PAGE_GROUPS,
        NAV_RAIL_PANEL_OFFSET,
        NAV_RAIL_PANEL_WIDTH,
        NAV_RAIL_RESULT_CAP,
        NAV_RAIL_WIDTH
    } from '~/consts/nav-rail.const'
    import { useLocaleHref } from '~/composables/useLocaleHref'
    import { useNavRail } from '~/composables/useNavRail'
    import { useT } from '~/composables/useT'

    /*********************************************************
     * Global
     *
     * @description
     * Le rail ne déclare aucune prop : il est monté une seule fois par le
     * layout et lit tout son état de `useNavRail`. Les trois émissions
     * servent au layout, qui porte la palette de commandes (`⌘K`) et doit
     * donc être prévenu quand le rail veut l'ouvrir.
     ********************************************************/
    defineProps<Record<string, never>>()

    const emits = defineEmits<{ 'open-palette': [] }>()

    defineSlots<Record<string, never>>()

    const { t } = useT()
    const { localeHref, navLinkHref } = useLocaleHref()
    const route = useRoute()

    const {
        tier,
        currentFamily,
        currentSlug,
        countFor,
        panel,
        openKind,
        openFamily,
        isOpen,
        openFamilyPanel,
        openPagesPanel,
        close,
        status,
        query,
        groups,
        isFlatList,
        visibleEntries,
        matchCount,
        isCapped,
        isEmptyResult,
        cursor,
        activeEntry,
        flatNavigable,
        moveCursor,
        setCursor
    } = useNavRail()

    /*********************************************************
     * Paliers
     *
     * @description
     * Le rail vertical vit à partir de 600 px ; sous ce seuil il devient une
     * cible unique en bas à droite. Le voile n'apparaît que sur les deux
     * paliers où le panneau recouvre l'essentiel de la page.
     ********************************************************/
    const showRail = computed(() => tier.value !== 'sheet')
    const showFab = computed(() => tier.value === 'sheet')
    const showScrim = computed(() => isOpen.value && tier.value !== 'rail')

    /*********************************************************
     * Surface du panneau
     *
     * @description
     * Un seul corps de panneau, trois surfaces. `origam-sheet` porte le
     * panneau ancré du bureau — `position="fixed" location="right center"`
     * émet exactement `right:0; top:50%; transform:translateY(-50%)`, donc
     * zéro CSS de position.
     *
     * ⛔ `origam-sheet side="bottom" swipeable` n'est PAS utilisé pour le
     * mobile, malgré ce que suggérait la maquette : `swipeable` pose
     * `--origam-sheet---position: absolute` (OrigamSheet.vue:437-438) APRÈS
     * la règle `--fixed` (:426), donc il écrase le positionnement fixe — et
     * `OrigamSheet` n'offre ni voile ni gestion de focus. `origam-drawer`
     * accepte `location="bottom"` (OrigamDrawer.vue:227-228) et apporte le
     * voile par `IScrimProps` : la feuille basse est donc un tiroir bas.
     ********************************************************/
    const panelComponent = computed(() => (tier.value === 'rail' ? 'origam-sheet' : 'origam-drawer'))

    const panelTierClass = computed(() => `nav-rail__panel--${tier.value}`)

    const panelProps = computed<Record<string, unknown>>(() => {
        if (tier.value === 'rail') {
            return {
                position: 'fixed',
                location: 'right center',
                width: NAV_RAIL_PANEL_WIDTH,
                maxHeight: 'min(80vh, 640px)',
                marginRight: NAV_RAIL_PANEL_OFFSET,
                rounded: 'lg',
                elevation: 'lg',
                border: true,
                bgColor: 'surface',
                ariaLabelledby: 'nav-rail-panel-title'
            }
        }

        return {
            modelValue: isOpen.value,
            location: tier.value === 'sheet' ? 'bottom' : 'right',
            temporary: true,
            scrim: true,
            width: tier.value === 'sheet' ? undefined : NAV_RAIL_PANEL_WIDTH,
            disableRouteWatcher: true,
            ariaLabelledby: 'nav-rail-panel-title'
        }
    })

    /*********************************************************
     * Géométrie
     *
     * @description
     * La largeur du rail et la gouttière sont posées en variables CSS depuis
     * les constantes, et non réécrites en dur dans le bloc `<style>` : la
     * gouttière que `<origam-main>` doit réserver se calcule sur les mêmes
     * nombres (`NAV_RAIL_PANEL_OFFSET = largeur + 2 × gouttière`). Deux
     * sources pour une même mesure finiraient par divergerN.
     ********************************************************/
    const railVars = computed(() => ({
        '--nav-rail---width': `${NAV_RAIL_WIDTH}px`,
        '--nav-rail---gutter': `${NAV_RAIL_GUTTER}px`
    }))

    /*********************************************************
     * Libellés
     *
     * @description
     * Aucune chaîne en dur, `aria-label` compris. Le libellé accessible
     * d'une cible de famille porte le NOM COMPLET et le dénombrement, là où
     * l'écran n'affiche que « I » ou « fn » : un lecteur d'écran n'a aucune
     * raison d'entendre « I » pour « Interfaces ».
     ********************************************************/
    const railAriaLabel = computed(() => t('rail.a11y.rail', 'Quick catalogue navigation'))
    const pagesLabel = computed(() => t('rail.pages.label', 'Pages'))
    const pagesAriaLabel = computed(() => t('rail.a11y.pages', 'Site pages and family indexes'))
    const searchLabel = computed(() => t('rail.search.label', 'Search everything'))
    const searchAriaLabel = computed(() => t('rail.a11y.search', 'Search the whole catalogue'))
    const closeLabel = computed(() => t('rail.close', 'Close the panel'))
    const loadingLabel = computed(() => t('rail.state.loading', 'Loading the catalogue…'))
    const errorLabel = computed(() => t('rail.state.error', 'The catalogue is unavailable. Open the index page instead.'))
    const emptyLabel = computed(() => t('rail.state.empty', 'Nothing here. Press Enter to search the whole catalogue.'))
    const escalateLabel = computed(() => t('rail.search.all', 'Search everything'))

    const familyShort = (family: INavRailFamily) => t(family.shortLabelKey, family.shortLabelFallback)
    const familyName = (family: INavRailFamily) => t(family.labelKey, family.labelFallback)

    const familyAriaLabel = (family: INavRailFamily) => {
        const count = countFor(family.kind)
        const name = familyName(family)

        if (count === null) {
            return isCurrentFamily(family)
                ? t('rail.a11y.family_here_plain', '{name} — you are here', { name })
                : name
        }

        return isCurrentFamily(family)
            ? t('rail.a11y.family_here', '{name} — {count} entries — you are here', { name, count })
            : t('rail.a11y.family', '{name} — {count} entries', { name, count })
    }

    const familyTooltip = (family: INavRailFamily) => {
        const count = countFor(family.kind)
        const name = familyName(family)

        return count === null ? name : t('rail.tooltip.family', '{name} · {count}', { name, count })
    }

    /*********************************************************
     * Cible unique du mobile
     *
     * @description
     * Elle porte le libellé de la famille lue et son dénombrement — la même
     * information que la mise en évidence du rail de bureau, condensée en
     * une cible. Hors catalogue, elle retombe sur le volet « Pages ».
     ********************************************************/
    const fabShort = computed(() => (currentFamily.value ? familyShort(currentFamily.value) : pagesLabel.value))

    const fabCount = computed(() => (currentFamily.value ? countFor(currentFamily.value.kind) : null))

    const fabAriaLabel = computed(() => {
        if (!currentFamily.value) return pagesAriaLabel.value

        return familyAriaLabel(currentFamily.value)
    })

    /*********************************************************
     * Entête du panneau
     ********************************************************/
    const isPagesOpen = computed(() => panel.value === 'pages')

    const isLoading = computed(() => !isPagesOpen.value && status.value === 'loading')
    const isError = computed(() => !isPagesOpen.value && status.value === 'error')

    const panelTitle = computed(() => {
        if (isPagesOpen.value) return pagesLabel.value

        return openFamily.value ? familyName(openFamily.value) : pagesLabel.value
    })

    const panelCountLabel = computed(() => {
        if (isPagesOpen.value || !openKind.value) return ''

        const count = countFor(openKind.value)

        return count === null ? '' : String(count)
    })

    /*********************************************************
     * Filtre et plafond
     *
     * @description
     * Le champ de filtre est le SEUL arrêt de tabulation du corps du
     * panneau : les entrées sont des ancres qu'`OrigamListItem` sort du
     * parcours (`tabindex="-2"`). Il est rendu dès qu'une famille est
     * ouverte, y compris sur les 6 directives — un seul modèle clavier pour
     * les huit familles vaut mieux qu'un champ économisé sur une seule.
     *
     * Le plafond est ANNONCÉ (« 50 sur 318 »). Un plafond silencieux est
     * pire que pas de plafond : l'utilisateur croit avoir vu la liste.
     ********************************************************/
    const showFilter = computed(() => !isPagesOpen.value && status.value === 'ready')

    const filterPlaceholder = computed(() => t('rail.filter.placeholder', 'Filter…'))

    const filterAriaLabel = computed(() =>
        t('rail.a11y.filter', 'Filter {name}', { name: panelTitle.value })
    )

    const hintLabel = computed(() => {
        if (isCapped.value) {
            return t('rail.hint.capped', '{shown} shown of {total} — narrow your search', {
                shown: NAV_RAIL_RESULT_CAP,
                total: matchCount.value
            })
        }

        if (query.value.trim()) {
            return t('rail.hint.results', '{count} results', { count: matchCount.value })
        }

        return t('rail.hint.keys', '↑ ↓ browse · Enter open · Esc close')
    })

    /*********************************************************
     * Liens
     *
     * @description
     * `localeHref` est appliqué sans condition aux entrées du catalogue :
     * ce sont toujours des routes de l'app. Les liens du volet « Pages »
     * passent par `navLinkHref`, qui respecte le drapeau `external` et
     * garde Stories et Docs hors de `localePath()` — `/fr/stories/` est un
     * 404 mesuré (#760).
     ********************************************************/
    const entryHref = (entry: INavRailEntry) => {
        const family = openFamily.value

        if (!family) return localeHref('/')

        return localeHref(`${family.route}/${entry.slug}`)
    }

    const indexHref = computed(() => {
        const family = openFamily.value

        return family ? localeHref(family.route) : ''
    })

    const indexLabel = computed(() =>
        t('rail.index_link', 'See all {name}', { name: panelTitle.value })
    )

    const entryDomId = (entry: INavRailEntry) => `nav-rail-opt-${entry.slug}`

    const slugifyLabel = (label: string) =>
        label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const groupTitle = (group: INavRailGroup) =>
        group.category || t('rail.group.other', 'Other')

    /*********************************************************
     * Position courante
     *
     * @description
     * `route.path` porte toujours le préfixe de locale alors qu'un lien de
     * `NAV_SECTIONS` porte un chemin brut : comparer les deux tels quels
     * rendrait la surbrillance morte hors locale par défaut (#809). On
     * compare donc à la forme localisée.
     ********************************************************/
    const isCurrentFamily = (family: INavRailFamily) => currentFamily.value?.kind === family.kind

    const isFamilyOpen = (family: INavRailFamily) =>
        panel.value === 'family' && openKind.value === family.kind

    const isEntryCurrent = (entry: INavRailEntry) =>
        currentSlug.value === entry.slug && isCurrentFamily(openFamily.value ?? ({} as INavRailFamily))

    const isPageActive = (link: INavLink) => {
        const { href, external } = link

        if (!href || external || href.startsWith('http')) return false

        const target = localeHref(href)

        return route.path === target || `${route.path}/` === target
    }

    const isCursorEntry = (entry: INavRailEntry) => activeEntry.value?.slug === entry.slug

    /*********************************************************
     * Clavier
     *
     * @description
     * ↑ / ↓ déplacent le curseur et donnent le FOCUS RÉEL à l'ancre
     * correspondante : les entrées sont des liens véritables, donc clic
     * milieu et « ouvrir dans un nouvel onglet » continuent de marcher.
     * ⎋ ferme et rend le focus au déclencheur. Sur une liste vide, ⏎ fait
     * monter la requête dans la palette globale plutôt que de ne rien faire.
     ********************************************************/
    const filterRef = ref<{ $el?: HTMLElement } | null>(null)
    const resultsRef = ref<HTMLElement | null>(null)
    const lastTrigger = ref<HTMLElement | null>(null)

    const focusCursorEntry = async () => {
        await nextTick()

        const entry = activeEntry.value

        if (!entry || !resultsRef.value) return

        const target = resultsRef.value.querySelector<HTMLElement>(`#${CSS.escape(entryDomId(entry))}`)

        target?.focus()
        target?.scrollIntoView({ block: 'nearest' })
    }

    const moveAndFocus = (delta: number) => {
        moveCursor(delta)
        void focusCursorEntry()
    }

    const escalateToPalette = () => {
        close()
        emits('open-palette')
    }

    const restoreTriggerFocus = () => {
        lastTrigger.value?.focus()
    }

    const closeAndRestore = () => {
        close()
        restoreTriggerFocus()
    }

    const handleClose = () => {
        closeAndRestore()
    }

    const handleFilterKeydown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault()
            moveAndFocus(1)

            return
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault()
            moveAndFocus(-1)

            return
        }

        if (event.key === 'Enter' && flatNavigable.value.length === 0) {
            event.preventDefault()
            escalateToPalette()
        }
    }

    const handlePanelKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            event.preventDefault()
            closeAndRestore()

            return
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault()
            moveAndFocus(1)

            return
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault()
            moveAndFocus(-1)
        }
    }

    const handleEntryHover = (entry: INavRailEntry) => {
        const at = flatNavigable.value.findIndex(e => e.slug === entry.slug)

        if (at >= 0) setCursor(at)
    }

    /*********************************************************
     * Ouverture
     *
     * @description
     * On mémorise le déclencheur AVANT d'ouvrir, pour pouvoir lui rendre le
     * focus à la fermeture — un panneau qui se ferme en laissant le focus
     * sur `<body>` fait repartir la tabulation du haut de la page.
     ********************************************************/
    const rememberTrigger = (event: Event) => {
        const target = event.currentTarget

        lastTrigger.value = target instanceof HTMLElement ? target : null
    }

    const focusFilter = async () => {
        await nextTick()

        const root = filterRef.value?.$el

        root?.querySelector<HTMLElement>('input')?.focus()
    }

    const handleFamilyClick = (family: INavRailFamily, event: MouseEvent) => {
        rememberTrigger(event)
        openFamilyPanel(family.kind)
        void focusFilter()
    }

    const handlePagesClick = (event: MouseEvent) => {
        rememberTrigger(event)
        openPagesPanel()
    }

    const handleFabClick = (event: MouseEvent) => {
        rememberTrigger(event)

        if (currentFamily.value) {
            openFamilyPanel(currentFamily.value.kind)
            void focusFilter()

            return
        }

        openPagesPanel()
    }

    const handleSearchClick = () => {
        escalateToPalette()
    }

    watch(isOpen, open => {
        if (!open) cursor.value = -1
    })

    /*********************************************************
     * Expose
     *
     * @description
     * Rien à piloter depuis l'extérieur : le layout communique avec le rail
     * par l'émission `open-palette` uniquement.
     ********************************************************/
    defineExpose({})
</script>

<style scoped lang="scss">
    .nav-rail {
        position: fixed;
        inset-inline-end: var(--nav-rail---gutter, 16px);
        inset-block-start: 50%;
        transform: translateY(-50%);
        z-index: var(--nav-rail---z-index, 1030);
        display: flex;
        flex-direction: column;
        gap: var(--nav-rail---gap, 4px);
        inline-size: var(--nav-rail---width, 56px);
        max-block-size: calc(100vh - var(--nav-rail---gutter, 16px) * 2);
        overflow-y: auto;
        padding: var(--nav-rail---padding, 6px);
        background-color: var(--origam-color__surface---default, #ffffff);
        border: 1px solid var(--origam-color__border---ghost, rgba(0, 0, 0, 0.08));
        border-radius: var(--origam-radius---lg, 12px);
        box-shadow: var(--origam-shadow---md);

        &__list {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: var(--nav-rail---gap, 4px);
        }

        &__slot {
            display: block;
        }

        &__btn {
            --origam-btn---min-height: var(--nav-rail---target, 44px);
            --origam-btn---height: var(--nav-rail---target, 44px);
            --origam-btn---padding-inline: 0;
            --origam-btn---font-size: var(--origam-font-size---xs, 0.75rem);
            --origam-btn---font-weight: 600;
            inline-size: 100%;
            flex-direction: column;

            &--here {
                --origam-btn---background-color: var(--origam-color__action--primary---bgSubtle);
                --origam-btn---color: var(--origam-color__action--primary---fgSubtle);
            }
        }

        &__short {
            display: block;
            line-height: 1.1;
        }

        &__badge {
            display: block;
            font-size: var(--origam-font-size---xs, 0.625rem);
            font-weight: 500;
            opacity: 0.7;
            line-height: 1.1;
        }

        &__rule {
            --origam-divider---opacity: 1;
            --origam-divider---color: var(--origam-color__border---ghost, rgba(0, 0, 0, 0.08));
            margin-block: var(--nav-rail---gap, 4px);
        }

        &__fab {
            position: fixed;
            inset-inline-end: var(--nav-rail---gutter, 16px);
            inset-block-end: calc(var(--nav-rail---gutter, 16px) + env(safe-area-inset-bottom, 0px));
            z-index: var(--nav-rail---z-index, 1030);
            --origam-btn---min-height: var(--nav-rail---fab-size, 56px);
            --origam-btn---height: var(--nav-rail---fab-size, 56px);
            --origam-btn---padding-inline: var(--origam-space---3, 0.75rem);
            flex-direction: column;
        }

        &__scrim {
            position: fixed;
            inset: 0;
            z-index: var(--nav-rail---scrim-z-index, 1029);
            border: 0;
            padding: 0;
            background-color: var(--nav-rail---scrim-color, rgba(0, 0, 0, 0.32));
            cursor: pointer;
        }

        &__panel-inner {
            display: flex;
            flex-direction: column;
            min-block-size: 0;
            max-block-size: inherit;
        }

        &__head {
            display: flex;
            align-items: center;
            gap: var(--origam-space---2, 0.5rem);
            padding: var(--origam-space---3, 0.75rem);
            border-block-end: 1px solid var(--origam-color__border---ghost, rgba(0, 0, 0, 0.08));
        }

        &__title {
            --origam-title---font-size: var(--origam-font-size---sm, 0.875rem);
            --origam-title---font-weight: 700;
            flex: 1 1 auto;
            min-inline-size: 0;
        }

        &__count {
            font-size: var(--origam-font-size---xs, 0.75rem);
            color: var(--origam-color__text---secondary, #525252);
        }

        &__close {
            --origam-btn---min-height: var(--nav-rail---target, 44px);
            --origam-btn---height: var(--nav-rail---target, 44px);
            --origam-btn---padding-inline: 0;
            inline-size: var(--nav-rail---target, 44px);
            flex: none;
        }

        &__filter {
            padding: var(--origam-space---3, 0.75rem);
            border-block-end: 1px solid var(--origam-color__border---ghost, rgba(0, 0, 0, 0.08));
        }

        &__hint {
            margin: var(--origam-space---1, 0.25rem) 0 0;
            font-size: var(--origam-font-size---xs, 0.75rem);
            color: var(--origam-color__text---secondary, #525252);
        }

        &__body {
            flex: 1 1 auto;
            min-block-size: 0;
            overflow-y: auto;
            padding: var(--origam-space---2, 0.5rem);
        }

        &__state {
            margin: 0;
            padding: var(--origam-space---3, 0.75rem);
            font-size: var(--origam-font-size---sm, 0.875rem);
            color: var(--origam-color__text---secondary, #525252);
        }

        &__group {
            margin-block-end: var(--origam-space---3, 0.75rem);
        }

        &__group-title {
            --origam-title---font-size: var(--origam-font-size---xs, 0.75rem);
            --origam-title---font-weight: 600;
            --origam-title---color: var(--origam-color__text---secondary, #525252);
            padding-inline: var(--origam-space---2, 0.5rem);
            text-transform: uppercase;
            letter-spacing: 0.06em;
        }

        &__item--cursor {
            outline: 2px solid var(--origam-color__border---focus, currentColor);
            outline-offset: -2px;
        }

        &__foot {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--origam-space---2, 0.5rem);
            padding: var(--origam-space---2, 0.5rem);
            border-block-start: 1px solid var(--origam-color__border---ghost, rgba(0, 0, 0, 0.08));
        }

        &__foot-link {
            --origam-btn---min-height: var(--nav-rail---target, 44px);
            --origam-btn---height: var(--nav-rail---target, 44px);
            --origam-btn---font-size: var(--origam-font-size---xs, 0.75rem);
        }
    }

    @media (height < 560px) {
        .nav-rail:has(.nav-rail__btn--here) .nav-rail__slot:not(:has(.nav-rail__btn--here)) {
            display: none;
        }
    }
</style>

<style lang="scss">
    .nav-rail__panel.nav-rail__panel--rail {
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .nav-rail__panel.nav-rail__panel--drawer .origam-drawer__content,
    .nav-rail__panel.nav-rail__panel--sheet .origam-drawer__content {
        display: flex;
        flex-direction: column;
        min-block-size: 0;
    }

    .nav-rail__panel.nav-rail__panel--sheet {
        --origam-drawer---height: 85vh;
        max-block-size: 85vh;
    }

    .nav-rail__panel .origam-list-item {
        --origam-list-item---min-height: var(--nav-rail---target, 44px);
    }
</style>
