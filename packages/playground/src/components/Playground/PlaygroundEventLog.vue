<template>
    <section
            class="pg-events"
            :aria-labelledby="titleId"
            data-cy="playground-event-log"
    >
        <header class="pg-events__head">
            <origam-title
                    :id="titleId"
                    tag="h3"
                    class="pg-events__title"
            >
                <template #default>{{ titleLabel }}</template>
            </origam-title>
            <span
                    class="pg-events__count"
                    data-cy="playground-event-log-count"
            >{{ countLabel }}</span>
            <origam-btn
                    variant="text"
                    size="small"
                    :disabled="isEmpty"
                    data-cy="playground-event-log-clear"
                    @click="handleClear"
            >
                <template #default>{{ clearLabel }}</template>
            </origam-btn>
        </header>

        <p
                v-if="isEmpty"
                class="pg-events__empty"
                data-cy="playground-event-log-empty"
        >
            {{ emptyLabel }}
        </p>

        <ol
                v-else
                class="pg-events__list"
                aria-live="polite"
                data-cy="playground-event-log-list"
        >
            <li
                    v-for="entry in entries"
                    :key="entry.id"
                    class="pg-events__entry"
                    :data-cy="`playground-event-${entry.name}`"
            >
                <time
                        class="pg-events__time"
                        :datetime="isoOf(entry.at)"
                >{{ timeOf(entry.at) }}</time>
                <code class="pg-events__name">{{ entry.name }}</code>
                <code class="pg-events__payload">{{ entry.payload }}</code>
            </li>
        </ol>
    </section>
</template>

<script setup lang="ts">
    import { computed, useId } from 'vue'
    import { useT } from '../../composables/I18n/useT'
    import type { IPlaygroundEventLogEmits, IPlaygroundEventLogProps, IPlaygroundEventLogSlots } from '../../interfaces/Components/playground-event-log.interface'
    import { formatLogTime } from '../../utils/Commons/event-log.util'

    /*********************************************************
     * Global
     ********************************************************/
    const props = defineProps<IPlaygroundEventLogProps>()

    const emits = defineEmits<IPlaygroundEventLogEmits>()

    defineSlots<IPlaygroundEventLogSlots>()

    const { t } = useT()

    const titleId = useId()

    /*********************************************************
     * Display
     ********************************************************/
    const isEmpty = computed(() => props.entries.length === 0)

    const timeOf = (at: number) => formatLogTime(at)
    const isoOf = (at: number) => new Date(at).toISOString()

    const titleLabel = computed(() => t('playground.events.title', 'Events'))
    const countLabel = computed(() => t('playground.events.count', '{count} emitted', { count: props.entries.length }))
    const clearLabel = computed(() => t('playground.events.clear', 'Clear'))
    const emptyLabel = computed(() => t('playground.events.empty', 'No emit yet — interact with the rendered component.'))

    /*********************************************************
     * Handlers
     ********************************************************/
    const handleClear = () => {
        emits('clear')
    }

    /*********************************************************
     * Expose
     ********************************************************/
    defineExpose({})
</script>

<style lang="scss" scoped>
    .pg-events {
        display: grid;
        gap: var(--pg-events---gap, 8px);
        padding: var(--pg-events---padding, 0 16px 16px);

        &__head {
            display: flex;
            align-items: center;
            gap: var(--pg-events---gap, 8px);
        }

        &__title {
            font-size: var(--pg-events__title---font-size, 0.9em);
            margin: 0;
        }

        &__count {
            margin-inline-end: auto;
            font-size: var(--pg-events__count---font-size, 0.75em);
            color: var(--pg-events__count---color, var(--origam-color__text---tertiary));
        }

        &__empty {
            margin: 0;
            color: var(--pg-events__empty---color, var(--origam-color__text---tertiary));
        }

        &__list {
            margin: 0;
            padding: 0;
            list-style: none;
            max-height: var(--pg-events__list---max-height, 200px);
            overflow-y: auto;
            font-family: var(--pg-events__list---font-family, var(--origam-font__family---mono));
            font-size: var(--pg-events__list---font-size, 0.8em);
        }

        &__entry {
            display: grid;
            grid-template-columns: auto auto 1fr;
            gap: var(--pg-events---gap, 8px);
            padding-block: var(--pg-events__entry---padding-block, 2px);
            border-block-end: 1px solid var(--pg-events__entry---border-color, var(--origam-color__border---subtle));
        }

        &__time {
            color: var(--pg-events__time---color, var(--origam-color__text---tertiary));
        }

        &__name {
            font-weight: 600;
        }

        &__payload {
            overflow-wrap: anywhere;
        }
    }
</style>

<style>
    :root {
        --pg-events---gap: 8px;
        --pg-events---padding: 0 16px 16px;
        --pg-events__title---font-size: 0.9em;
        --pg-events__count---font-size: 0.75em;
        --pg-events__list---max-height: 200px;
        --pg-events__list---font-size: 0.8em;
        --pg-events__entry---padding-block: 2px;
    }
</style>
