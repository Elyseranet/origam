<template>
    <section
            class="pg-snippets"
            :aria-labelledby="titleId"
            data-cy="playground-snippets"
    >
        <origam-title
                :id="titleId"
                tag="h3"
                class="pg-snippets__title"
        >
            <template #default>{{ titleLabel }}</template>
        </origam-title>

        <p
                v-if="isEmpty"
                class="pg-snippets__empty"
                data-cy="playground-snippets-empty"
        >
            {{ emptyLabel }}
        </p>

        <origam-list
                v-else
                :aria-label="titleLabel"
                :density="density"
                data-cy="playground-snippets-list"
        >
            <origam-list-item
                    v-for="snippet in snippets"
                    :key="snippet.id"
                    :value="snippet.id"
                    :title="snippet.label"
                    :subtitle="snippet.description"
                    :aria-label="loadAriaLabel(snippet.label)"
                    :data-cy="`playground-snippet-${snippet.id}`"
                    @click="handleLoad(snippet.id)"
            />
        </origam-list>
    </section>
</template>

<script setup lang="ts">
    import { computed, useId } from 'vue'
    import { DENSITY } from 'origam/enums'
    import { useT } from '../../composables/I18n/useT'
    import type { IPlaygroundSnippetsEmits, IPlaygroundSnippetsProps, IPlaygroundSnippetsSlots } from '../../interfaces/Components/playground-snippets.interface'

    /*********************************************************
     * Global
     ********************************************************/
    const props = defineProps<IPlaygroundSnippetsProps>()

    const emits = defineEmits<IPlaygroundSnippetsEmits>()

    defineSlots<IPlaygroundSnippetsSlots>()

    const { t } = useT()

    const titleId = useId()

    /*********************************************************
     * Snippets
     *
     * @description
     * Loading a snippet REPLACES the scene (`useSceneEditor().loadSnippet`):
     * a snippet is a starting point, not a fragment to merge into whatever
     * is already there.
     ********************************************************/
    const density = DENSITY.COMPACT

    const snippets = computed(() => props.definition?.snippets ?? [])
    const isEmpty = computed(() => snippets.value.length === 0)

    const handleLoad = (snippetId: string) => {
        emits('load', snippetId)
    }

    /*********************************************************
     * Labels
     ********************************************************/
    const titleLabel = computed(() => t('playground.snippets.title', 'Snippets'))
    const emptyLabel = computed(() => (props.definition
        ? t('playground.snippets.empty', '{name} has no snippet.', { name: props.definition.label })
        : t('playground.snippets.no_scene', 'Pick a component in the catalog to see its snippets.')))
    const loadAriaLabel = (label: string) => t('playground.snippets.load_aria', 'Load the snippet {label}', { label })

    /*********************************************************
     * Expose
     ********************************************************/
    defineExpose({})
</script>

<style lang="scss" scoped>
    .pg-snippets {
        display: flex;
        flex-direction: column;
        gap: var(--pg-snippets---gap, 8px);
        padding: var(--pg-snippets---padding, 8px 16px);

        &__empty {
            margin: 0;
            opacity: 0.7;
        }
    }
</style>

<style>
    :root {
        --pg-snippets---gap: 8px;
        --pg-snippets---padding: 8px 16px;
    }
</style>
