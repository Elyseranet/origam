<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useT } from '~/composables/useT'
import { useCopy } from '~/composables/useCopy'
import { useReferenceDoc } from '~/composables/useApiReference'
import type { ITypeDoc } from '~/interfaces/types-catalog.interface'

const { t } = useT()
const route = useRoute()
const { copy: copyValue } = useCopy()

const slug = computed(() => route.params.slug as string)

const { data: displayDoc } = await useReferenceDoc<ITypeDoc>('type', slug)

const catalogEntry = computed(() => displayDoc.value)

const hasValues   = computed(() => (displayDoc.value?.values?.length ?? 0) > 0)
const hasExamples = computed(() => (displayDoc.value?.examples?.length ?? 0) > 0)
const hasUsedBy   = computed(() => (displayDoc.value?.usedBy?.length ?? 0) > 0)

const typeName         = computed(() => displayDoc.value?.name ?? catalogEntry.value?.name ?? slug.value)
const typeKind         = computed(() => displayDoc.value?.kind ?? catalogEntry.value?.kind ?? 'type')
const typeCategory     = computed(() => displayDoc.value?.category ?? catalogEntry.value?.category ?? '')
const typeDescKey      = computed(() => displayDoc.value?.descriptionKey ?? catalogEntry.value?.descriptionKey ?? '')
const typeDescFallback = computed(() => displayDoc.value?.descriptionFallback ?? catalogEntry.value?.descriptionFallback ?? '')

const copiedValueIndex = ref<number | null>(null)
let copiedTimer: ReturnType<typeof setTimeout> | null = null

const copyEnumValue = async (value: string, index: number) => {
    await copyValue(value)
    copiedValueIndex.value = index
    if (copiedTimer) clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => { copiedValueIndex.value = null }, 2000)
}

const tocSections = computed(() => {
    const sections: { id: string; label: string }[] = []
    sections.push({ id: 'section-definition', label: t('types.detail.definition.title', 'Definition') })
    if (hasValues.value)   sections.push({ id: 'section-values',   label: typeKind.value === 'enum' ? t('types.detail.values.title_enum', 'Members') : t('types.detail.values.title', 'Values') })
    if (hasUsedBy.value)   sections.push({ id: 'section-used-by',  label: t('types.detail.used_by.title', 'Used by') })
    if (hasExamples.value) sections.push({ id: 'section-examples', label: t('types.detail.examples.title', 'Examples') })
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
    title: () => t('types.detail.meta.title', `${typeName.value} · origam API types`, { name: typeName.value }),
    description: () => t(typeDescKey.value, typeDescFallback.value),
    ogTitle: () => t('types.detail.meta.title', `${typeName.value} · origam API types`, { name: typeName.value }),
    ogDescription: () => t(typeDescKey.value, typeDescFallback.value),
})
</script>

