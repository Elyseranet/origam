<template>
	<origam-toolbar
			:id="id"
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
	import OrigamImg from '../Img/OrigamImg.vue'
	import OrigamToolbar from '../Toolbar/OrigamToolbar.vue'

	import { useLayoutItem } from '../../composables/Commons/layoutItem.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useScroll } from '../../composables/Commons/scroll.composable'
	import { useSsrBoot } from '../../composables/Commons/ssrBoot.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useToggleScope } from '../../composables/Commons/toggleScope.composable'
	import { useVModel } from '../../composables/Commons/vModel.composable'

	import { BLOCK } from '../../enums/Commons/anchor.enum'
	import { DENSITY } from '../../enums/Commons/density.enum'

	import type { IAppBarProps } from '../../interfaces/App/app-bar.interface'

	import type { IAppBarEmits, IAppBarSlots } from '../../interfaces/App/app-bar.interface'

	import type { TOrigamToolbar } from '../../types/Toolbar/toolbar.type'

	import { forwardRefs } from '../../utils/Commons/forwardRefs.util'
	import { int } from '../../utils/Commons/commons.util'

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

	defineSlots<IAppBarSlots>()

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

	const isScrolled = computed(() => currentScroll.value > 0)

	const isScrollActive = computed(() => scrollBehavior.value.active && isScrolled.value)

	const barActiveClasses = computed(() => {
		return isScrollActive.value ? ['origam-app-bar--active'] : []
	})

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
	/*********************************************************
	 * ⛔ `props.name` est lu EAGERLY ici, et c'est VOULU (ADR-005).
	 *
	 * @description
	 * `setup-reads.mjs` signale cette lecture, a juste titre : le resolveur
	 * de props de theme ecrit dans `beforeCreate`, APRES l'execution de
	 * `setup()`. Une valeur capturee ici ne verra donc jamais celle du
	 * theme.
	 *
	 * @description
	 * Elle ne peut pas etre differee pour autant. `useLayoutItem` se sert
	 * de cet `id` pour trois choses qui exigent une valeur STABLE des le
	 * setup : `provide(ORIGAM_LAYOUT_ITEM_KEY, {id})`, `layout.register(vm,
	 * {..., id})` et `layout.unregister(id)` au demontage. Un identifiant
	 * qui changerait apres l'enregistrement laisserait un element fantome
	 * dans le layout et n'en desenregistrerait aucun.
	 *
	 * @description
	 * La vraie question n'est donc pas « comment differer cette lecture »
	 * mais « un theme a-t-il vocation a nommer un element de layout ? ».
	 * `name` est une IDENTITE, pas un reglage visuel — au meme titre qu'un
	 * `id`. Tant que la reponse est non, cette lecture est correcte et le
	 * signalement de l'outil est un faux positif a connaitre.
	 ********************************************************/
	const {layoutItemStyles} = useLayoutItem({
		id: props.name,
		order: computed(() => {
			const parsed = int(props.order as string)
			return Number.isFinite(parsed) ? parsed : 0
		}),
		position: toRef(props, 'location'),
		layoutSize: height,
		elementSize: shallowRef(undefined),
		active: visible as unknown as ComputedRef,
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
	const {id, css, load, isLoaded, unload} = useStyle(appBarStyles, () => props.id)


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
