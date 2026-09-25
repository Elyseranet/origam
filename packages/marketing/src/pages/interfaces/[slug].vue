<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useT } from '~/composables/useT'
import { useReferenceDoc } from '~/composables/useApiReference'
import type { IInterfaceDoc } from '~/interfaces/interfaces-catalog.interface'

const { t } = useT()
const route = useRoute()

const slug = computed(() => route.params.slug as string)

const { data: displayDoc } = await useReferenceDoc<IInterfaceDoc>('interface', slug)

const hasProps    = computed(() => (displayDoc.value?.props?.length ?? 0) > 0)
const hasExtends  = computed(() => (displayDoc.value?.extends?.length ?? 0) > 0)
const hasExamples = computed(() => (displayDoc.value?.examples?.length ?? 0) > 0)
const hasUsedBy   = computed(() => (displayDoc.value?.usedBy?.length ?? 0) > 0)

const interfaceName     = computed(() => displayDoc.value?.name ?? slug.value)
const interfaceCategory = computed(() => displayDoc.value?.category ?? '')
const interfaceDescKey  = computed(() => displayDoc.value?.descriptionKey ?? '')
const interfaceDescFb   = computed(() => displayDoc.value?.descriptionFallback ?? '')

const interfaceNameToSlug = (name: string): string =>
    name
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
        .toLowerCase()

const extendsLinks = computed(() =>
    (displayDoc.value?.extends ?? []).map(name => ({
        name,
        slug: interfaceNameToSlug(name)
    }))
)

const tocSections = computed(() => {
    const sections: { id: string; label: string }[] = []
    sections.push({ id: 'section-definition', label: t('interfaces.detail.definition.title', 'Definition') })
    if (hasExtends.value)  sections.push({ id: 'section-extends',  label: t('interfaces.detail.extends.title', 'Extends') })
    if (hasProps.value)    sections.push({ id: 'section-props',    label: t('interfaces.detail.props.title', 'Properties') })
    if (hasUsedBy.value)   sections.push({ id: 'section-used-by',  label: t('interfaces.detail.used_by.title', 'Used by') })
    if (hasExamples.value) sections.push({ id: 'section-examples', label: t('interfaces.detail.examples.title', 'Examples') })
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
    title: () => t('interfaces.detail.meta.title', `${interfaceName.value} · origam API interfaces`, { name: interfaceName.value }),
    description: () => t(interfaceDescKey.value, interfaceDescFb.value),
    ogTitle: () => t('interfaces.detail.meta.title', `${interfaceName.value} · origam API interfaces`, { name: interfaceName.value }),
    ogDescription: () => t(interfaceDescKey.value, interfaceDescFb.value),
})
</script>

