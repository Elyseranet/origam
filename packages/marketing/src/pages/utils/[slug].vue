<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useT } from '~/composables/useT'
import { useCopy } from '~/composables/useCopy'
import { useReferenceDoc, useReferenceCatalog } from '~/composables/useApiReference'
import type { IUtilDoc, IUtilEntry } from '~/interfaces/utils-catalog.interface'

const { t } = useT()
const route = useRoute()
const { copy: copyText, copied: importCopied } = useCopy()
const { copy: copyParamText } = useCopy()

const slug = computed(() => route.params.slug as string)

const { data: displayDoc } = await useReferenceDoc<IUtilDoc>('util', slug)

const { data: allEntriesData } = await useReferenceCatalog<IUtilEntry>('util')
const allEntries = computed<IUtilEntry[]>(() => allEntriesData.value ?? [])

const hasParams   = computed(() => (displayDoc.value?.params?.length ?? 0) > 0)
const hasReturns  = computed(() => !!displayDoc.value?.returns)
const hasExamples = computed(() => (displayDoc.value?.examples?.length ?? 0) > 0)
const hasRelated  = computed(() => (displayDoc.value?.related?.length ?? 0) > 0)
const hasNote     = computed(() => !!displayDoc.value?.noteFallback)

const utilName    = computed(() => displayDoc.value?.name ?? slug.value)
const utilCategory = computed(() => displayDoc.value?.category ?? '')
const utilDescFb  = computed(() => displayDoc.value?.descriptionFallback ?? '')

const relatedEntry = (relSlug: string) => allEntries.value.find(e => e.slug === relSlug)

const importStatement = computed(() => `import { ${utilName.value} } from 'origam'`)

const copyImport = () => copyText(importStatement.value)

