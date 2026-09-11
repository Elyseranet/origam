<template>
	<component
			:is="tag"
			:class="slideGroupClasses"
			:style="slideGroupStyles"
			:tabindex="(isFocused || group.selected.value.length) ? -1 : 0"
			@focus="handleFocus"
	>
		<div
				v-if="hasAffixes"
				key="prev"
				:class="slideGroupPrevClasses"
				@click="handleFocusAffixes"
				@mousedown="hasPrev && scrollTo('prev')"
		>
			<slot name="prev">
				<origam-fade>
					<origam-icon :icon="prevIcon"/>
				</origam-fade>
			</slot>
		</div>

		<div
				key="container"
				ref="containerRef"
				class="origam-slide-group__container"
				@scroll="handleScroll"
		>
			<div
					ref="contentRef"
					class="origam-slide-group__content"
					@focusin="handleFocusin"
					@focusout="handleFocusout"
					@keydown="handleKeydown"
			>
				<slot
						name="default"
						v-bind="slotProps"
				/>
			</div>
		</div>

		<div
				v-if="hasAffixes"
				key="next"
				:class="slideGroupNextClasses"
				@click="handleFocusAffixes"
				@mousedown="hasNext && scrollTo('next')"
		>
			<slot name="next">
				<origam-fade>
					<origam-icon :icon="nextIcon"/>
				</origam-fade>
			</slot>
		</div>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, shallowRef, StyleValue, watch } from "vue"
	import { OrigamFade, OrigamIcon } from "../../components"
	import {
		useBorder,
		useDisplay,
		useGoTo,
		useGroup,
		useMargin,
		usePadding,
		useProps,
		useResizeObserver,
		useRounded,
		useRtl
	, useStyle} from "../../composables"

	import { IN_BROWSER, ORIGAM_SLIDE_GROUP_KEY } from "../../consts"

	import { DIRECTION, MDI_ICONS } from "../../enums"

	import type { IGoToOptions, ISlideGroupProps} from "../../interfaces"

	import type { ISlideGroupEmits } from '../../interfaces/Slide/slide-group.interface'
	import {
		calculateCenteredTarget,
		calculateUpdatedTarget,
		focusableChildren,
		getClientSize,
		getOffsetSize,
		getScrollPosition,
		getScrollSize
	} from "../../utils"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, composables and group registration.
	 ********************************************************/

	const props = withDefaults(defineProps<ISlideGroupProps>(), {
		// `tag` MUST default to a real string — without it the root
		// `<component :is="tag">` resolved to `<component :is="undefined">`
		// which Vue renders as a `<!--[object Object]-->` placeholder
		// and silently swallows the rest of the template (no error
		// surface, the story shell looked empty).
		tag: 'div',
		direction: DIRECTION.HORIZONTAL,
		// Affix icons were swapped: prev pointed RIGHT, next pointed LEFT.
		// Reversed so the chevrons match the scroll direction they trigger.
		prevIcon: MDI_ICONS.CHEVRON_LEFT,
		nextIcon: MDI_ICONS.CHEVRON_RIGHT,
		selectedClass: 'origam-slide-group-item--active'
	})

	defineEmits<ISlideGroupEmits>()

	const {filterProps} = useProps<ISlideGroupProps>(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {roundedClasses, roundedStyles} = useRounded(props)
	const {borderClasses, borderStyles} = useBorder(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)

	const {displayClasses, mobile} = useDisplay(props)
	const group = useGroup(props, ORIGAM_SLIDE_GROUP_KEY)
	const isOverflowing = shallowRef(false)
	const scrollOffset = shallowRef(0)
	const containerSize = shallowRef(0)
	const contentSize = shallowRef(0)
	const isHorizontal = computed(() => props.direction === 'horizontal')

	const {resizeRef: containerRef, contentRect: containerRect} = useResizeObserver()
	const {resizeRef: contentRef, contentRect} = useResizeObserver()
	const {isRtl} = useRtl()

	const goTo = useGoTo()
	const goToOptions = computed(() => {
		return {
			container: containerRef.value,
			duration: 200,
			easing: 'easeOutQuart'
		} as Partial<IGoToOptions>
	})

	const firstSelectedIndex = computed(() => {
		if (!group.selected.value.length) return -1

		return group.items.value.findIndex(item => item.id === group.selected.value[0])
	})

	const lastSelectedIndex = computed(() => {
		if (!group.selected.value.length) return -1

		return group.items.value.findIndex(item => item.id === group.selected.value[group.selected.value.length - 1])
	})

	if (IN_BROWSER) {
		let frame = -1
		watch(() => [group.selected.value, containerRect.value, contentRect.value, isHorizontal.value], () => {
			cancelAnimationFrame(frame)
			frame = requestAnimationFrame(() => {
				if (containerRect.value && contentRect.value) {
					const sizeProperty = isHorizontal.value ? 'width' : 'height'

					containerSize.value = containerRect.value[sizeProperty]
					contentSize.value = contentRect.value[sizeProperty]

					isOverflowing.value = containerSize.value + 1 < contentSize.value
				}

				if (firstSelectedIndex.value >= 0 && contentRef.value) {
					// TODO: Is this too naive? Should we store element references in group composable?
					const selectedElement = contentRef.value.children[lastSelectedIndex.value] as HTMLElement

					scrollToChildren(selectedElement, props.centerActive)
				}
			})
		})
	}

	const isFocused = shallowRef(false)

	/*********************************************************
	 * Scroll helpers
	 *
	 * @description
	 * Scroll-to-children and scroll-to-position utilities.
	 ********************************************************/

	const scrollToChildren = (children: HTMLElement, center?: boolean) => {
		let target = calculateUpdatedTarget({
			containerElement: containerRef.value!,
			isHorizontal: isHorizontal.value,
			isRtl: isRtl.value,
			selectedElement: children
		})

		if (center) {
			target = calculateCenteredTarget({
				containerElement: containerRef.value!,
				isHorizontal: isHorizontal.value,
				selectedElement: children
			})
		}

		scrollToPosition(target)
	}

	const scrollToPosition = (newPosition: number) => {
		if (!IN_BROWSER || !containerRef.value) return

		const offsetSize = getOffsetSize(isHorizontal.value, containerRef.value)
		const scrollPosition = getScrollPosition(isHorizontal.value, isRtl.value, containerRef.value)
		const scrollSize = getScrollSize(isHorizontal.value, containerRef.value)

		if (
				scrollSize <= offsetSize ||
				// Prevent scrolling by only a couple of pixels, which doesn't look smooth
				Math.abs(newPosition - scrollPosition) < 16
		) return

		// In RTL, scroll positions are mirrored: position 0 is the
		// right-most edge and increases as you go left. Flip
		// `newPosition` against the max scrollable distance so the
		// caller always works in LTR-style coordinates. In LTR, leave
		// the requested position untouched — the previous code applied
		// this flip unconditionally, which sent every "go to N" call
		// to `(maxScroll − N)` instead of `N`. With a 5-tab viewport
		// that meant clicking "next" jumped past the middle of the
		// list and skipped tabs.
		if (isHorizontal.value && isRtl.value && containerRef.value) {
			const {scrollWidth, offsetWidth: containerWidth} = containerRef.value!

			newPosition = (scrollWidth - containerWidth) - newPosition
		}

		if (isHorizontal.value) {
			goTo.horizontal(newPosition, goToOptions.value)
		} else {
			goTo(newPosition, goToOptions.value)
		}
	}

	/*********************************************************
	 * Event handlers
	 *
	 * @description
	 * Scroll, focus, keyboard and affix click handlers.
	 ********************************************************/

	const handleScroll = (e: Event) => {
		const {scrollTop, scrollLeft} = e.target as HTMLElement

		scrollOffset.value = isHorizontal.value ? scrollLeft : scrollTop
	}

	const handleFocusin = (e: FocusEvent) => {
		isFocused.value = true

		if (!isOverflowing.value || !contentRef.value) return

		// Focused element is likely to be the root of an item, so a
		// breadth-first search will probably find it in the first iteration
		for (const el of e.composedPath()) {
			for (const item of contentRef.value.children) {
				if (item === el) {
					scrollToChildren(item as HTMLElement)
					return
				}
			}
		}
	}

	const handleFocusout = () => {
		isFocused.value = false
	}

	// Affix clicks produce onFocus that we have to ignore to avoid extra scrollToChildren
	let ignoreFocusEvent = false
	const handleFocus = (e: FocusEvent) => {
		if (!ignoreFocusEvent && !isFocused.value && !(e.relatedTarget && contentRef.value?.contains(e.relatedTarget as Node))) focus()

		ignoreFocusEvent = false
	}

	const handleFocusAffixes = () => {
		ignoreFocusEvent = true
	}

	const handleKeydown = (e: KeyboardEvent) => {
		if (!contentRef.value) return

		const toFocus = (location: Parameters<typeof focus>[0]) => {
			e.preventDefault()
			focus(location)
		}

		if (isHorizontal.value) {
			if (e.key === 'ArrowRight') {
				toFocus('next')
			} else if (e.key === 'ArrowLeft') {
				toFocus('prev')
			}
		} else {
			if (e.key === 'ArrowDown') {
				toFocus('next')
			} else if (e.key === 'ArrowUp') {
				toFocus('prev')
			}
		}

		if (e.key === 'Home') {
			toFocus('first')
		} else if (e.key === 'End') {
			toFocus('last')
		}
	}

	const focus = (location?: 'next' | 'prev' | 'first' | 'last') => {
		if (!contentRef.value) return

		let el: HTMLElement | undefined

		if (!location) {
			const focusable = focusableChildren(contentRef.value)
			el = focusable[0]
		} else if (location === 'next') {
			el = contentRef.value.querySelector(':focus')?.nextElementSibling as HTMLElement | undefined

			if (!el) return focus('first')
		} else if (location === 'prev') {
			el = contentRef.value.querySelector(':focus')?.previousElementSibling as HTMLElement | undefined

			if (!el) return focus('last')
		} else if (location === 'first') {
			el = (contentRef.value.firstElementChild as HTMLElement)
		} else if (location === 'last') {
			el = (contentRef.value.lastElementChild as HTMLElement)
		}

		if (el) {
			el.focus({preventScroll: true})
		}
	}

	const scrollTo = (location: 'prev' | 'next') => {
		// Step one container-width per click, in the direction of the
		// affix. The previous implementation added `scrollWidth -
		// containerWidth` on top of the step, jumping straight to the
		// far end on the first click and then walking back from there —
		// arrows looked broken. A pure `currentOffset ± containerSize`
		// behaviour is the standard pattern for slide groups.
		const offsetStep = (location === 'prev' ? -1 : 1) * containerSize.value
		scrollToPosition(scrollOffset.value + offsetStep)
	}

	/*********************************************************
	 * Affixes & slot props
	 *
	 * @description
	 * Arrow visibility logic and group slot props.
	 ********************************************************/

	const slotProps = computed(() => ({
		next: group.next,
		prev: group.prev,
		select: group.select,
		isSelected: group.isSelected
	}))

	const hasAffixes = computed(() => {
		switch (props.showArrows) {
				// Always show arrows on desktop & mobile
			case 'always':
				return true

				// Always show arrows on desktop
			case 'desktop':
				return !mobile.value

				// Show arrows on mobile when overflowing.
				// This matches the default 2.2 behavior
			case true:
				return isOverflowing.value || Math.abs(scrollOffset.value) > 0

				// Always show on mobile
			case 'mobile':
				return (
						mobile.value ||
						(isOverflowing.value || Math.abs(scrollOffset.value) > 0)
				)

				// https://material.io/components/tabs#scrollable-tabs
				// Always show arrows when
				// overflowed on desktop
			default:
				return (
						!mobile.value &&
						(isOverflowing.value || Math.abs(scrollOffset.value) > 0)
				)
		}
	})
	const hasPrev = computed(() => {
		// 1 pixel in reserve, may be lost after rounding
		return Math.abs(scrollOffset.value) > 1
	})
	const hasNext = computed(() => {
		if (!containerRef.value) return false

		const scrollSize = getScrollSize(isHorizontal.value, containerRef.value)
		const clientSize = getClientSize(isHorizontal.value, containerRef.value)

		const scrollSizeMax = scrollSize - clientSize

		// 1 pixel in reserve, may be lost after rounding
		return scrollSizeMax - Math.abs(scrollOffset.value) > 1
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes and inline styles.
	 ********************************************************/

	const slideGroupStyles = computed(() => {
		return [
			roundedStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			props.style
		] as StyleValue
	})
	const slideGroupClasses = computed(() => {
		return [
			'origam-slide-group',
			{
				'origam-slide-group--vertical': !isHorizontal.value,
				'origam-slide-group--has-affixes': hasAffixes.value,
				'origam-slide-group--is-overflowing': isOverflowing.value
			},
			displayClasses.value,
			roundedClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})
	const slideGroupPrevClasses = computed(() => {
		return [
			'origam-slide-group__prev',
			{
				'origam-slide-group__prev--disabled': !hasPrev.value
			}
		]
	})
	const slideGroupNextClasses = computed(() => {
		return [
			'origam-slide-group__next',
			{
				// Was `!hasPrev.value` (copy-paste from the prev affix
				// classes) — the next button stayed enabled at the end
				// of the scroll and disabled at the start.
				'origam-slide-group__next--disabled': !hasNext.value
			}
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(slideGroupStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface exposed to parent components.
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
	.origam-slide-group {
		$this: &;

		display: var(--origam-slide-group---display, flex);
		overflow: var(--origam-slide-group---overflow, hidden);

		&__prev,
		&__next {
			align-items: center;
			display: flex;
			flex: 0 1 var(--origam-slide-group__prev---min-width, 52px);
			justify-content: center;
			min-width: var(--origam-slide-group__prev---min-width, 52px);
			cursor: var(--origam-slide-group__prev---cursor, pointer);
			color: var(--origam-slide-group__prev---color, inherit);

			&--disabled {
				pointer-events: none;
				opacity: var(--origam-slide-group__prev---opacity-disabled, 0.6);
			}
		}

		&__content {
			display: var(--origam-slide-group__content---display, flex);
			flex: var(--origam-slide-group__content---flex, 1 0 auto);
			position: var(--origam-slide-group__content---position, relative);
			transition:
				var(--origam-slide-group---transition-duration, 0.2s)
				all
				var(--origam-slide-group---transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
			white-space: var(--origam-slide-group__content---white-space, nowrap);

			> * {
				white-space: initial;
			}
		}

		&__container {
			contain: content;
			display: var(--origam-slide-group__container---display, flex);
			flex: var(--origam-slide-group__container---flex, 1 1 auto);
			overflow-x: var(--origam-slide-group__container---overflow-x, auto);
			overflow-y: var(--origam-slide-group__container---overflow-y, hidden);
			scrollbar-width: none;
			scrollbar-color: var(--origam-slide-group__container---scrollbar-color, transparent);

			&::-webkit-scrollbar {
				display: none;
			}
		}

		&--vertical {
			max-height: var(--origam-slide-group--vertical---max-height, inherit);

			&,
			#{$this}__container,
			#{$this}__content {
				flex-direction: column;
			}

			#{$this}__container {
				overflow-x: var(--origam-slide-group--vertical---content-overflow-x, hidden);
				overflow-y: var(--origam-slide-group--vertical---content-overflow-y, auto);
			}
		}
	}
</style>
