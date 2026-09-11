<template>
	<component
			:is="tag"
			:ref="rootEl"
			:class="sheetClasses"
			:style="sheetStyles"
			@click="onActive"
			@mouseenter="onMouseenter"
			@mouseleave="onMouseleave"
	>
		<div
				v-if="showHandle"
				ref="handleEl"
				class="origam-sheet__handle"
				role="button"
				tabindex="0"
				aria-label="Drag handle"
				data-cy="sheet-bottom-handle"
				@keydown.enter.prevent="onActive"
				@keydown.space.prevent="onActive"
		>
			<span class="origam-sheet__handle-pill"/>
		</div>

		<slot name="default"/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, type Ref, ref, StyleValue, toRef, watch } from 'vue'
	import {
		useActive,
		useBothColor,
		useDimension,
		useHover,
		useLocation,
		usePosition,
		useProps,
		useSheetSwipe,
		useStateEffect,
		useStyle
} from '../../composables'

	import type { ISheetProps} from "../../interfaces"

	import type { ISheetEmits } from '../../interfaces/Sheet/sheet-emits.interface'

	import type { TColor, TSheetSnapId, TSheetSnapPoint } from "../../types"

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<ISheetProps>(), {
		tag: 'div',
		swipeable: false,
		side: undefined,
		defaultSnap: 'half',
		open: undefined,
		disabled: false,
		persistent: false
	})

	const emit = defineEmits<ISheetEmits>()

	const {filterProps} = useProps<ISheetProps>(props)

	// Phase 3 (Vague C) — class-first companion alongside inline styles.
	// `colorClasses` ships `.origam--bg-{intent}` / `.origam--color-{intent}`
	// for tokenised intents; `colorStyles` keeps the legacy raw-color
	// fallback. Both are wired in parallel (strategy "a") so consumers
	// transitioning from hex to intents never see a regression.
	/*********************************************************
	 * Composables
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(
		toRef(props, 'bgColor') as Ref<TColor | undefined>,
		toRef(props, 'color') as Ref<TColor | undefined>
	)
	const {isHover, hoverState, hoverClasses, onMouseenter, onMouseleave} = useHover(props)
	const {isActive, activeState, activeClasses, onActive} = useActive(props)
	const {
		borderClasses, borderStyles,
		roundedClasses, roundedStyles,
		elevationClasses, elevationStyles,
		paddingClasses, paddingStyles,
		marginClasses, marginStyles,
	} = useStateEffect(props, isHover, isActive, hoverState, activeState)
	const {dimensionStyles} = useDimension(props)
	const {locationStyles} = useLocation(props)
	const {positionClasses} = usePosition(props)

	// ───────────────────────── swipe gesture ────────────────────────────

	const rootEl = ref<HTMLElement | null>(null)

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleEl = ref<HTMLElement | null>(null)

	/**
	 * The default snap-point preset is mirrored from the composable so
	 * consumers can pass a partial array without losing the rest. We
	 * accept the prop verbatim when present.
	 */
	const DEFAULT_SNAP_POINTS: ReadonlyArray<TSheetSnapPoint> = [
		{ id: 'closed', height: 0 },
		{ id: 'peek',   height: '120px' },
		{ id: 'half',   height: '50vh' },
		{ id: 'full',   height: '90vh' }
	]

	const swipeEnabled = computed(() => props.swipeable && props.side === 'bottom')
	const showHandle = computed(() => swipeEnabled.value)

	const snapPointsRef = computed(() => props.snapPoints ?? DEFAULT_SNAP_POINTS)
	const defaultSnapRef = computed<TSheetSnapId>(() => props.defaultSnap ?? 'half')
	const disabledRef = computed(() => props.disabled || !swipeEnabled.value)
	const persistentRef = computed(() => !!props.persistent)

	// `useSheetSwipe` mounts pointer listeners regardless — we gate
	// activation via `disabled`. This avoids re-instantiating the
	// composable when the user toggles `swipeable` at runtime.
	const {
		currentSnap,
		dragOffset,
		isDragging,
		currentSnapHeight,
		snapTo
	} = useSheetSwipe({
		el: rootEl,
		handle: handleEl,
		snapPoints: snapPointsRef,
		defaultSnap: defaultSnapRef,
		disabled: disabledRef,
		persistent: persistentRef
	})

	// Sync v-model:open ↔ snap-point semantics:
	// - external `:open=false` → snapTo('closed')
	// - external `:open=true`  → snapTo(defaultSnap) when currently closed
	watch(() => props.open, (next) => {
		if (next === undefined || !swipeEnabled.value) return
		if (next === false && currentSnap.value !== 'closed') {
			snapTo('closed')
		} else if (next === true && currentSnap.value === 'closed') {
			snapTo(defaultSnapRef.value)
		}
	}, {immediate: true})

	watch(currentSnap, (next, prev) => {
		emit('update:snap', next)
		const wasClosed = prev === 'closed'
		const isClosed = next === 'closed'
		if (wasClosed !== isClosed) {
			emit('update:open', !isClosed)
		}
	})

	// ───────────────────────── classes & styles ─────────────────────────

	/**
	 * Inline gesture styles applied only when the swipe is active. We
	 * intentionally keep the rest of the height/transform contract in
	 * the SCSS block — calc()-based defaults and CSS variables stay
	 * consumer-overridable, while the live values during a drag are
	 * driven from JS to track the pointer pixel-perfectly.
	 */
	const swipeStyles = computed(() => {
		if (!swipeEnabled.value) return {}
		// Sheet's effective height = current snap height + live drag
		// offset (capped to the largest snap so the user can't pull it
		// off-screen at the top).
		const maxHeight = Math.max(...snapPointsRef.value.map((s) => {
			const h = s.height
			if (typeof h === 'number') return h
			const m = String(h).match(/^([\d.]+)(px|vh|vw|%|rem|em)?$/i)
			if (!m) return 0
			const num = parseFloat(m[1])
			const unit = (m[2] ?? 'px').toLowerCase()
			if (typeof window === 'undefined') return num
			if (unit === 'vh' || unit === '%') return (window.innerHeight * num) / 100
			if (unit === 'vw') return (window.innerWidth * num) / 100
			return num
		}))
		const liveHeight = isDragging.value
			? Math.min(maxHeight, Math.max(0, currentSnapHeight.value + dragOffset.value))
			: currentSnapHeight.value
		return {
			'--origam-sheet---swipe-height': `${liveHeight}px`,
			'transition': isDragging.value ? 'none' : 'height 200ms ease'
		}
	})

	const sheetStyles = computed(() => {
		return [
			dimensionStyles.value,
			locationStyles.value,
			roundedStyles.value,
			elevationStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			colorStyles.value,
			swipeStyles.value,
			props.style
		] as StyleValue
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/

	const sheetClasses = computed(() => {
		return [
			'origam-sheet',
			colorClasses.value,
			elevationClasses.value,
			positionClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			roundedClasses.value,
			hoverClasses.value,
			activeClasses.value,
			swipeEnabled.value && 'origam-sheet--swipeable',
			swipeEnabled.value && `origam-sheet--side-${props.side}`,
			swipeEnabled.value && `origam-sheet--snap-${currentSnap.value}`,
			isDragging.value && 'origam-sheet--dragging',
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(sheetStyles)


	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		filterProps,
		// Imperative gesture handles for advanced consumers (test hooks,
		// programmatic open/close from Dialog wrappers, …).
		snapTo,
		currentSnap,
		isDragging,
		css,
		id,
		load,
		unload,
		isLoaded
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-sheet {
		position: var(--origam-sheet---position);
		display: var(--origam-sheet---display);
		box-sizing: var(--origam-sheet---box-sizing);

		border-color: var(--origam-sheet---border-color);
		border-style: var(--origam-sheet---border-style);
		border-top-width: var(--origam-sheet---border-top-width, var(--origam-sheet---border-width, 0));
		border-right-width: var(--origam-sheet---border-right-width, var(--origam-sheet---border-width, 0));
		border-bottom-width: var(--origam-sheet---border-bottom-width, var(--origam-sheet---border-width, 0));
		border-left-width: var(--origam-sheet---border-left-width, var(--origam-sheet---border-width, 0));
		border-radius: var(--origam-sheet---border-radius);

		width: var(--origam-sheet---width);
		max-width: var(--origam-sheet---max-width);
		min-width: var(--origam-sheet---min-width);
		height: var(--origam-sheet---height);
		max-height: var(--origam-sheet---max-height);
		min-height: var(--origam-sheet---min-height);

		padding-block-start: var(--origam-sheet---padding-block-start);
		padding-block-end: var(--origam-sheet---padding-block-end);
		padding-inline-start: var(--origam-sheet---padding-inline-start);
		padding-inline-end: var(--origam-sheet---padding-inline-end);

		margin-block-start: var(--origam-sheet---margin-block-start);
		margin-block-end: var(--origam-sheet---margin-block-end);
		margin-inline-start: var(--origam-sheet---margin-inline-start);
		margin-inline-end: var(--origam-sheet---margin-inline-end);

		background: var(--origam-sheet---background);
		backdrop-filter: var(--origam-sheet---backdrop-filter, none);
		-webkit-backdrop-filter: var(--origam-sheet---backdrop-filter, none);
		box-shadow: var(--origam-sheet---box-shadow);
		color: var(--origam-sheet---color);

		&--border {
			--origam-sheet---border-top-width: var(--origam-border__width---thin, 1px);
			--origam-sheet---border-right-width: var(--origam-border__width---thin, 1px);
			--origam-sheet---border-bottom-width: var(--origam-border__width---thin, 1px);
			--origam-sheet---border-left-width: var(--origam-border__width---thin, 1px);
			box-shadow: var(--origam-sheet--border---box-shadow, var(--origam-sheet---box-shadow));
		}

		&--rounded {
			--origam-sheet---border-radius: var(--origam-sheet--rounded---border-radius, var(--origam-radius---2xl, 24px));
		}

		&--rounded-x-small {
			--origam-sheet---border-radius: var(--origam-radius---xs, 2px);
		}

		&--rounded-small {
			--origam-sheet---border-radius: var(--origam-radius---sm, 4px);
		}

		&--rounded-default {
			--origam-sheet---border-radius: var(--origam-radius---md, 8px);
		}

		&--rounded-medium {
			--origam-sheet---border-radius: var(--origam-radius---lg, 12px);
		}

		&--rounded-large {
			--origam-sheet---border-radius: var(--origam-radius---xl, 16px);
		}

		&--rounded-x-large {
			--origam-sheet---border-radius: var(--origam-radius---2xl, 24px);
		}

		&--rounded-shaped {
			border-start-start-radius: var(--origam-sheet---border-radius-rounded, 16px);
			border-start-end-radius: 0;
			border-end-start-radius: 0;
			border-end-end-radius: var(--origam-sheet---border-radius-rounded, 16px);
		}

		&--rounded-shaped-invert {
			border-start-start-radius: 0;
			border-start-end-radius: var(--origam-sheet---border-radius-rounded, 16px);
			border-end-start-radius: var(--origam-sheet---border-radius-rounded, 16px);
			border-end-end-radius: 0;
		}

		&--absolute {
			--origam-sheet---position: absolute;
		}

		&--fixed {
			--origam-sheet---position: fixed;
		}

		&--relative {
			--origam-sheet---position: relative;
		}

		&--sticky {
			--origam-sheet---position: sticky;
		}

		&--swipeable {
			--origam-sheet---position: absolute;
			--origam-sheet---width: 100%;
			--origam-sheet---max-width: 100%;
			--origam-sheet---height: var(--origam-sheet---swipe-height, 0px);
			--origam-sheet---max-height: 100%;
			--origam-sheet---border-radius: var(--origam-sheet__swipeable---border-radius, var(--origam-radius---2xl, 24px));
			border-end-start-radius: 0;
			border-end-end-radius: 0;
			overflow: hidden;
		}

		&--side-bottom {
			left: 0;
			right: 0;
			bottom: 0;
		}

		&--dragging {
			transition: none !important;
		}

		&__handle {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			padding-block: var(--origam-sheet__handle---margin-block, 8px);
			cursor: grab;
			touch-action: none;
			user-select: none;
		}

		&--dragging &__handle {
			cursor: grabbing;
		}

		&__handle-pill {
			display: block;
			width: var(--origam-sheet__handle---width, 32px);
			height: var(--origam-sheet__handle---height, 4px);
			background-color: var(--origam-sheet__handle---color, var(--origam-color__border---subtle));
			border-radius: var(--origam-sheet__handle---border-radius, var(--origam-radius---full, 9999px));
		}
	}
</style>

