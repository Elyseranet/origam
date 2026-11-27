<template>
  <article
    class="enso-demo"
    aria-labelledby="enso-demo-title"
    data-cy="page-enso"
  >
    <origam-container class="home-container enso-demo__inner">
      <header class="enso-demo__header">
        <origam-title
          id="enso-demo-title"
          tag="h1"
          class="enso-demo__title"
        >
          {{ t('enso_demo.title', 'Enso foundations') }}
        </origam-title>

        <p class="enso-demo__intro">
          {{ t('enso_demo.intro', 'Control page for the enso redesign: the shared decorations and every converted illustration, in light and dark side by side.') }}
        </p>
      </header>

      <div class="enso-demo__columns">
        <origam-theme-provider
          v-for="column in columns"
          :key="column.mode"
          :mode="column.mode"
        >
          <enso-paper
            tag="section"
            class="enso-demo__column"
            :aria-labelledby="column.headingId"
            :data-cy="column.headingId"
          >
            <div class="enso-demo__stage">
              <enso-petals :count="petalCount" />

              <enso-section-title
                :id="column.headingId"
                tag="h2"
              >
                {{ t(column.labelKey, column.labelFallback) }}
              </enso-section-title>

              <p class="enso-demo__text">
                {{ t('enso_demo.stage_text', 'Washi paper, brush-underlined title, falling petals and the brush divider below.') }}
              </p>
            </div>

            <enso-divider />

            <ul
              class="enso-demo__gallery"
              :aria-label="galleryLabel"
            >
              <li
                v-for="item in column.items"
                :key="item.name"
                class="enso-demo__item"
              >
                <figure class="enso-demo__figure">
                  <origam-img
                    :src="item.src"
                    :srcset="item.srcset"
                    :sizes="ENSO_DEMO_GALLERY_SIZES"
                    :aspect-ratio="item.ratio"
                    alt=""
                    class="enso-demo__img"
                  />

                  <figcaption class="enso-demo__caption">
                    <code>{{ item.name }}</code>
                  </figcaption>
                </figure>
              </li>
            </ul>
          </enso-paper>
        </origam-theme-provider>
      </div>
    </origam-container>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useT } from '~/composables/useT'
import { ENSO_DEMO_GALLERY_SIZES, ENSO_PETAL_FLIGHTS } from '~/consts/enso.const'
import { ensoDemoColumns } from '~/utils/enso.util'

/*********************************************************
 * Global
 *
 * @description
 * Page de contrôle des lots enso (#1570) : les deux modes sont forcés côte à
 * côte par deux OrigamThemeProvider, ce qui vérifie au passage que les décors
 * suivent le `data-mode` le plus proche et pas celui de la page. Hors index.
 ********************************************************/
const { t } = useT()

const columns = ensoDemoColumns()

const petalCount = ENSO_PETAL_FLIGHTS.length

const galleryLabel = computed(() => t('enso_demo.gallery_label', 'Converted illustrations'))

useSeoMeta({
    title: () => t('enso_demo.meta.title', 'Enso foundations · origam'),
    description: () => t('enso_demo.meta.description', 'Internal control page for the enso redesign assets.'),
    robots: 'noindex, nofollow'
})

/*********************************************************
 * Expose
 *
 * @description
 * Rien à piloter depuis l'extérieur.
 ********************************************************/
defineExpose({})
</script>

<style scoped lang="scss">
.enso-demo__inner {
    display: flex;
    flex-direction: column;
    gap: var(--origam-space---8, 2rem);
    padding-block: var(--origam-space---12, 3rem);
}

.enso-demo__header {
    display: flex;
    flex-direction: column;
    gap: var(--origam-space---4, 1rem);
}

.enso-demo__title {
    margin: 0;
    font-size: var(--home-fs-h2);
}

.enso-demo__intro,
.enso-demo__text {
    margin: 0;
    font-size: var(--home-fs-body);
    color: var(--origam-color__text---primary);
}

.enso-demo__columns {
    display: grid;
    gap: var(--origam-space---6, 1.5rem);
}

.enso-demo__column {
    display: flex;
    flex-direction: column;
    gap: var(--origam-space---6, 1.5rem);
    min-inline-size: 0;
    padding: var(--origam-space---6, 1.5rem);
    color: var(--origam-color__text---primary);
}

.enso-demo__stage {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--origam-space---4, 1rem);
    min-block-size: 16rem;
    padding-block-start: var(--origam-space---8, 2rem);
}

.enso-demo__gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
    gap: var(--origam-space---4, 1rem);
    margin: 0;
    padding: 0;
    list-style: none;
}

.enso-demo__figure {
    display: flex;
    flex-direction: column;
    gap: var(--origam-space---2, 0.5rem);
    margin: 0;
}

.enso-demo__img {
    border: var(--origam-border__width---1, 1px) dashed var(--origam-color__border---subtle);
}

.enso-demo__caption {
    font-size: var(--home-fs-small);
    overflow-wrap: anywhere;
}

@media (min-width: 64rem) {
    .enso-demo__columns {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>
