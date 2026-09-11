<template>
	<component
			:is="tag"
			:id="id"
			ref="rootRef"
			v-touch="touchOptions"
			:class="panelsClasses"
			:style="panelsStyles"
	>
		<origam-defaults-provider :defaults="slotDefaults">
			<slot
					name="default"
					v-bind="slotProps"
			/>
		</origam-defaults-provider>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, provide, ref, shallowRef, StyleValue, watch } from 'vue'

	import { OrigamDefaultsProvider } from '../../components'

	import {
		useGroup,
		useProps,
		useStyle
	} from '../../composables'

	import { ORIGAM_TAB_PANELS_KEY, ORIGAM_TAB_PANELS_CTX_KEY } from '../../consts'

	import { vTouch } from '../../directives'

	import { DIRECTION } from '../../enums'

	import type { ITabPanelsProps, ITouchHandlers} from '../../interfaces'

	import type { ITabPanelsEmits } from '../../interfaces/Tabs/tab-panels.interface'

	/*********************************************************
	 * Global
	 ********************************************************/
	const props = withDefaults(defineProps<ITabPanelsProps>(), {
		tag: 'div',
		direction: DIRECTION.HORIZONTAL,
		mandatory: true,
		transition: 'fade',
		swipeable: false,
		selectedClass: 'origam-tab-panel--active'
	})

	defineEmits<ITabPanelsEmits>()

	const {filterProps} = useProps<ITabPanelsProps>(props)

	/*********************************************************
	 * Group orchestration
	 ********************************************************/
	const {isSelected, select, next, prev, selected, items} = useGroup(props, ORIGAM_TAB_PANELS_KEY)

	const rootRef = ref<HTMLElement>()
	const isReversed = shallowRef(false)

	/*********************************************************
	 * Reverse tracking
	 *
	 * @description
	 * The transition name is the same in both directions but
	 * `isReversed` is exposed via context so panels can pick a
	 * mirrored variant when a non-fade transition is requested.
	 ********************************************************/
	const activeIndex = computed(() => {
		return items.value.findIndex(item => selected.value.includes(item.id))
	})

	watch(activeIndex, (newVal, oldVal) => {
		isReversed.value = newVal < oldVal
	})

	const transition = computed(() => {
		if (props.transition === false) return false

		return props.transition || 'fade'
	})

	provide(ORIGAM_TAB_PANELS_CTX_KEY, {
		transition,
		isReversed
	})

	/*********************************************************
	 * Touch / swipe
	 ********************************************************/
	const touchOptions = computed(() => {
		if (!props.swipeable) return false

		const options: ITouchHandlers = {
			left: () => next(),
			right: () => prev()
		}

		return options
	})

	/*********************************************************
	 * Slot scope + defaults propagation
	 ********************************************************/
	const slotProps = computed(() => ({
		isSelected,
		select,
		next,
		prev,
		selected,
		items: items.value
	}))

	const slotDefaults = computed(() => ({
		'origam-tab-panel': {
			transition: props.transition
		}
	}))

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const panelsStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const panelsClasses = computed(() => {
		return [
			'origam-tab-panels',
			`origam-tab-panels--direction-${props.direction}`,
			{
				'origam-tab-panels--swipeable': props.swipeable
			},
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(panelsStyles)

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		filterProps,
		next,
		prev,
		select,
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
	.origam-tab-panels {
		display: block;
		position: relative;

		padding-block: var(--origam-tab-panels__panel---padding-block, 16px);
		padding-inline: var(--origam-tab-panels__panel---padding-inline, 0);

		&--direction-vertical {
			display: flex;
			flex-direction: row;
		}

		&--swipeable {
			overflow: hidden;
			touch-action: pan-y;
		}
	}
</style>

<style>
	:root {
		--origam-tab-panels__panel---padding-block: 16px;
		--origam-tab-panels__panel---padding-inline: 0;
	}
</style>