<template>
    <article
        class="type-detail"
        :data-cy="`page-type-${slug}`"
    >
        <div
            v-if="!displayDoc"
            class="type-detail-not-found"
            data-cy="type-not-found"
        >
            <origam-container class="type-detail-not-found__inner">
                <origam-avatar
                    icon="mdi-help-circle-outline"
                    color="warning"
                    size="64"
                    aria-hidden="true"
                />

                <origam-title
                    tag="h1"
                    class="type-detail-not-found__title"
                >
                    {{ t('types.detail.not_found.title', 'Type not found') }}
                </origam-title>

                <p class="type-detail-not-found__desc">
                    {{ t('types.detail.not_found.desc', 'No type matches the slug') }}
                    <origam-code
                        :code="slug"
                        lang="plaintext"
                        compact
                        class="type-detail-not-found__slug-code"
                    />
                </p>

                <origam-btn
                    href="/types"
                    prepend-icon="mdi-arrow-left"
                    variant="tonal"
                    color="primary"
                    data-cy="type-not-found-back"
                >
                    {{ t('types.detail.not_found.back', 'Back to catalogue') }}
                </origam-btn>
            </origam-container>
        </div>

        <template v-else>
            <div
                class="type-hero"
                aria-labelledby="type-title"
            >
                <origam-container class="type-hero__container">
                    <nav
                        class="type-hero__breadcrumb"
                        :aria-label="t('types.detail.breadcrumb_label', 'Page location')"
                    >
                        <nuxt-link
                            to="/types"
                            class="type-hero__breadcrumb-link"
                            data-cy="type-breadcrumb-catalog"
                        >
                            {{ t('types.detail.breadcrumb_catalog', 'Types') }}
                        </nuxt-link>

                        <span
                            class="type-hero__breadcrumb-sep"
                            aria-hidden="true"
                        >›</span>

                        <span
                            class="type-hero__breadcrumb-current"
                            aria-current="page"
                        >
                            {{ typeName }}
                        </span>
                    </nav>

                    <div class="type-hero__identity">
                        <div class="type-hero__title-row">
                            <origam-title
                                id="type-title"
                                tag="h1"
                                class="type-hero__title"
                            >
                                {{ typeName }}
                            </origam-title>

                            <origam-chip
                                :color="typeKind === 'enum' ? 'secondary' : 'primary'"
                                size="small"
                                variant="outlined"
                                class="type-hero__kind-chip"
                            >
                                {{ typeKind === 'enum' ? t('types.kind.enum', 'enum') : t('types.kind.type', 'type') }}
                            </origam-chip>

                            <origam-chip
                                v-if="typeCategory"
                                size="small"
                                variant="tonal"
                                class="type-hero__category-chip"
                            >
                                {{ typeCategory }}
                            </origam-chip>
                        </div>

                        <p class="type-hero__desc">
                            {{ t(typeDescKey, typeDescFallback) }}
                        </p>

                        <div class="type-hero__bottom">
                            <nav
                                v-if="displayDoc?.sourceFile"
                                class="type-hero__actions"
                                :aria-label="t('types.detail.external_links_label', 'External resources')"
                            >
                                <origam-btn
                                    :href="`https://github.com/origam-io/origam/blob/main/${displayDoc.sourceFile}`"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="text"
                                    size="small"
                                    prepend-icon="mdi-github"
                                    data-cy="type-source-link"
                                >
                                    {{ t('types.detail.hero.source_label', 'Source') }}
                                </origam-btn>
                            </nav>
                        </div>
                    </div>
                </origam-container>
            </div>

            <origam-container>
                <div class="type-detail__layout">
                    <aside
                        v-if="tocSections.length > 0"
                        class="type-toc"
                        :aria-label="t('types.detail.toc_label', 'Table of contents')"
                        data-cy="type-toc"
                    >
                        <p class="type-toc__heading">
                            {{ t('types.detail.toc_heading', 'On this page') }}
                        </p>

                        <origam-grid
                            tag="ul"
                            columns="1"
                            gap="0.25rem"
                            class="type-toc__list"
                        >
                            <origam-grid-item
                                v-for="section in tocSections"
                                :key="section.id"
                                tag="li"
                                class="type-toc__item"
                                :class="{ 'type-toc__item--active': activeSection === section.id }"
                            >
                                <a
                                    class="type-toc__link"
                                    :href="`#${section.id}`"
                                    :aria-current="activeSection === section.id ? 'true' : undefined"
                                    @click.prevent="scrollToSection(section.id)"
                                >
                                    {{ section.label }}
                                </a>
                            </origam-grid-item>
                        </origam-grid>
                    </aside>

                    <div class="type-detail__body">
                        <section
                            id="section-definition"
                            class="type-section type-definition"
                            aria-labelledby="type-definition-title"
                            data-cy="type-definition"
                        >
                            <header class="type-section__header">
                                <p class="type-section__eyebrow">
                                    {{ t('types.detail.definition.eyebrow', 'TypeScript') }}
                                </p>
                                <origam-title
                                    id="type-definition-title"
                                    tag="h2"
                                    class="type-section__title"
                                >
                                    {{ t('types.detail.definition.title', 'Definition') }}
                                </origam-title>
                                <p class="type-section__desc">
                                    {{ t('types.detail.definition.desc', 'The TypeScript definition as found in the origam source. Click the copy icon to copy the snippet.') }}
                                </p>
                            </header>

                            <div
                                v-if="displayDoc?.definition"
                                class="type-definition__code-wrap"
                                data-cy="type-definition-code"
                            >
                                <origam-code
                                    :code="displayDoc.definition"
                                    lang="typescript"
                                    copyable
                                    :line-numbers="true"
                                    class="type-definition__code"
                                />
                            </div>

                            <div
                                v-else
                                class="type-definition__no-doc"
                            >
                                <origam-card class="type-no-doc__card">
                                    <template #default>
                                        <div class="type-no-doc__inner">
                                            <origam-icon
                                                icon="mdi-book-open-page-variant-outline"
                                                color="primary"
                                                class="type-no-doc__icon"
                                                aria-hidden="true"
                                            />
                                            <origam-title
                                                tag="h3"
                                                class="type-no-doc__title"
                                            >
                                                {{ t('types.detail.no_doc.title', 'Documentation coming soon') }}
                                            </origam-title>
                                            <p class="type-no-doc__desc">
                                                {{ t('types.detail.no_doc.desc', 'The detailed API reference for this type is being written.') }}
                                            </p>
                                        </div>
                                    </template>
                                </origam-card>
                            </div>
                        </section>

                        <section
                            v-if="hasValues"
                            id="section-values"
                            class="type-section type-values"
                            aria-labelledby="type-values-title"
                            data-cy="type-values"
                        >
                            <header class="type-section__header">
                                <p class="type-section__eyebrow">
                                    {{ typeKind === 'enum' ? t('types.detail.values.eyebrow_enum', 'Members') : t('types.detail.values.eyebrow', 'Accepted') }}
                                </p>
                                <origam-title
                                    id="type-values-title"
                                    tag="h2"
                                    class="type-section__title"
                                >
                                    {{ typeKind === 'enum' ? t('types.detail.values.title_enum', 'Members') : t('types.detail.values.title', 'Values') }}
                                </origam-title>
                                <p class="type-section__desc">
                                    {{ typeKind === 'enum'
                                        ? t('types.detail.values.desc_enum', 'All members of this enum. Click a value to copy it to clipboard.')
                                        : t('types.detail.values.desc', 'Accepted string literal values for this type. Click a value to copy it.') }}
                                </p>
                            </header>

                            <dl
                                class="type-values__list"
                                data-cy="type-values-list"
                            >
                                <div
                                    v-for="(val, index) in displayDoc?.values"
                                    :key="val.value"
                                    class="type-values__item"
                                    :data-cy="`type-value-${val.value.replace(/[^a-z0-9]/gi, '-')}`"
                                >
                                    <dt class="type-values__dt">
                                        <origam-btn
                                            variant="text"
                                            size="x-small"
                                            class="type-values__copy-btn"
                                            :aria-label="`${t('types.detail.values.copy_label', 'Copy value')} ${val.value}`"
                                            @click="copyEnumValue(val.value, index)"
                                        >
                                            <span class="type-values__value-mono">{{ val.value }}</span>
                                            <origam-icon
                                                :icon="copiedValueIndex === index ? 'mdi-check' : 'mdi-content-copy'"
                                                size="11"
                                                class="type-values__copy-icon"
                                                aria-hidden="true"
                                            />
                                        </origam-btn>
                                    </dt>
                                    <dd class="type-values__dd">
                                        {{ t(val.descriptionKey, val.descriptionFallback) }}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <section
                            v-if="hasUsedBy"
                            id="section-used-by"
                            class="type-section type-used-by"
                            aria-labelledby="type-used-by-title"
                            data-cy="type-used-by"
                        >
                            <header class="type-section__header">
                                <p class="type-section__eyebrow">
                                    {{ t('types.detail.used_by.eyebrow', 'Ecosystem') }}
                                </p>
                                <origam-title
                                    id="type-used-by-title"
                                    tag="h2"
                                    class="type-section__title"
                                >
                                    {{ t('types.detail.used_by.title', 'Used by') }}
                                </origam-title>
                                <p class="type-section__desc">
                                    {{ t('types.detail.used_by.desc', 'Components and props that accept this type as a value.') }}
                                </p>
                            </header>

                            <origam-grid
                                tag="ul"
                                columns="repeat(auto-fill, minmax(200px, 1fr))"
                                gap="1rem"
                                class="type-used-by__grid"
                                data-cy="type-used-by-grid"
                            >
                                <origam-grid-item
                                    v-for="ref in displayDoc?.usedBy"
                                    :key="`${ref.slug}-${ref.propName}`"
                                    tag="li"
                                    class="type-used-by__item"
                                >
                                    <nuxt-link
                                        :to="`/components/${ref.slug}`"
                                        class="type-used-by__link"
                                        :aria-label="`${ref.name} — prop: ${ref.propName}`"
                                        :data-cy="`type-used-by-card-${ref.slug}`"
                                    >
                                        <origam-card class="type-used-by__card">
                                            <template #default>
                                                <div class="type-used-by__card-inner">
                                                    <div class="type-used-by__card-head">
                                                        <origam-title
                                                            tag="h3"
                                                            class="type-used-by__card-name"
                                                        >
                                                            {{ ref.name }}
                                                        </origam-title>

                                                        <origam-icon
                                                            icon="mdi-arrow-right"
                                                            size="16"
                                                            class="type-used-by__card-arrow"
                                                            aria-hidden="true"
                                                        />
                                                    </div>

                                                    <p class="type-used-by__card-prop">
                                                        <origam-code
                                                            :code="`prop: ${ref.propName}`"
                                                            lang="plaintext"
                                                            compact
                                                            :copyable="false"
                                                            class="type-used-by__card-prop-code"
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
                            class="type-section type-examples"
                            aria-labelledby="type-examples-title"
                            data-cy="type-examples"
                        >
                            <header class="type-section__header">
                                <p class="type-section__eyebrow">
                                    {{ t('types.detail.examples.eyebrow', 'Usage') }}
                                </p>
                                <origam-title
                                    id="type-examples-title"
                                    tag="h2"
                                    class="type-section__title"
                                >
                                    {{ t('types.detail.examples.title', 'Examples') }}
                                </origam-title>
                                <p class="type-section__desc">
                                    {{ t('types.detail.examples.desc', 'Ready-to-paste code snippets using this type.') }}
                                </p>
                            </header>

                            <div class="type-examples__list">
                                <div
                                    v-for="example in displayDoc?.examples"
                                    :key="example.titleFallback"
                                    class="type-examples__item"
                                    :data-cy="`type-example-${example.titleFallback.toLowerCase().replace(/[^a-z0-9]/g, '-')}`"
                                >
                                    <origam-title
                                        tag="h3"
                                        class="type-examples__item-title"
                                    >
                                        {{ t(example.titleKey, example.titleFallback) }}
                                    </origam-title>

                                    <origam-code
                                        :code="example.code"
                                        :lang="example.lang"
                                        copyable
                                        :line-numbers="true"
                                        class="type-examples__code"
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
.type-detail {
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

.type-detail-not-found {
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

.type-hero {
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

.type-toc {
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

.type-section {
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

.type-definition {
    &__code-wrap {
        overflow-x: auto;
    }
}

.type-no-doc {
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
        color: var(--origam-color__text---primary, #0a0a0a);
        margin: 0;
    }

    &__desc {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        color: var(--origam-color__text---secondary, #525252);
    }
}

.type-values {
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

.type-used-by {
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

        &:hover .type-used-by__card {
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
        color: var(--origam-color__text---primary, #0a0a0a);
        margin: 0;
    }

    &__card-arrow {
        flex-shrink: 0;
        color: var(--origam-color__text---tertiary, #737373);
    }

    &__card-prop {
        margin: 0;
    }

    &__card-prop-code {
        display: inline-flex;
    }
}

.type-examples {
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