<template>
    <article
        class="interface-detail"
        :data-cy="`page-interface-${slug}`"
    >
        <div
            v-if="!displayDoc"
            class="interface-detail-not-found"
            data-cy="interface-not-found"
        >
            <origam-container class="interface-detail-not-found__inner">
                <origam-avatar
                    icon="mdi-help-circle-outline"
                    color="warning"
                    size="64"
                    aria-hidden="true"
                />

                <origam-title
                    tag="h1"
                    class="interface-detail-not-found__title"
                >
                    {{ t('interfaces.detail.not_found.title', 'Interface not found') }}
                </origam-title>

                <p class="interface-detail-not-found__desc">
                    {{ t('interfaces.detail.not_found.desc', 'No interface matches the slug') }}
                    <origam-code
                        :code="slug"
                        lang="plaintext"
                        compact
                        class="interface-detail-not-found__slug-code"
                    />
                </p>

                <origam-btn
                    href="/interfaces"
                    prepend-icon="mdi-arrow-left"
                    variant="tonal"
                    color="primary"
                    data-cy="interface-not-found-back"
                >
                    {{ t('interfaces.detail.not_found.back', 'Back to catalogue') }}
                </origam-btn>
            </origam-container>
        </div>

        <template v-else>
            <div
                class="interface-hero"
                aria-labelledby="interface-title"
            >
                <origam-container class="interface-hero__container">
                    <nav
                        class="interface-hero__breadcrumb"
                        :aria-label="t('interfaces.detail.breadcrumb_label', 'Page location')"
                    >
                        <nuxt-link
                            to="/interfaces"
                            class="interface-hero__breadcrumb-link"
                            data-cy="interface-breadcrumb-catalog"
                        >
                            {{ t('interfaces.detail.breadcrumb_catalog', 'Interfaces') }}
                        </nuxt-link>

                        <span
                            class="interface-hero__breadcrumb-sep"
                            aria-hidden="true"
                        >›</span>

                        <span
                            class="interface-hero__breadcrumb-current"
                            aria-current="page"
                        >
                            {{ interfaceName }}
                        </span>
                    </nav>

                    <div class="interface-hero__identity">
                        <div class="interface-hero__title-row">
                            <origam-title
                                id="interface-title"
                                tag="h1"
                                class="interface-hero__title"
                            >
                                {{ interfaceName }}
                            </origam-title>

                            <origam-chip
                                color="primary"
                                size="small"
                                variant="outlined"
                                class="interface-hero__kind-chip"
                            >
                                {{ t('interfaces.kind.interface', 'interface') }}
                            </origam-chip>

                            <origam-chip
                                v-if="interfaceCategory"
                                size="small"
                                variant="tonal"
                                class="interface-hero__category-chip"
                            >
                                {{ interfaceCategory }}
                            </origam-chip>
                        </div>

                        <p class="interface-hero__desc">
                            {{ t(interfaceDescKey, interfaceDescFb) }}
                        </p>

                        <div class="interface-hero__bottom">
                            <nav
                                v-if="displayDoc?.sourceFile"
                                class="interface-hero__actions"
                                :aria-label="t('interfaces.detail.external_links_label', 'External resources')"
                            >
                                <origam-btn
                                    :href="`https://github.com/origam-io/origam/blob/main/${displayDoc.sourceFile}`"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="text"
                                    size="small"
                                    prepend-icon="mdi-github"
                                    data-cy="interface-source-link"
                                >
                                    {{ t('interfaces.detail.hero.source_label', 'Source') }}
                                </origam-btn>
                            </nav>
                        </div>
                    </div>
                </origam-container>
            </div>

            <origam-container>
                <div class="interface-detail__layout">
                    <aside
                        v-if="tocSections.length > 0"
                        class="interface-toc"
                        :aria-label="t('interfaces.detail.toc_label', 'Table of contents')"
                        data-cy="interface-toc"
                    >
                        <p class="interface-toc__heading">
                            {{ t('interfaces.detail.toc_heading', 'On this page') }}
                        </p>

                        <origam-grid
                            tag="ul"
                            columns="1"
                            gap="0.25rem"
                            class="interface-toc__list"
                        >
                            <origam-grid-item
                                v-for="section in tocSections"
                                :key="section.id"
                                tag="li"
                                class="interface-toc__item"
                                :class="{ 'interface-toc__item--active': activeSection === section.id }"
                            >
                                <a
                                    class="interface-toc__link"
                                    :href="`#${section.id}`"
                                    :aria-current="activeSection === section.id ? 'true' : undefined"
                                    @click.prevent="scrollToSection(section.id)"
                                >
                                    {{ section.label }}
                                </a>
                            </origam-grid-item>
                        </origam-grid>
                    </aside>

                    <div class="interface-detail__body">
                        <section
                            id="section-definition"
                            class="interface-section interface-definition"
                            aria-labelledby="interface-definition-title"
                            data-cy="interface-definition"
                        >
                            <header class="interface-section__header">
                                <p class="interface-section__eyebrow">
                                    {{ t('interfaces.detail.definition.eyebrow', 'TypeScript') }}
                                </p>
                                <origam-title
                                    id="interface-definition-title"
                                    tag="h2"
                                    class="interface-section__title"
                                >
                                    {{ t('interfaces.detail.definition.title', 'Definition') }}
                                </origam-title>
                                <p class="interface-section__desc">
                                    {{ t('interfaces.detail.definition.desc', 'The TypeScript interface definition as found in the origam source. Click the copy icon to copy the snippet.') }}
                                </p>
                            </header>

                            <div
                                v-if="displayDoc?.definition"
                                class="interface-definition__code-wrap"
                                data-cy="interface-definition-code"
                            >
                                <origam-code
                                    :code="displayDoc.definition"
                                    lang="typescript"
                                    copyable
                                    :line-numbers="true"
                                    class="interface-definition__code"
                                />
                            </div>
                        </section>

                        <section
                            v-if="hasExtends"
                            id="section-extends"
                            class="interface-section interface-extends"
                            aria-labelledby="interface-extends-title"
                            data-cy="interface-extends"
                        >
                            <header class="interface-section__header">
                                <p class="interface-section__eyebrow">
                                    {{ t('interfaces.detail.extends.eyebrow', 'Inheritance') }}
                                </p>
                                <origam-title
                                    id="interface-extends-title"
                                    tag="h2"
                                    class="interface-section__title"
                                >
                                    {{ t('interfaces.detail.extends.title', 'Extends') }}
                                </origam-title>
                                <p class="interface-section__desc">
                                    {{ t('interfaces.detail.extends.desc', 'Parent interfaces this one inherits from. Their properties are available on every consumer of this interface.') }}
                                </p>
                            </header>

                            <ul
                                class="interface-extends__list"
                                data-cy="interface-extends-list"
                            >
                                <li
                                    v-for="parent in extendsLinks"
                                    :key="parent.slug"
                                    class="interface-extends__item"
                                >
                                    <nuxt-link
                                        :to="`/interfaces/${parent.slug}`"
                                        class="interface-extends__link"
                                        :data-cy="`interface-extends-${parent.slug}`"
                                    >
                                        <origam-chip
                                            color="primary"
                                            size="small"
                                            variant="tonal"
                                            prepend-icon="mdi-arrow-up-thin"
                                            class="interface-extends__chip"
                                        >
                                            {{ parent.name }}
                                        </origam-chip>
                                    </nuxt-link>
                                </li>
                            </ul>
                        </section>

                        <section
                            v-if="hasProps"
                            id="section-props"
                            class="interface-section interface-props"
                            aria-labelledby="interface-props-title"
                            data-cy="interface-props"
                        >
                            <header class="interface-section__header">
                                <p class="interface-section__eyebrow">
                                    {{ t('interfaces.detail.props.eyebrow', 'API') }}
                                </p>
                                <origam-title
                                    id="interface-props-title"
                                    tag="h2"
                                    class="interface-section__title"
                                >
                                    {{ t('interfaces.detail.props.title', 'Properties') }}
                                </origam-title>
                                <p class="interface-section__desc">
                                    {{ t('interfaces.detail.props.desc', 'Every property declared by this interface, with its type, optionality and default.') }}
                                </p>
                            </header>

                            <div class="interface-props__table-wrap">
                                <table
                                    class="interface-props__table"
                                    data-cy="interface-props-table"
                                >
                                    <thead>
                                        <tr>
                                            <th scope="col">{{ t('interfaces.detail.props.col_name', 'Name') }}</th>
                                            <th scope="col">{{ t('interfaces.detail.props.col_type', 'Type') }}</th>
                                            <th scope="col">{{ t('interfaces.detail.props.col_optional', 'Optional') }}</th>
                                            <th scope="col">{{ t('interfaces.detail.props.col_default', 'Default') }}</th>
                                            <th scope="col">{{ t('interfaces.detail.props.col_description', 'Description') }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-for="prop in displayDoc?.props"
                                            :key="prop.name"
                                            :data-cy="`interface-prop-${prop.name}`"
                                        >
                                            <td class="interface-props__cell-name">
                                                <code class="interface-props__code">{{ prop.name }}</code>
                                            </td>
                                            <td class="interface-props__cell-type">
                                                <code class="interface-props__code">{{ prop.type }}</code>
                                            </td>
                                            <td class="interface-props__cell-optional">
                                                {{ prop.optional ? t('interfaces.detail.props.optional_yes', 'Yes') : t('interfaces.detail.props.optional_no', 'No') }}
                                            </td>
                                            <td class="interface-props__cell-default">
                                                <code
                                                    v-if="prop.default"
                                                    class="interface-props__code"
                                                >{{ prop.default }}</code>
                                                <span
                                                    v-else
                                                    class="interface-props__dash"
                                                    aria-hidden="true"
                                                >—</span>
                                            </td>
                                            <td class="interface-props__cell-desc">
                                                {{ prop.descriptionFallback }}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section
                            v-if="hasUsedBy"
                            id="section-used-by"
                            class="interface-section interface-used-by"
                            aria-labelledby="interface-used-by-title"
                            data-cy="interface-used-by"
                        >
                            <header class="interface-section__header">
                                <p class="interface-section__eyebrow">
                                    {{ t('interfaces.detail.used_by.eyebrow', 'Ecosystem') }}
                                </p>
                                <origam-title
                                    id="interface-used-by-title"
                                    tag="h2"
                                    class="interface-section__title"
                                >
                                    {{ t('interfaces.detail.used_by.title', 'Used by') }}
                                </origam-title>
                                <p class="interface-section__desc">
                                    {{ t('interfaces.detail.used_by.desc', 'Components and composables that extend or consume this interface.') }}
                                </p>
                            </header>

                            <origam-grid
                                tag="ul"
                                columns="repeat(auto-fill, minmax(200px, 1fr))"
                                gap="1rem"
                                class="interface-used-by__grid"
                                data-cy="interface-used-by-grid"
                            >
                                <origam-grid-item
                                    v-for="ref in displayDoc?.usedBy"
                                    :key="`${ref.kind}-${ref.slug}`"
                                    tag="li"
                                    class="interface-used-by__item"
                                >
                                    <nuxt-link
                                        :to="ref.kind === 'composable' ? `/composables/${ref.slug}` : `/components/${ref.slug}`"
                                        class="interface-used-by__link"
                                        :aria-label="`${ref.name} — ${ref.kind}`"
                                        :data-cy="`interface-used-by-card-${ref.slug}`"
                                    >
                                        <origam-card class="interface-used-by__card">
                                            <template #default>
                                                <div class="interface-used-by__card-inner">
                                                    <div class="interface-used-by__card-head">
                                                        <origam-title
                                                            tag="h3"
                                                            class="interface-used-by__card-name"
                                                        >
                                                            {{ ref.name }}
                                                        </origam-title>

                                                        <origam-icon
                                                            icon="mdi-arrow-right"
                                                            size="16"
                                                            class="interface-used-by__card-arrow"
                                                            aria-hidden="true"
                                                        />
                                                    </div>

                                                    <p class="interface-used-by__card-kind">
                                                        <origam-chip
                                                            size="x-small"
                                                            variant="tonal"
                                                            :color="ref.kind === 'composable' ? 'secondary' : 'primary'"
                                                            pill
                                                        >
                                                            {{ ref.kind === 'composable' ? t('interfaces.kind.composable', 'composable') : t('interfaces.kind.component', 'component') }}
                                                        </origam-chip>
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
                            class="interface-section interface-examples"
                            aria-labelledby="interface-examples-title"
                            data-cy="interface-examples"
                        >
                            <header class="interface-section__header">
                                <p class="interface-section__eyebrow">
                                    {{ t('interfaces.detail.examples.eyebrow', 'Usage') }}
                                </p>
                                <origam-title
                                    id="interface-examples-title"
                                    tag="h2"
                                    class="interface-section__title"
                                >
                                    {{ t('interfaces.detail.examples.title', 'Examples') }}
                                </origam-title>
                                <p class="interface-section__desc">
                                    {{ t('interfaces.detail.examples.desc', 'Ready-to-paste code snippets using this interface.') }}
                                </p>
                            </header>

                            <div class="interface-examples__list">
                                <div
                                    v-for="example in displayDoc?.examples"
                                    :key="example.titleFallback"
                                    class="interface-examples__item"
                                    :data-cy="`interface-example-${example.titleFallback.toLowerCase().replace(/[^a-z0-9]/g, '-')}`"
                                >
                                    <origam-title
                                        tag="h3"
                                        class="interface-examples__item-title"
                                    >
                                        {{ t(example.titleKey, example.titleFallback) }}
                                    </origam-title>

                                    <origam-code
                                        :code="example.code"
                                        :lang="example.lang"
                                        copyable
                                        :line-numbers="true"
                                        class="interface-examples__code"
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
.interface-detail {
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

.interface-detail-not-found {
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

.interface-hero {
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

.interface-toc {
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

.interface-section {
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

.interface-definition {
    &__code-wrap {
        overflow-x: auto;
    }
}

.interface-extends {
    &__list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-wrap: wrap;
        gap: var(--origam-space---2, 0.5rem);
    }

    &__item {
        list-style: none;
    }

    &__link {
        text-decoration: none;
        color: inherit;
        border-radius: var(--origam-radius---md, 8px);

        &:focus-visible {
            outline: 2px solid var(--origam-color__action--primary---bg, #7c3aed);
            outline-offset: 2px;
        }
    }

    &__chip {
        font-family: var(--origam-font__family---mono, monospace);
    }
}

.interface-props {
    &__table-wrap {
        overflow-x: auto;
    }

    &__table {
        inline-size: 100%;
        border-collapse: collapse;
        font-size: var(--origam-font-size---sm, 0.875rem);

        thead th {
            text-align: start;
            padding: var(--origam-space---2, 0.5rem) var(--origam-space---3, 0.75rem);
            font-size: var(--origam-font-size---xs, 0.75rem);
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: var(--origam-color__text---tertiary, #737373);
            border-block-end: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
            white-space: nowrap;
        }

        tbody td {
            padding: var(--origam-space---3, 0.75rem);
            border-block-end: 1px solid var(--origam-color__border---subtle, rgba(0, 0, 0, 0.04));
            vertical-align: top;
            color: var(--origam-color__text---secondary, #525252);
            line-height: 1.55;
        }
    }

    &__code {
        font-family: var(--origam-font__family---mono, monospace);
        font-size: var(--origam-font-size---sm, 0.875rem);
        color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
        background: var(--origam-color__action--primary---bgSubtle, rgba(124, 58, 237, 0.08));
        padding: 0.1em 0.4em;
        border-radius: var(--origam-radius---sm, 4px);
        white-space: nowrap;
    }

    &__cell-name &__code {
        font-weight: 600;
        color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__cell-optional {
        white-space: nowrap;
    }

    &__dash {
        color: var(--origam-color__text---tertiary, #737373);
    }
}

.interface-used-by {
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

        &:hover .interface-used-by__card {
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

    &__card-kind {
        margin: 0;
    }
}

.interface-examples {
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
