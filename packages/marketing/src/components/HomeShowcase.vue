<script setup lang="ts">
import { computed } from 'vue'
import { useT } from '~/composables/useT'
import {
    SHOWCASE_AVATAR_ITEMS,
    SHOWCASE_CHIP_ITEMS,
    SHOWCASE_GRID_COLUMNS,
    SHOWCASE_SPARKLINE_DATA,
    SHOWCASE_TABLE_ROWS,
    SHOWCASE_TABLE_VARS,
    SHOWCASE_WIDGET_RADIUS,
    SHOWCASE_WIDGET_VARS
} from '~/consts/showcase.const'

const { t } = useT()

const sparklineSeries = computed(() => [
    { name: 'growth', data: SHOWCASE_SPARKLINE_DATA }
])

const switchPairs = computed(() => [
    { modelValue: false, inset: false, flat: false },
    { modelValue: true,  inset: false, flat: false }
])

const STATUS_DOT_COLOR: Record<string, string> = {
    success: 'var(--origam-color__feedback--success---fgSubtle, #15803d)',
    warning: 'var(--origam-color__feedback--warning---fgSubtle, #b45309)',
    danger:  'var(--origam-color__feedback--danger---fgSubtle, #b91c1c)',
    info:    'var(--origam-color__feedback--info---fgSubtle, #1d4ed8)',
    neutral: 'var(--origam-color__text---secondary, #525252)',
    primary: 'var(--origam-color__action--primary---fgSubtle, #6d28d9)',
}
</script>

