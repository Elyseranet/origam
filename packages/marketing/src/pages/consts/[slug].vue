<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useT } from '~/composables/useT'
import { useCopy } from '~/composables/useCopy'
import { useReferenceDoc } from '~/composables/useApiReference'
import type { IConstDoc } from '~/interfaces/consts-catalog.interface'

const { t } = useT()
const route = useRoute()
const { copy: copyValue } = useCopy()

const slug = computed(() => route.params.slug as string)

const { data: displayDoc } = await useReferenceDoc<IConstDoc>('const', slug)

const hasValues   = computed(() => (displayDoc.value?.values?.length ?? 0) > 0)
const hasValue    = computed(() => !hasValues.value && !!displayDoc.value?.value)
const hasExamples = computed(() => (displayDoc.value?.examples?.length ?? 0) > 0)
const hasUsedBy   = computed(() => (displayDoc.value?.usedBy?.length ?? 0) > 0)

const usedByEntries = computed(() =>
    (displayDoc.value?.usedBy ?? []).map(ref => ({
        name: ref.name,
        tag: ref.slug ? 'nuxt-link' : 'div',
        to: ref.slug ? `/components/${ref.slug}` : undefined,
        linkable: !!ref.slug
    }))
)

const constName        = computed(() => displayDoc.value?.name ?? slug.value)
const constCategory    = computed(() => displayDoc.value?.category ?? '')
const constDescKey     = computed(() => displayDoc.value?.descriptionKey ?? '')
const constDescFallback = computed(() => displayDoc.value?.descriptionFallback ?? '')

const copiedValueIndex = ref<number | null>(null)
let copiedTimer: ReturnType<typeof setTimeout> | null = null

const copyConstValue = async (value: string, index: number) => {
    await copyValue(value)
    copiedValueIndex.value = index
    if (copiedTimer) clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => { copiedValueIndex.value = null }, 2000)
}

const tocSections = computed(() => {
    const sections: { id: string; label: string }[] = []
    sections.push({ id: 'section-definition', label: t('consts.detail.definition.title', 'Definition') })
    if (hasValues.value)   sections.push({ id: 'section-values',   label: t('consts.detail.values.title', 'Values') })
    if (hasUsedBy.value)   sections.push({ id: 'section-used-by',  label: t('consts.detail.used_by.title', 'Used by') })
    if (hasExamples.value) sections.push({ id: 'section-examples', label: t('consts.detail.examples.title', 'Examples') })
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
    if (copiedTimer) clearTimeout(copiedTimer)
})

useSeoMeta({
    title: () => t('consts.detail.meta.title', `${constName.value} · origam constants`, { name: constName.value }),
    description: () => t(constDescKey.value, constDescFallback.value),
    ogTitle: () => t('consts.detail.meta.title', `${constName.value} · origam constants`, { name: constName.value }),
    ogDescription: () => t(constDescKey.value, constDescFallback.value),
})
</script>

