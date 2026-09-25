<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useT } from '~/composables/useT'
import { useCopy } from '~/composables/useCopy'
import { useReferenceDoc } from '~/composables/useApiReference'
import type { IDirectiveDoc } from '~/interfaces/directive-doc.interface'

const { t } = useT()
const route = useRoute()
const { copy: copySignature, copied: signatureCopied } = useCopy()

const slug = computed(() => route.params.slug as string)

const { data: displayDoc } = await useReferenceDoc<IDirectiveDoc>('directive', slug)

const catalogEntry = computed(() => displayDoc.value)

const hasArgs      = computed(() => (displayDoc.value?.args?.length ?? 0) > 0)
const hasModifiers = computed(() => (displayDoc.value?.modifiers?.length ?? 0) > 0)
const hasExamples  = computed(() => (displayDoc.value?.examples?.length ?? 0) > 0)
const hasRelated   = computed(() => (displayDoc.value?.related?.length ?? 0) > 0)
const hasNote      = computed(() => !!displayDoc.value?.noteKey || !!displayDoc.value?.noteFallback)

const directiveName         = computed(() => displayDoc.value?.name ?? catalogEntry.value?.name ?? slug.value)
const directiveDescKey      = computed(() => displayDoc.value?.descriptionKey ?? catalogEntry.value?.descriptionKey ?? '')
const directiveDescFallback = computed(() => displayDoc.value?.descriptionFallback ?? catalogEntry.value?.descriptionFallback ?? '')