const tocSections = computed(() => {
    const sections: { id: string; label: string }[] = []
    sections.push({ id: 'section-signature', label: t('utils.detail.signature.title', 'Signature') })
    if (hasParams.value)   sections.push({ id: 'section-params',   label: t('utils.detail.params.title',   'Parameters') })
    if (hasReturns.value)  sections.push({ id: 'section-returns',  label: t('utils.detail.returns.title',  'Return value') })
    if (hasExamples.value) sections.push({ id: 'section-examples', label: t('utils.detail.examples.title', 'Examples') })
    if (hasRelated.value)  sections.push({ id: 'section-related',  label: t('utils.detail.related.title',  'Related utils') })
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

onMounted(() => { initIntersectionObserver() })
onUnmounted(() => { intersectionObserver?.disconnect() })

useSeoMeta({
    title: () => t('utils.detail.meta.title', `${utilName.value} · origam utils`, { name: utilName.value }),
    description: () => utilDescFb.value,
    ogTitle: () => t('utils.detail.meta.title', `${utilName.value} · origam utils`, { name: utilName.value }),
    ogDescription: () => utilDescFb.value,
})
</script>

<template>
    <article
        class="util-detail"
        :data-cy="`page-util-${slug}`"
    >
        <div
            v-if="!displayDoc"
            class="util-detail-not-found"
            data-cy="util-not-found"
        >
            <origam-container class="util-detail-not-found__inner">
                <origam-avatar
                    icon="mdi-help-circle-outline"
                    color="warning"
                    size="64"
                    aria-hidden="true"
                />

                <origam-title
                    tag="h1"
                    class="util-detail-not-found__title"
                >
                    {{ t('utils.detail.not_found.title', 'Util not found') }}
                </origam-title>

                <p class="util-detail-not-found__desc">
                    {{ t('utils.detail.not_found.desc', 'No util matches the slug') }}
                    <origam-code
                        :code="slug"
                        lang="plaintext"
                        compact
                        class="util-detail-not-found__slug-code"
                    />
                </p>

                <origam-btn
                    href="/utils"
                    prepend-icon="mdi-arrow-left"
                    variant="tonal"
                    color="primary"
                    data-cy="util-not-found-back"
                >
                    {{ t('utils.detail.not_found.back', 'Back to catalogue') }}
                </origam-btn>
            </origam-container>
        </div>

        <template v-else>
            <div
                class="util-hero"
                aria-labelledby="util-title"
            >
                <origam-container class="util-hero__container">
                    <nav
                        class="util-hero__breadcrumb"
                        :aria-label="t('utils.detail.breadcrumb_label', 'Page location')"
                    >
                        <nuxt-link
                            to="/utils"
                            class="util-hero__breadcrumb-link"
                            data-cy="util-breadcrumb-catalog"
                        >
                            {{ t('utils.detail.breadcrumb_catalog', 'Utils') }}
                        </nuxt-link>

                        <span
                            class="util-hero__breadcrumb-sep"
                            aria-hidden="true"
                        >›</span>

                        <span
                            class="util-hero__breadcrumb-current"
                            aria-current="page"
                        >
                            {{ utilName }}
                        </span>
                    </nav>

                    <div class="util-hero__identity">
                        <div class="util-hero__title-row">
                            <origam-title
                                id="util-title"
                                tag="h1"
                                class="util-hero__title"
                            >
                                {{ utilName }}
                            </origam-title>

                            <origam-chip
                                v-if="utilCategory"
                                color="primary"
                                size="small"
                                variant="outlined"
                                class="util-hero__category-chip"
                            >
                                {{ utilCategory }}
                            </origam-chip>

                            <origam-chip
                                size="small"
                                color="success"
                                variant="outlined"
                                prepend-icon="mdi-circle"
                                class="util-hero__status-chip"
                            >
                                {{ t('utils.detail.hero.stable_label', 'stable') }}
                            </origam-chip>
                        </div>

                        <p class="util-hero__desc">
                            {{ utilDescFb }}
                        </p>

                        <div class="util-hero__bottom">
                            <nav
                                v-if="displayDoc?.sourceFile"
                                class="util-hero__actions"
                                :aria-label="t('utils.detail.external_links_label', 'External resources')"
                            >
                                <origam-btn
                                    :href="`https://github.com/origam-io/origam/blob/main/${displayDoc.sourceFile}`"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="text"
                                    size="small"
                                    prepend-icon="mdi-github"
                                    data-cy="util-source-link"
                                >
                                    {{ t('utils.detail.hero.source_label', 'Source') }}
                                </origam-btn>
                            </nav>

                            <origam-btn
                                class="util-hero__import"
                                variant="text"
                                size="small"
                                :aria-label="t('utils.detail.hero.import_label', 'Copy import statement')"
                                :data-cy="`util-import-btn-${slug}`"
                                @click="copyImport"
                            >
                                <span class="util-hero__import-text">{{ importStatement }}</span>
                                <origam-icon
                                    :icon="importCopied ? 'mdi-check' : 'mdi-content-copy'"
                                    size="14"
                                    aria-hidden="true"
                                />
                            </origam-btn>
                        </div>
                    </div>
                </origam-container>
            </div>

            <origam-container>
                <div class="util-detail__layout">
                    <aside
                        v-if="tocSections.length > 0"
                        class="util-toc"
                        :aria-label="t('utils.detail.toc_label', 'Table of contents')"
                        data-cy="util-toc"
                    >
                        <p class="util-toc__heading">
                            {{ t('utils.detail.toc_heading', 'On this page') }}
                        </p>

                        <origam-grid
                            tag="ul"
                            columns="1"
                            gap="0.25rem"
                            class="util-toc__list"
                        >
                            <origam-grid-item
                                v-for="section in tocSections"
                                :key="section.id"
                                tag="li"
                                class="util-toc__item"
                                :class="{ 'util-toc__item--active': activeSection === section.id }"
                            >
                                <a
                                    class="util-toc__link"
                                    :href="`#${section.id}`"
                                    :aria-current="activeSection === section.id ? 'true' : undefined"
                                    @click.prevent="scrollToSection(section.id)"
                                >
                                    {{ section.label }}
                                </a>
                            </origam-grid-item>
                        </origam-grid>
                    </aside>

                    <div class="util-detail__body">
                        <section
                            id="section-signature"
                            class="util-section util-signature"
                            aria-labelledby="util-signature-title"
                            data-cy="util-signature"
                        >
                            <header class="util-section__header">
                                <p class="util-section__eyebrow">
                                    {{ t('utils.detail.signature.eyebrow', 'API') }}
                                </p>
                                <origam-title
                                    id="util-signature-title"
                                    tag="h2"
                                    class="util-section__title"
                                >
                                    {{ t('utils.detail.signature.title', 'Signature') }}
                                </origam-title>
                                <p class="util-section__desc">
                                    {{ t('utils.detail.signature.desc', 'Full TypeScript signature sourced from the util file.') }}
                                </p>
                            </header>

                            <origam-code
                                v-if="displayDoc?.signature"
                                :code="displayDoc.signature"
                                lang="typescript"
                                copyable
                                :line-numbers="true"
                                class="util-signature__code"
                                data-cy="util-signature-code"
                            />

                            <div
                                v-if="hasNote"
                                class="util-note"
                                role="note"
                                data-cy="util-note"
                            >
                                <origam-icon
                                    icon="mdi-information-outline"
                                    size="16"
                                    class="util-note__icon"
                                    aria-hidden="true"
                                />
                                <p class="util-note__text">
                                    {{ displayDoc?.noteFallback }}
                                </p>
                            </div>
                        </section>

                        <section
                            v-if="hasParams"
                            id="section-params"
                            class="util-section util-params"
                            aria-labelledby="util-params-title"
                            data-cy="util-params"
                        >
                            <header class="util-section__header">
                                <p class="util-section__eyebrow">
                                    {{ t('utils.detail.params.eyebrow', 'API') }}
                                </p>
                                <origam-title
                                    id="util-params-title"
                                    tag="h2"
                                    class="util-section__title"
                                >
                                    {{ t('utils.detail.params.title', 'Parameters') }}
                                </origam-title>
                                <p class="util-section__desc">
                                    {{ t('utils.detail.params.desc', 'Input parameters accepted by this util.') }}
                                </p>
                            </header>

                            <dl
                                class="prop-list"
                                data-cy="util-params-table"
                            >
                                <div
                                    v-for="param in displayDoc?.params"
                                    :key="param.name"
                                    class="prop-list__item"
                                    :data-cy="`param-row-${param.name}`"
                                >
                                    <dt class="prop-list__dt">
                                        <origam-btn
                                            variant="text"
                                            size="x-small"
                                            class="prop-list__name-btn"
                                            :aria-label="`Copy ${param.name}`"
                                            @click="copyParamText(param.name)"
                                        >
                                            <span class="prop-list__name-mono">{{ param.name }}</span>
                                            <origam-icon
                                                icon="mdi-content-copy"
                                                size="11"
                                                class="prop-list__copy-icon"
                                                aria-hidden="true"
                                            />
                                        </origam-btn>

                                        <origam-chip
                                            v-if="param.required"
                                            size="x-small"
                                            color="danger"
                                            pill
                                            class="prop-list__required-badge"
                                        >
                                            {{ t('utils.detail.params.required', 'required') }}
                                        </origam-chip>

                                        <origam-chip
                                            size="x-small"
                                            variant="outlined"
                                            class="prop-list__type-chip prop-list__type-chip--primitive"
                                        >
                                            {{ param.type }}
                                        </origam-chip>

                                        <span
                                            v-if="param.defaultValue"
                                            class="prop-list__default"
                                        >= {{ param.defaultValue }}</span>
                                    </dt>
                                    <dd class="prop-list__dd">
                                        {{ param.descriptionFallback }}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <section
                            v-if="hasReturns"
                            id="section-returns"
                            class="util-section util-returns"
                            aria-labelledby="util-returns-title"
                            data-cy="util-returns"
                        >
                            <header class="util-section__header">
                                <p class="util-section__eyebrow">
                                    {{ t('utils.detail.returns.eyebrow', 'API') }}
                                </p>
                                <origam-title
                                    id="util-returns-title"
                                    tag="h2"
                                    class="util-section__title"
                                >
                                    {{ t('utils.detail.returns.title', 'Return value') }}
                                </origam-title>
                                <p class="util-section__desc">
                                    {{ t('utils.detail.returns.desc', 'The value returned by this util.') }}
                                </p>
                            </header>

                            <dl
                                class="prop-list"
                                data-cy="util-returns-table"
                            >
                                <div
                                    class="prop-list__item"
                                    data-cy="util-return-row"
                                >
                                    <dt class="prop-list__dt">
                                        <origam-code
                                            :code="displayDoc?.returns?.type ?? ''"
                                            lang="typescript"
                                            compact
                                            :copyable="false"
                                            class="prop-list__return-type-code"
                                        />
                                    </dt>
                                    <dd class="prop-list__dd">
                                        {{ displayDoc?.returns?.descriptionFallback }}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <section
                            v-if="hasExamples"
                            id="section-examples"
                            class="util-section util-examples"
                            aria-labelledby="util-examples-title"
                            data-cy="util-examples"
                        >
                            <header class="util-section__header">
                                <p class="util-section__eyebrow">
                                    {{ t('utils.detail.examples.eyebrow', 'Usage') }}
                                </p>
                                <origam-title
                                    id="util-examples-title"
                                    tag="h2"
                                    class="util-section__title"
                                >
                                    {{ t('utils.detail.examples.title', 'Examples') }}
                                </origam-title>
                                <p class="util-section__desc">
                                    {{ t('utils.detail.examples.desc', 'Ready-to-paste usage snippets.') }}
                                </p>
                            </header>

                            <div class="util-examples__list">
                                <div
                                    v-for="example in displayDoc?.examples"
                                    :key="example.titleFallback"
                                    class="util-examples__item"
                                    :data-cy="`util-example-${example.titleFallback.toLowerCase().replace(/[^a-z0-9]/g, '-')}`"
                                >
                                    <origam-title
                                        tag="h3"
                                        class="util-examples__item-title"
                                    >
                                        {{ t(example.titleKey, example.titleFallback) }}
                                    </origam-title>

                                    <origam-code
                                        :code="example.code"
                                        :lang="example.lang"
                                        copyable
                                        :line-numbers="true"
                                        class="util-examples__code"
                                    />
                                </div>
                            </div>
                        </section>

                        <section
                            v-if="hasRelated"
                            id="section-related"
                            class="util-section util-related"
                            aria-labelledby="util-related-title"
                            data-cy="util-related"
                        >
                            <header class="util-section__header">
                                <p class="util-section__eyebrow">
                                    {{ t('utils.detail.related.eyebrow', 'Ecosystem') }}
                                </p>
                                <origam-title
                                    id="util-related-title"
                                    tag="h2"
                                    class="util-section__title"
                                >
                                    {{ t('utils.detail.related.title', 'Related utils') }}
                                </origam-title>
                                <p class="util-section__desc">
                                    {{ t('utils.detail.related.desc', 'Other helpers that pair naturally with this one.') }}
                                </p>
                            </header>

                            <origam-grid
                                tag="ul"
                                columns="repeat(auto-fill, minmax(200px, 1fr))"
                                gap="1rem"
                                class="util-related__grid"
                                data-cy="util-related-grid"
                            >
                                <origam-grid-item
                                    v-for="relSlug in displayDoc?.related"
                                    :key="relSlug"
                                    tag="li"
                                    class="util-related__item"
                                >
                                    <nuxt-link
                                        :to="`/utils/${relSlug}`"
                                        class="util-related__link"
                                        :data-cy="`util-related-card-${relSlug}`"
                                    >
                                        <origam-card class="util-related__card">
                                            <template #default>
                                                <div class="util-related__card-inner">
                                                    <div class="util-related__card-head">
                                                        <origam-title
                                                            tag="h3"
                                                            class="util-related__card-name"
                                                        >
                                                            {{ relatedEntry(relSlug)?.name ?? relSlug }}
                                                        </origam-title>

                                                        <origam-icon
                                                            icon="mdi-arrow-right"
                                                            size="16"
                                                            class="util-related__card-arrow"
                                                            aria-hidden="true"
                                                        />
                                                    </div>

                                                    <p class="util-related__card-desc">
                                                        {{ relatedEntry(relSlug)?.descriptionFallback ?? '' }}
                                                    </p>
                                                </div>
                                            </template>
                                        </origam-card>
                                    </nuxt-link>
                                </origam-grid-item>
                            </origam-grid>
                        </section>
                    </div>
                </div>
            </origam-container>
        </template>
    </article>
</template>

<style scoped lang="scss">
.util-detail {
    display: flex;
    flex-direction: column;
    min-block-size: 60vh;

    &__layout {
        display: grid;
        grid-template-columns: 212px 1fr;
        gap: var(--origam-space---12, 3rem);
        padding-block: var(--origam-space---10, 2.5rem) var(--origam-space---20, 5rem);
        align-items: start;
    }

    &__body {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---20, 5rem);
        min-inline-size: 0;
    }
}

.util-detail-not-found {
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
        color: var(--origam-color__text---primary, #0a0a0a);
        margin: 0;
    }

    &__desc {
        margin: 0;
        font-size: var(--origam-font__size---lg, 1rem);
        color: var(--origam-color__text---secondary, #525252);
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

.util-hero {
    position: relative;
    background: color-mix(in srgb, var(--origam-color__surface---raised, #ffffff) 62%, transparent);
    border-block-end: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: var(--origam-gradient---hero-grid);
        background-size: 32px 32px;
        mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, transparent 100%);
        pointer-events: none;
    }

    &::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        inset-block-start: 0;
        block-size: 100%;
        background: var(--origam-gradient---hero-glow);
        opacity: 0.45;
        pointer-events: none;
    }

    &__container {
        position: relative;
        z-index: 1;
        padding-block: var(--origam-space---5, 1.25rem) var(--origam-space---8, 2rem);
    }

    &__breadcrumb {
        display: flex;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
        padding-block: var(--origam-space---5, 1.25rem) 0;
        font-size: var(--origam-font-size---xs, 0.75rem);
        font-weight: var(--origam-font__weight---medium, 500);
        flex-wrap: wrap;
    }

    &__breadcrumb-link {
        color: var(--origam-color__text---secondary, #525252);
        text-decoration: none;
        transition: color 100ms;

        &:hover {
            color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
        }
    }

    &__breadcrumb-sep {
        color: var(--origam-color__text---tertiary, #737373);
        font-size: 0.625rem;
    }

    &__breadcrumb-current {
        color: var(--origam-color__text---primary, #0a0a0a);
        font-weight: var(--origam-font__weight---semibold, 600);
        font-family: var(--origam-font__family---mono, monospace);
    }

    &__identity {
        padding-block: var(--origam-space---8, 2rem) var(--origam-space---6, 1.5rem);
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---4, 1rem);
    }

    &__title-row {
        display: flex;
        align-items: center;
        gap: var(--origam-space---3, 0.75rem);
        flex-wrap: wrap;
    }

    &__title {
        margin: 0;
        font-size: clamp(2.25rem, 5vw, 2.75rem);
        font-weight: 800;
        letter-spacing: -0.045em;
        line-height: 1;
        color: var(--origam-color__text---ink, #0a0a0a);
        display: block;
        font-family: var(--origam-font__family---mono, monospace);
    }

    &__category-chip {
        font-family: var(--origam-font__family---mono, monospace);
        font-size: 0.625rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }

    &__status-chip {
        font-size: var(--origam-font-size---xs, 0.75rem);
    }

    &__desc {
        margin: 0;
        max-inline-size: 52ch;
        font-size: var(--origam-font__size---lg, 1rem);
        line-height: 1.65;
        color: var(--origam-color__text---secondary, #525252);
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

    &__import {
        font-family: var(--origam-font__family---mono, monospace);
        font-size: var(--origam-font-size---xs, 0.75rem);
        border: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
        background: var(--origam-color__surface---sunken, #f5f5f5);
        border-radius: var(--origam-radius---btn, 4px);
        white-space: nowrap;
        --origam-btn---font-size: var(--origam-font-size---xs, 0.75rem);
    }

    &__import-text {
        font-family: var(--origam-font__family---mono, monospace);
        font-size: var(--origam-font-size---xs, 0.75rem);
        overflow: hidden;
        text-overflow: ellipsis;
        max-inline-size: 40ch;
    }
}

.util-toc {
    position: sticky;
    top: calc(var(--origam-layout---position-top, 0px) + var(--origam-space---8, 2rem));
    padding-block-end: var(--origam-space---8, 2rem);

    &__heading {
        margin: 0 0 var(--origam-space---3, 0.75rem);
        padding-inline-start: var(--origam-space---3, 0.75rem);
        font-size: var(--origam-font-size---xs, 0.75rem);
        font-weight: 700;
        letter-spacing: 0.09em;
        text-transform: uppercase;
        color: var(--origam-color__text---tertiary, #737373);
    }

    &__list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    &__item {
        list-style: none;

        &--active .util-toc__link {
            color: var(--origam-color__action--primary---bg, #7c3aed);
            border-inline-start-color: var(--origam-color__action--primary---bg, #7c3aed);
            font-weight: var(--origam-font__weight---semibold, 600);
        }
    }

    &__link {
        display: block;
        padding: var(--origam-space---1\.5, 0.375rem) var(--origam-space---3, 0.75rem);
        font-size: var(--origam-font-size---sm, 0.875rem);
        font-weight: var(--origam-font__weight---medium, 500);
        color: var(--origam-color__text---secondary, #525252);
        text-decoration: none;
        border-radius: var(--origam-radius---sm, 4px);
        border-inline-start: 2px solid transparent;
        transition: color 100ms, border-color 100ms, background-color 100ms;

        &:hover {
            color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
            background: var(--origam-color__surface---sunken, #f5f5f5);
        }
    }
}

.util-section {
    &__header {
        margin-block-end: var(--origam-space---6, 1.5rem);
    }

    &__eyebrow {
        margin: 0 0 var(--origam-space---2, 0.5rem);
        font-size: var(--origam-font-size---xs, 0.75rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
    }

    &__title {
        margin: 0 0 var(--origam-space---3, 0.75rem);
        display: block;
        font-size: clamp(1.25rem, 3vw, 1.5rem);
        font-weight: var(--origam-font__weight---bold, 700);
        letter-spacing: -0.02em;
        color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__desc {
        margin: 0;
        font-size: var(--origam-font__size---lg, 1rem);
        line-height: 1.65;
        color: var(--origam-color__text---secondary, #525252);
    }
}

.util-signature {
    &__code {
        margin-block-start: var(--origam-space---4, 1rem);
    }
}

.util-note {
    display: flex;
    gap: var(--origam-space---3, 0.75rem);
    padding: var(--origam-space---4, 1rem);
    margin-block-start: var(--origam-space---4, 1rem);
    background: var(--origam-color__action--primary---bgSubtle, #ede9fe);
    border-radius: var(--origam-radius---md, 8px);
    border-inline-start: 3px solid var(--origam-color__action--primary---bg, #7c3aed);

    &__icon {
        flex-shrink: 0;
        color: var(--origam-color__action--primary---bg, #7c3aed);
        margin-block-start: 2px;
    }

    &__text {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        line-height: 1.6;
        color: var(--origam-color__text---primary, #0a0a0a);
    }
}

.prop-list {
    display: flex;
    flex-direction: column;
    gap: 0;

    &__item {
        padding-block: var(--origam-space---4, 1rem);
        border-block-end: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));

        &:last-child {
            border-block-end: none;
        }
    }

    &__dt {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--origam-space---2, 0.5rem);
        margin-block-end: var(--origam-space---2, 0.5rem);
    }

    &__dd {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        line-height: 1.55;
        color: var(--origam-color__text---secondary, #525252);
        padding-inline-start: var(--origam-space---2, 0.5rem);
    }

    &__name-btn {
        --origam-btn---font-size: var(--origam-font__size---lg, 1rem);
        gap: var(--origam-space---1, 0.25rem);

        &:hover .prop-list__copy-icon {
            opacity: 1;
        }
    }

    &__name-mono {
        font-family: var(--origam-font__family---mono, monospace);
        font-size: var(--origam-font-size---sm, 0.875rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__copy-icon {
        opacity: 0.4;
        transition: opacity 100ms;
    }

    &__type-chip--primitive {
        font-family: var(--origam-font__family---mono, monospace);
        font-size: 0.7rem;
    }

    &__required-badge {
        font-size: 0.65rem;
    }

    &__default {
        font-family: var(--origam-font__family---mono, monospace);
        font-size: var(--origam-font-size---xs, 0.75rem);
        color: var(--origam-color__text---tertiary, #737373);
    }

    &__return-type-code {
        max-inline-size: 42ch;
    }
}

.util-examples {
    &__list {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---8, 2rem);
    }

    &__item-title {
        display: block;
        font-size: var(--origam-font__size---lg, 1rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary, #0a0a0a);
        margin: 0 0 var(--origam-space---3, 0.75rem);
    }
}

.util-related {
    &__grid {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    &__item {
        list-style: none;
    }

    &__link {
        display: block;
        text-decoration: none;
        color: inherit;
        border-radius: var(--origam-radius---lg, 12px);
        block-size: 100%;

        &:focus-visible {
            outline: 2px solid var(--origam-color__action--primary---bg, #7c3aed);
            outline-offset: 2px;
        }

        &:hover .util-related__card {
            transform: translateY(-2px);
            box-shadow: var(--origam-shadow---md, 0 4px 12px rgba(0, 0, 0, 0.1));
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
        font-size: var(--origam-font-size---sm, 0.875rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        font-family: var(--origam-font__family---mono, monospace);
        color: var(--origam-color__text---primary, #0a0a0a);
        margin: 0;
    }

    &__card-arrow {
        flex-shrink: 0;
        color: var(--origam-color__text---tertiary, #737373);
    }

    &__card-desc {
        margin: 0;
        font-size: var(--origam-font-size---xs, 0.75rem);
        line-height: 1.5;
        color: var(--origam-color__text---secondary, #525252);
    }
}

@media (max-width: 1080px) {
    .util-detail__layout {
        grid-template-columns: 1fr;
    }

    .util-toc {
        position: static;
        display: none;
    }
}
</style>
