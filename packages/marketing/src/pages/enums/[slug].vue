<template>
  <article
    class="enum-detail home"
    :data-cy="`page-enum-${slug}`"
  >
    <div
      v-if="!displayDoc"
      class="enum-detail-not-found"
      data-cy="enum-not-found"
    >
      <origam-container class="enum-detail-not-found__inner">
        <origam-avatar
          icon="mdi-help-circle-outline"
          color="warning"
          size="64"
          aria-hidden="true"
        />

        <origam-title
          tag="h1"
          class="enum-detail-not-found__title"
        >
          {{ t('enums.detail.not_found.title', 'Enum not found') }}
        </origam-title>

        <p class="enum-detail-not-found__desc">
          {{ t('enums.detail.not_found.desc', 'No enum matches the slug') }}
          <origam-code
            :code="slug"
            lang="plaintext"
            compact
            class="enum-detail-not-found__slug-code"
          />
        </p>

        <origam-btn
          href="/enums"
          prepend-icon="mdi-arrow-left"
          variant="tonal"
          color="primary"
          data-cy="enum-not-found-back"
        >
          {{ t('enums.detail.not_found.back', 'Back to catalogue') }}
        </origam-btn>
      </origam-container>
    </div>

    <template v-else>
      <enso-page-header
        family="catalog"
        title-id="enum-title"
      >
        <template #breadcrumb>
          <catalog-breadcrumb
            kind="enum"
            :name="enumName"
          />
        </template>

        <template #eyebrow>
          {{ t('nav.enums', 'Enums') }}
        </template>

        <template #title>
          {{ enumName }}
        </template>

        <template
          v-if="enumDescKey || enumDescFallback"
          #intro
        >
          {{ t(enumDescKey, enumDescFallback) }}
        </template>

        <template #default>
          <div class="enum-hero__chips">
            <origam-chip
              color="secondary"
              size="small"
              variant="outlined"
              class="enum-hero__kind-chip"
            >
              {{ t('enums.kind.enum', 'enum') }}
            </origam-chip>

            <origam-chip
              v-if="enumCategory"
              size="small"
              variant="tonal"
              class="enum-hero__category-chip"
            >
              {{ enumCategory }}
            </origam-chip>
          </div>

          <div class="enum-hero__bottom">
            <nav
              v-if="displayDoc?.sourceFile"
              class="enum-hero__actions"
              :aria-label="t('enums.detail.external_links_label', 'External resources')"
            >
              <origam-btn
                :href="`https://github.com/origam-io/origam/blob/main/${displayDoc.sourceFile}`"
                target="_blank"
                rel="noopener noreferrer"
                variant="text"
                size="small"
                prepend-icon="mdi-github"
                data-cy="enum-source-link"
              >
                {{ t('enums.detail.hero.source_label', 'Source') }}
              </origam-btn>
            </nav>
          </div>
        </template>
      </enso-page-header>

      <catalog-related-families
        kind="enum"
        :slug="slug"
      />

      <origam-container class="home-container">
        <div class="enum-detail__layout">
          <aside
            v-if="tocSections.length > 0"
            class="enum-toc"
            :aria-label="t('enums.detail.toc_label', 'Table of contents')"
            data-cy="enum-toc"
          >
            <p class="enum-toc__heading">
              {{ t('enums.detail.toc_heading', 'On this page') }}
            </p>

            <origam-grid
              tag="ul"
              columns="1"
              gap="0.25rem"
              class="enum-toc__list"
            >
              <origam-grid-item
                v-for="section in tocSections"
                :key="section.id"
                tag="li"
                class="enum-toc__item"
                :class="{ 'enum-toc__item--active': activeSection === section.id }"
              >
                <a
                  class="enum-toc__link"
                  :href="`#${section.id}`"
                  :aria-current="activeSection === section.id ? 'true' : undefined"
                  @click.prevent="scrollToSection(section.id)"
                >
                  {{ section.label }}
                </a>
              </origam-grid-item>
            </origam-grid>
          </aside>

          <div class="enum-detail__body">
            <section
              id="section-definition"
              class="enum-section enum-definition"
              aria-labelledby="enum-definition-title"
              data-cy="enum-definition"
            >
              <header class="enum-section__header">
                <p class="enum-section__eyebrow home-eyebrow">
                  {{ t('enums.detail.definition.eyebrow', 'TypeScript') }}
                </p>
                <origam-title
                  id="enum-definition-title"
                  tag="h2"
                  class="enum-section__title"
                >
                  {{ t('enums.detail.definition.title', 'Definition') }}
                </origam-title>
                <p class="enum-section__desc">
                  {{ t('enums.detail.definition.desc', 'The TypeScript definition as found in the origam source. Click the copy icon to copy the snippet.') }}
                </p>
              </header>

              <div
                v-if="displayDoc?.definition"
                class="enum-definition__code-wrap"
                data-cy="enum-definition-code"
              >
                <origam-code
                  :code="displayDoc.definition"
                  lang="typescript"
                  copyable
                  :line-numbers="true"
                  class="enum-definition__code"
                />
              </div>

              <div
                v-else
                class="enum-definition__no-doc"
              >
                <origam-card class="enum-no-doc__card">
                  <template #default>
                    <div class="enum-no-doc__inner">
                      <origam-icon
                        icon="mdi-book-open-page-variant-outline"
                        color="primary"
                        class="enum-no-doc__icon"
                        aria-hidden="true"
                      />
                      <origam-title
                        tag="h3"
                        class="enum-no-doc__title"
                      >
                        {{ t('enums.detail.no_doc.title', 'Documentation coming soon') }}
                      </origam-title>
                      <p class="enum-no-doc__desc">
                        {{ t('enums.detail.no_doc.desc', 'The detailed API reference for this enum is being written.') }}
                      </p>
                    </div>
                  </template>
                </origam-card>
              </div>
            </section>

            <section
              v-if="hasValues"
              id="section-values"
              class="enum-section enum-values"
              aria-labelledby="enum-values-title"
              data-cy="enum-values"
            >
              <header class="enum-section__header">
                <p class="enum-section__eyebrow home-eyebrow">
                  {{ t('enums.detail.values.eyebrow', 'Members') }}
                </p>
                <origam-title
                  id="enum-values-title"
                  tag="h2"
                  class="enum-section__title"
                >
                  {{ t('enums.detail.values.title', 'Members') }}
                </origam-title>
                <p class="enum-section__desc">
                  {{ t('enums.detail.values.desc', 'All members of this enum. Click a value to copy it to clipboard.') }}
                </p>
              </header>

              <row-list
                :items="displayDoc?.values ?? []"
                row-prefix="enum-value"
                data-cy="enum-values-list"
              />
            </section>

            <section
              v-if="hasUsedBy"
              id="section-used-by"
              class="enum-section enum-used-by"
              aria-labelledby="enum-used-by-title"
              data-cy="enum-used-by"
            >
              <header class="enum-section__header">
                <p class="enum-section__eyebrow home-eyebrow">
                  {{ t('enums.detail.used_by.eyebrow', 'Ecosystem') }}
                </p>
                <origam-title
                  id="enum-used-by-title"
                  tag="h2"
                  class="enum-section__title"
                >
                  {{ t('enums.detail.used_by.title', 'Used by') }}
                </origam-title>
                <p class="enum-section__desc">
                  {{ t('enums.detail.used_by.desc', 'Components and props that accept this enum as a value.') }}
                </p>
              </header>

              <origam-grid
                tag="ul"
                columns="repeat(auto-fill, minmax(200px, 1fr))"
                gap="1rem"
                class="enum-used-by__grid"
                data-cy="enum-used-by-grid"
              >
                <origam-grid-item
                  v-for="ref in displayDoc?.usedBy"
                  :key="`${ref.slug}-${ref.propName}`"
                  tag="li"
                  class="enum-used-by__item"
                >
                  <nuxt-link
                    :to="`/components/${ref.slug}`"
                    class="enum-used-by__link"
                    :aria-label="`${ref.name} — prop: ${ref.propName}`"
                    :data-cy="`enum-used-by-card-${ref.slug}`"
                  >
                    <origam-card class="enum-used-by__card">
                      <template #default>
                        <div class="enum-used-by__card-inner">
                          <div class="enum-used-by__card-head">
                            <origam-title
                              tag="h3"
                              class="enum-used-by__card-name"
                            >
                              {{ ref.name }}
                            </origam-title>

                            <origam-icon
                              icon="mdi-arrow-right"
                              size="16"
                              class="enum-used-by__card-arrow"
                              aria-hidden="true"
                            />
                          </div>

                          <p class="enum-used-by__card-prop">
                            <origam-code
                              :code="`prop: ${ref.propName}`"
                              lang="plaintext"
                              compact
                              :copyable="false"
                              class="enum-used-by__card-prop-code"
                            />
                          </p>
                        </div>
                      </template>
                    </origam-card>
                  </nuxt-link>
                </origam-grid-item>
              </origam-grid>
            </section>

            <section
              v-if="hasExamples"
              id="section-examples"
              class="enum-section enum-examples"
              aria-labelledby="enum-examples-title"
              data-cy="enum-examples"
            >
              <header class="enum-section__header">
                <p class="enum-section__eyebrow home-eyebrow">
                  {{ t('enums.detail.examples.eyebrow', 'Usage') }}
                </p>
                <origam-title
                  id="enum-examples-title"
                  tag="h2"
                  class="enum-section__title"
                >
                  {{ t('enums.detail.examples.title', 'Examples') }}
                </origam-title>
                <p class="enum-section__desc">
                  {{ t('enums.detail.examples.desc', 'Ready-to-paste code snippets using this enum.') }}
                </p>
              </header>

              <div class="enum-examples__list">
                <div
                  v-for="example in displayDoc?.examples"
                  :key="example.titleFallback"
                  class="enum-examples__item"
                  :data-cy="`enum-example-${example.titleFallback.toLowerCase().replace(/[^a-z0-9]/g, '-')}`"
                >
                  <origam-title
                    tag="h3"
                    class="enum-examples__item-title"
                  >
                    {{ t(example.titleKey, example.titleFallback) }}
                  </origam-title>

                  <origam-code
                    :code="example.code"
                    :lang="example.lang"
                    copyable
                    :line-numbers="true"
                    class="enum-examples__code"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </origam-container>

      <origam-container class="home-container">
        <catalog-prev-next
          kind="enum"
          :slug="slug"
        />
      </origam-container>
    </template>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useT } from '~/composables/useT'
