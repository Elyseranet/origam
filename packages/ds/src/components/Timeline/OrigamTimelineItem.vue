<template>
	<div :class="itemClasses" :style="itemStyles" role="listitem">
		<div class="origam-timeline-item__track" aria-hidden="true">
			<div class="origam-timeline-item__dot" :style="dotStyles">
				<slot name="dot">
					<origam-icon
						v-if="icon"
						:icon="icon"
						:size="10"
					/>
				</slot>
			</div>
			<span
				v-if="showConnector"
				class="origam-timeline-item__connector"
				:style="connectorStyles"
			/>
		</div>

		<div class="origam-timeline-item__content">
			<slot name="default">
				<div class="origam-timeline-item__header">
					<span
						v-if="title"
						class="origam-timeline-item__title"
					>{{ title }}</span>
					<span
						v-if="subtitle"
						class="origam-timeline-item__subtitle"
					>{{ subtitle }}</span>
				</div>
				<div
					v-if="$slots.body || description"
					class="origam-timeline-item__body"
				>
					<slot name="body">{{ description }}</slot>
				</div>
			</slot>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { computed, inject } from 'vue'
	import type { StyleValue } from 'vue'

	import { OrigamIcon } from '../../components'
	import {
	useDensity,
	useProps,
	useSize,
	useStyle
} from '../../composables'
	import type { ITimelineItemProps } from '../../interfaces'

	import { TIMELINE_CONTEXT_KEY } from '../../consts'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<ITimelineItemProps & { description?: string }>(), {
		side: 'start',
		orientation: 'vertical',
		isLast: false,
		truncateLine: false,
		index: 0,
		description: undefined
	})

	// Inject parent context if nested in OrigamTimeline
	const timelineCtx = inject(TIMELINE_CONTEXT_KEY, null)

	const { filterProps } = useProps<ITimelineItemProps>(props)
	/*********************************************************
	 * Composables
	 ********************************************************/

	const { densityClasses } = useDensity(props)
	const { sizeClasses } = useSize(props)

	const effectiveSide = computed(() => {
		if (timelineCtx?.side) return timelineCtx.side
		return props.side
	})

	const effectiveOrientation = computed(() => {
		if (timelineCtx?.orientation) return timelineCtx.orientation
		return props.orientation ?? 'vertical'
	})

	const effectiveTruncateLine = computed(() => {
		if (timelineCtx?.truncateLine !== undefined) return timelineCtx.truncateLine
		return props.truncateLine
	})

	const showConnector = computed(() => {
		if (effectiveTruncateLine.value && props.isLast) return false
		return true
	})

	// Resolve which intent to use for the dot
	const resolvedIntent = computed(() => props.intent ?? timelineCtx?.color ?? 'primary')

	const dotStyles = computed(() => {
		const intent = resolvedIntent.value
		const intentBg = intentToBgToken(intent)
		const intentFg = intentToFgToken(intent)
		return {
			'--origam-timeline-item---dot-bg': intentBg,
			'--origam-timeline-item---dot-color': intentFg
		}
	})

	const connectorStyles = computed(() => {
		// In horizontal layout the connector is a horizontal bar — its
		// "thickness" becomes the height, and the width fills the
		// available space. In vertical layout (legacy default) it's a
		// thin vertical bar.
		const isH = effectiveOrientation.value === 'horizontal'
		return {
			'background-color': 'var(--origam-timeline---connector-color, var(--origam-color__border---subtle))',
			[isH ? 'height' : 'width']: 'var(--origam-timeline---connector-thickness, var(--origam-border__width---thin, 1px))'
		}
	})

	function intentToBgToken(intent: string): string {
		if (intent === 'primary' || intent === 'secondary' || intent === 'ghost' || intent === 'neutral') {
			return `var(--origam-color__action--${intent}---bg, var(--origam-color__action--primary---bg))`
		}
		if (intent === 'success' || intent === 'warning' || intent === 'danger' || intent === 'info') {
			return `var(--origam-color__feedback--${intent}---bg)`
		}
		return 'var(--origam-color__action--primary---bg)'
	}

	function intentToFgToken(intent: string): string {
		if (intent === 'primary' || intent === 'secondary' || intent === 'ghost' || intent === 'neutral') {
			return `var(--origam-color__action--${intent}---fg, var(--origam-color__action--primary---fg))`
		}
		if (intent === 'success' || intent === 'warning' || intent === 'danger' || intent === 'info') {
			return `var(--origam-color__feedback--${intent}---fg)`
		}
		return 'var(--origam-color__action--primary---fg)'
	}

	const contentSide = computed(() => {
		const side = effectiveSide.value
		if (side === 'alternating') {
			return props.index % 2 === 0 ? 'start' : 'end'
		}
		return side
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/

	const itemClasses = computed(() => [
		'origam-timeline-item',
		`origam-timeline-item--orientation-${effectiveOrientation.value}`,
		{
			'origam-timeline-item--side-start': effectiveSide.value === 'start' || contentSide.value === 'start',
			'origam-timeline-item--side-end': effectiveSide.value === 'end' || contentSide.value === 'end',
			'origam-timeline-item--alternating': effectiveSide.value === 'alternating',
			'origam-timeline-item--content-end': contentSide.value === 'end',
			'origam-timeline-item--last': props.isLast
		},
		densityClasses.value,
		sizeClasses.value,
		props.class
	])

	const itemStyles = computed(() => [
		props.style
	] as StyleValue)
	const {id, css, load, isLoaded, unload} = useStyle(itemStyles)


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
	.origam-timeline-item {
		$this: &;

		display: flex;
		flex-direction: row;
		gap: var(--origam-timeline---gap, 14px);
		position: relative;

		&__track {
			display: flex;
			flex-direction: column;
			align-items: center;
			flex-shrink: 0;
			width: var(--origam-timeline---track-width, 24px);
			position: relative;
		}

		&__dot {
			width: var(--origam-timeline---dot-size, 12px);
			height: var(--origam-timeline---dot-size, 12px);
			border-radius: 50%;
			background-color: var(--origam-timeline-item---dot-bg, var(--origam-timeline---dot-bg, var(--origam-color__action--primary---bg)));
			color: var(--origam-timeline-item---dot-color, var(--origam-timeline---dot-color, var(--origam-color__action--primary---fg)));
			border: var(--origam-timeline---dot-border-width, 2px) solid var(--origam-timeline---dot-border-color, var(--origam-color__surface---default));
			flex-shrink: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 0 0 1px var(--origam-color__border---default, var(--origam-color__border---subtle));
			z-index: 1;
			position: relative;
		}

		&__connector {
			flex: 1;
			min-height: 16px;
			width: var(--origam-timeline---connector-thickness, 1px);
			background-color: var(--origam-timeline---connector-color, var(--origam-color__border---subtle));
			margin-top: 4px;
			display: block;
		}

		&__content {
			flex: 1;
			padding-bottom: var(--origam-timeline---gap, 14px);
			padding-top: 0;
		}

		// ── Horizontal orientation ────────────────────────────────────
		// Each item becomes a column (dot on top + content below). The
		// connector runs horizontally to the next dot. `scroll-snap-align`
		// pins each dot to the start of the scroll viewport so the user
		// can navigate point-to-point.
		&--orientation-horizontal {
			flex-direction: column;
			gap: var(--origam-timeline---gap, 14px);
			flex-shrink: 0;
			min-width: var(--origam-timeline-item---min-width, 160px);
			max-width: var(--origam-timeline-item---max-width, 240px);
			scroll-snap-align: start;
			scroll-snap-stop: always;

			#{$this}__track {
				flex-direction: row;
				align-items: center;
				width: 100%;
				height: var(--origam-timeline---track-width, 24px);
			}

			#{$this}__connector {
				flex: 1;
				min-height: 0;
				min-width: 16px;
				width: auto;
				height: var(--origam-timeline---connector-thickness, 1px);
				margin-top: 0;
				margin-left: 4px;
			}

			#{$this}__content {
				flex: none;
				padding-bottom: 0;
				padding-top: 0;
				text-align: start;
			}

			#{$this}__header {
				flex-direction: column;
				align-items: flex-start;
				gap: 2px;
			}

			&#{$this}--last {
				min-width: var(--origam-timeline---dot-size, 12px);
				flex-shrink: 1;

				#{$this}__connector {
					display: none;
				}
			}
		}

		&__header {
			display: flex;
			align-items: baseline;
			flex-wrap: wrap;
			gap: 6px;
		}

		&__title {
			font-size: var(--origam-timeline---title-font-size, var(--origam-font__size---md, 0.875rem));
			font-weight: var(--origam-timeline---title-font-weight, var(--origam-font__weight---semibold, 600));
			font-family: var(--origam-font__family---mono, monospace);
			color: var(--origam-timeline---color, var(--origam-color__text---primary));
			line-height: 1.4;
		}

		&__subtitle {
			font-size: var(--origam-timeline---subtitle-font-size, var(--origam-font__size---sm, 0.75rem));
			color: var(--origam-timeline---subtitle-color, var(--origam-color__text---secondary));
			line-height: 1.4;
		}

		&__body {
			font-size: var(--origam-timeline---subtitle-font-size, var(--origam-font__size---sm, 0.75rem));
			color: var(--origam-timeline---subtitle-color, var(--origam-color__text---secondary));
			margin-top: 4px;
			line-height: 1.5;
		}

		&--content-end {
			flex-direction: row-reverse;

			.origam-timeline-item__content {
				text-align: end;
			}

			.origam-timeline-item__header {
				flex-direction: row-reverse;
			}
		}

		&--last {
			.origam-timeline-item__content {
				padding-bottom: 0;
			}
		}
	}
</style>
