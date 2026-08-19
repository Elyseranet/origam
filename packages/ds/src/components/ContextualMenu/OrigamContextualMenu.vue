<template>
	<origam-menu
			:id="id"
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
	import OrigamMenu from '../Menu/OrigamMenu.vue'
	import OrigamTranslateScale from '../Transition/OrigamTranslateScale.vue'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useVModel } from '../../composables/Commons/vModel.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { INLINE } from '../../enums/Commons/anchor.enum'
	import { LOCATION_STRATEGIES } from '../../enums/Commons/location.enum'
	import { SCROLL_STRATEGIES } from '../../enums/Commons/scroll.enum'
	import type { IContextualMenuProps } from '../../interfaces/ContextualMenu/contextual-menu.interface'
	import type { TOrigamMenu } from '../../types/Menu/menu.type'
	import type { TTransitionProps } from '../../types/Transition/transition.type'
	import { forwardRefs } from '../../utils/Commons/forwardRefs.util'

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
	const {id, css, load, isLoaded, unload} = useStyle(contextualMenuStyles, () => props.id)


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

	/*
	 * No `defineSlots<IContextualMenuSlots>()` here, deliberately. Like
	 * `<OrigamChart>`, `<OrigamContextualMenu>` is a transparent
	 * passthrough — the template does `v-for="(_, name) in $slots"` and
	 * forwards WHATEVER named slots the consumer provides straight to the
	 * inner `<OrigamMenu>`. Typing `defineSlots` to `IMenuSlots` would
	 * under-document (the consumer can pass any slot name, not just the
	 * ones Menu documents) while a widened `Record<string, (b: any) => any>`
	 * signature compiles but adds zero type safety. The well-known slot
	 * shape accepted downstream is `IMenuSlots` (see
	 * `interfaces/Menu/menu.interface.ts`) — refer to it for what actually
	 * reaches the DOM.
	 */

</script>

