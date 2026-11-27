<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { LocaleObject } from '@nuxtjs/i18n'
  import { useHydration, useTheme } from 'origam/composables'
  import { MDI_ICONS } from 'origam/enums'
  import type { ICommand } from 'origam/interfaces'
  import type { INavLink, INavSection } from '~/interfaces/nav.interface'

  import { SKIP_LINK_HREF, SKIP_LINK_TARGET_ID } from '~/consts/a11y.const'
  import { NAV_SECTIONS, NAV_THEMING_LINK } from '~/consts/nav.const'
  import { GITHUB_STARS_MIN_DISPLAY } from '~/consts/adoption.const'
  import { SEARCH_SHORTCUT } from '~/consts/chrome.const'
  import { CATALOG_FAMILIES } from '~/consts/catalog-family.const'
  import { GLOBAL_SEARCH_ALL_FAMILY } from '~/consts/global-search.const'
  import { ENSO_BRUSH, ENSO_NAV_BRUSH_WIDTH, ENSO_BAR_BRUSH_WIDTH } from '~/consts/enso.const'
  import { MARKETING_DEFAULTS } from '~/consts/marketing.const'
  import { useLocaleHref } from '~/composables/useLocaleHref'
  import { useT } from '~/composables/useT'
  import { useGithubStars } from '~/composables/useGithubStars'
  import { useGlobalSearch } from '~/composables/useGlobalSearch'
  import { ensoArtVars, ensoPaperVars } from '~/utils/enso.util'

  const { t } = useT()
  const { localeHref, navLinkHref } = useLocaleHref()

  const { resolvedMode, toggleMode } = useTheme()
  const { stars } = useGithubStars()
  const showGithubStars = computed(() => stars.value !== null && stars.value >= GITHUB_STARS_MIN_DISPLAY)

  const paletteOpen = ref(false)
  const { commands, family, isLoading, ensureLoaded, setQuery, resetQuery, setFamily, cycleFamily, getHref } = useGlobalSearch()

  watch(paletteOpen, (open) => {
    if (open) {
      ensureLoaded()
    } else {
      resetQuery()
    }
  })

  const searchFamilyChips = computed(() => [
    { value: GLOBAL_SEARCH_ALL_FAMILY, label: t('chrome.search_filter_all', 'All') },
    ...CATALOG_FAMILIES.map(f => ({ value: f.kind, label: t(f.labelKey, f.labelFallback) }))
  ])
  const searchFilterLabel = computed(() => t('chrome.search_filter_label', 'Filter by family'))
  const searchFilterHint = computed(() => t('chrome.search_filter_hint', 'switch family'))

  // The palette traps Tab (it keeps focus on its input), so the family chips
  // cannot be reached by tabbing. Tab / Shift+Tab cycle the family instead; the
  // palette's own handler runs first and only prevents the default.
  function handlePaletteKeydown (event: KeyboardEvent) {
    if (event.key === 'Tab') {
      cycleFamily(event.shiftKey ? -1 : 1)
    }
  }

  function openPalette () {
    paletteOpen.value = true
  }

  // ⛔ `getHref` returns a RAW app path (`/components/btn`, `/installation`).
  // Under `prefix_except_default` that resolves to the default locale, so the
  // palette used to eject a French visitor into the English page just like the
  // nav links did — measured on /fr/roadmap: "Installation" landed on
  // `/installation`, lang=en-US. #809. Every id `getHref` can answer for is an
  // app route, so `localeHref` applies unconditionally here.
  function handlePaletteSelect (cmd: ICommand) {
    navigateTo(localeHref(getHref(cmd.id)))
  }

  const { locale, locales, setLocale } = useI18n()
  const availableLocales = computed(() => locales.value as LocaleObject[])
  const currentLocale = computed(() => availableLocales.value.find(l => l.code === locale.value))
  const currentLocaleLabel = computed(() => currentLocale.value?.code.toUpperCase() ?? locale.value.toUpperCase())
  const languageAriaLabel = computed(() => t('a11y.language', 'Change language'))
  const changeLocale = (code: string) => setLocale(code as typeof locale.value)

  // #1103 — sans mode épinglé (`$origam.mode === 'auto'`), le serveur ne connaît
  // pas le mode système : il rend l'icône « clair ». Le client doit donc
  // hydrater avec la même icône, puis passer au vrai mode une fois monté.
  const hydrated = useHydration()
  const modeIsPinned = useNuxtApp().$origam.mode !== 'auto'
  const themeIcon = computed(() => {
    const dark = resolvedMode.value === 'dark' && (modeIsPinned || hydrated.value)
    return dark ? 'mdi-weather-sunny' : 'mdi-weather-night'
  })
  const brandName = computed(() => t('brand.name', 'origam'))
  const searchPlaceholder = computed(() => t('chrome.search_placeholder', 'Search…'))
  const searchAriaLabel = computed(() => t('a11y.search', 'Search the documentation'))
  const starCountAriaLabel = computed(() => t('a11y.star_count', 'GitHub stars'))
  const themeAriaLabel = computed(() => t('a11y.toggle_theme', 'Toggle light and dark mode'))

  const primaryNavAriaLabel = computed(() => t('nav.a11y.nav_primary', 'Primary navigation'))
  const githubLabel = computed(() => t('nav.github', 'GitHub'))
  const githubAriaLabel = computed(() => t('a11y.github', 'origam on GitHub'))
  const mobileMenuAriaLabel = computed(() => t('nav.a11y.open_menu', 'Open the navigation menu'))
  const mobileListAriaLabel = computed(() => t('nav.a11y.mobile_menu', 'Navigation menu'))
  const themingLabel = computed(() => t(NAV_THEMING_LINK.i18nKey, NAV_THEMING_LINK.i18nFallback))
  const sectionAriaLabel = (section: { titleKey: string; titleFallback: string }) =>
    t('nav.a11y.open_section', 'Open {section} menu', { section: t(section.titleKey, section.titleFallback) })


  const route = useRoute()

  // `route.path` ALWAYS carries the locale prefix (`/fr/roadmap`); a nav entry
  // holds a raw path (`/roadmap`). Comparing the two raw made the highlight
  // permanently dead outside the default locale — measured on /fr/roadmap:
  // 0 element matched `.primary-nav__link--active`, though the Introduction
  // section does contain /roadmap. #809. Taking the whole link rather than its
  // href is what keeps the `external` entries (Stories, Docs) off localePath().
  function isLinkActive (link: INavLink): boolean {
    const { href, external } = link

    if (!href || external || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return false

    const target = localeHref(href)

    return route.path === target || `${route.path}/` === target
  }

  function isSectionActive (section: Pick<INavSection, 'items'>): boolean {
    return section.items.some(isLinkActive)
  }

  // Fond papier de page : `enso-art` + texture sur <body>, donc aussi pour les
  // menus téléportés hors de l'arbre du layout (ils héritent de <body>).
  useHead({ bodyAttrs: { class: 'enso-art', style: ensoPaperVars() } })

  const navBrushVars = ensoArtVars(ENSO_BRUSH, ENSO_NAV_BRUSH_WIDTH)
  const barBrushVars = ensoArtVars(ENSO_BRUSH, ENSO_BAR_BRUSH_WIDTH)

</script>

<template>
  <origam-app>
    <a
      :href="SKIP_LINK_HREF"
      class="skip-link"
    >
      {{ t('a11y.skip_to_content', 'Skip to content') }}
    </a>

    <origam-app-bar
      class="site-appbar"
      :height="72"
    >
      <template #prepend>
        <nuxt-link
          :to="localeHref('/')"
          class="brand"
          data-cy="brand-home"
        >
          <site-logo :alt="brandName"/>
        </nuxt-link>
      </template>

      <template #content>
        <nav
          class="primary-nav enso-art"
          :style="navBrushVars"
          :aria-label="primaryNavAriaLabel"
        >
          <origam-menu
            v-for="section in NAV_SECTIONS"
            :key="section.titleKey"
            class="appbar-menu appbar-menu--nav"
            location="bottom"
          >
            <template #activator="{ props: menuProps }">
              <origam-btn
                variant="text"
                :elevation="0"
                rounded="small"
                class="primary-nav__link"
                :class="{ 'primary-nav__link--active': isSectionActive(section) }"
                :aria-label="sectionAriaLabel(section)"
                :aria-current="isSectionActive(section) ? 'page' : undefined"
                :append-icon="MDI_ICONS.CHEVRON_DOWN"
                :data-cy="`nav-section-${section.titleFallback.toLowerCase().replace(/\s+/g, '-')}`"
                v-bind="menuProps"
              >
                {{ t(section.titleKey, section.titleFallback) }}
              </origam-btn>
            </template>

            <template #default>
              <origam-list nav>
                <origam-list-item
                  v-for="item in section.items"
                  :key="item.href"
                  :title="t(item.i18nKey, item.i18nFallback)"
                  :href="navLinkHref(item)"
                  :data-cy="`nav-item-${item.i18nFallback.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`"
                />
              </origam-list>
            </template>
          </origam-menu>

          <origam-btn
            :href="navLinkHref(NAV_THEMING_LINK)"
            variant="text"
            :elevation="0"
            rounded="small"
            class="primary-nav__link"
            :class="{ 'primary-nav__link--active': isLinkActive(NAV_THEMING_LINK) }"
            :aria-current="isLinkActive(NAV_THEMING_LINK) ? 'page' : undefined"
            data-cy="nav-theming"
          >
            {{ themingLabel }}
          </origam-btn>
        </nav>
      </template>

      <template #append>
        <span
          class="site-appbar__brush enso-art"
          :style="barBrushVars"
          aria-hidden="true"
          data-cy="appbar-brush"
        />
        <div class="appbar-actions">
          <button
            class="search-trigger"
            type="button"
            data-cy="search-trigger"
            @click="openPalette"
          >
            <origam-icon
              :icon="MDI_ICONS.MAGNIFY"
              :size="16"
              aria-hidden="true"
              class="search-trigger__icon"
            />
            <span class="search-trigger__label">{{ searchPlaceholder }}</span>
            <origam-kbd class="search-trigger__kbd">{{ SEARCH_SHORTCUT }}</origam-kbd>
          </button>

          <origam-btn
            class="appbar-search-btn"
            variant="outlined"
            :icon="MDI_ICONS.MAGNIFY"
            :aria-label="searchAriaLabel"
            data-cy="search-trigger-mobile"
            @click="openPalette"
          />

          <origam-btn
            v-if="showGithubStars"
            class="appbar-actions__btn appbar-actions__stars"
            :href="MARKETING_DEFAULTS.githubRepo"
            target="_blank"
            variant="outlined"
            :prepend-icon="MDI_ICONS.GITHUB"
            rel="noopener noreferrer"
            :aria-label="starCountAriaLabel"
          >
            <origam-number-format
              :value="stars"
              format="compact"
              compact-display="short"
            />
          </origam-btn>

          <origam-btn
            v-else
            class="appbar-actions__btn appbar-actions__btn--icon appbar-actions__github"
            :href="MARKETING_DEFAULTS.githubRepo"
            target="_blank"
            rel="noopener noreferrer"
            variant="text"
            :icon="MDI_ICONS.GITHUB"
            :aria-label="githubAriaLabel"
            data-cy="nav-github"
          />

          <origam-btn
            class="appbar-actions__btn appbar-actions__btn--icon"
            :icon="themeIcon"
            variant="outlined"
            :aria-label="themeAriaLabel"
            data-cy="nav-mode-toggle"
            @click="toggleMode"
          />

          <origam-menu
            class="appbar-menu appbar-menu--lang"
            location="bottom"
          >
            <template #activator="{ props }">
              <origam-btn
                class="appbar-actions__btn appbar-actions__btn--lang"
                variant="outlined"
                :aria-label="languageAriaLabel"
                :prepend-icon="MDI_ICONS.TRANSLATE"
                :text="currentLocaleLabel"
                :append-icon="MDI_ICONS.CHEVRON_DOWN"
                v-bind="props"
              />
            </template>

            <template #default>
              <origam-list nav>
                <origam-list-item
                  v-for="loc in availableLocales"
                  :key="loc.code"
                  :title="loc.name"
                  :active="loc.code === locale"
                  data-cy="locale-option"
                  @click="changeLocale(loc.code)"
                />
              </origam-list>
            </template>
          </origam-menu>

          <origam-menu
            class="appbar-menu appbar-menu--mobile"
            location="bottom"
          >
            <template #activator="{ props: menuProps }">
              <origam-btn
                class="appbar-burger"
                variant="outlined"
                :icon="MDI_ICONS.MENU"
                :aria-label="mobileMenuAriaLabel"
                data-cy="nav-mobile-trigger"
                v-bind="menuProps"
              />
            </template>

            <template #default>
              <origam-list
                nav
                :aria-label="mobileListAriaLabel"
              >
                <template
                  v-for="section in NAV_SECTIONS"
                  :key="section.titleKey"
                >
                  <origam-list-subheader :title="t(section.titleKey, section.titleFallback)"/>
                  <origam-list-item
                    v-for="item in section.items"
                    :key="item.href"
                    :title="t(item.i18nKey, item.i18nFallback)"
                    :href="navLinkHref(item)"
                  />
                </template>
                <origam-divider/>
                <origam-list-item
                  :title="themingLabel"
                  :href="navLinkHref(NAV_THEMING_LINK)"
                />
                <origam-list-item
                  :title="githubLabel"
                  :href="MARKETING_DEFAULTS.githubRepo"
                  target="_blank"
                  rel="noopener noreferrer"
                />
                <origam-divider/>
                <origam-list-subheader :title="languageAriaLabel"/>
                <origam-list-item
                  v-for="loc in availableLocales"
                  :key="loc.code"
                  :title="loc.name"
                  :active="loc.code === locale"
                  @click="changeLocale(loc.code)"
                />
              </origam-list>
            </template>
          </origam-menu>
        </div>
      </template>
    </origam-app-bar>

    <origam-command-palette
      v-model="paletteOpen"
      :commands="commands"
      :placeholder="searchPlaceholder"
      :empty-text="t('chrome.search_empty', 'No results')"
      :loading="isLoading"
      data-cy="global-command-palette"
      @select="handlePaletteSelect"
      @query="setQuery"
      @keydown="handlePaletteKeydown"
    >
      <template #footer>
        <div
          :aria-label="searchFilterLabel"
          class="search-families"
          role="group"
          data-cy="search-families"
        >
          <origam-chip
            v-for="chip in searchFamilyChips"
            :key="chip.value"
            :bg-color="chip.value === family ? 'primary' : undefined"
            :aria-pressed="chip.value === family"
            :text="chip.label"
            :data-cy="`search-family-${chip.value}`"
            role="button"
            size="small"
            @click="setFamily(chip.value)"
          />
        </div>
        <span class="search-families__hint">
          <origam-kbd :combination="['tab']" variant="tonal"/>
          {{ searchFilterHint }}
        </span>
      </template>
    </origam-command-palette>

    <origam-main
      :id="SKIP_LINK_TARGET_ID"
      class="site-main"
    >
      <slot/>
    </origam-main>

    <site-footer/>
  </origam-app>
</template>

<style scoped lang="scss">
  .skip-link {
    position: absolute;
    inset-inline-start: var(--origam-space---2, 0.5rem);
    inset-block-start: var(--origam-space---2, 0.5rem);
    z-index: 100;
    padding: var(--origam-space---2, 0.5rem) var(--origam-space---3, 0.75rem);
    background-color: var(--origam-color__surface---default, #ffffff);
    color: var(--origam-color__text---primary, #0a0a0a);
    border-radius: var(--origam-radius---md, 0.5rem);
    transform: translateY(-200%);
    transition: transform 0.2s ease;

    &:focus {
      transform: translateY(0);
    }
  }

  .brand {
    display: inline-flex;
    align-items: center;
  }

  .site-appbar {
    --origam-toolbar---padding-inline: var(--site-gutter);
    // Papier washi OPAQUE (la couleur de surface sous la texture) : un fond
    // transparent laissait le contenu défiler visiblement dessous. #1571
    --origam-toolbar---background: var(--enso-art) 0 0 / var(--enso-paper---tile, 512px) repeat, var(--origam-color__surface---default);
    --origam-appbar---backdrop-filter: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;

    &__brush {
      position: absolute;
      inset-inline: 0;
      inset-block-end: 0;
      block-size: 6px;
      background: var(--enso-art) center / 100% 100% no-repeat;
      pointer-events: none;
    }
  }

  .primary-nav {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: var(--origam-space---1, 0.25rem);

    &__link {
      // ⛔ Lit la MEME variable que les items des menus de l'appbar
      // (`.appbar-menu .origam-list-item__title`, bloc non scope plus bas).
      // Le menu est TELEPORTE hors de `.primary-nav`, donc la variable est
      // declaree sur `:root` : posee ici, elle n'atteindrait jamais le menu.
      // Une seule source = activateur et menu ne peuvent plus diverger.
      --origam-btn---font-size: var(--appbar-nav---font-size);
      --origam-btn---font-weight: 500;
      --origam-btn---color: var(--origam-color__text---secondary, #525252);
      --origam-btn---padding-inline: var(--origam-space---3, 0.75rem);
      --origam-btn---height: 38px;
      --origam-btn---min-height: 38px;
      --origam-btn---background-color: transparent;
      --origam-btn---overlay-opacity-hover: 0.06;
      position: relative;

      &:hover {
        --origam-btn---color: var(--origam-color__text---primary, #0a0a0a);
      }

      &--active {
        // `!important`: the DS's OrigamToolbar chrome contract
        // (`.origam-toolbar :deep(.origam-btn:not(:hover):not(.origam-btn--active))`)
        // sets `--origam-btn---color` with a higher-specificity selector
        // that beats a plain `.primary-nav__link--active` custom-property
        // override regardless of source order. Setting `color` directly
        // (not through the `--origam-btn---color` token) with `!important`
        // mirrors the DS's own pattern for the same class of problem
        // (`&--variant-text` forces `background-color` the same way).
        color: var(--origam-color__action--primary---fgSubtle, var(--origam-color__action--primary---bg)) !important;
        --origam-btn---font-weight: 600;

        &::after {
          content: '';
          position: absolute;
          inset-inline: var(--origam-btn---padding-inline, 0.75rem);
          inset-block-end: 2px;
          block-size: 6px;
          background: var(--enso-art) center / 100% 100% no-repeat;
          pointer-events: none;
        }
      }
    }
  }

  .appbar-actions {
    display: flex;
    align-items: center;
    gap: var(--origam-space---2, 0.5rem);

    &__btn {
      --origam-btn---height: 38px;
      --origam-btn---min-height: 38px;
      --origam-btn---font-size: 13px;
      --origam-btn---font-weight: 600;
      --origam-btn---padding-inline: var(--origam-space---3, 0.75rem);
      --origam-btn---border-radius: 10px;
      --origam-btn---border-color: var(--origam-color__border---default, rgba(0, 0, 0, 0.12));
      --origam-btn---color: var(--origam-color__text---primary, #0a0a0a);

      &--icon {
        --origam-btn---padding-inline: 0;
        inline-size: 38px;
        --origam-btn---font-size: 18px;
      }
    }
  }

  .appbar-actions .appbar-burger {
    --origam-btn---padding-inline: 0;
    --origam-btn---font-size: 18px;
    --origam-btn---border-radius: 10px;
    --origam-btn---border-color: var(--origam-color__border---default, rgba(0, 0, 0, 0.12));
    --origam-btn---color: var(--origam-color__text---primary, #0a0a0a);
    display: none;
  }

  .appbar-actions .appbar-search-btn {
    --origam-btn---padding-inline: 0;
    --origam-btn---font-size: 18px;
    --origam-btn---border-radius: 10px;
    --origam-btn---border-color: var(--origam-color__border---default, rgba(0, 0, 0, 0.12));
    --origam-btn---color: var(--origam-color__text---primary, #0a0a0a);
    display: none;
  }

  .search-trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--origam-space---2, 0.5rem);
    inline-size: 220px;
    block-size: 38px;
    padding-inline: var(--origam-space---3, 0.75rem);
    background-color: var(--origam-color__surface---variant, rgba(0, 0, 0, 0.04));
    border: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.12));
    border-radius: var(--origam-radius---btn, 10px);
    cursor: pointer;
    color: var(--origam-color__text---secondary, #525252);
    font-size: 13px;
    font-family: inherit;
    transition: background-color 0.15s ease, border-color 0.15s ease;

    &:hover {
      background-color: var(--origam-color__surface---variant, rgba(0, 0, 0, 0.06));
      border-color: var(--origam-color__border---subtle, rgba(0, 0, 0, 0.2));
    }

    &:focus-visible {
      outline: 2px solid var(--origam-color__action--primary---bg, #7c3aed);
      outline-offset: 2px;
    }

    &__icon {
      flex: none;
      color: var(--origam-color__text---secondary, #525252);
    }

    &__label {
      flex: 1 1 auto;
      text-align: start;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &__kbd {
      flex: none;
      margin-inline-start: auto;
      font-size: 11px;
    }
  }

  /*
    ⛔ LA NAV PRINCIPALE EST RETIREE SOUS 600px — #1032.

    Mesure du 2026-10-02 sur /roadmap a 400px de large (glass/light, cookie
    pose avant chargement) : `.primary-nav` s'etend jusqu'a `right=506` dans
    un viewport de 400, et `header.origam-toolbar` la CLIPPE
    (`overflow-x: hidden`). Elle ne faisait donc pas defiler le document —
    elle rendait TROIS commandes inatteignables tout en les laissant dans le
    parcours de tabulation, `visibility: visible` : `nav-section-features`
    (right=413), `nav-theming` (right=506) et `theme-switcher-trigger`
    (right=553).

    On retire donc du parcours clavier des cibles invisibles. `display: none`
    et pas `visibility: hidden` : il faut qu'elles sortent AUSSI de la
    tabulation. La recherche ⌘K (bouton loupe de 44px) reste le seul chemin
    visible vers les pages sous 600px.

    Les autres actions (mode, langue, theme, etoiles) sont retirees au meme
    seuil : mesure a 390px, `.origam-toolbar__append` (356px) ne tient pas a
    cote de la marque (157px) dans les 358px utiles, passe a la ligne a
    y=67 et `header.origam-toolbar` (hauteur 55px, `overflow: hidden`) la
    CLIPPE — elles etaient deja invisibles tout en restant dans la
    tabulation.
  */
  /*
    #1516 — le seuil passe de 600px à 1120px (`responsive.md` du kit : la nav
    tient sur une ligne à partir de 1120px, mesuré). En dessous, la navigation, la
    langue, GitHub et le CTA quittent la barre (display: none, donc aussi la
    tabulation) et vivent dans le menu `.appbar-burger`. Le mode clair / sombre
    et la recherche restent dans la barre à toute largeur.
  */
  @media (max-width: 79.9375rem) {
    .appbar-actions .search-trigger {
      display: none;
    }

    .appbar-actions .appbar-search-btn {
      display: inline-flex;
      flex: none;
      inline-size: 38px;
      block-size: 38px;
      --origam-btn---height: 38px;
      --origam-btn---min-height: 38px;
    }
  }

  @media (max-width: 69.9375rem) {
    .primary-nav,
    .appbar-actions .appbar-actions__stars,
    .appbar-actions .appbar-actions__github,
    .appbar-actions .appbar-actions__btn--lang {
      display: none;
    }

    .appbar-actions .appbar-burger {
      display: inline-flex;
      flex: none;
      inline-size: 38px;
      block-size: 38px;
      --origam-btn---height: 38px;
      --origam-btn---min-height: 38px;
    }
  }

  @media (max-width: 39.9375rem) {
    .appbar-actions .appbar-search-btn,
    .appbar-actions .appbar-burger,
    .appbar-actions__btn--icon {
      inline-size: 44px;
      block-size: 44px;
      --origam-btn---height: 44px;
      --origam-btn---min-height: 44px;
    }
  }

  .search-families {
    display: flex;
    flex: 1 1 auto;
    min-inline-size: 0;
    flex-wrap: wrap;
    gap: var(--origam-space---1, 0.25rem);

    &__hint {
      display: inline-flex;
      align-items: center;
      gap: var(--origam-space---1, 0.25rem);
      white-space: nowrap;
    }
  }
</style>

<style lang="scss">
  /*
    Taille du texte de la barre de navigation — UNE seule declaration, lue a la
    fois par l'activateur (`.primary-nav__link`, bloc scope plus haut) et par les
    items de tous les menus de l'appbar (nav, langue, theme).

    Sur `:root` et pas sur `.primary-nav` : le contenu d'`origam-menu` est
    TELEPORTE hors de la barre, une variable posee sur la barre ne l'atteindrait
    jamais.

    Mesure avant (8 identites, clair, menu nav ET menu theme) : activateur 13px,
    item de menu 16px — +3px partout sauf `geek`, qui etait le seul aligne parce
    qu'une regle `[data-theme="geek"]` lui donnait 0.8125rem au passage, pour sa
    police monospace. Cette exception devient la regle generale ; le bloc `geek`
    ne garde plus que ce qui lui est propre (famille et interlettrage).
  */
  :root {
    --appbar-nav---font-size: 15px;
    --site-gutter: 20px;
  }

  @media (min-width: 40rem) {
    :root {
      --site-gutter: 32px;
    }
  }

  @media (min-width: 64rem) {
    :root {
      --site-gutter: 48px;
    }
  }


  .appbar-menu .origam-list-item__title {
    font-size: var(--appbar-nav---font-size);
  }

  body.enso-art {
    background-image: var(--enso-art), var(--origam-page---background-image, none);
    background-size: var(--enso-paper---tile, 512px), auto;
    background-repeat: repeat, repeat;
  }

  .appbar-menu .origam-menu__content {
    background: var(--enso-art) 0 0 / var(--enso-paper---tile, 512px) repeat, var(--origam-color__surface---default);
    border: 1px solid var(--origam-color__border---default);
    min-width: 200px;
    width: 200px;
    /*
      ⛔ Lit la variable, ne pose PAS de litteral — #955.

      Il y avait ici `padding: 4px` en dur. Il ECRASAIT
      `--origam-menu__content---padding`, que sept themes declarent : quatre
      demandaient 6px et obtenaient 4px.

      ⚠️ Mais le simple RETRAIT du litteral ne rend pas la main au theme — il
      supprime tout le padding. Mesure, 8 identites x 2 modes : le panneau
      tombe a 0px partout. Raison, cote DS : `OrigamMenu.vue:599-602` applique
      `var(--origam-menu__content---padding, 4px)` sur `.origam-menu__list`,
      un element qui n'est rendu QUE dans le repli du slot par defaut
      (`OrigamMenu.vue:31-36`). Des qu'un consommateur fournit son contenu — ce
      que fait toute la navigation de ce site — l'element n'existe pas, et le
      panneau ne recoit AUCUN padding du DS. Verifie : zero regle ne pose de
      padding sur `.origam-menu__content` dans la feuille servie.

      D'ou la forme ci-dessous : on garde une declaration ici, mais elle LIT le
      canal de theme au lieu de le court-circuiter, avec le meme repli 4px que
      le DS. Les quatre identites a 6px l'obtiennent enfin, les trois a 4px ne
      bougent pas.

      Le vrai defaut reste cote DS — le padding du panneau est accroche a un
      enfant de repli plutot qu'au panneau. Le corriger changerait la geometrie
      de tous les consommateurs d'`origam-menu` : pas ici.
    */
    padding: var(--origam-menu__content---padding, 4px);  }

  .appbar-menu .origam-menu__list {
    min-width: 200px;
  }

  .appbar-menu .origam-list-item {
    cursor: pointer;
    transition: background-color 0.12s ease;
  }

  .appbar-menu .origam-list-item:hover {
    background-color: var(--origam-color__action--primary---bgSubtle);
  }

  .appbar-menu .origam-list-item--active {
    --origam-list-item__overlay---background-color: var(--origam-color__action--primary---bg);
    background-color: var(--origam-color__action--primary---bgSubtle);
  }

  .appbar-menu .origam-list-item--active .origam-list-item__title {
    color: var(--origam-color__action--primary---fgSubtle);
    font-weight: 600;
  }

  /*
    ⛔ LARGEUR PILOTEE PAR LE CONTENU — il y avait ici `min-width: 180px` ET
    `width: 180px`, donc une largeur FIXE, pas un plancher.

    Mesure du 2026-09-30, menu « Features » (10 items), 8 identites : le libelle
    le plus long (« Composables ») fait 86px, les gouttieres ~28px, soit ~114px
    utiles — pour 180px imposes. Il restait donc 64 a 67px de VIDE a droite du
    texte sur chaque identite, contre 12 a 15px de retrait a gauche.

    C'est ce que l'utilisateur signalait par « un tres gros espace a droite et a
    gauche ». Mesurer les paddings ne le montrait pas : la pastille est bien
    symetrique, elle s'etend simplement dans du vide. Le defaut n'etait pas une
    gouttiere, c'etait la largeur.

    `max-content` dimensionne sur le libelle le plus long ; le plancher evite un
    menu ridicule sur une section a un seul mot, et le plafond protege des
    libelles longs et des petits ecrans.
  */
  .appbar-menu--nav .origam-menu__content {
    min-width: 8rem;
    width: max-content;
    max-width: min(20rem, 90vw);
  }

  .appbar-menu--nav .origam-menu__list {
    min-width: 0;
  }

  .appbar-menu--nav .origam-list-item {
    text-decoration: none;
  }

  .appbar-menu--mobile .origam-menu__content {
    min-width: 14rem;
    width: max-content;
    max-width: min(20rem, 90vw);
    max-height: 80vh;
    overflow-y: auto;
  }
</style>
