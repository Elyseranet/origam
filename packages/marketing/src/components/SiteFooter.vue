<template>
  <footer
    class="site-footer"
    data-cy="site-footer"
  >
    <div class="site-footer__main">
      <div class="site-footer__bar">
        <nuxt-link
          :to="localeHref('/')"
          class="site-footer__brand"
          data-cy="footer-brand"
        >
          <span
            class="site-footer__mark"
            :style="markStyle"
            aria-hidden="true"
          />
          <span class="site-footer__name">{{ brandName }}</span>
          <small class="site-footer__tagline">{{ t('footer.brand_tagline', 'DESIGN SYSTEM') }}</small>
        </nuxt-link>

        <ul
          class="site-footer__social"
          data-cy="footer-social"
        >
          <li
            v-for="social in socials"
            :key="social.key"
          >
            <a
              :href="social.href"
              :aria-label="social.showLabel ? undefined : t(social.labelKey, social.labelFallback)"
              target="_blank"
              rel="noopener noreferrer"
              class="site-footer__link site-footer__social-link"
              :data-cy="`footer-social-${social.key}`"
            >
              <origam-icon
                :icon="social.icon"
                :size="22"
                aria-hidden="true"
              />
              <template v-if="social.showLabel">{{ t(social.labelKey, social.labelFallback) }}</template>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div
      class="site-footer__legal"
      :style="legalStyle"
    >
      <nav
        class="site-footer__sitemap"
        data-cy="footer-sitemap"
        :aria-label="t('nav.a11y.sitemap', 'Site map')"
      >
        <template
          v-for="section in NAV_SECTIONS"
          :key="section.titleKey"
        >
          <h3 class="site-footer__sitemap-title">{{ t(section.titleKey, section.titleFallback) }}</h3>
          <ul class="site-footer__sitemap-list">
            <li
              v-for="item in section.items"
              :key="item.href"
            >
              <a
                v-if="item.external"
                :href="item.href"
                class="site-footer__link"
              >
                {{ t(item.i18nKey, item.i18nFallback) }}
              </a>
              <nuxt-link
                v-else
                :to="localeHref(item.href)"
                class="site-footer__link"
              >
                {{ t(item.i18nKey, item.i18nFallback) }}
              </nuxt-link>
            </li>
          </ul>
        </template>
      </nav>

      <div class="site-footer__legal-bar">
        <nav
          :aria-label="t('footer.legal.title', 'Legal information')"
          data-cy="footer-legal"
        >
          <ul class="site-footer__list site-footer__list--legal">
            <li
              v-for="link in FOOTER_LEGAL"
              :key="link.href"
            >
              <nuxt-link
                :to="navLinkHref(link)"
                class="site-footer__link"
              >
                {{ t(link.i18nKey, link.i18nFallback) }}
              </nuxt-link>
            </li>
          </ul>
        </nav>

        <p
          class="site-footer__copyright"
          data-cy="footer-copyright"
        >
          {{ t('footer.copyright', '© 2026 Elysera · MIT license · Made with origam') }}
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLocaleHref } from '~/composables/useLocaleHref'
import { useT } from '~/composables/useT'
import { ENSO_CIRCLE_OPEN, ENSO_MASK_DRY_05 } from '~/consts/enso.const'
import { NAV_SECTIONS } from '~/consts/nav.const'
import {
    FOOTER_LEGAL,
    FOOTER_MARK_WIDTH,
    FOOTER_SOCIAL_GITHUB,
    FOOTER_SOCIAL_X,
    FOOTER_SOCIAL_YOUTUBE
} from '~/consts/footer.const'
import { ensoImageSet } from '~/utils/enso.util'

/*********************************************************
 * Props, emits & slots
 *
 * @description
 * Pied de page sur deux niveaux (#1596). Niveau 1 : violet profond, une ligne
 * logo | réseaux, sans crête (la scène du CTA fait la transition).
 * Niveau 2 : encre, mentions légales et ligne de copyright, entré par un
 * pinceau sec (`dry-05`) qui mord dans le violet. Identique dans les deux modes :
 * seule l'encre du niveau 2 change (token marketing `brand-deep---ink`).
 ********************************************************/
defineEmits([])

defineSlots<Record<string, never>>()

const { t } = useT()
const { localeHref, navLinkHref } = useLocaleHref()
const { public: publicConfig } = useRuntimeConfig()

const brandName = computed(() => t('brand.name', 'origam'))

/*********************************************************
 * Marque & pinceau
 *
 * @description
 * La marque est la variante ivoire de l'enso (le niveau 1 est sombre dans les
 * deux modes) ; le masque du pinceau est un fichier de même origine (sinon CORS).
 ********************************************************/
const markStyle = {
    '--site-footer-mark': ensoImageSet(ENSO_CIRCLE_OPEN.dark, FOOTER_MARK_WIDTH)
}

const legalStyle = {
    '--site-footer-dry': `url("${ENSO_MASK_DRY_05.src}")`
}

/*********************************************************
 * Réseaux
 *
 * @description
 * GitHub et X viennent du dépôt ; YouTube n'apparaît que si son URL est posée
 * (`NUXT_PUBLIC_YOUTUBE_URL`), jamais un lien fictif.
 ********************************************************/