import { useReferenceDoc } from '~/composables/useApiReference'
import type { IEnumDoc } from '~/interfaces/enums-catalog.interface'

const { t } = useT()
const route = useRoute()

const slug = computed(() => route.params.slug as string)

const { data: displayDoc } = await useReferenceDoc<IEnumDoc>('enum', slug)

const hasValues   = computed(() => (displayDoc.value?.values?.length ?? 0) > 0)
const hasExamples = computed(() => (displayDoc.value?.examples?.length ?? 0) > 0)
const hasUsedBy   = computed(() => (displayDoc.value?.usedBy?.length ?? 0) > 0)

const enumName         = computed(() => displayDoc.value?.name ?? slug.value)
const enumCategory     = computed(() => displayDoc.value?.category ?? '')
const enumDescKey      = computed(() => displayDoc.value?.descriptionKey ?? '')
const enumDescFallback = computed(() => displayDoc.value?.descriptionFallback ?? '')

const tocSections = computed(() => {
    const sections: { id: string; label: string }[] = []
    sections.push({ id: 'section-definition', label: t('enums.detail.definition.title', 'Definition') })
    if (hasValues.value)   sections.push({ id: 'section-values',   label: t('enums.detail.values.title', 'Members') })
    if (hasUsedBy.value)   sections.push({ id: 'section-used-by',  label: t('enums.detail.used_by.title', 'Used by') })
    if (hasExamples.value) sections.push({ id: 'section-examples', label: t('enums.detail.examples.title', 'Examples') })
    return sections
})