<template>
    <article
        class="const-detail"
        :data-cy="`page-const-${slug}`"
    >
        <div
            v-if="!displayDoc"
            class="const-detail-not-found"
            data-cy="const-not-found"
        >
            <origam-container class="const-detail-not-found__inner">
                <origam-avatar
                    icon="mdi-help-circle-outline"
                    color="warning"
                    size="64"
                    aria-hidden="true"
                />

                <origam-title
                    tag="h1"
                    class="const-detail-not-found__title"
                >
                    {{ t('consts.detail.not_found.title', 'Constant not found') }}
                </origam-title>

                <p class="const-detail-not-found__desc">
                    {{ t('consts.detail.not_found.desc', 'No constant matches the slug') }}
                    <origam-code
                        :code="slug"
                        lang="plaintext"
                        compact
                        class="const-detail-not-found__slug-code"
                    />
                </p>

                <origam-btn
                    href="/consts"
                    prepend-icon="mdi-arrow-left"
                    variant="tonal"
                    color="primary"
                    data-cy="const-not-found-back"
                >
                    {{ t('consts.detail.not_found.back', 'Back to catalogue') }}
                </origam-btn>
            </origam-container>
        </div>

        <template v-else>
            <div
                class="const-hero"
                aria-labelledby="const-title"
            >
                <origam-container class="const-hero__container">
                    <nav
                        class="const-hero__breadcrumb"
                        :aria-label="t('consts.detail.breadcrumb_label', 'Page location')"
                    >
                        <nuxt-link
                            to="/consts"
                            class="const-hero__breadcrumb-link"
                            data-cy="const-breadcrumb-catalog"
                        >
                            {{ t('consts.detail.breadcrumb_catalog', 'Constants') }}
                        </nuxt-link>

                        <span
                            class="const-hero__breadcrumb-sep"
                            aria-hidden="true"
                        >›</span>

                        <span
                            class="const-hero__breadcrumb-current"
                            aria-current="page"
                        >
                            {{ constName }}
                        </span>
                    </nav>

                    <div class="const-hero__identity">
                        <div class="const-hero__title-row">
                            <origam-title
                                id="const-title"
                                tag="h1"
                                class="const-hero__title"
                            >
                                {{ constName }}
                            </origam-title>

                            <origam-chip
                                color="secondary"
                                size="small"
                                variant="outlined"
                                class="const-hero__kind-chip"
                            >
                                {{ t('consts.kind.const', 'const') }}
                            </origam-chip>

                            <origam-chip
                                v-if="constCategory"
                                size="small"
                                variant="tonal"
                                class="const-hero__category-chip"
                            >
                                {{ constCategory }}
                            </origam-chip>
                        </div>

                        <p class="const-hero__desc">
                            {{ t(constDescKey, constDescFallback) }}
                        </p>

                        <div class="const-hero__bottom">
                            <nav
                                v-if="displayDoc?.sourceFile"
                                class="const-hero__actions"
                                :aria-label="t('consts.detail.external_links_label', 'External resources')"
                            >
                                <origam-btn
                                    :href="`https://github.com/origam-io/origam/blob/main/${displayDoc.sourceFile}`"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="text"
                                    size="small"
                                    prepend-icon="mdi-github"
                                    data-cy="const-source-link"
                                >
                                    {{ t('consts.detail.hero.source_label', 'Source') }}
                                </origam-btn>
                            </nav>
                        </div>
                    </div>
                </origam-container>
            </div>

            <origam-container>
                <div class="const-detail__layout">
                    <aside
                        v-if="tocSections.length > 0"
                        class="const-toc"
                        :aria-label="t('consts.detail.toc_label', 'Table of contents')"
                        data-cy="const-toc"
                    >
                        <p class="const-toc__heading">
                            {{ t('consts.detail.toc_heading', 'On this page') }}
                        </p>

                        <origam-grid
                            tag="ul"
                            columns="1"
                            gap="0.25rem"
                            class="const-toc__list"
                        >
                            <origam-grid-item
                                v-for="section in tocSections"
                                :key="section.id"
                                tag="li"
                                class="const-toc__item"
                                :class="{ 'const-toc__item--active': activeSection === section.id }"
                            >
                                <a
                                    class="const-toc__link"
                                    :href="`#${section.id}`"
                                    :aria-current="activeSection === section.id ? 'true' : undefined"
                                    @click.prevent="scrollToSection(section.id)"
                                >
                                    {{ section.label }}
                                </a>
                            </origam-grid-item>
                        </origam-grid>
                    </aside>

                    <div class="const-detail__body">
                        <section
                            id="section-definition"
                            class="const-section const-definition"
                            aria-labelledby="const-definition-title"
                            data-cy="const-definition"
                        >
                            <header class="const-section__header">
                                <p class="const-section__eyebrow">
                                    {{ t('consts.detail.definition.eyebrow', 'TypeScript') }}
                                </p>
                                <origam-title
                                    id="const-definition-title"
                                    tag="h2"
                                    class="const-section__title"
                                >
                                    {{ t('consts.detail.definition.title', 'Definition') }}
                                </origam-title>
                                <p class="const-section__desc">
                                    {{ t('consts.detail.definition.desc', 'The TypeScript definition as found in the origam source. Click the copy icon to copy the snippet.') }}
                                </p>
                            </header>

                            <div
                                v-if="displayDoc?.definition"
                                class="const-definition__code-wrap"
                                data-cy="const-definition-code"
                            >
                                <origam-code
                                    :code="displayDoc.definition"
                                    lang="typescript"
                                    copyable
                                    :line-numbers="true"
                                    class="const-definition__code"
                                />
                            </div>

                            <div
                                v-if="hasValue"
                                class="const-definition__scalar"
                                data-cy="const-scalar-value"
                            >
                                <p class="const-definition__scalar-label">
                                    {{ t('consts.detail.definition.value_label', 'Resolved value') }}
                                </p>
                                <origam-code
                                    :code="displayDoc?.value ?? ''"
                                    lang="typescript"
                                    compact
                                    copyable
                                    class="const-definition__scalar-code"
                                />
                            </div>
                        </section>

                        <section
                            v-if="hasValues"
                            id="section-values"
                            class="const-section const-values"
                            aria-labelledby="const-values-title"
                            data-cy="const-values"
                        >
                            <header class="const-section__header">
                                <p class="const-section__eyebrow">
                                    {{ t('consts.detail.values.eyebrow', 'Entries') }}
                                </p>
                                <origam-title
                                    id="const-values-title"
                                    tag="h2"
                                    class="const-section__title"
                                >
                                    {{ t('consts.detail.values.title', 'Values') }}
                                </origam-title>
                                <p class="const-section__desc">
                                    {{ t('consts.detail.values.desc', 'All entries in this constant. Click a value to copy it to clipboard.') }}
                                </p>
                            </header>

                            <dl
                                class="const-values__list"
                                data-cy="const-values-list"
                            >
                                <div
                                    v-for="(val, index) in displayDoc?.values"
                                    :key="val.value"
                                    class="const-values__item"
                                    :data-cy="`const-value-${val.value.replace(/[^a-z0-9]/gi, '-')}`"
                                >
                                    <dt class="const-values__dt">
                                        <origam-btn
                                            variant="text"
                                            size="x-small"
                                            class="const-values__copy-btn"
                                            :aria-label="`${t('consts.detail.values.copy_label', 'Copy value')} ${val.value}`"
                                            @click="copyConstValue(val.value, index)"
                                        >
                                            <span class="const-values__value-mono">{{ val.value }}</span>
                                            <origam-icon
                                                :icon="copiedValueIndex === index ? 'mdi-check' : 'mdi-content-copy'"
                                                size="11"
                                                class="const-values__copy-icon"
                                                aria-hidden="true"
                                            />
                                        </origam-btn>
                                    </dt>
                                    <dd class="const-values__dd">
                                        {{ t(val.descriptionKey, val.descriptionFallback) }}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <section
                            v-if="hasUsedBy"
                            id="section-used-by"
                            class="const-section const-used-by"
                            aria-labelledby="const-used-by-title"
                            data-cy="const-used-by"
                        >
                            <header class="const-section__header">
                                <p class="const-section__eyebrow">
                                    {{ t('consts.detail.used_by.eyebrow', 'Ecosystem') }}
                                </p>
                                <origam-title
                                    id="const-used-by-title"
                                    tag="h2"
                                    class="const-section__title"
                                >
                                    {{ t('consts.detail.used_by.title', 'Used by') }}
                                </origam-title>
                                <p class="const-section__desc">
                                    {{ t('consts.detail.used_by.desc', 'Composables and components that consume this constant.') }}
                                </p>
                            </header>

                            <origam-grid
                                tag="ul"
                                columns="repeat(auto-fill, minmax(200px, 1fr))"
                                gap="1rem"
                                class="const-used-by__grid"
                                data-cy="const-used-by-grid"
                            >
                                <origam-grid-item
                                    v-for="ref in usedByEntries"
                                    :key="ref.name"
                                    tag="li"
                                    class="const-used-by__item"
                                >
                                    <component
                                        :is="ref.tag"
                                        :to="ref.to"
                                        class="const-used-by__link"
                                        :aria-label="ref.name"
                                        :data-cy="`const-used-by-card-${ref.name}`"
                                    >
                                        <origam-card class="const-used-by__card">
                                            <template #default>
                                                <div class="const-used-by__card-inner">
                                                    <origam-title
                                                        tag="h3"
                                                        class="const-used-by__card-name"
                                                    >
                                                        {{ ref.name }}
                                                    </origam-title>

                                                    <origam-icon
                                                        v-if="ref.linkable"
                                                        icon="mdi-arrow-right"
                                                        size="16"
                                                        class="const-used-by__card-arrow"
                                                        aria-hidden="true"
                                                    />
                                                </div>
                                            </template>
                                        </origam-card>
                                    </component>
                                </origam-grid-item>
                            </origam-grid>
                        </section>

                        <section
                            v-if="hasExamples"
                            id="section-examples"
                            class="const-section const-examples"
                            aria-labelledby="const-examples-title"
                            data-cy="const-examples"
                        >
                            <header class="const-section__header">
                                <p class="const-section__eyebrow">
                                    {{ t('consts.detail.examples.eyebrow', 'Usage') }}
                                </p>
                                <origam-title
                                    id="const-examples-title"
                                    tag="h2"
                                    class="const-section__title"
                                >
                                    {{ t('consts.detail.examples.title', 'Examples') }}
                                </origam-title>
                                <p class="const-section__desc">
                                    {{ t('consts.detail.examples.desc', 'Ready-to-paste code snippets using this constant.') }}
                                </p>
                            </header>

                            <div class="const-examples__list">
                                <div
                                    v-for="example in displayDoc?.examples"
                                    :key="example.titleFallback"
                                    class="const-examples__item"
                                    :data-cy="`const-example-${example.titleFallback.toLowerCase().replace(/[^a-z0-9]/g, '-')}`"
                                >
                                    <origam-title
                                        tag="h3"
                                        class="const-examples__item-title"
                                    >
                                        {{ t(example.titleKey, example.titleFallback) }}
                                    </origam-title>

                                    <origam-code
                                        :code="example.code"
                                        :lang="example.lang"
                                        copyable
                                        :line-numbers="true"
                                        class="const-examples__code"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </origam-container>
        </template>
    </article>
