<template>
    <client-only>
        <p
            v-if="unavailableReason"
            class="component-preview__fallback"
            :data-cy="`preview-reason-${slug}`"
        >
            {{ unavailableReasonText }}
        </p>

        <nuxt-error-boundary v-else>
            <component
                :is="parentEnvelope.tag"
                v-if="parentEnvelope"
                v-bind="parentEnvelope.props"
            >
                <template #[parentEnvelopeSlot]>
                    <component-live-preview-instance
                        :tag="tag"
                        :instance-props="instanceProps"
                        :children="children"
                        :slot-text="slotText"
                    />
                </template>
            </component>

            <component-live-preview-instance
                v-else
                :tag="tag"
                :instance-props="instanceProps"
                :children="children"
                :slot-text="slotText"
            />

            <template #error="{ error }">
                <p
                    class="component-preview__fallback"
                    :data-cy="`preview-error-${slug}`"
                >
                    {{ renderFailedText }}
                    <code class="component-preview__fallback-detail">{{ errorDetail(error) }}</code>
                </p>
            </template>
        </nuxt-error-boundary>

        <template #fallback>
            <p
                class="component-preview__loading"
                :data-cy="`preview-loading-${slug}`"
            >
                {{ loadingText }}
            </p>
        </template>
    </client-only>
</template>

<script setup lang="ts">
    import { computed } from 'vue'

    import { useT } from '~/composables/useT'
    import {
        previewChildrenFor,
        previewParentEnvelopeFor,
        previewPropsFor,
        previewSlotTextFor,
        previewTagFor,
        previewUnavailableReasonFor
    } from '~/utils/component-preview.util'

    import ComponentLivePreviewInstance from '~/components/reference/ComponentLivePreviewInstance.vue'

    import type { IComponentLivePreviewProps } from '~/interfaces/component-live-preview.interface'

    /*********************************************************
     * Global
     *
     * @description
     * Aperçu live d'un composant du DS, partagé par la bande d'aperçu de
     * l'en-tête et par le playground des fiches composants. Trois issues
     * possibles, jamais une boîte vide muette :
     *  - le composant se rend (éventuellement avec enfants/props de démo) ;
     *  - il ne PEUT PAS se rendre isolément → on affiche la raison curatée ;
     *  - il lève à l'exécution → on affiche le message d'erreur réel.
     ********************************************************/
    const { t } = useT()

    const props = withDefaults(defineProps<IComponentLivePreviewProps>(), {
        doc: null,
        userProps: () => ({}),
        uneditedProps: () => ({}),
        slotContent: '',
        instanceAriaLabel: undefined,
        dataCySuffix: 'live',
        curatedReason: true
    })

    /*********************************************************
     * Instance rendue
     *
     * @description
     * Tag réel (la colonne `tag` de la fiche fait foi — `origam-${slug}` est
     * faux pour 3 fiches), props fusionnées et contenu du slot par défaut.
     ********************************************************/
    const tag = computed(() => previewTagFor(props.slug, props.doc))

    const mergedProps = computed(() => previewPropsFor(props.slug, props.userProps, props.uneditedProps))

    const children = computed(() => previewChildrenFor(props.slug))

    const slotText = computed(() => previewSlotTextFor(props.slug, props.doc, props.slotContent))

    const instanceDataCy = computed(() => `playground-${props.dataCySuffix}-${props.slug}`)

    /** Attributs communs aux deux branches de rendu (avec / sans slot). */
    const instanceProps = computed(() => ({
        ...mergedProps.value,
        'aria-label': props.instanceAriaLabel,
        'data-cy': instanceDataCy.value
    }))

    /*********************************************************
     * Enveloppe parente minimale
     *
     * @description
     * Certains sous-composants (`tab`, `data-table-row`, …) lèvent au montage
     * s'ils ne sont pas descendants d'un vrai parent du DS — voir
     * `IComponentPreviewParentEnvelope`. `null` pour l'immense majorité des
     * slugs, qui se montent à la racine comme avant.
     ********************************************************/
    const parentEnvelope = computed(() => previewParentEnvelopeFor(props.slug))

    const parentEnvelopeSlot = computed(() => parentEnvelope.value?.slot ?? 'default')

    /*********************************************************
     * Replis honnêtes
     *
     * @description
     * `unavailableReason` court-circuite le montage pour les sous-parties et
     * les overlays téléportés. `renderErrorText` expose la vraie erreur plutôt
     * qu'un « indisponible » muet, qui n'apprend rien au lecteur.
     ********************************************************/
    const unavailableReason = computed(() =>
        props.curatedReason ? previewUnavailableReasonFor(props.slug) : null
    )

    const unavailableReasonText = computed(() =>
        unavailableReason.value ? t(unavailableReason.value.key, unavailableReason.value.fallback) : ''
    )

    const loadingText = computed(() =>
        t('components.detail.preview.loading', 'Rendering the live preview…')
    )

    const renderFailedText = computed(() =>
        t('components.detail.preview.render_failed', 'This component raised an error while rendering with these props:')
    )

    const errorDetail = (error: unknown): string =>
        error instanceof Error ? error.message : String(error ?? '')

    /*********************************************************
     * Expose
     *
     * @description
     * Rien à piloter depuis le parent.
     ********************************************************/
    defineExpose({})
</script>

<style scoped lang="scss">
    .component-preview__fallback {
        margin: 0;
        max-inline-size: var(--component-preview-fallback---max-inline-size, 34rem);
        color: var(--component-preview-fallback---color, #525252);
        font-size: var(--component-preview-fallback---font-size, 0.8125rem);
        line-height: var(--component-preview-fallback---line-height, 1.6);
        text-align: center;
    }

    .component-preview__loading {
        margin: 0;
        color: var(--component-preview-fallback---color, #525252);
        font-size: var(--component-preview-fallback---font-size, 0.8125rem);
        opacity: var(--component-preview-loading---opacity, 0.6);
    }

    .component-preview__fallback-detail {
        display: block;
        margin-block-start: var(--component-preview-fallback-detail---margin-block-start, 0.5rem);
        font-family: var(--origam-font__family---mono, ui-monospace, monospace);
        font-size: var(--component-preview-fallback-detail---font-size, 0.75rem);
        overflow-wrap: anywhere;
    }
</style>

<style>
    :root {
        --component-preview-fallback---max-inline-size: 34rem;
        --component-preview-fallback---color: var(--origam-color__text---secondary, #525252);
        --component-preview-fallback---font-size: 0.8125rem;
        --component-preview-fallback---line-height: 1.6;
        --component-preview-loading---opacity: 0.6;
        --component-preview-fallback-detail---margin-block-start: 0.5rem;
        --component-preview-fallback-detail---font-size: 0.75rem;
    }
</style>
