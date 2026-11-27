<template>
  <origam-theme-provider mode="dark">
    <section
      class="home-cta enso-art"
      :style="waveVars"
      aria-labelledby="cta-title"
    >
      <div class="home-cta__inner home-container">
        <div class="home-cta__text">
          <origam-title
            id="cta-title"
            tag="h2"
            class="home-cta__title"
          >
            {{ t('home.cta.title', 'Three steps to begin.') }}
          </origam-title>

          <p
            class="home-cta__description"
            data-cy="cta-description"
          >
            {{ t('home.cta.description', 'npm i origam, then the plugin and a first component. On Nuxt, one module to add.') }}
          </p>

          <p
            class="home-cta__support"
            data-cy="cta-support"
          >
            {{ t('home.cta.support', 'Origam is free, MIT licensed and maintained by one person.') }}
            <origam-btn
              class="home-cta__support-link"
              variant="text"
              size="small"
              append-icon="mdi-arrow-right"
              :href="CONTACT_SUPPORT_ROUTE"
              data-cy="cta-support-link"
            >
              {{ t('home.cta.support_link', 'Support the project') }}
            </origam-btn>
          </p>
        </div>

        <nav
          class="home-cta__actions"
          :aria-label="t('home.cta.actions_label', 'Get started')"
        >
          <origam-btn
            class="home-cta__btn"
            variant="flat"
            size="x-large"
            :bg-color="CTA_SUN_COLOR"
            :color="CTA_INK_COLOR"
            :href="CTA_START_HREF"
            data-cy="cta-btn-start"
          >
            {{ t('home.cta.cta_start', 'Install') }}
          </origam-btn>

          <origam-btn
            class="home-cta__btn"
            variant="outlined"
            size="x-large"
            :href="CTA_COMPONENTS_HREF"
            data-cy="cta-btn-docs"
          >
            {{ t('home.cta.cta_docs', 'Explore the components') }}
          </origam-btn>
        </nav>
      </div>
    </section>
  </origam-theme-provider>
</template>

<script setup lang="ts">
import { useT } from '~/composables/useT'
import { CONTACT_SUPPORT_ROUTE } from '~/consts/contact.const'
import { CTA_COMPONENTS_HREF, CTA_INK_COLOR, CTA_START_HREF, CTA_SUN_COLOR, CTA_WAVE_WIDTH } from '~/consts/cta.const'
import { ENSO_CTA_WAVE } from '~/consts/enso.const'
import { ensoArtVars } from '~/utils/enso.util'

/*********************************************************
 * Props, emits & slots
 *
 * @description
 * Bande finale : titre à gauche, boutons à droite (T8 de #1554). Le pinceau du
 * kit (lilas terminé en doré) court sur le bord haut, derrière le texte. La
 * bande reste encre dans les deux modes (sous-arbre forcé en sombre) : le kit
 * n'a pas de fond CTA violet plein, la variante sombre est la plus proche.
 ********************************************************/
defineEmits([])

defineSlots<Record<string, never>>()

const { t } = useT()

/*********************************************************
 * Pinceau
 *
 * @description
 * Fond CTA du kit dans les deux variantes ; `.enso-art` choisit selon `data-mode`.
 ********************************************************/
const waveVars = ensoArtVars(ENSO_CTA_WAVE, CTA_WAVE_WIDTH)

/*********************************************************
 * Expose
 *
 * @description
 * Rien à piloter depuis l'extérieur.
 ********************************************************/
defineExpose({})
</script>

<style scoped lang="scss">
.home-cta {
    --home-cta-art: min(100vw, 62.5rem);

    position: relative;
    isolation: isolate;
    overflow: hidden;
    container-type: inline-size;
    padding-block-start: calc(var(--home-cta-art) * 0.25);
    padding-block-end: var(--origam-space---12, 3rem);
    background-color: var(--origam-color__surface---default);
    color: var(--origam-color__text---primary);

    &::before {
        content: '';
        position: absolute;
        inset-block-start: calc(var(--home-cta-art) * -0.235);
        inset-inline: 0;
        z-index: -1;
        inline-size: var(--home-cta-art);
        aspect-ratio: var(--enso-art-ratio);
        margin-inline: auto;
        background: var(--enso-art) center / 100% 100% no-repeat;
        mask-image: linear-gradient(to bottom, transparent, black 12%, black 80%, transparent), linear-gradient(to right, transparent, black 18%, black 82%, transparent);
        mask-composite: intersect;
        pointer-events: none;
    }

    &__inner {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: var(--origam-space---8, 2rem);
    }

    &__text {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--origam-space---4, 1rem);
    }

    &__title {
        margin: 0;
        font-size: var(--home-fs-h2);
        font-weight: var(--origam-font__weight---bold, 700);
        letter-spacing: var(--origam-letter-spacing---tight, -0.03em);
        line-height: 1.15;
        color: var(--origam-color__text---primary);
    }

    &__description {
        margin: 0;
        max-inline-size: 34rem;
        font-size: var(--home-fs-body);
        line-height: 1.6;
        color: var(--origam-color__text---secondary);
    }

    &__support {
        margin: 0;
        font-size: var(--home-fs-small);
        color: var(--origam-color__text---secondary);
    }

    &__actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        gap: var(--origam-space---3, 0.75rem);
    }
}

@container (max-width: 48rem) {
    .home-cta__inner {
        grid-template-columns: 1fr;
    }

    .home-cta__actions {
        justify-content: flex-start;
    }
}
</style>