const activeSection = ref('')
let intersectionObserver: IntersectionObserver | null = null

const initIntersectionObserver = () => {
    if (intersectionObserver) intersectionObserver.disconnect()
    intersectionObserver = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    activeSection.value = entry.target.id
                    break
                }
            }
        },
        { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )
    tocSections.value.forEach(({ id }) => {
        const el = document.getElementById(id)
        if (el) intersectionObserver!.observe(el)
    })
}

const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(initIntersectionObserver)
onUnmounted(() => {
    intersectionObserver?.disconnect()
})

useSeoMeta({
    title: () => t('enums.detail.meta.title', `${enumName.value} · origam API enums`, { name: enumName.value }),
    description: () => t(enumDescKey.value, enumDescFallback.value),
    ogTitle: () => t('enums.detail.meta.title', `${enumName.value} · origam API enums`, { name: enumName.value }),
    ogDescription: () => t(enumDescKey.value, enumDescFallback.value),
})
</script>

<style scoped lang="scss">
.enum-detail {
    display: flex;
    flex-direction: column;
    min-block-size: 60vh;

    &__layout {
        display: grid;
        grid-template-columns: 212px 1fr;
        gap: var(--origam-space---12, 3rem);
        padding-block: var(--origam-space---10, 2.5rem) var(--origam-space---20, 5rem);
        align-items: start;

        @media (max-width: 1024px) {
            grid-template-columns: 1fr;
        }
    }

    &__body {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---20, 5rem);
        min-inline-size: 0;
    }
}

