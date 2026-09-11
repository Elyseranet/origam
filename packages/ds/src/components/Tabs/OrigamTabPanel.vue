<template>
	<Transition
			:name="transitionName"
			mode="out-in"
	>
		<component
				:is="tag"
				v-show="isShown"
				:id="panelDomId"
				ref="rootRef"
				role="tabpanel"
				:tabindex="0"
				:aria-labelledby="tabLabelledBy"
				:hidden="!isShown || undefined"
				:class="panelClasses"
				:style="panelStyles"
		>
			<slot
					v-if="hasContent"
					name="default"
			/>
		</component>
	</Transition>
</template>

<script
		lang="ts"
		setup
>
	import { computed, inject, ref, StyleValue } from 'vue'

	import {
		useGroupItem,
		useLazy,
		useProps,
		useStyle
	} from '../../composables'

	import { ORIGAM_TABS_KEY, ORIGAM_TAB_PANELS_KEY, ORIGAM_TAB_PANELS_CTX_KEY } from '../../consts'

	import type { ITabPanelProps } from '../../interfaces'

	/*********************************************************
	 * Global
	 ********************************************************/
	const props = withDefaults(defineProps<ITabPanelProps>(), {
		tag: 'div',
		value: undefined,
		eager: false
	})

	const {filterProps} = useProps<ITabPanelProps>(props)

	const rootRef = ref<HTMLElement>()

	/*********************************************************
	 * Group registration
	 ********************************************************/
	const groupItem = useGroupItem(props, ORIGAM_TAB_PANELS_KEY)
	const tabsGroup = inject(ORIGAM_TABS_KEY, null)
	const panelsCtx = inject(ORIGAM_TAB_PANELS_CTX_KEY, null)

	if (!groupItem) {
		throw new Error('[Origam] <OrigamTabPanel> must be used inside an <OrigamTabPanels>')
	}

	/*********************************************************
	 * ARIA wiring
	 ********************************************************/
	const panelDomId = computed(() => `origam-tab-panel-${groupItem!.id}`)

	const tabLabelledBy = computed(() => {
		if (!tabsGroup) return undefined

		const tab = tabsGroup.items.value.find(item => item.value === groupItem!.value.value)

		return tab ? `origam-tab-${tab.id}` : undefined
	})

	/*********************************************************
	 * Visibility + lazy mounting
	 *
	 * @description
	 * `isShown` toggles via `v-show` so the panel stays in the
	 * DOM once mounted (preserves child component state, scroll
	 * position, etc.). `useLazy` gates the slot content so the
	 * first render is deferred until the panel becomes active.
	 ********************************************************/
	const isShown = computed(() => groupItem!.isSelected.value)

	const {hasContent} = useLazy({eager: !!props.eager}, isShown)

	const transitionName = computed(() => {
		const t = panelsCtx?.transition.value
		if (t === false) return ''

		return t || 'fade'
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const panelStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const panelClasses = computed(() => {
		return [
			'origam-tab-panel',
			groupItem!.selectedClass.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(panelStyles)

	/*********************************************************
	 * Expose
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
	.origam-tab-panel {
		flex: 1 1 auto;
		min-height: 0;
		min-width: 0;
		width: 100%;
		outline: none;

		&:focus-visible {
			outline: 2px solid var(--origam-tab-panels__panel--focus---outline-color, currentColor);
			outline-offset: -2px;
		}
	}

	.fade-enter-active,
	.fade-leave-active {
		transition: opacity var(--origam-tab-panels__panel---transition-duration, 0.18s) ease;
	}

	.fade-enter-from,
	.fade-leave-to {
		opacity: 0;
	}
</style>
