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
	import { computed, inject, ref, StyleValue, watchEffect } from 'vue'

	import { useGroupItem } from '../../composables/Commons/groupItem.composable'
	import { useLazy } from '../../composables/Commons/lazy.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import {
		ORIGAM_TABS_LINK_KEY,
		ORIGAM_TAB_PANELS_KEY,
		ORIGAM_TAB_PANELS_CTX_KEY
	} from '../../consts/Tabs/tabs.const'

	import type {
		ITabPanelEmits,
		ITabPanelProps,
		ITabPanelSlots
	} from '../../interfaces/Tabs/tab-panel.interface'

	/*********************************************************
	 * Global
	 ********************************************************/
	const props = withDefaults(defineProps<ITabPanelProps>(), {
		tag: 'div',
		value: undefined,
		eager: false
	})

	const {filterProps} = useProps<ITabPanelProps>(props)

	defineEmits<ITabPanelEmits>()

	defineSlots<ITabPanelSlots>()

	const rootRef = ref<HTMLElement>()

	/*********************************************************
	 * Group registration
	 *
	 * @description
	 * The tabs group is NOT reachable via a plain
	 * `inject(ORIGAM_TABS_KEY)` — `<OrigamTabs>` is a SIBLING of
	 * `<OrigamTabPanels>`, not its ancestor (#441). `<OrigamTabPanels>`
	 * resolves the sibling once (`useGroupSiblingLink`) and re-provides
	 * it under `ORIGAM_TABS_LINK_KEY`, down its OWN ancestor chain —
	 * THAT is what we inject here.
	 ********************************************************/
	const groupItem = useGroupItem(props, ORIGAM_TAB_PANELS_KEY)
	const tabsGroupLink = inject(ORIGAM_TABS_LINK_KEY, undefined)
	const panelsCtx = inject(ORIGAM_TAB_PANELS_CTX_KEY, null)

	if (!groupItem) {
		throw new Error('[Origam] <OrigamTabPanel> must be used inside an <OrigamTabPanels>')
	}

	/*********************************************************
	 * ARIA wiring
	 *
	 * @description
	 * `panelDomId` is the DOM id of THIS panel — `props.id` when
	 * the consumer supplies one, a generated fallback otherwise
	 * (referenced by the tab via `aria-controls`). Published onto
	 * this panel's OWN entry in the tab-panels group's `items`
	 * registry (`domId`, see `IGroupItem`) so the sibling
	 * `<OrigamTab>` can read the REAL id instead of guessing the
	 * generated-fallback naming scheme (#519-#522) — symmetric to
	 * `<OrigamTab>`'s own wiring.
	 *
	 * `tabLabelledBy` mirrors that lookup in the other direction —
	 * the generated-fallback string is kept as a defensive default
	 * for the brief window before the tab's own effect has run.
	 ********************************************************/
	const panelDomId = computed(() => props.id || `origam-tab-panel-${groupItem!.id}`)

	watchEffect(() => {
		const self = groupItem!.group.items.value.find(item => item.id === groupItem!.id)
		if (self) self.domId = panelDomId.value
	})

	const tabLabelledBy = computed(() => {
		const tabsGroup = tabsGroupLink?.value
		if (!tabsGroup) return undefined

		const tab = tabsGroup.items.value.find(item => item.value === groupItem!.value.value)
		if (!tab) return undefined

		return tab.domId || `origam-tab-${tab.id}`
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