.enum-detail-not-found {
    &__inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--origam-space---6, 1.5rem);
        padding-block: var(--origam-space---24, 6rem);
        text-align: center;
    }

    &__title {
        display: block;
        font-size: var(--origam-font-size---section, 2rem);
        font-weight: var(--origam-font__weight---bold, 700);
        color: var(--origam-color__text---primary);
        margin: 0;
    }

    &__desc {
        margin: 0;
        font-size: var(--origam-font__size---lg, 1rem);
        color: var(--origam-color__text---secondary);
        display: flex;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
        flex-wrap: wrap;
        justify-content: center;
    }

    &__slug-code {
        display: inline-flex;
    }
}

.enum-hero {
    &__chips {
        display: flex;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
        flex-wrap: wrap;
    }

    &__kind-chip {
        font-family: var(--origam-font__family---mono, monospace);
        font-size: 0.625rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }

    &__category-chip {
        font-size: var(--origam-font__size---sm, 0.75rem);
    }

    &__bottom {
        display: flex;
        align-items: center;
        gap: var(--origam-space---4, 1rem);
        flex-wrap: wrap;
    }

    &__actions {
        display: flex;
        gap: var(--origam-space---2, 0.5rem);
        flex-wrap: wrap;
    }
}

.enum-toc {
    position: sticky;
    top: calc(var(--origam-layout---position-top, 0px) + var(--origam-space---8, 2rem));
    padding-block-end: var(--origam-space---8, 2rem);

    @media (max-width: 1024px) {
        position: static;
        display: flex;
        flex-wrap: wrap;
        gap: var(--origam-space---2, 0.5rem);
        align-items: center;
    }

    &__heading {
        margin: 0 0 var(--origam-space---3, 0.75rem);
        padding-inline-start: var(--origam-space---3, 0.75rem);
        font-size: var(--origam-font__size---sm, 0.75rem);
        font-weight: 700;
        letter-spacing: 0.09em;
        text-transform: uppercase;
        color: var(--origam-color__text---tertiary);

        @media (max-width: 1024px) {
            padding-inline-start: 0;
        }
    }

    &__list {
        list-style: none;
        padding: 0;
        margin: 0;

        @media (max-width: 1024px) {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: var(--origam-space---1, 0.25rem);
        }
    }

    &__item {
        list-style: none;
    }

    &__link {
        display: block;
        font-size: var(--origam-font__size---md, 0.875rem);
        font-weight: 400;
        color: var(--origam-color__text---secondary);
        padding: var(--origam-space---1, 0.25rem) var(--origam-space---3, 0.75rem);
        border-radius: var(--origam-radius---md, 8px);
        border-inline-start: 2px solid transparent;
        text-decoration: none;
        transition: color 100ms, border-color 100ms, background 100ms;

        &:hover {
            color: var(--origam-color__text---primary);
            background: var(--origam-color__action--primary---bgSubtle);
        }

        @media (max-width: 1024px) {
            border-inline-start: none;
            border-block-end: 2px solid transparent;
            padding: var(--origam-space---1, 0.25rem) var(--origam-space---2, 0.5rem);
        }
    }

    &__item--active &__link {
        color: var(--origam-color__action--primary---fgSubtle);
        border-inline-start-color: var(--origam-color__action--primary---bg);
        font-weight: 600;

        @media (max-width: 1024px) {
            border-inline-start-color: transparent;
            border-block-end-color: var(--origam-color__action--primary---bg);
        }
    }
}

