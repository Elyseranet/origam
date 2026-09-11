<template>
	<origam-menu
			ref="origamMenuRef"
			v-model:model-value="modelValue"
			:class="contextualMenuClasses"
			:open-on-click="false"
			:style="contextualMenuStyles"
			activator="cursor"
			open-on-context-menu
			target="cursor"
			v-bind="menuProps"
	>
		<template
				v-for="(_, name) in $slots"
				#[name]="slotProps"
		>
			<slot
					:name="name"
					v-bind="slotProps || {}"
			/>
		</template>
	</origam-menu>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamMenu, OrigamTranslateScale } from "../../components"
	import { useProps, useVModel , useStyle} from "../../composables"
	import { INLINE, LOCATION_STRATEGIES, SCROLL_STRATEGIES } from "../../enums"
	import type { IContextualMenuProps } from "../../interfaces"
	import type { TOrigamMenu, TTransitionProps } from "../../types"
	import { forwardRefs } from "../../utils"

	import { computed, ref, StyleValue } from "vue"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, composables and top-level refs.
	 ********************************************************/

	const props = withDefaults(defineProps<IContextualMenuProps>(), {
		target: 'cursor',
		openOnClick: false,
		openOnContextMenu: true,
		activator: 'cursor',
		closeDelay: 250,
		closeOnContentClick: true,
		locationStrategy: LOCATION_STRATEGIES.CONNECTED,
		openDelay: 300,
		scrim: false,
		location: INLINE.RIGHT,
		scrollStrategy: SCROLL_STRATEGIES.REPOSITION,
		offset: 8,
		transition: () => ({component: OrigamTranslateScale}) as unknown as TTransitionProps
	})

	const {filterProps} = useProps<IContextualMenuProps>(props)

	/*********************************************************
	 * Value
	 ********************************************************/

	const modelValue = useVModel(props, 'modelValue', false)

	const origamMenuRef = ref<TOrigamMenu>()

	/*********************************************************
	 * Props forwarding
	 *
	 * @description
	 * Filtered props passed down to the inner menu component.
	 ********************************************************/

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const menuProps = computed(() => {
		return origamMenuRef.value?.filterProps(props, ['class', 'id', 'style', 'modelValue', 'activator', 'target', 'openOnClick', 'openOnContextualMenu'])
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes and inline styles.
	 ********************************************************/

	const contextualMenuStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const contextualMenuClasses = computed(() => {
		return [
			'origam-contextual-menu',
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(contextualMenuStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface exposed to parent components.
	 ********************************************************/

	defineExpose(forwardRefs({filterProps,
		css,
		id,
		load,
		unload,
		isLoaded
	}, origamMenuRef))

</script>

