<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useT } from '~/composables/useT'
import { useCopy } from '~/composables/useCopy'
import { useReferenceDoc, useReferenceCatalog } from '~/composables/useApiReference'
import type { IComposableDoc, IComposableEntry } from '~/interfaces/composables-catalog.interface'

const { t } = useT()
const route = useRoute()
const { copy: copyText, copied: importCopied } = useCopy()
const { copy: copyParamText } = useCopy()

const slug = computed(() => route.params.slug as string)

const { data: displayDoc } = await useReferenceDoc<IComposableDoc>('composable', slug)

const catalogEntry = computed(() => displayDoc.value)

const { data: composablesCatalogData } = await useReferenceCatalog<IComposableEntry>('composable')
const composablesCatalog = computed<IComposableEntry[]>(() => composablesCatalogData.value ?? [])

const hasParams   = computed(() => (displayDoc.value?.params?.length ?? 0) > 0)
const hasReturns  = computed(() => (displayDoc.value?.returns?.length ?? 0) > 0)
const hasExamples = computed(() => (displayDoc.value?.examples?.length ?? 0) > 0)
const hasRelated  = computed(() => (displayDoc.value?.related?.length ?? 0) > 0)
const hasConsumed = computed(() => (displayDoc.value?.consumedInterfaces?.length ?? 0) > 0)
const hasNote     = computed(() => !!displayDoc.value?.noteFallback)

const composableName    = computed(() => displayDoc.value?.name ?? catalogEntry.value?.name ?? slug.value)
const composableDomain  = computed(() => displayDoc.value?.domain ?? catalogEntry.value?.domain ?? '')
const composableDescFb  = computed(() => displayDoc.value?.descriptionFallback ?? catalogEntry.value?.descriptionFallback ?? '')

const importStatement = computed(() => `import { ${composableName.value} } from 'origam'`)

const copyImport = () => copyText(importStatement.value)