.enum-section {
    &__header {
        padding-block-end: var(--origam-space---4, 1rem);
        border-block-end: 1px solid var(--origam-color__border---default);
        margin-block-end: var(--origam-space---6, 1.5rem);
    }

    &__eyebrow {
        margin: 0 0 var(--origam-space---2, 0.5rem);
    }

    &__title {
        display: block;
        font-size: clamp(1.35rem, 2.4vw, 1.75rem);
        font-weight: 700;
        color: var(--origam-color__text---ink);
        letter-spacing: var(--home-ls-title);
        margin: 0 0 var(--origam-space---2, 0.5rem);
    }

    &__desc {
        margin: var(--origam-space---3, 0.75rem) 0 0;
        font-size: var(--origam-font__size---md, 0.875rem);
        color: var(--origam-color__text---secondary);
        line-height: 1.6;
        max-inline-size: 60ch;
    }
}

.enum-definition {
    &__code-wrap {
        overflow-x: auto;
    }
}

.enum-no-doc {
    &__card {
        max-inline-size: 40rem;
    }

    &__inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--origam-space---4, 1rem);
        padding: var(--origam-space---8, 2rem);
        text-align: center;
    }

    &__icon {
        font-size: 2.5rem;
    }

    &__title {
        display: block;
        font-size: var(--origam-font__size---lg, 1rem);
        font-weight: 700;
        color: var(--origam-color__text---primary);
        margin: 0;
    }

    &__desc {
        margin: 0;
        font-size: var(--origam-font__size---md, 0.875rem);
        color: var(--origam-color__text---secondary);
    }
}

.enum-values {
    &__list {
        display: flex;
        flex-direction: column;
        gap: 0;
    }

    &__item {
        display: grid;
        grid-template-columns: minmax(0, 240px) 1fr;
        gap: var(--origam-space---4, 1rem);
        padding-block: var(--origam-space---3, 0.75rem);
        border-block-end: 1px solid var(--origam-color__border---subtle);
        align-items: start;

        &:first-child {
            border-block-start: 1px solid var(--origam-color__border---subtle);
        }

        @media (max-width: 600px) {
            grid-template-columns: 1fr;
            gap: var(--origam-space---2, 0.5rem);
        }
    }

    &__dt {
        display: flex;
        align-items: center;
    }

    &__copy-btn {
        font-family: var(--origam-font__family---mono, monospace);
        display: inline-flex;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
        --origam-btn---font-size: var(--origam-font__size---md, 0.875rem);
    }

    &__value-mono {
        font-family: var(--origam-font__family---mono, monospace);
        font-size: var(--origam-font__size---md, 0.875rem);
        font-weight: 600;
        color: var(--origam-color__action--primary---fgSubtle);
    }

    &__copy-icon {
        opacity: 0.5;
        flex-shrink: 0;
    }

    &__dd {
        margin: 0;
        font-size: var(--origam-font__size---md, 0.875rem);
        line-height: 1.6;
        color: var(--origam-color__text---secondary);
        padding-block-start: var(--origam-space---1, 0.25rem);
    }
}

.enum-used-by {
    &__grid {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    &__item {
        list-style: none;
    }

    &__link {
        display: flex;
        flex-direction: column;
        block-size: 100%;
        text-decoration: none;
        color: inherit;
        border-radius: var(--origam-radius---lg, 12px);

        &:hover .enum-used-by__card {
            transform: translateY(-2px);
            box-shadow: var(--origam-shadow---md);
        }

        &:focus-visible {
            outline: 2px solid var(--origam-color__action--primary---bg);
            outline-offset: 2px;
        }
    }

    &__card {
        block-size: 100%;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    &__card-inner {
        padding: var(--origam-space---4, 1rem);
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---2, 0.5rem);
    }

    &__card-head {
        display: flex;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
    }

    &__card-name {
        display: block;
        flex: 1;
        font-size: var(--origam-font__size---lg, 1rem);
        font-weight: 600;
        font-family: var(--origam-font__family---mono, monospace);
        color: var(--origam-color__text---primary);
        margin: 0;
    }

    &__card-arrow {
        flex-shrink: 0;
        color: var(--origam-color__text---tertiary);
    }

    &__card-prop {
        margin: 0;
    }

    &__card-prop-code {
        display: inline-flex;
    }
}

.enum-examples {
    &__list {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---8, 2rem);
    }

    &__item-title {
        display: block;
        font-size: var(--origam-font__size---lg, 1rem);
        font-weight: 600;
        color: var(--origam-color__text---primary);
        margin: 0 0 var(--origam-space---3, 0.75rem);
    }
}
</style>
