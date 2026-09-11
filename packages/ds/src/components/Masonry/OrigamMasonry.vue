<template>
	<component
			:is="tag"
			ref="rootEl"
			role="list"
			:class="masonryClasses"
			:style="masonryStyles"
	>
		<template v-if="useCssPath">
			<slot/>
		</template>
		<template v-else>
			<div
					v-for="(child, idx) in childrenVNodes"
					:key="child?.key ?? idx"
					:ref="(el) => bindItemRef(idx, el)"
					class="origam-masonry__item"
					role="listitem"
					:style="getItemStyle(idx)"
			>
				<component
						:is="{ render: () => child }"
				/>
			</div>
		</template>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import {
		computed,
		onMounted,
		ref,
		StyleValue,
		toRef,
		useSlots,
		watch
	} from 'vue'

	import {
		useBorder,
		useBothColor,
		useCssSupport,
		useDimension,
		useElevation,
		useMargin,
		useMasonry,
		usePadding,
		useProps,
		useRounded
	} from '../../composables'

	import { GRID_GAP_SIZE_VAR } from '../../consts'

	import type { IMasonryProps } from '../../interfaces'

	import type { TGridGapSize } from '../../types'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props + defaults for `<OrigamMasonry>`. The component decides at
	 * mount time between a CSS-only path (when `grid-template-rows: masonry`
	 * is supported AND `align === 'top'`) and a JS bucket-fill fallback
	 * driven by `useMasonry`. The runtime branch is invisible to the
	 * consumer.
	 ********************************************************/
	const props = withDefaults(defineProps<IMasonryProps>(), {
		tag: 'div',
		columns: 3,
		gap: 'md',
		animated: true,
		align: 'top',
		columnBreakpoints: undefined
	})

	const {filterProps} = useProps<IMasonryProps>(props)

	const slots = useSlots()
	const rootEl = ref<HTMLElement | null>(null)

	/*********************************************************
	 * CSS support gate
	 *
	 * @description
	 * `grid-template-rows: masonry` is currently behind a flag in Firefox
	 * (about:config layout.css.grid-template-masonry-value.enabled) and
	 * shipping experimentally in Chrome 117+ under the
	 * `enable-experimental-web-platform-features` flag. We detect support
	 * at runtime via the central registry. When unavailable, we render
	 * the JS bucket-fill path instead. `align: 'center'` is not
	 * expressible in the CSS path either, so we force the JS path in
	 * that case.
	 ********************************************************/
	const { css } = useCssSupport()
	const supportsCssMasonry = computed(() =>
		css.value.masonry && props.align === 'top'
	)

	/*********************************************************
	 * Gap serialisation (token / number / raw CSS)
	 *
	 * @description
	 * Reuses the `GRID_GAP_SIZE_VAR` map for visual parity with
	 * `<OrigamGrid>`. Numbers become px; arbitrary strings pass through.
	 * The result is consumed both by the CSS `gap` declaration AND by the
	 * JS bucket-fill (which needs a numeric pixel value).
	 ********************************************************/
	const serialiseGap = (value: TGridGapSize | string | number | undefined): string => {
		if (value == null) return GRID_GAP_SIZE_VAR.md
		if (typeof value === 'number') {
			if (!Number.isFinite(value)) return GRID_GAP_SIZE_VAR.md
			return `${value}px`
		}
		if (typeof value === 'string') {
			if (value in GRID_GAP_SIZE_VAR) return GRID_GAP_SIZE_VAR[value as TGridGapSize]
			return value
		}
		return GRID_GAP_SIZE_VAR.md
	}

	const gapCss = computed<string>(() => serialiseGap(props.gap))

	/*********************************************************
	 * Numeric gap for the JS fallback
	 *
	 * @description
	 * The bucket-fill algo needs a concrete px value. We read the
	 * resolved computed style at mount + on every prop change. SSR-safe
	 * — defaults to 16 px if we can't reach the DOM yet.
	 ********************************************************/
	const gapPx = ref(16)
	const resolveGapPx = () => {
		const el = rootEl.value
		if (!el) return
		// Read the painted value rather than the raw token so we honour
		// theme overrides (a brand theme might pump the gap up).
		const v = getComputedStyle(el).getPropertyValue('--origam-masonry---resolved-gap').trim()
		const numeric = parseFloat(v)
		if (Number.isFinite(numeric)) gapPx.value = numeric
	}

	/*********************************************************
	 * useMasonry — JS bucket-fill
	 *
	 * @description
	 * Always instantiated so the composable's lifecycle hooks fire in a
	 * predictable order. When `supportsCssMasonry` is true the layout
	 * data is computed but the template ignores it (the CSS path takes
	 * over). The cost of running the algo on a non-CSS-masonry browser
	 * is one pass per resize, well within frame budget for <200 items.
	 ********************************************************/
	const { containerRef, setItem, layout, relayout } = useMasonry({
		columnsRef: toRef(props, 'columns'),
		gapRef: gapPx,
		breakpointsRef: toRef(props, 'columnBreakpoints'),
		alignRef: toRef(props, 'align')
	})

	// Bridge the composable's containerRef to our own template ref so we
	// can read `rootEl` in this component (gap resolution) AND the
	// composable observes the same element.
	onMounted(() => {
		containerRef.value = rootEl.value
		resolveGapPx()
		// Defer the first relayout one tick so resolveGapPx applies.
		requestAnimationFrame(() => relayout())
	})

	// Re-resolve gap when the prop changes (token rename, raw value).
	watch(() => props.gap, () => {
		// Microtask: the CSS var is already updated synchronously, but
		// `getComputedStyle` reads through layout — one frame is safer.
		requestAnimationFrame(resolveGapPx)
	})

	/*********************************************************
	 * Slot extraction (JS path only)
	 *
	 * @description
	 * The bucket-fill path needs to wrap each child in a positioned
	 * container. We pull the default slot's vnodes, filter out
	 * whitespace-only text nodes (Vue inserts them between elements in
	 * the source template), and render each into a positioned wrapper.
	 ********************************************************/
	const childrenVNodes = computed(() => {
		const raw = slots.default?.() ?? []
		const out: any[] = []
		const visit = (nodes: any[]): void => {
			for (const node of nodes) {
				// Fragment vnodes (e.g. produced by `v-for` inside the slot)
				// have a `Symbol` `type` AND an `Array` `children` payload.
				// We unwrap them recursively so the masonry layout sees the
				// actual leaf elements rather than discarding the fragment.
				if (typeof node.type === 'symbol' && Array.isArray(node.children)) {
					visit(node.children)
					continue
				}
				// Comment / whitespace text nodes carry no visible content —
				// drop them so they don't claim a column slot.
				if (typeof node.type === 'symbol') continue
				if (typeof node.children === 'string' && node.children.trim() === '') continue
				out.push(node)
			}
		}
		visit(raw)
		return out
	})

	/*********************************************************
	 * Per-item style binding (JS path)
	 *
	 * @description
	 * Reads from `layout.value.items` by index. Until the first measure
	 * pass returns data, we hide items (visibility: hidden) so the
	 * un-positioned flow doesn't flash. Once positioned, we toggle them
	 * back on.
	 ********************************************************/
	const getItemStyle = (idx: number): StyleValue => {
		const item = layout.value.items[idx]
		if (!item) {
			return {
				position: 'absolute',
				visibility: 'hidden',
				left: '0px',
				top: '0px'
			}
		}
		return {
			position: 'absolute',
			visibility: 'visible',
			left: `${item.left}px`,
			top: `${item.top}px`,
			width: `${item.width}px`
		}
	}

	const bindItemRef = (idx: number, el: any) => {
		setItem(idx, el && (el as HTMLElement).nodeType === 1 ? (el as HTMLElement) : null)
	}

	/*********************************************************
	 * Composables
	 ********************************************************/
	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))
	const {borderClasses, borderStyles} = useBorder(props)
	const {roundedClasses, roundedStyles} = useRounded(props)
	const {elevationClasses} = useElevation(props)
	const {dimensionStyles} = useDimension(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)

	/*********************************************************
	 * Container CSS (both paths)
	 *
	 * @description
	 * - CSS path: emits `--origam-masonry---template-columns` + relies on
	 *   `grid-template-rows: masonry`.
	 * - JS path: emits `--origam-masonry---container-height` so the
	 *   absolute-positioned children don't collapse the container.
	 *
	 * `--origam-masonry---resolved-gap` is the bridge between the CSS
	 * variable system (where tokens live) and the JS measurer.
	 ********************************************************/
	const useCssPath = computed(() => supportsCssMasonry.value)

	const masonryStyles = computed<StyleValue>(() => {
		const style: Record<string, string> = {
			'--origam-masonry---resolved-gap': gapCss.value
		}
		if (useCssPath.value) {
			style['--origam-masonry---template-columns'] = `repeat(${Math.max(1, Math.floor(props.columns))}, 1fr)`
		} else {
			style['--origam-masonry---container-height'] = `${layout.value.containerHeight}px`
		}
		return [
			style,
			colorStyles.value,
			borderStyles.value,
			roundedStyles.value,
			dimensionStyles.value,
			paddingStyles.value,
			marginStyles.value,
			props.style
		] as StyleValue
	})

	const masonryClasses = computed(() => {
		return [
			'origam-masonry',
			{
				'origam-masonry--css': useCssPath.value,
				'origam-masonry--js': !useCssPath.value,
				'origam-masonry--animated': props.animated
			},
			colorClasses.value,
			borderClasses.value,
			roundedClasses.value,
			elevationClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		filterProps,
		layout,
		relayout,
		useCssPath,
		gapPx
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-masonry {
		--origam-masonry---transition-duration: var(--origam-masonry---animation-duration, 200ms);
		--origam-masonry---transition-easing: var(--origam-masonry---animation-easing, ease);

		box-sizing: border-box;
		gap: var(--origam-masonry---resolved-gap);

		&--css {
			display: grid;
			grid-template-columns: var(--origam-masonry---template-columns, repeat(3, 1fr));
			grid-template-rows: masonry;
			align-tracks: start;
		}

		&--js {
			position: relative;
			display: block;
			height: var(--origam-masonry---container-height, auto);
		}

		&__item {
			box-sizing: border-box;
		}

		&--animated.origam-masonry--js .origam-masonry__item {
			transition: transform var(--origam-masonry---transition-duration) var(--origam-masonry---transition-easing),
						top var(--origam-masonry---transition-duration) var(--origam-masonry---transition-easing),
						left var(--origam-masonry---transition-duration) var(--origam-masonry---transition-easing),
						width var(--origam-masonry---transition-duration) var(--origam-masonry---transition-easing);
		}

		&--animated.origam-masonry--css {
			transition: grid-template-columns var(--origam-masonry---transition-duration) var(--origam-masonry---transition-easing);
		}

		@media (prefers-reduced-motion: reduce) {
			&--animated.origam-masonry--js .origam-masonry__item,
			&--animated.origam-masonry--css {
				transition: none;
			}
		}
	}
</style>
