<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { LocaleObject } from '@nuxtjs/i18n'
  import { useTheme } from 'origam/composables'
  import { MDI_ICONS } from 'origam/enums'
  import type { ICommand } from 'origam/interfaces'
  import type { INavLink, INavSection } from '~/interfaces/nav.interface'

  import { SKIP_LINK_HREF, SKIP_LINK_TARGET_ID } from '~/consts/a11y.const'
  import { FOOTER_COLUMNS, FOOTER_GRID_COLUMNS, NAV_SECTIONS, NAV_THEMING_LINK } from '~/consts/nav.const'
  import { SEARCH_SHORTCUT, GITHUB_STARS_MIN_DISPLAY } from '~/consts/chrome.const'
  import { MARKETING_DEFAULTS } from '~/consts/marketing.const'
  import { THEME_CHIPS } from '~/consts/themes-showcase.const'
  import { useT } from '~/composables/useT'
  import { useVersion } from '~/composables/useVersion'
  import { useGithubStars } from '~/composables/useGithubStars'
  import { useLinkAvailability } from '~/composables/useLinkAvailability'
  import { useGlobalSearch } from '~/composables/useGlobalSearch'

  const { t } = useT()
  const { versionTag } = useVersion()
  const { theme, setTheme, resolvedMode, toggleMode } = useTheme()
  const { stars } = useGithubStars()
  const showGithubStars = computed(() => stars.value >= GITHUB_STARS_MIN_DISPLAY)

  const paletteOpen = ref(false)
  const { commands, getHref } = useGlobalSearch()

  function openPalette () {
    paletteOpen.value = true
  }

  function handlePaletteSelect (cmd: ICommand) {
    navigateTo(getHref(cmd.id))
  }

  const { locale, locales, setLocale } = useI18n()
  const availableLocales = computed(() => locales.value as LocaleObject[])
  const currentLocale = computed(() => availableLocales.value.find(l => l.code === locale.value))
  const currentLocaleLabel = computed(() => currentLocale.value?.code.toUpperCase() ?? locale.value.toUpperCase())
  const languageAriaLabel = computed(() => t('a11y.language', 'Change language'))
  const changeLocale = (code: string) => setLocale(code as typeof locale.value)

  const themeIcon = computed(() => (resolvedMode.value === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night'))
  const brandName = computed(() => t('brand.name', 'origam'))
  const searchPlaceholder = computed(() => t('chrome.search_placeholder', 'Search…'))
  const searchAriaLabel = computed(() => t('a11y.search', 'Search the documentation'))
  const starCountAriaLabel = computed(() => t('a11y.star_count', 'GitHub stars'))
  const themeAriaLabel = computed(() => t('a11y.toggle_theme', 'Toggle light and dark mode'))
  const themeMenuAriaLabel = computed(() => t('a11y.toggle_brand_theme', 'Switch brand theme'))
  const themeSelectLabel = computed(() => t('chrome.theme_select_label', 'Select brand theme'))

  const activeThipLabel = computed(() => {
    const active = THEME_CHIPS.find(c => c.key === theme.value)
    return active ? t(active.labelKey, active.labelFallback) : t('chrome.theme', 'Theme')
  })
  const themeMenuLabel = computed(() => t('chrome.theme_active', 'Theme: {label}', { label: activeThipLabel.value }))

  const primaryNavAriaLabel = computed(() => t('nav.a11y.nav_primary', 'Primary navigation'))
  const themingLabel = computed(() => t(NAV_THEMING_LINK.i18nKey, NAV_THEMING_LINK.i18nFallback))
  const sectionAriaLabel = (section: { titleKey: string; titleFallback: string }) =>
    t('nav.a11y.open_section', 'Open {section} menu', { section: t(section.titleKey, section.titleFallback) })

  const allNavHrefs = [
    ...NAV_SECTIONS.flatMap(s => s.items.map(i => i.href)),
    NAV_THEMING_LINK.href,
    ...FOOTER_COLUMNS.flatMap(col => col.links.filter(l => !l.external).map(l => l.href))
  ]

  const { availability, ready: navReady } = useLinkAvailability(allNavHrefs)

  function isLinkVisible (link: INavLink): boolean {
    if (link.external) return true
    return availability[link.href] === true
  }

  const route = useRoute()

  function isRouteActive (href: string): boolean {
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return false
    return route.path === href || `${route.path}/` === href
  }

  function isSectionActive (section: Pick<INavSection, 'items'>): boolean {
    return section.items.some(item => isRouteActive(item.href))
  }

  const visibleNavSections = computed(() =>
    NAV_SECTIONS.map(section => ({
      ...section,
      items: section.items.filter(item => isLinkVisible(item))
    })).filter(section => section.items.length > 0)
  )

  const showThemingLink = computed(() => availability[NAV_THEMING_LINK.href] === true)

  const visibleFooterColumns = computed(() =>
    FOOTER_COLUMNS.map(col => ({
      ...col,
      links: col.links.filter(link => isLinkVisible(link))
    }))
  )
</script>

<template>
  <origam-app>
    <span
      class="nav-ready-signal"
      aria-hidden="true"
      :data-nav-ready="navReady ? 'true' : undefined"
    />

    <a
      :href="SKIP_LINK_HREF"
      class="skip-link"
    >
      {{ t('a11y.skip_to_content', 'Skip to content') }}
    </a>

    <origam-app-bar class="site-appbar">
      <template #prepend>
        <nuxt-link
          to="/"
          class="brand"
          :aria-label="brandName"
          data-cy="brand-home"
        >
          <img
            class="brand__logo"
            :src="MARKETING_DEFAULTS.logoPath"
            :alt="brandName"
            width="26"
            height="26"
          >
          <span class="brand__name">{{ brandName }}</span>
          <origam-chip
            class="brand__version"
            size="x-small"
            color="primary"
            border
          >{{ versionTag }}</origam-chip>
        </nuxt-link>
      </template>

      <template #content>
        <nav
          class="primary-nav"
          :aria-label="primaryNavAriaLabel"
        >
          <origam-menu
            v-for="section in visibleNavSections"
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
                  :href="item.href"
                  :data-cy="`nav-item-${item.i18nFallback.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`"
                />
              </origam-list>
            </template>
          </origam-menu>

          <origam-btn
            v-if="showThemingLink"
            :href="NAV_THEMING_LINK.href"
            variant="text"
            :elevation="0"
            rounded="small"
            class="primary-nav__link"
            :class="{ 'primary-nav__link--active': isRouteActive(NAV_THEMING_LINK.href) }"
            :aria-current="isRouteActive(NAV_THEMING_LINK.href) ? 'page' : undefined"
            data-cy="nav-theming"
          >
            {{ themingLabel }}
          </origam-btn>
        </nav>
      </template>

      <template #append>
        <div class="appbar-actions">
          <button
            class="search-trigger"
            type="button"
            :aria-label="searchAriaLabel"
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
            v-if="showGithubStars"
            class="appbar-actions__btn"
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
            class="appbar-actions__btn appbar-actions__btn--icon"
            :icon="themeIcon"
            variant="outlined"
            :aria-label="themeAriaLabel"
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
            class="appbar-menu appbar-menu--theme"
            location="bottom"
          >
            <template #activator="{ props }">
              <origam-btn
                class="appbar-actions__btn"
                variant="outlined"
                :aria-label="themeMenuAriaLabel"
                :text="themeMenuLabel"
                :append-icon="MDI_ICONS.CHEVRON_DOWN"
                v-bind="props"
              >
                <template #prepend>
                  <span
                    class="theme-switcher__swatch"
                    :data-theme-swatch="theme"
                    aria-hidden="true"
                  />
                </template>
              </origam-btn>
            </template>

            <template #default>
              <origam-list
                nav
                :aria-label="themeSelectLabel"
              >
                <origam-list-item
                  v-for="chip in THEME_CHIPS"
                  :key="chip.key"
                  :title="t(chip.labelKey, chip.labelFallback)"
                  :active="chip.key === theme"
                  :data-cy="`theme-menu-${chip.key}`"
                  @click="setTheme(chip.key)"
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
      data-cy="global-command-palette"
      @select="handlePaletteSelect"
    />

    <origam-main :id="SKIP_LINK_TARGET_ID">
      <slot/>
    </origam-main>

    <footer class="site-footer">
      <origam-grid
        class="site-footer__top"
        :columns="FOOTER_GRID_COLUMNS"
        gap="xl"
        tag="div"
      >
        <div class="site-footer__brand">
          <nuxt-link
            to="/"
            class="brand"
            :aria-label="brandName"
          >
            <img
              class="brand__logo"
              :src="MARKETING_DEFAULTS.logoPath"
              :alt="brandName"
              width="26"
              height="26"
            >
            <span class="brand__name">{{ brandName }}</span>
          </nuxt-link>
          <p class="site-footer__tagline">{{ t('footer.tagline', 'The Vue 3 design system that just works.') }}</p>
        </div>

        <nav
          v-for="column in visibleFooterColumns"
          :key="column.titleKey"
          class="site-footer__column"
          :aria-label="t(column.titleKey, column.titleFallback)"
        >
          <origam-title
            tag="h2"
            class="site-footer__column-title"
            :text="t(column.titleKey, column.titleFallback)"
          />
          <origam-grid
            tag="ul"
            columns="1"
            gap="0"
            class="site-footer__list"
          >
            <origam-grid-item
              v-for="link in column.links"
              :key="link.href"
              tag="li"
            >
              <a
                v-if="link.external"
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
                class="site-footer__link"
              >
                {{ t(link.i18nKey, link.i18nFallback) }}
              </a>
              <nuxt-link
                v-else
                :to="link.href"
                class="site-footer__link"
              >
                {{ t(link.i18nKey, link.i18nFallback) }}
              </nuxt-link>
            </origam-grid-item>
          </origam-grid>
        </nav>
      </origam-grid>

      <origam-divider class="site-footer__rule"/>

      <div class="site-footer__bottom">
        <p class="site-footer__line">{{ t('footer.copyright', '© 2026 origam · MIT') }}</p>
        <p class="site-footer__line">{{ t('footer.made_with', 'Made with origam, by humans.') }}</p>
      </div>
    </footer>
  </origam-app>
</template>

<style scoped lang="scss">
  .nav-ready-signal {
    display: none;
  }

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
    gap: var(--origam-space---2, 0.5rem);
    font-weight: 700;

    &__logo {
      flex: none;
      inline-size: 26px;
      block-size: 26px;
    }

    &__name {
      font-size: var(--origam-font-size---lg, 1.125rem);
    }

    &__version {
      font-size: var(--origam-font-size---xs, 0.75rem);
      font-weight: 500;
      color: var(--origam-color__text---secondary, #525252);
      padding-inline: var(--origam-space---1, 0.25rem);
      border-radius: var(--origam-radius---sm, 0.25rem);
      background-color: var(--origam-color__surface---variant, rgba(0, 0, 0, 0.04));
    }
  }

  .site-appbar {
    --origam-toolbar---background: var(--origam-appbar---bg);
    backdrop-filter: saturate(1.4) blur(16px);
    -webkit-backdrop-filter: saturate(1.4) blur(16px);
    border-block-end: 1px solid var(--origam-color__border---ghost, rgba(0, 0, 0, 0.08));
  }

  .primary-nav {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: var(--origam-space---1, 0.25rem);

    &__link {
      --origam-btn---font-size: 13px;
      --origam-btn---font-weight: 500;
      --origam-btn---color: var(--origam-color__text---secondary, #525252);
      --origam-btn---padding-inline: var(--origam-space---3, 0.75rem);
      --origam-btn---height: 34px;
      --origam-btn---min-height: 34px;
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
          inset-block-end: 4px;
          block-size: 2px;
          border-radius: var(--origam-radius---xs, 1px);
          background-color: var(--origam-color__action--primary---bg, currentColor);
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

  .theme-switcher {
    &__swatch {
      display: inline-block;
      inline-size: 16px;
      block-size: 16px;
      border-radius: var(--origam-radius---sm, 4px);
      background: linear-gradient(135deg, var(--origam-color__action--primary---bg, #7c3aed), var(--origam-color__text---ink, #0a0a0a));
    }
  }

  .site-footer {
    display: flex;
    flex-direction: column;
    gap: var(--origam-space---6, 1.5rem);
    padding: var(--origam-space---10, 4rem) var(--origam-space---6, 1.5rem) var(--origam-space---6, 1.5rem);
    border-block-start: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
    color: var(--origam-color__text---secondary, #525252);

    &__top {
      align-items: start;
    }

    &__brand {
      display: flex;
      flex-direction: column;
      gap: var(--origam-space---3, 0.75rem);
      max-inline-size: 22rem;
    }

    &__tagline {
      margin: 0;
      font-size: var(--origam-font-size---md, 1rem);
      line-height: 1.5;
      color: var(--origam-color__text---secondary, #525252);
    }

    &__column {
      display: flex;
      flex-direction: column;
      gap: var(--origam-space---2, 0.5rem);
    }

    &__column-title {
      --origam-title---font-size: var(--origam-font-size---xs, 0.75rem);
      --origam-title---color: var(--origam-color__text---secondary, #525252);
      --origam-title---font-weight: 600;
      --origam-title---letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    &__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--origam-space---2, 0.5rem);
    }

    &__link {
      font-size: var(--origam-font-size---sm, 0.875rem);
      color: var(--origam-color__text---secondary, #525252);
      text-decoration: none;
      transition: color 0.15s ease;

      &:hover,
      &:focus-visible {
        color: var(--origam-color__action--primary---bg, #7c3aed);
      }
    }

    &__rule {
      --origam-divider---opacity: 1;
      --origam-divider---border-top-width: 1px;
      --origam-divider---color: var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
    }

    &__bottom {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: var(--origam-space---2, 0.5rem);
    }

    &__line {
      margin: 0;
      font-size: var(--origam-font-size---sm, 0.875rem);
    }
  }
</style>

<style lang="scss">
  .appbar-menu .origam-menu__content {
    min-width: 200px;
    width: 200px;
    padding: 4px;
  }

  .appbar-menu .origam-menu__list {
    min-width: 200px;
  }

  .appbar-menu .origam-list-item {
    cursor: pointer;
    border-radius: var(--origam-radius---sm, 6px);
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

  [data-theme="geek"] .appbar-menu .origam-list-item__title {
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    font-size: 0.8125rem;
    letter-spacing: -0.01em;
  }

  .appbar-menu--nav .origam-menu__content {
    min-width: 180px;
    width: 180px;
  }

  .appbar-menu--nav .origam-menu__list {
    min-width: 180px;
  }

  .appbar-menu--nav .origam-list-item {
    text-decoration: none;
  }
</style>
