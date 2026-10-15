<template>
    <section
            class="pg-code"
            :aria-label="title"
            data-cy="playground-code-panel"
    >
        <origam-code
                v-if="hasCode"
                :code="code"
                :lang="lang"
                copyable
                data-cy="playground-code"
        />
        <p
                v-else
                class="pg-code__empty"
                data-cy="playground-code-empty"
        >
            {{ emptyMessage }}
        </p>
    </section>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import { CODE_LANG } from 'origam/enums'
    import { useT } from '../../composables/I18n/useT'
    import { generateSceneCode } from '../../utils/Code/scene-code.util'
    import type { IPlaygroundCodePanelProps } from '../../interfaces/Components/playground-code-panel.interface'

    /*********************************************************
     * Global
     ********************************************************/
    const props = defineProps<IPlaygroundCodePanelProps>()

    const { t } = useT()

    /*********************************************************
     * Code
     *
     * @description
     * Derived from the scene on every change, never stored and never parsed
     * back (#1048) — the scene is the only source of truth, and the code is
     * a view of it.
     *
     * @description
     * Rendered through `OrigamCode` rather than a hand-made `<pre>`: its
     * copy button (an `OrigamBtn`, keyboard-operable, localised by the DS)
     * is the one this panel needs, so there is no second copy control to
     * maintain. Syntax colouring is the HOST's call — `createOrigam({ code:
     * { highlighter } })`, condition 3 of #1048. Without it `OrigamCode`
     * falls back to its own `import('shiki')`, and to plain text when that
     * fails; the code stays readable and copyable either way.
     ********************************************************/
    const code = computed(() => generateSceneCode(props.scene, props.codeOptions))

    const hasCode = computed(() => code.value.length > 0)

    const lang = CODE_LANG.VUE

    /*********************************************************
     * Labels
     ********************************************************/
    const title = computed(() => t('playground.code.title', 'Code'))
    const emptyMessage = computed(() => t('playground.code.empty', 'The scene is empty — pick a component in the catalog to see its code.'))

    /*********************************************************
     * Expose
     ********************************************************/
    defineExpose({})
</script>

<style lang="scss" scoped>
    .pg-code {
        padding: var(--pg-code---padding, 0 16px 16px);

        &__empty {
            margin: 0;
            opacity: var(--pg-code__empty---opacity, 0.6);
        }
    }
</style>

<style>
    :root {
        --pg-code---padding: 0 16px 16px;
        --pg-code__empty---opacity: 0.6;
    }
</style>
