<template>
    <section
            class="pg-dock"
            :aria-label="handleLabel"
            data-cy="playground-dock"
    >
        <button
                type="button"
                class="pg-dock__handle"
                :aria-expanded="open"
                aria-controls="pg-dock-body"
                data-cy="playground-dock-handle"
                @click="handleToggle"
        >
            {{ handleLabel }}
        </button>

        <div
                v-show="open"
                id="pg-dock-body"
                data-cy="playground-dock-body"
        >
            <p class="pg-dock__placeholder">{{ placeholderLabel }}</p>
        </div>
    </section>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue'
    import { useT } from '../../composables/I18n/useT'

    const { t } = useT()

    /*********************************************************
     * State
     *
     * @description
     * Repliable, replié par défaut — c'est l'écran "défaut" du lot 2. Son
     * contenu (Code / Snippets / Events) arrive dans un lot ultérieur; ce
     * lot livre uniquement la coque repliable.
     ********************************************************/
    const open = ref(false)

    const handleLabel = computed(() => t('playground.dock.handle', 'Code · Snippets · Events'))
    const placeholderLabel = computed(() => t('playground.dock.placeholder', 'Available in a later lot.'))

    const handleToggle = () => {
        open.value = !open.value
    }

    defineExpose({})
</script>

<style lang="scss" scoped>
    .pg-dock {
        grid-area: dock;
        border-block-start: 1px solid var(--pg-dock---border-color, #e5e5e5);

        &__handle {
            width: 100%;
            text-align: start;
            padding: var(--pg-dock__handle---padding, 8px 16px);
            min-height: var(--pg-dock__handle---min-height, 44px);
            background: none;
            border: 0;
            font: inherit;
            cursor: pointer;

            &:focus-visible {
                outline: 2px solid var(--pg-dock__handle--focus---outline-color, #2563eb);
                outline-offset: -2px;
            }
        }

        &__placeholder {
            padding: var(--pg-dock__placeholder---padding, 0 16px 16px);
            opacity: 0.6;
            margin: 0;
        }
    }
</style>

<style>
    :root {
        --pg-dock---border-color: #e5e5e5;
        --pg-dock__handle---padding: 8px 16px;
        --pg-dock__handle---min-height: 44px;
        --pg-dock__handle--focus---outline-color: #2563eb;
        --pg-dock__placeholder---padding: 0 16px 16px;
    }
</style>