/* ── ToC ──────────────────────────────────────────────────────────── */
const tocSections = computed(() => {
    const sections: { id: string; label: string }[] = []
    if (displayDoc.value?.signatureCode) sections.push({ id: 'section-signature', label: t('directives.detail.signature.title', 'Signature') })
    if (hasArgs.value)      sections.push({ id: 'section-args',      label: t('directives.detail.args.title', 'Value / Arguments') })
    if (hasModifiers.value) sections.push({ id: 'section-modifiers', label: t('directives.detail.modifiers.title', 'Modifiers') })
    if (hasExamples.value)  sections.push({ id: 'section-examples',  label: t('directives.detail.examples.title', 'Examples') })
    if (hasRelated.value)   sections.push({ id: 'section-related',   label: t('directives.detail.related.title', 'Related elements') })
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

onMounted(() => {
    initIntersectionObserver()
})

onUnmounted(() => {
    intersectionObserver?.disconnect()
})

/* ── SEO ──────────────────────────────────────────────────────────── */
useSeoMeta({
    title: () => t('directives.detail.meta.title', `${directiveName.value} · origam directives`, { name: directiveName.value }),
    description: () => t(directiveDescKey.value, directiveDescFallback.value),
    ogTitle: () => t('directives.detail.meta.title', `${directiveName.value} · origam directives`, { name: directiveName.value }),
    ogDescription: () => t(directiveDescKey.value, directiveDescFallback.value)
})
</script>

<template>
    <article
        class="directive-detail"
        :data-cy="`page-directive-${slug}`"
    >
        <div
            v-if="!catalogEntry"
            class="directive-detail-not-found"
            data-cy="directive-not-found"
        >
            <origam-container class="directive-detail-not-found__inner">
                <origam-avatar
                    icon="mdi-help-circle-outline"
                    color="warning"
                    rounded="lg"
                    size="64"
                    aria-hidden="true"
                />

                <origam-title
                    tag="h1"
                    class="directive-detail-not-found__title"
                >
                    {{ t('directives.detail.not_found.title', 'Directive not found') }}
                </origam-title>

                <p class="directive-detail-not-found__desc">
                    {{ t('directives.detail.not_found.desc', 'No directive matches the slug') }}
                    <origam-code
                        :code="slug"
                        lang="plaintext"
                        compact
                        class="directive-detail-not-found__slug-code"
                    />
                </p>

                <origam-btn
                    href="/directives"
                    prepend-icon="mdi-arrow-left"
                    variant="tonal"
                    color="primary"
                    data-cy="directive-not-found-back"
                >
                    {{ t('directives.detail.not_found.back', 'Back to directives') }}
                </origam-btn>
            </origam-container>
        </div>

        <template v-else>
            <div
                class="directive-hero"
                aria-labelledby="directive-title"
            >
                <origam-container class="directive-hero__container">
                    <nav
                        class="directive-hero__breadcrumb"
                        :aria-label="t('directives.detail.breadcrumb_label', 'Page location')"
                    >
                        <nuxt-link
                            to="/directives"
                            class="directive-hero__breadcrumb-link"
                            data-cy="directive-breadcrumb-catalog"
                        >
                            {{ t('directives.detail.breadcrumb_catalog', 'Directives') }}
                        </nuxt-link>

                        <span
                            class="directive-hero__breadcrumb-sep"
                            aria-hidden="true"
                        >›</span>

                        <span
                            class="directive-hero__breadcrumb-current"
                            aria-current="page"
                        >
                            {{ directiveName }}
                        </span>
                    </nav>

                    <div class="directive-hero__identity">
                        <div class="directive-hero__title-row">
                            <origam-title
                                id="directive-title"
                                tag="h1"
                                class="directive-hero__title"
                            >
                                {{ directiveName }}
                            </origam-title>

                            <origam-chip
                                color="secondary"
                                size="small"
                                variant="outlined"
                                class="directive-hero__category-chip"
                            >
                                {{ t('directives.detail.category', 'Directive') }}
                            </origam-chip>
                        </div>

                        <p class="directive-hero__desc">
                            {{ t(directiveDescKey, directiveDescFallback) }}
                        </p>

                        <div class="directive-hero__bottom">
                            <nav
                                v-if="displayDoc?.storyUrl"
                                class="directive-hero__actions"
                                :aria-label="t('directives.detail.external_links_label', 'External resources')"
                            >
                                <origam-btn
                                    :href="displayDoc.storyUrl"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="outlined"
                                    size="small"
                                    prepend-icon="mdi-play-circle-outline"
                                    data-cy="directive-story-link"
                                >
                                    {{ t('directives.detail.hero.story_label', 'Story') }}
                                </origam-btn>

                                <origam-btn
                                    :href="`https://github.com/origam-io/origam/blob/main/packages/ds/src/directives/${directiveName}/origam-${slug}.directive.ts`"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="text"
                                    size="small"
                                    prepend-icon="mdi-github"
                                    data-cy="directive-source-link"
                                >
                                    {{ t('directives.detail.hero.source_label', 'Source') }}
                                </origam-btn>
                            </nav>

                            <origam-btn
                                v-if="displayDoc?.signatureSummary"
                                class="directive-hero__signature-btn"
                                variant="text"
                                size="small"
                                :aria-label="t('directives.detail.hero.signature_copy_label', 'Copy directive signature')"
                                :data-cy="`directive-signature-btn-${slug}`"
                                @click="copySignature(displayDoc.signatureSummary)"
                            >
                                <span class="directive-hero__signature-text">{{ displayDoc.signatureSummary }}</span>
                                <origam-icon
                                    :icon="signatureCopied ? 'mdi-check' : 'mdi-content-copy'"
                                    size="14"
                                    aria-hidden="true"
                                />
                            </origam-btn>
                        </div>
                    </div>
                </origam-container>
            </div>

            <origam-container>
                <div class="directive-detail__layout">
                    <aside
                        v-if="tocSections.length > 0"
                        class="directive-toc"
                        :aria-label="t('directives.detail.toc_label', 'Table of contents')"
                        data-cy="directive-toc"
                    >
                        <p class="directive-toc__heading">
                            {{ t('directives.detail.toc_heading', 'On this page') }}
                        </p>

                        <origam-grid
                            tag="ul"
                            columns="1"
                            gap="0.25rem"
                            class="directive-toc__list"
                        >
                            <origam-grid-item
                                v-for="section in tocSections"
                                :key="section.id"
                                tag="li"
                                class="directive-toc__item"
                                :class="{ 'directive-toc__item--active': activeSection === section.id }"
                            >
                                <a
                                    class="directive-toc__link"
                                    :href="`#${section.id}`"
                                    :aria-current="activeSection === section.id ? 'true' : undefined"
                                    @click.prevent="scrollToSection(section.id)"
                                >
                                    {{ section.label }}
                                </a>
                            </origam-grid-item>
                        </origam-grid>
                    </aside>

                    <div class="directive-detail__body">
                        <section
                            v-if="displayDoc?.signatureCode"
                            id="section-signature"
                            class="directive-section directive-signature"
                            aria-labelledby="directive-signature-title"
                            data-cy="directive-signature-section"
                        >
                            <header class="directive-section__header">
                                <p class="directive-section__eyebrow">
                                    {{ t('directives.detail.signature.eyebrow', 'API') }}
                                </p>
                                <origam-title
                                    id="directive-signature-title"
                                    tag="h2"
                                    class="directive-section__title"
                                >
                                    {{ t('directives.detail.signature.title', 'Signature') }}
                                </origam-title>
                                <p class="directive-section__desc">
                                    {{ t('directives.detail.signature.desc', 'All accepted forms of the directive binding.') }}
                                </p>
                            </header>

                            <origam-code
                                :code="displayDoc.signatureCode"
                                :lang="displayDoc.signatureLang"
                                copyable
                                :line-numbers="true"
                                rounded="lg"
                                class="directive-signature__code"
                                :data-cy="`directive-signature-${slug}`"
                            />
                        </section>

                        <section
                            v-if="hasArgs"
                            id="section-args"
                            class="directive-section directive-args"
                            aria-labelledby="directive-args-title"
                            data-cy="directive-args"
                        >
                            <header class="directive-section__header">
                                <p class="directive-section__eyebrow">
                                    {{ t('directives.detail.args.eyebrow', 'API') }}
                                </p>
                                <origam-title
                                    id="directive-args-title"
                                    tag="h2"
                                    class="directive-section__title"
                                >
                                    {{ t('directives.detail.args.title', 'Value / Arguments') }}
                                </origam-title>
                                <p class="directive-section__desc">
                                    {{ t('directives.detail.args.desc', 'Shape of the binding value and each property in the options object.') }}
                                </p>
                            </header>

                            <dl
                                class="prop-list"
                                :aria-label="t('directives.detail.args.table_caption', `${directiveName} value shape`)"
                                :data-cy="`directive-args-table-${slug}`"
                            >
                                <div
                                    v-for="arg in displayDoc?.args"
                                    :key="arg.name"
                                    class="prop-list__item"
                                    :data-cy="`directive-arg-row-${arg.name.replace(/[^a-z0-9]/gi, '-')}`"
                                >
                                    <dt class="prop-list__dt">
                                        <span class="prop-list__name-mono">{{ arg.name }}</span>

                                        <origam-chip
                                            v-if="arg.required"
                                            size="x-small"
                                            color="danger"
                                            pill
                                            class="prop-list__required-badge"
                                        >
                                            {{ t('directives.detail.args.required', 'required') }}
                                        </origam-chip>

                                        <origam-chip
                                            size="x-small"
                                            variant="outlined"
                                            class="prop-list__type-chip prop-list__type-chip--primitive"
                                        >
                                            {{ arg.type }}
                                        </origam-chip>
                                    </dt>
                                    <dd class="prop-list__dd">
                                        {{ t(arg.descriptionKey, arg.descriptionFallback) }}
                                    </dd>
                                </div>
                            </dl>

                            <p
                                v-if="hasNote"
                                class="directive-note"
                            >
                                {{ t(displayDoc?.noteKey ?? '', displayDoc?.noteFallback ?? '') }}
                            </p>
                        </section>

                        <section
                            v-if="hasModifiers"
                            id="section-modifiers"
                            class="directive-section directive-modifiers"
                            aria-labelledby="directive-modifiers-title"
                            data-cy="directive-modifiers"
                        >
                            <header class="directive-section__header">
                                <p class="directive-section__eyebrow">
                                    {{ t('directives.detail.modifiers.eyebrow', 'API') }}
                                </p>
                                <origam-title
                                    id="directive-modifiers-title"
                                    tag="h2"
                                    class="directive-section__title"
                                >
                                    {{ t('directives.detail.modifiers.title', 'Modifiers') }}
                                </origam-title>
                                <p class="directive-section__desc">
                                    {{ t('directives.detail.modifiers.desc', 'Dot-suffix modifiers that alter the directive behaviour.') }}
                                </p>
                            </header>

                            <dl
                                class="prop-list"
                                :aria-label="t('directives.detail.modifiers.table_caption', `${directiveName} modifiers`)"
                                :data-cy="`directive-modifiers-table-${slug}`"
                            >
                                <div
                                    v-for="modifier in displayDoc?.modifiers"
                                    :key="modifier.name"
                                    class="prop-list__item"
                                >
                                    <dt class="prop-list__dt">
                                        <span class="prop-list__name-mono">.{{ modifier.name }}</span>
                                    </dt>
                                    <dd class="prop-list__dd">
                                        {{ t(modifier.descriptionKey, modifier.descriptionFallback) }}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <section
                            v-if="hasExamples"
                            id="section-examples"
                            class="directive-section directive-examples"
                            aria-labelledby="directive-examples-title"
                            data-cy="directive-examples"
                        >
                            <header class="directive-section__header">
                                <p class="directive-section__eyebrow">
                                    {{ t('directives.detail.examples.eyebrow', 'Usage') }}
                                </p>
                                <origam-title
                                    id="directive-examples-title"
                                    tag="h2"
                                    class="directive-section__title"
                                >
                                    {{ t('directives.detail.examples.title', 'Examples') }}
                                </origam-title>
                                <p class="directive-section__desc">
                                    {{ t('directives.detail.examples.desc', 'Ready-to-paste code snippets for your templates.') }}
                                </p>
                            </header>

                            <div class="directive-examples__list">
                                <div
                                    v-for="example in displayDoc?.examples"
                                    :key="example.titleFallback"
                                    class="directive-examples__item"
                                    :data-cy="`directive-example-${example.titleFallback.toLowerCase().replace(/[^a-z0-9]/g, '-')}`"
                                >
                                    <origam-title
                                        tag="h3"
                                        class="directive-examples__item-title"
                                    >
                                        {{ t(example.titleKey, example.titleFallback) }}
                                    </origam-title>

                                    <origam-code
                                        :code="example.code"
                                        :lang="example.lang"
                                        copyable
                                        :line-numbers="true"
                                        rounded="lg"
                                        class="directive-examples__code"
                                    />
                                </div>
                            </div>
                        </section>

                        <section
                            v-if="hasRelated"
                            id="section-related"
                            class="directive-section directive-related"
                            aria-labelledby="directive-related-title"
                            data-cy="directive-related"
                        >
                            <header class="directive-section__header">
                                <p class="directive-section__eyebrow">
                                    {{ t('directives.detail.related.eyebrow', 'Ecosystem') }}
                                </p>
                                <origam-title
                                    id="directive-related-title"
                                    tag="h2"
                                    class="directive-section__title"
                                >
                                    {{ t('directives.detail.related.title', 'Related elements') }}
                                </origam-title>
                                <p class="directive-section__desc">
                                    {{ t('directives.detail.related.desc', 'DS components that use this directive internally or that commonly pair with it.') }}
                                </p>
                            </header>

                            <origam-grid
                                tag="ul"
                                columns="repeat(auto-fill, minmax(200px, 1fr))"
                                gap="1rem"
                                class="directive-related__grid"
                                data-cy="directive-related-grid"
                            >
                                <origam-grid-item
                                    v-for="item in displayDoc?.related"
                                    :key="item.slug"
                                    tag="li"
                                    class="directive-related__item"
                                >
                                    <nuxt-link
                                        :to="item.kind === 'directive' ? `/directives/${item.slug}` : `/components/${item.slug}`"
                                        class="directive-related__link"
                                        :aria-label="`${item.name} — ${t(item.descriptionKey, item.descriptionFallback)}`"
                                        :data-cy="`directive-related-card-${item.slug}`"
                                    >
                                        <origam-card
                                            rounded="lg"
                                            class="directive-related__card"
                                        >
                                            <template #default>
                                                <div class="directive-related__card-inner">
                                                    <div class="directive-related__card-head">
                                                        <origam-chip
                                                            :color="item.kind === 'directive' ? 'secondary' : 'primary'"
                                                            size="x-small"
                                                            pill
                                                            class="directive-related__kind-chip"
                                                        >
                                                            {{ item.kind === 'directive' ? t('directives.detail.related.kind_directive', 'directive') : t('directives.detail.related.kind_component', 'component') }}
                                                        </origam-chip>
                                                    </div>

                                                    <origam-title
                                                        tag="h3"
                                                        class="directive-related__card-name"
                                                    >
                                                        {{ item.name }}
                                                    </origam-title>

                                                    <p class="directive-related__card-desc">
                                                        {{ t(item.descriptionKey, item.descriptionFallback) }}
                                                    </p>
                                                </div>
                                            </template>
                                        </origam-card>
                                    </nuxt-link>
                                </origam-grid-item>
                            </origam-grid>
                        </section>

                        <section
                            v-if="!displayDoc && catalogEntry"
                            class="directive-section directive-no-doc"
                            aria-labelledby="directive-no-doc-title"
                            data-cy="directive-no-doc"
                        >
                            <origam-card
                                rounded="lg"
                                class="directive-no-doc__card"
                            >
                                <template #default>
                                    <div class="directive-no-doc__inner">
                                        <origam-icon
                                            icon="mdi-book-open-page-variant-outline"
                                            color="primary"
                                            class="directive-no-doc__icon"
                                            aria-hidden="true"
                                        />

                                        <origam-title
                                            id="directive-no-doc-title"
                                            tag="h2"
                                            class="directive-no-doc__title"
                                        >
                                            {{ t('directives.detail.no_doc.title', 'Documentation coming soon') }}
                                        </origam-title>

                                        <p class="directive-no-doc__desc">
                                            {{ t('directives.detail.no_doc.desc', 'The detailed API reference for this directive is being written.') }}
                                        </p>
                                    </div>
                                </template>
                            </origam-card>
                        </section>
                    </div>
                </div>
            </origam-container>
        </template>
    </article>
</template>

<style scoped lang="scss">
.directive-detail {
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

.directive-detail-not-found {
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

.directive-hero {
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
        font-family: var(--origam-font__family---mono, monospace);
    }

    &__category-chip {
        font-family: var(--origam-font__family---mono, monospace);
        font-size: 0.625rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
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

    &__signature-btn {
        font-family: var(--origam-font__family---mono, monospace);
        font-size: var(--origam-font-size---xs, 0.75rem);
        border: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
        background: var(--origam-color__surface---sunken, #f5f5f5);
        border-radius: var(--origam-radius---btn, 4px);
        white-space: nowrap;
        --origam-btn---font-size: var(--origam-font-size---xs, 0.75rem);
    }

    &__signature-text {
        font-family: var(--origam-font__family---mono, monospace);
        font-size: var(--origam-font-size---xs, 0.75rem);
        overflow: hidden;
        text-overflow: ellipsis;
        max-inline-size: 40ch;

        @media (max-width: 768px) {
            display: none;
        }
    }
}

.directive-toc {
    position: sticky;
    top: calc(var(--origam-layout---position-top, 0px) + var(--origam-space---8, 2rem));
    padding-block-end: var(--origam-space---8, 2rem);

    @media (max-width: 1024px) {
        position: static;
        display: flex;
        align-items: center;
        gap: var(--origam-space---4, 1rem);
        flex-wrap: wrap;
        border-block-end: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
        padding-block-end: var(--origam-space---4, 1rem);
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
            margin: 0;
            white-space: nowrap;
        }
    }

    &__list {
        list-style: none;
        padding: 0;
        margin: 0;

        @media (max-width: 1024px) {
            display: flex;
            flex-wrap: wrap;
            gap: var(--origam-space---2, 0.5rem);
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
        }
    }

    &__item--active &__link {
        color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
        border-inline-start-color: var(--origam-color__action--primary---bg, #7c3aed);
        font-weight: 600;

        @media (max-width: 1024px) {
            border-inline-start: none;
            border-block-end-color: var(--origam-color__action--primary---bg, #7c3aed);
        }
    }
}

.directive-section {
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

.directive-signature {
    &__code {
        inline-size: 100%;
    }
}

.prop-list {
    margin: 0;
    padding: 0;
    border: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
    border-radius: var(--origam-radius---lg, 8px);
    overflow: hidden;

    &__item {
        padding: var(--origam-space---3, 0.75rem) var(--origam-space---4, 1rem);
        border-block-end: 1px solid var(--origam-color__border---subtle, rgba(0, 0, 0, 0.04));
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---1, 0.25rem);
        transition: background 100ms;

        &:last-child {
            border-block-end: none;
        }

        &:hover {
            background: var(--origam-color__action--primary---bgSubtle, rgba(124, 58, 237, 0.03));
        }

        &:hover .prop-list__copy-icon {
            opacity: 1;
        }
    }

    &__dt {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--origam-space---2, 0.5rem);
        min-block-size: 1.75rem;
    }

    &__name-btn {
        padding: 0;
        gap: var(--origam-space---1, 0.25rem);
        --origam-btn---font-size: var(--origam-font-size---sm, 0.875rem);
        font-weight: 600;
        color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__name-mono {
        font-family: var(--origam-font__family---mono, monospace);
        font-size: var(--origam-font-size---sm, 0.875rem);
        font-weight: 600;
        color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__copy-icon {
        margin-inline-start: var(--origam-space---2, 0.5rem);
        opacity: 0;
        transition: opacity 100ms;
        color: var(--origam-color__text---tertiary, #737373);
    }

    &__required-badge {
        flex-shrink: 0;
    }

    &__type-link {
        text-decoration: none;
        color: inherit;
        display: inline-flex;
    }

    &__type-chip {
        font-family: var(--origam-font__family---mono, monospace);
        font-size: 0.65rem;
        max-inline-size: 32ch;
        white-space: normal;
        height: auto;
        padding-block: 1px;
        line-height: 1.3;

        &--primitive {
            color: var(--origam-color__text---secondary, #525252);
        }
    }

    &__default {
        font-family: var(--origam-font__family---mono, monospace);
        font-size: var(--origam-font-size---xs, 0.75rem);
        color: var(--origam-color__text---tertiary, #737373);
        white-space: nowrap;
    }

    &__dd {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        line-height: 1.6;
        color: var(--origam-color__text---secondary, #525252);
        padding-inline-start: 0;
    }
}

:deep(.origam-code--compact) {
    --origam-code__compact---gap: var(--origam-space---2, 0.5rem);
}

.directive-note {
    margin: var(--origam-space---4, 1rem) 0 0;
    padding: var(--origam-space---3, 0.75rem) var(--origam-space---4, 1rem);
    border-inline-start: 3px solid var(--origam-color__action--primary---bg, #7c3aed);
    background: var(--origam-color__action--primary---bgSubtle, rgba(124, 58, 237, 0.04));
    border-radius: 0 var(--origam-radius---sm, 4px) var(--origam-radius---sm, 4px) 0;
    font-size: var(--origam-font-size---sm, 0.875rem);
    line-height: 1.65;
    color: var(--origam-color__text---secondary, #525252);
    max-inline-size: 56rem;
}

.directive-examples {
    &__list {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---8, 2rem);
    }

    &__item-title {
        display: flex;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
        font-size: var(--origam-font-size---sm, 0.875rem);
        font-weight: 700;
        color: var(--origam-color__text---ink, #0a0a0a);
        margin: 0 0 var(--origam-space---3, 0.75rem);

        &::before {
            content: '';
            display: inline-block;
            inline-size: 3px;
            block-size: 14px;
            border-radius: 2px;
            background: var(--origam-color__action--primary---bg, #7c3aed);
            flex-shrink: 0;
        }
    }

    &__code {
        inline-size: 100%;
    }
}

.directive-related {
    &__grid {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    &__item {
        list-style: none;
        display: flex;
        flex-direction: column;
    }

    &__link {
        display: flex;
        flex-direction: column;
        block-size: 100%;
        text-decoration: none;
        color: inherit;
        border-radius: var(--origam-radius---lg, 12px);

        &:hover .directive-related__card {
            transform: translateY(-2px);
            box-shadow: var(--origam-shadow---card-elevated, 0 4px 12px rgba(0, 0, 0, 0.1));
        }

        &:focus-visible {
            outline: 2px solid var(--origam-color__action--primary---bg, #7c3aed);
            outline-offset: 2px;
        }
    }

    &__card {
        block-size: 100%;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        display: flex;
        flex-direction: column;
    }

    &__card-inner {
        padding: var(--origam-space---4, 1rem) var(--origam-space---5, 1.25rem);
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---2, 0.5rem);
        block-size: 100%;
    }

    &__card-head {
        margin-block-end: var(--origam-space---1, 0.25rem);
    }

    &__kind-chip {
        align-self: flex-start;
    }

    &__card-name {
        display: block;
        font-size: var(--origam-font-size---sm, 0.875rem);
        font-weight: 700;
        font-family: var(--origam-font__family---mono, monospace);
        color: var(--origam-color__text---primary, #0a0a0a);
        margin: 0;
    }

    &__card-desc {
        margin: 0;
        font-size: var(--origam-font-size---xs, 0.75rem);
        line-height: 1.5;
        color: var(--origam-color__text---secondary, #525252);
        flex: 1;
    }
}

.directive-no-doc {
    &__card {
        max-inline-size: 48rem;
    }

    &__inner {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--origam-space---4, 1rem);
        padding: var(--origam-space---6, 1.5rem);
    }

    &__icon {
        font-size: 2rem;
        color: var(--origam-color__action--primary---bg, #7c3aed);
    }

    &__title {
        display: block;
        font-size: var(--origam-font-size---lg, 1.125rem);
        font-weight: var(--origam-font__weight---bold, 700);
        color: var(--origam-color__text---primary, #0a0a0a);
        margin: 0;
    }

    &__desc {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        line-height: 1.65;
        color: var(--origam-color__text---secondary, #525252);
    }
}
</style>