const socials = computed(() => [
    FOOTER_SOCIAL_GITHUB,
    FOOTER_SOCIAL_X,
    ...(publicConfig.youtubeUrl ? [{ ...FOOTER_SOCIAL_YOUTUBE, href: publicConfig.youtubeUrl }] : [])
])

/*********************************************************
 * Expose
 *
 * @description
 * Rien à piloter depuis l'extérieur.
 ********************************************************/
defineExpose({})
</script>

<style scoped lang="scss">
.site-footer {
    --site-footer-deep: var(--origam-color__brand-deep---end);
    --site-footer-ink: var(--origam-color__brand-deep---ink);
    --site-footer-fg: var(--origam-color__neutral---0);
    --site-footer-muted: color-mix(in srgb, var(--origam-color__primary---50) 77%, var(--origam-color__brand-deep---start));

    position: relative;
    overflow-x: clip;
    line-height: 1.6;
    color: var(--site-footer-fg);

    &__main {
        position: relative;
        isolation: isolate;
        padding-block: 30px 34px;
        background: var(--site-footer-deep);
    }

    &__bar {
        display: grid;
        grid-template-columns: auto auto;
        justify-content: space-between;
        align-items: center;
        gap: 16px 32px;
        min-block-size: 90px;
        padding: 6px max(20px, 3vw);
        font-size: 14.5px;
    }

    &__brand {
        display: flex;
        align-items: center;
        gap: 14px;
        font-size: 20px;
        font-weight: var(--origam-font__weight---bold, 700);
        color: var(--site-footer-fg);
        text-decoration: none;
    }

    &__mark {
        flex: none;
        inline-size: 34px;
        block-size: 34px;
        background: var(--site-footer-mark) center / contain no-repeat;
    }

    &__name {
        text-transform: capitalize;
    }

    &__tagline {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 10.5px;
        font-weight: var(--origam-font__weight---semibold, 600);
        letter-spacing: 0.38em;

        &::before {
            content: '';
            inline-size: 26px;
            block-size: 3px;
            border-radius: 2px;
            background: var(--origam-color__sun---500);
        }
    }

    &__list {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 4px 36px;
        margin: 0;
        padding: 0;
        list-style: none;

        li {
            display: flex;
        }

        &--legal {
            justify-content: flex-start;
        }
    }

    &__link {
        color: var(--site-footer-fg);
        text-decoration: none;

        &:focus-visible {
            outline: 2px solid var(--origam-color__sun---500);
            outline-offset: 3px;
            border-radius: 2px;
        }
    }

    &__social {
        display: flex;
        align-items: center;
        gap: 22px;
        margin: 0;
        padding: 0;
        list-style: none;

        li {
            display: flex;
            align-items: center;
            gap: 22px;
        }

        li:nth-child(2)::before {
            content: '';
            inline-size: 1px;
            block-size: 26px;
            background: color-mix(in srgb, var(--site-footer-fg) 30%, transparent);
        }
    }

    &__social-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-block-size: 44px;
    }

    &__legal {
        position: relative;
        background: var(--site-footer-ink);

        &::before {
            content: '';
            position: absolute;
            inset-inline: -4%;
            inset-block-end: calc(100% - 2px);
            block-size: 46px;
            background: var(--site-footer-ink);
            transform: scaleX(-1);
            pointer-events: none;
            mask:
                var(--site-footer-dry) 0 0 / 100% 100% no-repeat,
                linear-gradient(#000 0 0) 0 100% / 100% 45% no-repeat;
        }
    }

    &__sitemap {
        position: relative;
        display: grid;
        grid-template-columns: max-content 1fr;
        align-items: baseline;
        gap: 6px 24px;
        padding: 18px max(20px, 3vw) 6px;
        font-size: 13px;
        color: var(--site-footer-muted);
    }

    &__sitemap-title {
        margin: 0;
        font-size: 10.5px;
        font-weight: var(--origam-font__weight---semibold, 600);
        letter-spacing: 0.16em;
        text-transform: uppercase;
    }

    &__sitemap-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0 22px;
        margin: 0;
        padding: 0;
        list-style: none;

        .site-footer__link {
            display: inline-flex;
            align-items: center;
            min-block-size: 32px;

            &:hover {
                text-decoration: underline;
            }
        }
    }

    &__legal-bar {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 6px 24px;
        padding: 10px max(20px, 3vw) 18px;
        font-size: 13px;
        color: var(--site-footer-muted);

        .site-footer__link {
            display: inline-flex;
            align-items: center;
            min-block-size: 32px;

            &:hover {
                text-decoration: underline;
            }
        }
    }

    &__copyright {
        margin: 0;
    }
}

@media (max-width: 48rem) {
    .site-footer {
        &__bar {
            grid-template-columns: 1fr;
            justify-items: center;
            padding-block: 22px;
            text-align: center;
        }

        &__legal-bar {
            justify-content: center;
            text-align: center;
        }

        &__sitemap {
            grid-template-columns: 1fr;
            justify-items: center;
            text-align: center;
        }

        &__sitemap-list {
            justify-content: center;
        }

        &__list--legal {
            justify-content: center;
        }
    }
}
</style>