<template>
    <section
        class="home-showcase"
        aria-labelledby="showcase-title"
    >
        <header class="home-showcase__header">
            <p class="home-showcase__eyebrow">
                {{ t('home.showcase.eyebrow', 'SHOWCASE') }}
            </p>

            <div class="home-showcase__title-row">
                <origam-title
                    id="showcase-title"
                    tag="h2"
                    class="home-showcase__title"
                >
                    <span class="home-showcase__title-line">{{ t('home.showcase.title_line1', '95 components.') }}</span>
                    <span class="home-showcase__title-line">{{ t('home.showcase.title_line2', 'One vibe.') }}</span>
                </origam-title>

                <origam-btn
                    variant="text"
                    href="/components"
                    class="home-showcase__view-all"
                    append-icon="mdi-arrow-right"
                    data-cy="showcase-view-all"
                >
                    {{ t('home.showcase.view_all', 'View all') }}
                </origam-btn>
            </div>
        </header>

        <origam-grid
            tag="ul"
            :columns="SHOWCASE_GRID_COLUMNS"
            gap="16px"
            :aria-label="t('a11y.showcase_grid', 'Component showcase')"
            class="home-showcase__grid"
        >
            <origam-grid-item
                tag="li"
                :row="'1 / 3'"
                class="home-showcase__item"
            >
                <origam-card
                    tag="figure"
                    :rounded="SHOWCASE_WIDGET_RADIUS"
                    :style="SHOWCASE_WIDGET_VARS"
                    class="home-showcase__widget"
                >
                    <figcaption class="home-showcase__widget-header">
                        <div class="home-showcase__widget-label">
                            <strong class="home-showcase__widget-title">
                                {{ t('home.showcase.data_table.title', 'Data Table') }}
                            </strong>
                            <span class="home-showcase__widget-caption">
                                {{ t('home.showcase.data_table.caption', 'Sortable · filterable · virtualized') }}
                            </span>
                        </div>

                        <origam-chip
                            :text="t('home.showcase.data_table.badge', 'Data')"
                            color="primary"
                            border
                            pill
                            size="x-small"
                            class="home-showcase__data-badge"
                            data-cy="showcase-data-badge"
                        />
                    </figcaption>

                    <origam-table
                        class="home-showcase__table"
                        :style="SHOWCASE_TABLE_VARS"
                        data-cy="showcase-data-table"
                    >
                        <thead class="home-showcase__table-head">
                            <tr>
                                <th scope="col" class="home-showcase__th">
                                    {{ t('home.showcase.data_table.col_project', 'PROJECT') }}
                                    <span class="home-showcase__th-sort" aria-hidden="true">↓</span>
                                </th>
                                <th scope="col" class="home-showcase__th">
                                    {{ t('home.showcase.data_table.col_owner', 'Owner') }}
                                </th>
                                <th scope="col" class="home-showcase__th">
                                    {{ t('home.showcase.data_table.col_status', 'Status') }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(row, rowIndex) in SHOWCASE_TABLE_ROWS"
                                :key="row.nameKey"
                                class="home-showcase__tr"
                            >
                                <td class="home-showcase__td home-showcase__td--name">
                                    {{ t(row.nameKey, row.nameFallback) }}
                                </td>
                                <td class="home-showcase__td home-showcase__td--owner">
                                    {{ t(row.ownerKey, row.ownerFallback) }}
                                </td>
                                <td class="home-showcase__td home-showcase__td--status">
                                    <span class="home-showcase__status-cell">
                                        <span
                                            class="home-showcase__status-dot"
                                            :style="{ backgroundColor: STATUS_DOT_COLOR[row.statusIntent] }"
                                            aria-hidden="true"
                                        />
                                        <span
                                            class="home-showcase__status-text"
                                            :style="{ color: STATUS_DOT_COLOR[row.statusIntent] }"
                                        >
                                            {{ t(row.statusKey, row.statusFallback) }}
                                        </span>

                                        <origam-btn
                                            variant="text"
                                            icon="mdi-dots-horizontal"
                                            size="x-small"
                                            class="home-showcase__row-menu"
                                            :aria-label="t('home.showcase.data_table.row_menu', 'Row actions')"
                                            :data-cy="`showcase-row-menu-${rowIndex}`"
                                        />
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </origam-table>
                </origam-card>
            </origam-grid-item>

            <origam-grid-item
                tag="li"
                class="home-showcase__item"
            >
                <origam-card
                    tag="figure"
                    :rounded="SHOWCASE_WIDGET_RADIUS"
                    :style="SHOWCASE_WIDGET_VARS"
                    class="home-showcase__widget"
                >
                    <figcaption class="home-showcase__widget-label">
                        <strong class="home-showcase__widget-title">
                            {{ t('home.showcase.chart_line.title', 'Chart Line') }}
                        </strong>
                        <span class="home-showcase__widget-caption home-showcase__widget-caption--accent">
                            {{ t('home.showcase.chart_line.caption', '+12.4% this month') }}
                        </span>
                    </figcaption>

                    <origam-chart-sparkline
                        type="area"
                        color="primary"
                        :series="sparklineSeries"
                        :show-last="true"
                        width="100%"
                        :height="80"
                        class="home-showcase__sparkline"
                        data-cy="showcase-sparkline"
                        :title="t('home.showcase.chart_line.caption', '+12.4% this month')"
                    />
                </origam-card>
            </origam-grid-item>

            <origam-grid-item
                tag="li"
                class="home-showcase__item"
            >
                <origam-card
                    tag="figure"
                    :rounded="SHOWCASE_WIDGET_RADIUS"
                    :style="SHOWCASE_WIDGET_VARS"
                    class="home-showcase__widget"
                >
                    <figcaption class="home-showcase__widget-label">
                        <strong class="home-showcase__widget-title">
                            {{ t('home.showcase.switch.title', 'Switch') }}
                        </strong>
                        <span class="home-showcase__widget-caption">
                            {{ t('home.showcase.switch.caption', 'inset · flat · default') }}
                        </span>
                    </figcaption>

                    <div
                        class="home-showcase__switch-row"
                        role="group"
                        :aria-label="t('home.showcase.switch.title', 'Switch')"
                    >
                        <origam-switch
                            v-for="(variant, index) in switchPairs"
                            :key="index"
                            :model-value="variant.modelValue"
                            :inset="variant.inset"
                            :flat="variant.flat"
                            readonly
                            :data-cy="`showcase-switch-${index}`"
                        />
                    </div>
                </origam-card>
            </origam-grid-item>

            <origam-grid-item
                tag="li"
                class="home-showcase__item"
            >
                <origam-card
                    tag="figure"
                    :rounded="SHOWCASE_WIDGET_RADIUS"
                    :style="SHOWCASE_WIDGET_VARS"
                    class="home-showcase__widget"
                >
                    <figcaption class="home-showcase__widget-label">
                        <strong class="home-showcase__widget-title">
                            {{ t('home.showcase.chips.title', 'Chips') }}
                        </strong>
                        <span class="home-showcase__widget-caption">
                            {{ t('home.showcase.chips.caption', '6 intents') }}
                        </span>
                    </figcaption>

                    <ul
                        class="home-showcase__chip-list"
                        data-cy="showcase-chip-group"
                        :aria-label="t('a11y.showcase_chip_list', 'Chip intents')"
                    >
                        <li
                            v-for="chip in SHOWCASE_CHIP_ITEMS"
                            :key="chip.intent"
                        >
                            <origam-chip
                                :color="chip.intent"
                                border
                                pill
                                size="small"
                                :text="t(chip.labelKey, chip.labelFallback)"
                                :data-cy="`showcase-chip-${chip.intent}`"
                            />
                        </li>
                    </ul>
                </origam-card>
            </origam-grid-item>

            <origam-grid-item
                tag="li"
                class="home-showcase__item"
            >
                <origam-card
                    tag="figure"
                    :rounded="SHOWCASE_WIDGET_RADIUS"
                    :style="SHOWCASE_WIDGET_VARS"
                    class="home-showcase__widget"
                >
                    <figcaption class="home-showcase__widget-label">
                        <strong class="home-showcase__widget-title">
                            {{ t('home.showcase.avatar_group.title', 'Avatar Group') }}
                        </strong>
                        <span class="home-showcase__widget-caption">
                            {{ t('home.showcase.avatar_group.caption', '+3 members') }}
                        </span>
                    </figcaption>

                    <div class="home-showcase__avatar-row">
                        <origam-avatar-group
                            :items="SHOWCASE_AVATAR_ITEMS"
                            :max="5"
                            class="home-showcase__avatar-group"
                            data-cy="showcase-avatar-group"
                            :aria-label="t('home.showcase.avatar_group.caption', '+3 members')"
                        />
                    </div>
                </origam-card>
            </origam-grid-item>
        </origam-grid>
    </section>
</template>

<style scoped lang="scss">
.home-showcase {
    padding-block: var(--origam-space---24, 6rem);
    padding-inline: var(--origam-space---14, 3.5rem);
    max-width: var(--origam-layout---max-width, 80rem);
    margin-inline: auto;

    &__header {
        margin-block-end: var(--origam-space---8, 2rem);
    }

    &__eyebrow {
        margin: 0 0 var(--origam-space---3, 0.75rem);
        font-size: var(--origam-font-size---xs, 0.75rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
        text-transform: uppercase;
        letter-spacing: var(--origam-letter-spacing---wide, 0.08em);
    }

    &__title-row {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: var(--origam-space---4, 1rem);
    }

    &__title {
        margin: 0;
        font-size: var(--origam-font-size---section, 3rem);
        font-weight: var(--origam-font__weight---bold, 700);
        letter-spacing: var(--origam-letter-spacing---tight, -0.03em);
        line-height: var(--origam-line-height---tight, 1.1);
        color: var(--origam-color__text---primary, #0a0a0a);
        display: flex;
        flex-direction: column;
    }

    &__title-line {
        display: block;
    }

    &__view-all {
        flex-shrink: 0;
        align-self: flex-end;
        padding-block-end: var(--origam-space---1, 0.25rem);
    }

    &__grid {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    &__item {
        list-style: none;
        display: flex;
    }

    &__widget {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---4, 1rem);
        margin: 0;
    }

    &__widget-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--origam-space---3, 0.75rem);
        flex-shrink: 0;
    }

    &__widget-label {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---1, 0.25rem);
        flex-shrink: 0;
    }

    &__widget-title {
        font-size: var(--origam-font-size---base, 1rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__widget-caption {
        font-size: var(--origam-font-size---sm, 0.875rem);
        color: var(--origam-color__text---secondary, #525252);

        &--accent {
            color: var(--origam-color__feedback--success---fgSubtle, #15803d);
            font-weight: var(--origam-font__weight---medium, 500);
        }
    }

    &__data-badge {
        flex-shrink: 0;
        margin-block-start: var(--origam-space---1, 0.25rem);
    }

    &__table {
        width: 100%;
        font-size: var(--origam-font-size---sm, 0.875rem);
        color: var(--origam-color__text---primary, #0a0a0a);

        // Remove bottom border on the last row (OrigamTable adds border-bottom on every td)
        :deep(tr:last-child td) {
            border-bottom: none;
        }
    }

    &__th {
        padding: var(--origam-space---2, 0.5rem) var(--origam-space---3, 0.75rem);
        text-align: start;
        font-weight: var(--origam-font__weight---semibold, 600);
        font-size: var(--origam-font-size---xs, 0.75rem);
        letter-spacing: var(--origam-letter-spacing---wide, 0.08em);
        text-transform: uppercase;
        color: var(--origam-color__text---secondary, #525252);
        border-block-end: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
        white-space: nowrap;
    }

    &__th-sort {
        margin-inline-start: var(--origam-space---1, 0.25rem);
        font-size: var(--origam-font-size---xs, 0.75rem);
        opacity: 0.7;
    }

    &__td {
        padding: var(--origam-space---2, 0.5rem) var(--origam-space---3, 0.75rem);
        vertical-align: middle;

        &--name {
            font-weight: var(--origam-font__weight---medium, 500);
        }

        &--owner {
            color: var(--origam-color__text---secondary, #525252);
        }

        &--status {
            white-space: nowrap;
        }
    }

    &__status-cell {
        display: inline-flex;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
        width: 100%;
    }

    &__status-dot {
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    &__status-text {
        font-size: var(--origam-font-size---sm, 0.875rem);
        font-weight: var(--origam-font__weight---medium, 500);
        flex: 1;
    }

    &__row-menu {
        flex-shrink: 0;
        color: var(--origam-color__text---secondary, #525252);
    }

    &__sparkline {
        display: block;
        flex: 1;
    }

    &__switch-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: var(--origam-space---4, 1rem);
        flex: 1;

        :deep(.origam-switch-track--dirty:not(.origam-switch-track--disabled)) {
            background-color: var(--origam-color__action--primary---bg, #7c3aed);
        }

        :deep(.origam-switch__thumb) {
            background-color: var(--origam-color__text---inverse, #ffffff);
        }
    }

    &__chip-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-wrap: wrap;
        gap: var(--origam-space---2, 0.5rem);
        flex: 1;
        align-content: flex-start;
    }

    &__avatar-row {
        display: flex;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
        flex: 1;
    }

    &__avatar-group {
        --origam-avatar-group__item---margin-inline-start: -8px;
    }

    &__avatar-pill {
        flex-shrink: 0;
    }
}

@media (max-width: 48rem) {
    .home-showcase {
        padding-inline: var(--origam-space---6, 1.5rem);
    }
}
</style>