</template>

<style scoped lang="scss">
.const-detail {
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

.const-detail-not-found {
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

.const-hero {
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
        font-size: clamp(2rem, 5vw, 2.5rem);
        font-weight: 800;
        letter-spacing: -0.045em;
        line-height: 1;
        color: var(--origam-color__text---ink, #0a0a0a);
        display: block;
        font-family: var(--origam-font__family---mono, monospace);
    }

    &__kind-chip {
        font-family: var(--origam-font__family---mono, monospace);
        font-size: 0.625rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }

    &__category-chip {
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
}

.const-toc {
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
        font-size: var(--origam-font-size---xs, 0.75rem);
        font-weight: 700;
        letter-spacing: 0.09em;
        text-transform: uppercase;
        color: var(--origam-color__text---tertiary, #737373);

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
        font-size: var(--origam-font-size---sm, 0.875rem);
        font-weight: 400;
        color: var(--origam-color__text---secondary, #525252);
        padding: var(--origam-space---1, 0.25rem) var(--origam-space---3, 0.75rem);
        border-radius: var(--origam-radius---md, 8px);
        border-inline-start: 2px solid transparent;
        text-decoration: none;
        transition: color 100ms, border-color 100ms, background 100ms;

        &:hover {
            color: var(--origam-color__text---primary, #0a0a0a);
            background: var(--origam-color__action--primary---bgSubtle, rgba(124, 58, 237, 0.08));
        }

        @media (max-width: 1024px) {
            border-inline-start: none;
            border-block-end: 2px solid transparent;
            padding: var(--origam-space---1, 0.25rem) var(--origam-space---2, 0.5rem);
        }
    }

    &__item--active &__link {
        color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
        border-inline-start-color: var(--origam-color__action--primary---bg, #7c3aed);
        font-weight: 600;

        @media (max-width: 1024px) {
            border-inline-start-color: transparent;
            border-block-end-color: var(--origam-color__action--primary---bg, #7c3aed);
        }
    }
}

.const-section {
    &__header {
        padding-block-end: var(--origam-space---4, 1rem);
        border-block-end: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
        margin-block-end: var(--origam-space---6, 1.5rem);
    }

    &__eyebrow {
        margin: 0 0 var(--origam-space---1, 0.25rem);
        font-size: var(--origam-font-size---xs, 0.75rem);
        font-weight: 700;
        letter-spacing: 0.09em;
        text-transform: uppercase;
        color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
    }

    &__title {
        display: block;
        font-size: var(--origam-font-size---xl, 1.25rem);
        font-weight: 700;
        color: var(--origam-color__text---ink, #0a0a0a);
        letter-spacing: -0.02em;
        margin: 0 0 var(--origam-space---2, 0.5rem);
    }

    &__desc {
        margin: var(--origam-space---3, 0.75rem) 0 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        color: var(--origam-color__text---secondary, #525252);
        line-height: 1.6;
        max-inline-size: 60ch;
    }
}

.const-definition {
    &__code-wrap {
        overflow-x: auto;
    }

    &__scalar {
        margin-block-start: var(--origam-space---4, 1rem);
        display: flex;
        align-items: center;
        gap: var(--origam-space---3, 0.75rem);
        flex-wrap: wrap;
    }

    &__scalar-label {
        margin: 0;
        font-size: var(--origam-font-size---xs, 0.75rem);
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--origam-color__text---tertiary, #737373);
    }

    &__scalar-code {
        display: inline-flex;
    }
}

.const-values {
    &__list {
        display: flex;
        flex-direction: column;
        gap: 0;
    }

    &__item {
        display: grid;
        grid-template-columns: minmax(0, 280px) 1fr;
        gap: var(--origam-space---4, 1rem);
        padding-block: var(--origam-space---3, 0.75rem);
        border-block-end: 1px solid var(--origam-color__border---subtle, rgba(0, 0, 0, 0.04));
        align-items: start;

        &:first-child {
            border-block-start: 1px solid var(--origam-color__border---subtle, rgba(0, 0, 0, 0.04));
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
        --origam-btn---font-size: var(--origam-font-size---sm, 0.875rem);
    }

    &__value-mono {
        font-family: var(--origam-font__family---mono, monospace);
        font-size: var(--origam-font-size---sm, 0.875rem);
        font-weight: 600;
        color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
    }

    &__copy-icon {
        opacity: 0.5;
        flex-shrink: 0;
    }

    &__dd {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        line-height: 1.6;
        color: var(--origam-color__text---secondary, #525252);
        padding-block-start: var(--origam-space---1, 0.25rem);
    }
}

.const-used-by {
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

        &:hover .const-used-by__card {
            transform: translateY(-2px);
            box-shadow: var(--origam-shadow---md, 0 4px 12px rgba(0, 0, 0, 0.1));
        }

        &:focus-visible {
            outline: 2px solid var(--origam-color__action--primary---bg, #7c3aed);
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
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
    }

    &__card-name {
        display: block;
        flex: 1;
        font-size: var(--origam-font__size---lg, 1rem);
        font-weight: 600;
        font-family: var(--origam-font__family---mono, monospace);
        color: var(--origam-color__text---primary, #0a0a0a);
        margin: 0;
    }

    &__card-arrow {
        flex-shrink: 0;
        color: var(--origam-color__text---tertiary, #737373);
    }
}

.const-examples {
    &__list {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---8, 2rem);
    }

    &__item-title {
        display: block;
        font-size: var(--origam-font__size---lg, 1rem);
        font-weight: 600;
        color: var(--origam-color__text---primary, #0a0a0a);
        margin: 0 0 var(--origam-space---3, 0.75rem);
    }
}
</style>