/* ── ToC ──────────────────────────────────────────────────────────── */
const tocSections = computed(() => {
    const sections: { id: string; label: string }[] = []
    sections.push({ id: 'section-signature', label: t('composables.detail.signature.title', 'Signature') })
    if (hasParams.value)   sections.push({ id: 'section-params',   label: t('composables.detail.params.title',   'Parameters') })
    if (hasReturns.value)  sections.push({ id: 'section-returns',  label: t('composables.detail.returns.title',  'Return values') })
    if (hasExamples.value) sections.push({ id: 'section-examples', label: t('composables.detail.examples.title', 'Examples') })
    if (hasRelated.value)  sections.push({ id: 'section-related',  label: t('composables.detail.related.title',  'Related composables') })
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

/* ── SEO ──────────────────────────────────────────────────────────── */
useSeoMeta({
    title: () => t('composables.detail.meta.title', `${composableName.value} · origam composables`, { name: composableName.value }),
    description: () => composableDescFb.value,
    ogTitle: () => t('composables.detail.meta.title', `${composableName.value} · origam composables`, { name: composableName.value }),
    ogDescription: () => composableDescFb.value,
})
</script>

<template>
    <article
        class="composable-detail"
        :data-cy="`page-composable-${slug}`"
    >
        <div
            v-if="!displayDoc"
            class="composable-detail-not-found"
            data-cy="composable-not-found"
        >
            <origam-container class="composable-detail-not-found__inner">
                <origam-avatar
                    icon="mdi-help-circle-outline"
                    color="warning"
                    size="64"
                    aria-hidden="true"
                />

                <origam-title
                    tag="h1"
                    class="composable-detail-not-found__title"
                >
                    {{ t('composables.detail.not_found.title', 'Composable not found') }}
                </origam-title>

                <p class="composable-detail-not-found__desc">
                    {{ t('composables.detail.not_found.desc', 'No composable matches the slug') }}
                    <origam-code
                        :code="slug"
                        lang="plaintext"
                        compact
                        class="composable-detail-not-found__slug-code"
                    />
                </p>

                <origam-btn
                    href="/composables"
                    prepend-icon="mdi-arrow-left"
                    variant="tonal"
                    color="primary"
                    data-cy="composable-not-found-back"
                >
                    {{ t('composables.detail.not_found.back', 'Back to catalogue') }}
                </origam-btn>
            </origam-container>
        </div>

        <template v-else>
            <div
                class="composable-hero"
                aria-labelledby="composable-title"
            >
                <origam-container class="composable-hero__container">
                    <nav
                        class="composable-hero__breadcrumb"
                        :aria-label="t('composables.detail.breadcrumb_label', 'Page location')"
                    >
                        <nuxt-link
                            to="/composables"
                            class="composable-hero__breadcrumb-link"
                            data-cy="composable-breadcrumb-catalog"
                        >
                            {{ t('composables.detail.breadcrumb_catalog', 'Composables') }}
                        </nuxt-link>

                        <span
                            class="composable-hero__breadcrumb-sep"
                            aria-hidden="true"
                        >›</span>

                        <span
                            class="composable-hero__breadcrumb-current"
                            aria-current="page"
                        >
                            {{ composableName }}
                        </span>
                    </nav>

                    <div class="composable-hero__identity">
                        <div class="composable-hero__title-row">
                            <origam-title
                                id="composable-title"
                                tag="h1"
                                class="composable-hero__title"
                            >
                                {{ composableName }}
                            </origam-title>

                            <origam-chip
                                color="primary"
                                size="small"
                                variant="outlined"
                                class="composable-hero__domain-chip"
                            >
                                {{ composableDomain }}
                            </origam-chip>

                            <origam-chip
                                size="small"
                                color="success"
                                variant="outlined"
                                prepend-icon="mdi-circle"
                                class="composable-hero__status-chip"
                            >
                                {{ t('composables.detail.hero.stable_label', 'stable') }}
                            </origam-chip>
                        </div>

                        <p class="composable-hero__desc">
                            {{ composableDescFb }}
                        </p>

                        <div class="composable-hero__bottom">
                            <nav
                                class="composable-hero__actions"
                                :aria-label="t('composables.detail.external_links_label', 'External resources')"
                            >
                                <origam-btn
                                    :href="`https://github.com/origam-io/origam/blob/main/packages/ds/src/composables/${composableDomain}/${composableName.replace(/^use/, '').replace(/([A-Z])/g, (m) => m.toLowerCase())}.composable.ts`"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="text"
                                    size="small"
                                    prepend-icon="mdi-github"
                                    data-cy="composable-source-link"
                                >
                                    {{ t('composables.detail.hero.source_label', 'Source') }}
                                </origam-btn>
                            </nav>

                            <origam-btn
                                class="composable-hero__import"
                                variant="text"
                                size="small"
                                :aria-label="t('composables.detail.hero.import_label', 'Copy import statement')"
                                :data-cy="`composable-import-btn-${slug}`"
                                @click="copyImport"
                            >
                                <span class="composable-hero__import-text">{{ importStatement }}</span>
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
                <div class="composable-detail__layout">
                    <aside
                        v-if="tocSections.length > 0"
                        class="composable-toc"
                        :aria-label="t('composables.detail.toc_label', 'Table of contents')"
                        data-cy="composable-toc"
                    >
                        <p class="composable-toc__heading">
                            {{ t('composables.detail.toc_heading', 'On this page') }}
                        </p>

                        <origam-grid
                            tag="ul"
                            columns="1"
                            gap="0.25rem"
                            class="composable-toc__list"
                        >
                            <origam-grid-item
                                v-for="section in tocSections"
                                :key="section.id"
                                tag="li"
                                class="composable-toc__item"
                                :class="{ 'composable-toc__item--active': activeSection === section.id }"
                            >
                                <a
                                    class="composable-toc__link"
                                    :href="`#${section.id}`"
                                    :aria-current="activeSection === section.id ? 'true' : undefined"
                                    @click.prevent="scrollToSection(section.id)"
                                >
                                    {{ section.label }}
                                </a>
                            </origam-grid-item>
                        </origam-grid>
                    </aside>

                    <div class="composable-detail__body">
                        <section
                            id="section-signature"
                            class="composable-section composable-signature"
                            aria-labelledby="composable-signature-title"
                            data-cy="composable-signature"
                        >
                            <header class="composable-section__header">
                                <p class="composable-section__eyebrow">
                                    {{ t('composables.detail.signature.eyebrow', 'API') }}
                                </p>
                                <origam-title
                                    id="composable-signature-title"
                                    tag="h2"
                                    class="composable-section__title"
                                >
                                    {{ t('composables.detail.signature.title', 'Signature') }}
                                </origam-title>
                                <p class="composable-section__desc">
                                    {{ t('composables.detail.signature.desc', 'Full TypeScript signature sourced from the composable file.') }}
                                </p>
                            </header>

                            <template v-if="displayDoc?.signature">
                                <origam-code
                                    :code="displayDoc.signature"
                                    lang="typescript"
                                    copyable
                                    :line-numbers="true"
                                    class="composable-signature__code"
                                    data-cy="composable-signature-code"
                                />
                            </template>

                            <template v-else-if="!displayDoc && catalogEntry">
                                <div class="composable-no-doc__inner">
                                    <origam-icon
                                        icon="mdi-book-open-page-variant-outline"
                                        color="primary"
                                        class="composable-no-doc__icon"
                                        aria-hidden="true"
                                    />

                                    <origam-title
                                        tag="h3"
                                        class="composable-no-doc__title"
                                    >
                                        {{ t('composables.detail.no_doc.title', 'Documentation coming soon') }}
                                    </origam-title>

                                    <p class="composable-no-doc__desc">
                                        {{ t('composables.detail.no_doc.desc', 'The detailed API reference for this composable is being written.') }}
                                    </p>
                                </div>
                            </template>

                            <div
                                v-if="hasNote"
                                class="composable-note"
                                role="note"
                                data-cy="composable-note"
                            >
                                <origam-icon
                                    icon="mdi-information-outline"
                                    size="16"
                                    class="composable-note__icon"
                                    aria-hidden="true"
                                />
                                <p class="composable-note__text">
                                    {{ displayDoc?.noteFallback }}
                                </p>
                            </div>

                            <div
                                v-if="hasConsumed"
                                class="composable-consumed"
                                data-cy="composable-consumed-interfaces"
                            >
                                <p class="composable-consumed__label">
                                    {{ t('composables.detail.consumed_label', 'Consumed interfaces') }}
                                </p>
                                <div class="composable-consumed__chips">
                                    <origam-chip
                                        v-for="iface in displayDoc?.consumedInterfaces"
                                        :key="iface"
                                        size="small"
                                        variant="tonal"
                                        color="primary"
                                        class="composable-consumed__chip"
                                    >
                                        {{ iface }}
                                    </origam-chip>
                                </div>
                            </div>
                        </section>

                        <section
                            v-if="hasParams"
                            id="section-params"
                            class="composable-section composable-params"
                            aria-labelledby="composable-params-title"
                            data-cy="composable-params"
                        >
                            <header class="composable-section__header">
                                <p class="composable-section__eyebrow">
                                    {{ t('composables.detail.params.eyebrow', 'API') }}
                                </p>
                                <origam-title
                                    id="composable-params-title"
                                    tag="h2"
                                    class="composable-section__title"
                                >
                                    {{ t('composables.detail.params.title', 'Parameters') }}
                                </origam-title>
                                <p class="composable-section__desc">
                                    {{ t('composables.detail.params.desc', 'Input parameters accepted by this composable.') }}
                                </p>
                            </header>

                            <dl
                                class="prop-list"
                                data-cy="composable-params-table"
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
                                            {{ t('composables.detail.params.required', 'required') }}
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
                            class="composable-section composable-returns"
                            aria-labelledby="composable-returns-title"
                            data-cy="composable-returns"
                        >
                            <header class="composable-section__header">
                                <p class="composable-section__eyebrow">
                                    {{ t('composables.detail.returns.eyebrow', 'API') }}
                                </p>
                                <origam-title
                                    id="composable-returns-title"
                                    tag="h2"
                                    class="composable-section__title"
                                >
                                    {{ t('composables.detail.returns.title', 'Return values') }}
                                </origam-title>
                                <p class="composable-section__desc">
                                    {{ t('composables.detail.returns.desc', 'Properties and methods exposed by the composable return object.') }}
                                </p>
                            </header>

                            <dl
                                class="prop-list"
                                data-cy="composable-returns-table"
                            >
                                <div
                                    v-for="ret in displayDoc?.returns"
                                    :key="ret.name"
                                    class="prop-list__item"
                                    :data-cy="`return-row-${ret.name}`"
                                >
                                    <dt class="prop-list__dt">
                                        <origam-btn
                                            variant="text"
                                            size="x-small"
                                            class="prop-list__name-btn"
                                            :aria-label="`Copy ${ret.name}`"
                                            @click="copyParamText(ret.name)"
                                        >
                                            <span class="prop-list__name-mono">{{ ret.name }}</span>
                                            <origam-icon
                                                icon="mdi-content-copy"
                                                size="11"
                                                class="prop-list__copy-icon"
                                                aria-hidden="true"
                                            />
                                        </origam-btn>

                                        <origam-code
                                            :code="ret.type"
                                            lang="typescript"
                                            compact
                                            :copyable="false"
                                            class="prop-list__return-type-code"
                                        />
                                    </dt>
                                    <dd class="prop-list__dd">
                                        {{ ret.descriptionFallback }}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <section
                            v-if="hasExamples"
                            id="section-examples"
                            class="composable-section composable-examples"
                            aria-labelledby="composable-examples-title"
                            data-cy="composable-examples"
                        >
                            <header class="composable-section__header">
                                <p class="composable-section__eyebrow">
                                    {{ t('composables.detail.examples.eyebrow', 'Usage') }}
                                </p>
                                <origam-title
                                    id="composable-examples-title"
                                    tag="h2"
                                    class="composable-section__title"
                                >
                                    {{ t('composables.detail.examples.title', 'Examples') }}
                                </origam-title>
                                <p class="composable-section__desc">
                                    {{ t('composables.detail.examples.desc', 'Ready-to-paste usage snippets.') }}
                                </p>
                            </header>

                            <div class="composable-examples__list">
                                <div
                                    v-for="example in displayDoc?.examples"
                                    :key="example.titleFallback"
                                    class="composable-examples__item"
                                    :data-cy="`composable-example-${example.titleFallback.toLowerCase().replace(/[^a-z0-9]/g, '-')}`"
                                >
                                    <origam-title
                                        tag="h3"
                                        class="composable-examples__item-title"
                                    >
                                        {{ example.titleFallback }}
                                    </origam-title>

                                    <origam-code
                                        :code="example.code"
                                        :lang="example.lang"
                                        copyable
                                        :line-numbers="true"
                                        class="composable-examples__code"
                                    />
                                </div>
                            </div>
                        </section>

                        <section
                            v-if="hasRelated"
                            id="section-related"
                            class="composable-section composable-related"
                            aria-labelledby="composable-related-title"
                            data-cy="composable-related"
                        >
                            <header class="composable-section__header">
                                <p class="composable-section__eyebrow">
                                    {{ t('composables.detail.related.eyebrow', 'Ecosystem') }}
                                </p>
                                <origam-title
                                    id="composable-related-title"
                                    tag="h2"
                                    class="composable-section__title"
                                >
                                    {{ t('composables.detail.related.title', 'Related composables') }}
                                </origam-title>
                                <p class="composable-section__desc">
                                    {{ t('composables.detail.related.desc', 'Other composables that pair naturally with this one.') }}
                                </p>
                            </header>

                            <origam-grid
                                tag="ul"
                                columns="repeat(auto-fill, minmax(200px, 1fr))"
                                gap="1rem"
                                class="composable-related__grid"
                                data-cy="composable-related-grid"
                            >
                                <origam-grid-item
                                    v-for="relSlug in displayDoc?.related"
                                    :key="relSlug"
                                    tag="li"
                                    class="composable-related__item"
                                >
                                    <nuxt-link
                                        :to="`/composables/${relSlug}`"
                                        class="composable-related__link"
                                        :data-cy="`composable-related-card-${relSlug}`"
                                    >
                                        <origam-card class="composable-related__card">
                                            <template #default>
                                                <div class="composable-related__card-inner">
                                                    <div class="composable-related__card-head">
                                                        <origam-title
                                                            tag="h3"
                                                            class="composable-related__card-name"
                                                        >
                                                            {{ composablesCatalog.find(e => e.slug === relSlug)?.name ?? relSlug }}
                                                        </origam-title>

                                                        <origam-icon
                                                            icon="mdi-arrow-right"
                                                            size="16"
                                                            class="composable-related__card-arrow"
                                                            aria-hidden="true"
                                                        />
                                                    </div>

                                                    <p class="composable-related__card-desc">
                                                        {{ composablesCatalog.find(e => e.slug === relSlug)?.descriptionFallback ?? '' }}
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
.composable-detail {
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
}

.composable-detail-not-found {
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
        font-size: var(--origam-font-size---base, 1rem);
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

.composable-hero {
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
        font-family: var(--origam-font-family---mono, monospace);
    }

    &__domain-chip {
        font-family: var(--origam-font-family---mono, monospace);
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
        font-size: var(--origam-font-size---base, 1rem);
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
        font-family: var(--origam-font-family---mono, monospace);
        font-size: var(--origam-font-size---xs, 0.75rem);
        border: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
        background: var(--origam-color__surface---sunken, #f5f5f5);
        border-radius: var(--origam-radius---btn, 4px);
        white-space: nowrap;
        --origam-btn---font-size: var(--origam-font-size---xs, 0.75rem);
    }

    &__import-text {
        font-family: var(--origam-font-family---mono, monospace);
        font-size: var(--origam-font-size---xs, 0.75rem);
        overflow: hidden;
        text-overflow: ellipsis;
        max-inline-size: 40ch;
    }
}

.composable-toc {
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

        &--active .composable-toc__link {
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

.composable-section {
    padding-block-end: var(--origam-space---12, 3rem);
    border-block-end: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
    margin-block-end: var(--origam-space---12, 3rem);

    &:last-child {
        border-block-end: none;
        margin-block-end: 0;
    }

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
        font-size: var(--origam-font-size---base, 1rem);
        line-height: 1.65;
        color: var(--origam-color__text---secondary, #525252);
    }
}

.composable-signature {
    &__code {
        margin-block-start: var(--origam-space---4, 1rem);
    }
}

.composable-note {
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

.composable-consumed {
    display: flex;
    align-items: center;
    gap: var(--origam-space---3, 0.75rem);
    margin-block-start: var(--origam-space---4, 1rem);
    flex-wrap: wrap;

    &__label {
        margin: 0;
        font-size: var(--origam-font-size---xs, 0.75rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--origam-color__text---tertiary, #737373);
    }

    &__chips {
        display: flex;
        flex-wrap: wrap;
        gap: var(--origam-space---2, 0.5rem);
    }
}

.composable-no-doc {
    &__inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--origam-space---4, 1rem);
        padding-block: var(--origam-space---12, 3rem);
        text-align: center;
    }

    &__title {
        display: block;
        font-size: var(--origam-font-size---lg, 1.125rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary, #0a0a0a);
        margin: 0;
    }

    &__desc {
        margin: 0;
        color: var(--origam-color__text---secondary, #525252);
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
        --origam-btn---font-size: var(--origam-font-size---base, 1rem);
        gap: var(--origam-space---1, 0.25rem);

        &:hover .prop-list__copy-icon {
            opacity: 1;
        }
    }

    &__name-mono {
        font-family: var(--origam-font-family---mono, monospace);
        font-size: var(--origam-font-size---sm, 0.875rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__copy-icon {
        opacity: 0.4;
        transition: opacity 100ms;
    }

    &__type-chip--primitive {
        font-family: var(--origam-font-family---mono, monospace);
        font-size: 0.7rem;
    }

    &__required-badge {
        font-size: 0.65rem;
    }

    &__default {
        font-family: var(--origam-font-family---mono, monospace);
        font-size: var(--origam-font-size---xs, 0.75rem);
        color: var(--origam-color__text---tertiary, #737373);
    }

    &__return-type-code {
        max-inline-size: 42ch;
    }
}

.composable-examples {
    &__list {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---8, 2rem);
    }

    &__item-title {
        display: block;
        font-size: var(--origam-font-size---base, 1rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary, #0a0a0a);
        margin: 0 0 var(--origam-space---3, 0.75rem);
    }
}

.composable-related {
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

        &:hover .composable-related__card {
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
        font-family: var(--origam-font-family---mono, monospace);
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
    .composable-detail__layout {
        grid-template-columns: 1fr;
    }

    .composable-toc {
        position: static;
        display: none;
    }
}
</style>
