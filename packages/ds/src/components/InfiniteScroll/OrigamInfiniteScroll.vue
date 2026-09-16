<template>
	<component
			:is="tag"
			:id="id"
			ref="rootEl"
			:class="infiniteScrollClasses"
			:style="infiniteScrollStyles"
	>
		<div class="origam-infinite-scroll__side" role="status" aria-live="polite" :style="typographyStyles">
			<template v-if="hasStartIntersect">
				<slot
						name="error"
						v-bind="{side: INFINITE_SCROLL_SIDE.START, props: { onClick: () => intersecting(INFINITE_SCROLL_SIDE.START), color }}"
				/>

				<slot
						name="empty"
						v-bind="{side: INFINITE_SCROLL_SIDE.START, props: { onClick: () => intersecting(INFINITE_SCROLL_SIDE.START), color }}"
				>
					<span>{{ t(emptyText) }}</span>
				</slot>

				<template v-if="isManualMode">
					<template v-if="isLoading">
						<slot
								name="loading"
								v-bind="{side: INFINITE_SCROLL_SIDE.START, props: { onClick: () => intersecting(INFINITE_SCROLL_SIDE.START), color }}"
						>
							<origam-progress
									:color="color"
									:type="PROGRESS_TYPE.CIRCULAR"
									indeterminate
							/>
						</slot>
					</template>

					<slot
							name="loadMore"
							v-bind="{side: INFINITE_SCROLL_SIDE.START, props: { onClick: () => intersecting(INFINITE_SCROLL_SIDE.START), color }}"
					>
						<origam-btn
								:color="color"
								:text="t(loadMoreText)"
								@click="intersecting(INFINITE_SCROLL_SIDE.START)"
						/>
					</slot>
				</template>
			</template>
		</div>

		<template v-if="rootEl && hasStartIntersect && isIntersectMode">
			<origam-infinite-scroll-intersect
					:key="INFINITE_SCROLL_SIDE.START"
					:margin="margin"
					:root-ref="rootEl"
					:side="INFINITE_SCROLL_SIDE.START"
					@intersect="handleIntersect"
			/>
		</template>

		<slot name="default"/>

		<template v-if="rootEl && hasEndIntersect && isIntersectMode">
			<origam-infinite-scroll-intersect
					:key="INFINITE_SCROLL_SIDE.END"
					:margin="margin"
					:root-ref="rootEl"
					:side="INFINITE_SCROLL_SIDE.END"
					@intersect="handleIntersect"
			/>
		</template>

		<div class="origam-infinite-scroll__side" role="status" aria-live="polite" :style="typographyStyles">
			<template v-if="hasEndIntersect">
				<slot
						name="error"
						v-bind="{side: INFINITE_SCROLL_SIDE.END, props: { onClick: () => intersecting(INFINITE_SCROLL_SIDE.END), color }}"
				/>

				<slot
						name="empty"
						v-bind="{side: INFINITE_SCROLL_SIDE.END, props: { onClick: () => intersecting(INFINITE_SCROLL_SIDE.END), color }}"
				>
					<span>{{ t(emptyText) }}</span>
				</slot>

				<template v-if="isManualMode">
					<template v-if="isLoading">
						<slot
								name="loading"
								v-bind="{side: INFINITE_SCROLL_SIDE.END, props: { onClick: () => intersecting(INFINITE_SCROLL_SIDE.END), color }}"
						>
							<origam-progress
									:color="color"
									:type="PROGRESS_TYPE.CIRCULAR"
									indeterminate
							/>
						</slot>
					</template>

					<slot
							name="loadMore"
							v-bind="{side: INFINITE_SCROLL_SIDE.END, props: { onClick: () => intersecting(INFINITE_SCROLL_SIDE.END), color }}"
					>
						<origam-btn
								:color="color"
								:text="t(loadMoreText)"
								@click="intersecting(INFINITE_SCROLL_SIDE.END)"
						/>
					</slot>
				</template>
			</template>
		</div>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, StyleValue, toRef } from 'vue'
	import OrigamBtn from '../Btn/OrigamBtn.vue'
	import OrigamInfiniteScrollIntersect from './OrigamInfiniteScrollIntersect.vue'
	import OrigamProgress from '../Progress/OrigamProgress.vue'

	import { useBothColor } from '../../composables/Commons/bothColor.composable'
	import { useDimension } from '../../composables/Commons/dimension.composable'
	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useTypography } from '../../composables/Commons/typography.composable'

	import { IN_BROWSER } from '../../consts/Commons/commons.const'

	import { DIRECTION } from '../../enums/Commons/direction.enum'
	import { INFINITE_SCROLL_MODE, INFINITE_SCROLL_SIDE, INFINITE_SCROLL_STATUS } from '../../enums/InfiniteScroll/infinite-scroll.enum'
	import { PROGRESS_TYPE } from '../../enums/Progress/progress.enum'

	import type { IInfiniteScrollProps } from '../../interfaces/InfiniteScroll/infinite-scroll.interface'

	import type { IInfiniteScrollEmits, IInfiniteScrollSlots } from '../../interfaces/InfiniteScroll/infinite-scroll.interface'

	import type { TInfiniteScrollSide, TInfiniteScrollStatus } from '../../types/InfiniteScroll/infinite-scroll.type'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, and composable setup.
	 ********************************************************/
	const props = withDefaults(defineProps<IInfiniteScrollProps>(), {
		direction: DIRECTION.VERTICAL,
		side: INFINITE_SCROLL_SIDE.END,
		mode: INFINITE_SCROLL_MODE.INTERSECT,
		tag: 'div',
		loadMoreText: 'origam.infinite_scroll.load_more',
		emptyText: 'origam.infinite_scroll.empty'
	})

	const emits = defineEmits<IInfiniteScrollEmits>()

	defineSlots<IInfiniteScrollSlots>()

	const {filterProps} = useProps<IInfiniteScrollProps>(props)

	const {t} = useLocale()

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {dimensionStyles} = useDimension(props)
	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	// BEM-child surface: .origam-infinite-scroll__side reads
	// --origam-infinite-scroll__loader---font-size. Bound directly on both
	// __side divs; only fontSize has a real visual effect (no font-weight /
	// font-family / line-height / letter-spacing rule in the SCSS).
	const {typographyStyles} = useTypography(props, 'infinite-scroll__loader')

	/*********************************************************
	 * Color
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))

	const rootEl = ref<HTMLDivElement>()
	const isIntersecting = shallowRef(false)

	const propertyDirection = computed(() => {
		return props.direction === DIRECTION.VERTICAL ? 'scrollTop' : 'scrollLeft'
	})
	const propertySize = computed(() => {
		return props.direction === DIRECTION.VERTICAL ? 'scrollHeight' : 'scrollWidth'
	})
	const propertyContainerSize = computed(() => {
		return props.direction === DIRECTION.VERTICAL ? 'clientHeight' : 'clientWidth'
	})

	const getScrollAmount = () => {
		if (!rootEl.value) return 0

		return rootEl.value[propertyDirection.value]
	}
	const setScrollAmount = (amount: number) => {
		if (!rootEl.value) return

		rootEl.value[propertyDirection.value] = amount
	}

	const getScrollSize = () => {
		if (!rootEl.value) return 0

		return rootEl.value[propertySize.value]
	}
	const getContainerSize = () => {
		if (!rootEl.value) return 0

		return rootEl.value[propertyContainerSize.value]
	}

	onMounted(() => {
		if (!rootEl.value) return

		if (props.side === INFINITE_SCROLL_SIDE.START) {
			setScrollAmount(getScrollSize())
		} else if (props.side === INFINITE_SCROLL_SIDE.BOTH) {
			setScrollAmount(getScrollSize() / 2 - getContainerSize() / 2)
		}
	})

	const currentSide = shallowRef<TInfiniteScrollSide>(INFINITE_SCROLL_SIDE.START)
	const startStatus = shallowRef<TInfiniteScrollStatus>(INFINITE_SCROLL_STATUS.OK)
	const endStatus = shallowRef<TInfiniteScrollStatus>(INFINITE_SCROLL_STATUS.OK)
	const status = computed({
		get () {
			return currentSide.value === INFINITE_SCROLL_SIDE.START ? startStatus.value : endStatus.value
		},
		set (status: TInfiniteScrollStatus) {
			if (currentSide.value === INFINITE_SCROLL_SIDE.START) {
				startStatus.value = status
			} else if (currentSide.value === INFINITE_SCROLL_SIDE.END) {
				endStatus.value = status
			}
		}
	})

	let previousScrollSize = 0

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleIntersect = ({side, isIntersecting: _isIntersecting}: {isIntersecting: boolean, side: TInfiniteScrollSide}) => {
		isIntersecting.value = _isIntersecting

		if (isIntersecting.value) {
			intersecting(side)
		}
	}

	/*********************************************************
	 * scheduleFrame — rAF bound to the component's lifetime (#719)
	 *
	 * @description
	 * `done()` re-arms the intersection three frames later, through two
	 * `nextTick`s. Nothing used to cancel that chain, so a component
	 * unmounted in between kept a continuation queued on a torn-down
	 * environment — the family measured in #706: under Vitest the frame
	 * lands AFTER jsdom is destroyed, `window` no longer exists, and the
	 * *scheduler* itself (`window.requestAnimationFrame` on the next
	 * rung) throws `ReferenceError: window is not defined`. That failure
	 * kills the whole run with zero red tests.
	 *
	 * @description
	 * One mechanism, both failure modes: `onBeforeUnmount` cancels the
	 * frame already armed AND flips `disposed`, which makes any LATER
	 * scheduling attempt a no-op — needed because the scheduling here is
	 * itself deferred behind two `nextTick`s, so at unmount time there is
	 * not always a handle to cancel yet.
	 *
	 * @description
	 * Every armed id is tracked, NOT just the latest: `done()` is called
	 * once per side, so two chains can be in flight at the same time and
	 * a single handle would lose one of them.
	 ********************************************************/
	const frames = new Set<number>()
	let disposed = false

	const scheduleFrame = (cb: () => void) => {
		if (disposed || !IN_BROWSER) return

		const id = window.requestAnimationFrame(() => {
			frames.delete(id)
			cb()
		})

		frames.add(id)
	}

	onBeforeUnmount(() => {
		disposed = true

		for (const id of frames) window.cancelAnimationFrame(id)

		frames.clear()
	})

	const done = (_status: TInfiniteScrollStatus) => {
		status.value = _status

		nextTick(() => {
			if (disposed) return

			if (status.value === INFINITE_SCROLL_STATUS.EMPTY || status.value === INFINITE_SCROLL_STATUS.ERROR) return

			if (status.value === INFINITE_SCROLL_STATUS.OK && currentSide.value === INFINITE_SCROLL_SIDE.START) {
				setScrollAmount(getScrollSize() - previousScrollSize + getScrollAmount())
			}

			if (props.mode !== INFINITE_SCROLL_MODE.MANUAL) {
				nextTick(() => {
					scheduleFrame(() => {
						scheduleFrame(() => {
							scheduleFrame(() => {
								intersecting(currentSide.value)
							})
						})
					})
				})
			}
		})
	}
	const intersecting = (side: TInfiniteScrollSide) => {
		if (props.mode !== 'manual' && !isIntersecting.value) return

		currentSide.value = side

		if (!rootEl.value || isLoading.value) return

		previousScrollSize = getScrollSize()
		status.value = INFINITE_SCROLL_STATUS.LOADING

		emits('load', {side: currentSide.value, done})
	}

	const hasStartIntersect = computed(() => {
		return props.side === INFINITE_SCROLL_SIDE.START || props.side === INFINITE_SCROLL_SIDE.BOTH
	})
	const hasEndIntersect = computed(() => {
		// Pre-fix: `props.side === END || INFINITE_SCROLL_SIDE.BOTH` —
		// the second operand was a string literal (truthy), so this
		// always returned true regardless of the `side` prop. The end
		// sentinel rendered even when `side="start"`, the start
		// sentinel rendered as expected, and side="both" worked by
		// accident.
		return props.side === INFINITE_SCROLL_SIDE.END || props.side === INFINITE_SCROLL_SIDE.BOTH
	})
	const isIntersectMode = computed(() => {
		return props.mode === INFINITE_SCROLL_MODE.INTERSECT
	})
	const isManualMode = computed(() => {
		return props.mode === INFINITE_SCROLL_MODE.MANUAL
	})
	const isLoading = computed(() => {
		return status.value === INFINITE_SCROLL_STATUS.LOADING
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composable-driven class and style composition.
	 ********************************************************/
	const infiniteScrollStyles = computed(() => {
		return [
			colorStyles.value,
			dimensionStyles.value,
			props.style
		] as StyleValue
	})
	const infiniteScrollClasses = computed(() => {
		return [
			'origam-infinite-scroll',
			`origam-infinite-scroll--${props.direction}`,
			{
				'origam-infinite-scroll--start': hasStartIntersect.value,
				'origam-infinite-scroll--end': hasEndIntersect.value
			},
			colorClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(infiniteScrollStyles, () => props.id)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Forwards filterProps to parent components.
	 ********************************************************/
	defineExpose({
		filterProps,
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
	.origam-infinite-scroll {
		overflow-y: auto;

		&__side {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
			gap: var(--origam-infinite-scroll__loader---gap, 12px);
			padding-block: var(--origam-infinite-scroll__empty---padding-block, var(--origam-infinite-scroll__loader---padding-block, 12px));
			padding-inline: var(--origam-infinite-scroll__loader---padding-inline, 0px);
			font-size: var(--origam-infinite-scroll__loader---font-size, 0.875rem);
			color: var(--origam-infinite-scroll__empty---color, var(--origam-color__text---secondary));
		}
	}
</style>
