<template>
	<origam-toolbar
			ref="origamToolbarRef"
			:class="appBarClasses"
			:collapse="isCollapsed"
			:flat="isFlat"
			:active="toolbarActive"
			:style="appBarStyles"
			v-bind="toolbarProps"
	>
		<template
				v-if="hasAppend"
				#append
		>
			<slot name="append"/>
		</template>

		<template
				v-if="hasPrepend"
				#prepend
		>
			<slot name="prepend"/>
			<div
					v-if="hasImage"
					class="origam-bar__img"
			>
				<slot name="img">
					<origam-img v-bind="image"/>
				</slot>
			</div>
		</template>

		<template
				v-if="hasContent"
				#content
		>
			<slot name="content"/>
		</template>

		<template
				v-if="slots.default"
				#default
		>
			<slot name="default"/>
		</template>
	</origam-toolbar>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamImg, OrigamToolbar } from '../../components'

	import {
	useLayoutItem,
	useProps,
	useScroll,
	useSsrBoot,
	useStyle,
	useToggleScope,
	useVModel
} from '../../composables'

	import { BLOCK, DENSITY } from '../../enums'

	import type { IAppBarProps} from '../../interfaces'

	import type { IAppBarEmits } from '../../interfaces/App/app-bar.interface'

	import type { TOrigamToolbar } from "../../types"

	import { forwardRefs, int } from "../../utils"

	import { computed, ComputedRef, ref, shallowRef, StyleValue, toRef, useSlots, watchEffect } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits and slot detection for the AppBar component.
	 ********************************************************/
	const props = withDefaults(defineProps<IAppBarProps>(), {
		tag: 'header',
		density: DENSITY.DEFAULT,
		scrollThreshold: 300,
		location: BLOCK.TOP,
		modelValue: true
	})

	defineEmits<IAppBarEmits>()

	const {filterProps} = useProps<IAppBarProps>(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {ssrBootStyles} = useSsrBoot()
	const slots = useSlots()

	const origamToolbarRef = ref<TOrigamToolbar>()

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const toolbarProps = computed(() => {
		return origamToolbarRef.value?.filterProps(props, ['class', 'style', 'collapse', 'flat', 'floating', 'active', 'width', 'minWidth', 'maxWidth'])
	})

	const hasImage = computed(() => {
		return !!(props.image || slots.img)
	})
	const hasPrepend = computed(() => {
		return hasImage.value || slots.prepend
	})
	const hasContent = computed(() => {
		return slots.content
	})
	const hasAppend = computed(() => {
		return slots.append
	})

	/*********************************************************
	 * Effect
	 ********************************************************/

	// Visibility (show / hide on scroll) is a WRITABLE state — the hide
	// behaviour assigns it. `useActive` only exposed a readonly computed, so
	// the previous `isActive.value = …` writes silently failed and hide /
	// inverted never worked. `useVModel` keeps the `modelValue` v-model contract
	// (controlled) AND an internal ref fallback (uncontrolled), both writable.
	const visible = useVModel(props, 'modelValue')

	/*********************************************************
	 * Scroll
	 *
	 * @description
	 * Scroll-behaviour driven visibility, collapse and
	 * elevation logic for the sticky app bar.
	 ********************************************************/
	const scrollBehavior = computed(() => {
		const behavior = new Set(props.scrollBehavior?.split(' ') ?? [])

		return {
			hide: behavior.has('hide'),
			// fullyHide: behavior.has('fully-hide'),
			inverted: behavior.has('inverted'),
			collapse: behavior.has('collapse'),
			elevate: behavior.has('elevate'),
			// Engage the bar's `active` design-state once the page is scrolled
			// (transparent at the top → painted/`--active` on scroll). Opt-in,
			// like every other behaviour token.
			active: behavior.has('active'),
			fadeImage: behavior.has('fade-image')
			// shrink: behavior.has('shrink'),
		}
	})
	const canScroll = computed(() => {
		const behavior = scrollBehavior.value

		return (
				behavior.hide ||
				behavior.inverted ||
				behavior.collapse ||
				behavior.elevate ||
				behavior.active ||
				behavior.fadeImage ||
				!visible.value
		)
	})

	const {
		currentScroll,
		scrollThreshold,
		isScrollingUp,
		scrollRatio
	} = useScroll(props, {canScroll})
	useToggleScope(computed(() => !!props.scrollBehavior), () => {
		watchEffect(() => {
			if (scrollBehavior.value.hide) {
				if (scrollBehavior.value.inverted) {
					visible.value = currentScroll.value > scrollThreshold.value
				} else {
					visible.value = isScrollingUp.value || (currentScroll.value < scrollThreshold.value)
				}
			} else {
				visible.value = true
			}
		})
	})

	// `active` scroll-behaviour: the bar engages its `active` design-state as
	// soon as the page is scrolled away from the top. Drives the
	// `origam-app-bar--active` class (consumer CSS hook) AND forwards a forced
	// `active` to the inner Toolbar so its surface paints (see `toolbarActive`).
	const isScrolled = computed(() => currentScroll.value > 0)

	const isScrollActive = computed(() => scrollBehavior.value.active && isScrolled.value)

	// `--active` is emitted ONLY for the `active` scroll-behaviour (engaged on
	// scroll). It is intentionally NOT tied to `modelValue`/visibility — the bar
	// being shown is not an "active" design-state, and binding the class to
	// visibility painted the bar permanently (modelValue defaults to true).
	// Visibility is handled by the layout transform, no class required.
	const barActiveClasses = computed(() => {
		return isScrollActive.value ? ['origam-app-bar--active'] : []
	})

	// Forwarded `active` for the Toolbar surface. The Toolbar's own design is
	// only engaged on scroll when the consumer PROVIDED an override object
	// (`:active="{ bgColor: 'surface' }"`). With no override we leave the
	// surface untouched — `--active` (the class) is the only signal, so the
	// consumer styles it however they want and nothing is imposed by default.
	const toolbarActive = computed(() => {
		const override = props.active && typeof props.active === 'object' ? props.active : undefined

		if (!scrollBehavior.value.active || !override) return props.active

		return isScrollActive.value ? { ...override, enabled: true } : false
	})

	const isCollapsed = computed(() => props.collapse || (
			scrollBehavior.value.collapse &&
			(scrollBehavior.value.inverted ? scrollRatio.value > 0 : scrollRatio.value === 0)
	))
	const isFlat = computed(() => props.flat || (
			scrollBehavior.value.elevate &&
			(scrollBehavior.value.inverted ? currentScroll.value > 0 : currentScroll.value === 0)
	))
	// AppBar default height matches the toolbar's `--origam-toolbar---height`
	// token (56 px). If the consumer overrides via `:height="…"` the prop
	// wins. Without a default the layout reserved 0 px at the top → drawer /
	// main covered the AppBar (user report: drawer overlaps the bar instead
	// of starting BELOW it).
	const height = computed(() => {
		if (scrollBehavior.value.hide && scrollBehavior.value.inverted) return 0

		return props.height ?? 56
	})

	/*********************************************************
	 * Layout
	 *
	 * @description
	 * Registers the bar as a layout item so sibling regions
	 * (main, nav drawer) offset correctly.
	 ********************************************************/
	const {layoutItemStyles} = useLayoutItem({
		id: props.name,
		// `int(undefined as string)` is NaN, which silently broke the
		// layer-chain sort in useCreateLayout (drawers ended up before
		// the AppBar, causing the drawer to extend full-height
		// instead of starting BELOW the bar). Fall back to 0 so AppBar
		// reserves its top space FIRST, then drawers / side rails
		// register after it (their own order defaults to a UID-based
		// large number).
		order: computed(() => {
			const parsed = int(props.order as string)
			return Number.isFinite(parsed) ? parsed : 0
		}),
		position: toRef(props, 'location'),
		layoutSize: height,
		elementSize: shallowRef(undefined),
		active: visible as unknown as ComputedRef,
		// `absolute` is not part of the AppBar surface (it only toggles
		// absolute↔fixed and never scrolls the bar away). The layout defaults
		// to fixed for the root bar.
		absolute: shallowRef(undefined)
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes layout item styles and active modifier class.
	 ********************************************************/
	const appBarStyles = computed(() => {
		return [
			layoutItemStyles.value,
			ssrBootStyles.value,
			props.style
		] as StyleValue
	})
	const appBarClasses = computed(() => {
		return [
			'origam-app-bar',
			`origam-app-bar--${props.location}`,
			barActiveClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(appBarStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface: filterProps forwarded from toolbar ref.
	 ********************************************************/
	defineExpose(forwardRefs({
		filterProps,
		css,
		id,
		load,
		unload,
		isLoaded
	}, origamToolbarRef))

</script>

<!--
	NB: AppBar's chrome (btn shape, transparent btn surface, prepend /
	append gutters, title color inheritance, inline padding) now lives
	in OrigamToolbar.vue's scoped style block — applies universally to
	every Toolbar consumer (AppBar included, plus standalone Toolbar,
	footer bars, etc.) so the chrome stays consistent.

	If you need to tweak per-instance, the toolbar exposes:
	    --origam-toolbar---btn-background-color
	    --origam-toolbar---btn-background-color-hover
	    --origam-toolbar---btn-background-color-active
	    --origam-toolbar---btn-color
	    --origam-toolbar---btn-border-radius      (default 8 px)
	    --origam-toolbar---padding-inline         (default 16 px)
	    --origam-toolbar__prepend---margin-inline-end   (default 12 px)
	    --origam-toolbar__append---margin-inline-start  (default 12 px)
	    --origam-toolbar__title---color           (default currentColor)

	No AppBar-scoped CSS is necessary — the file no longer ships a
	<style> block.
-->
