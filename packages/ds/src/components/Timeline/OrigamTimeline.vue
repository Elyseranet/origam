<template>
	<component
		:is="tag || 'div'"
		:class="timelineClasses"
		:style="timelineStyles"
		role="list"
		:aria-label="ariaLabel"
	>
		<div
				v-if="orientation === 'horizontal'"
				class="origam-timeline__track-wrapper"
		>
			<slot name="default">
				<origam-timeline-item
					v-for="(entry, index) in items"
					:key="index"
					:title="entry.title"
					:subtitle="entry.subtitle"
					:description="entry.description"
					:icon="entry.icon"
					:intent="entry.intent"
					:is-last="index === (items?.length ?? 0) - 1"
					:truncate-line="truncateLine ?? false"
					:side="side ?? 'start'"
					:orientation="orientation"
					:index="index"
					:data-cy="`timeline-item-${index}`"
				/>
			</slot>
		</div>

		<slot v-else name="default">
			<origam-timeline-item
				v-for="(entry, index) in items"
				:key="index"
				:title="entry.title"
				:subtitle="entry.subtitle"
				:description="entry.description"
				:icon="entry.icon"
				:intent="entry.intent"
				:is-last="index === (items?.length ?? 0) - 1"
				:truncate-line="truncateLine ?? false"
				:side="side ?? 'start'"
				:orientation="orientation"
				:index="index"
				:data-cy="`timeline-item-${index}`"
			/>
		</slot>
	</component>
</template>

<script lang="ts" setup>
	import { computed, provide } from 'vue'
	import type { StyleValue } from 'vue'

	import { OrigamTimelineItem } from '../../components'
	import {
	useDensity,
	useProps,
	useSize,
	useStyle
} from '../../composables'
	import type { ITimelineProps } from '../../interfaces'
	import { TIMELINE_CONTEXT_KEY } from '../../consts'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<ITimelineProps>(), {
		side: 'start',
		orientation: 'vertical',
		truncateLine: false,
		tag: 'div'
	})

	const { filterProps } = useProps<ITimelineProps>(props)

	const orientation = computed(() => props.orientation ?? 'vertical')

	/*********************************************************
	 * Composables
	 ********************************************************/

	const { densityClasses } = useDensity(props)
	const { sizeClasses } = useSize(props)

	// Provide context to nested OrigamTimelineItem children — `orientation`
	// is exposed too so an item dropped manually in the slot picks up the
	// parent layout direction without having to pass the prop explicitly.
	provide(TIMELINE_CONTEXT_KEY, {
		get side() { return props.side ?? 'start' },
		get truncateLine() { return props.truncateLine ?? false },
		get orientation() { return orientation.value },
		get color() {
			const c = props.color
			return typeof c === 'string' ? c : undefined
		}
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/

	const timelineClasses = computed(() => [
		'origam-timeline',
		`origam-timeline--orientation-${orientation.value}`,
		{
			[`origam-timeline--side-${props.side}`]: !!props.side,
			'origam-timeline--truncate-line': props.truncateLine
		},
		densityClasses.value,
		sizeClasses.value,
		props.class
	])

	const timelineStyles = computed(() => [
		props.style
	] as StyleValue)
	const {id, css, load, isLoaded, unload} = useStyle(timelineStyles)


	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({ filterProps,
		css,
		id,
		load,
		unload,
		isLoaded
	})
</script>

<style lang="scss" scoped>
	.origam-timeline {
		display: flex;
		flex-direction: column;
		background-color: var(--origam-timeline---background-color, var(--origam-color__surface---default));
		color: var(--origam-timeline---color, var(--origam-color__text---primary));
		padding-block: var(--origam-timeline---padding-block, 8px);
		padding-inline: var(--origam-timeline---padding-inline, 16px);

		// ── Size variants ────────────────────────────────────────────
		// Each tier scales the dot, the track width, the gap between
		// adjacent items, and both title / subtitle font-sizes. Token
		// values are inherited by descendants (OrigamTimelineItem) via
		// CSS custom-property cascade.
		&--size-x-small {
			--origam-timeline---dot-size: 8px;
			--origam-timeline---track-width: 16px;
			--origam-timeline---gap: 8px;
			--origam-timeline---title-font-size: 0.75rem;
			--origam-timeline---subtitle-font-size: 0.625rem;
		}

		&--size-small {
			--origam-timeline---dot-size: 10px;
			--origam-timeline---track-width: 20px;
			--origam-timeline---gap: 10px;
			--origam-timeline---title-font-size: 0.8125rem;
			--origam-timeline---subtitle-font-size: 0.6875rem;
		}

		&--size-default {
			--origam-timeline---dot-size: 12px;
			--origam-timeline---track-width: 24px;
			--origam-timeline---gap: 14px;
			--origam-timeline---title-font-size: 0.875rem;
			--origam-timeline---subtitle-font-size: 0.75rem;
		}

		&--size-large {
			--origam-timeline---dot-size: 16px;
			--origam-timeline---track-width: 32px;
			--origam-timeline---gap: 18px;
			--origam-timeline---title-font-size: 1rem;
			--origam-timeline---subtitle-font-size: 0.8125rem;
		}

		&--size-x-large {
			--origam-timeline---dot-size: 20px;
			--origam-timeline---track-width: 40px;
			--origam-timeline---gap: 22px;
			--origam-timeline---title-font-size: 1.125rem;
			--origam-timeline---subtitle-font-size: 0.875rem;
		}

		// ── Orientation: vertical (default) ──────────────────────────
		&--orientation-vertical {
			flex-direction: column;
		}

		// ── Orientation: horizontal ──────────────────────────────────
		// Wraps items inside a scroll-snapping track so the user can
		// navigate point-to-point with a swipe / scroll / arrow keys.
		// Each item lays out as a column (dot on top, content below).
		&--orientation-horizontal {
			flex-direction: row;
			overflow: hidden;

			.origam-timeline__track-wrapper {
				display: flex;
				flex-direction: row;
				align-items: flex-start;
				gap: 0;
				overflow-x: auto;
				overflow-y: hidden;
				scroll-snap-type: x mandatory;
				scroll-behavior: smooth;
				width: 100%;
				padding-block: var(--origam-timeline---padding-block, 8px);

				// Hide the scrollbar — the dots + their connectors are
				// enough of a progress affordance.
				scrollbar-width: none;

				&::-webkit-scrollbar {
					display: none;
				}
			}
		}
	}
</style>
