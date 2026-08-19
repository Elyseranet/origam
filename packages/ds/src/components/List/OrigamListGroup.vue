<template>
	<component
			:is="tag"
			:id="styleId"
			v-contrast
			:class="listGroupClasses"
			:style="listGroupStyles"
	>
		<origam-defaults-provider :defaults="slotDefaults">
			<slot name="default">
				<origam-list-group-activator class="origam-list-group__activator">
					<slot
							name="activator"
							v-bind="{ events: activatorEvents, props: activatorProps, isOpen, toggleIcon }"
					>
						<origam-list-item
								:active="isOpen"
								:append-icon="appendActivatorIcon"
								:prepend-icon="prependActivatorIcon"
								:title="title"
								:value="value"
								v-bind="activatorProps"
								v-on="activatorEvents"
						/>
					</slot>
				</origam-list-group-activator>

				<origam-transition
						:disabled="!isBooted"
						:transition="transition"
				>
					<div
							v-if="isOpen"
							:aria-labelledby="id"
							class="origam-list-group__items"
							role="group"
					>
						<slot name="items"/>
					</div>
				</origam-transition>
			</slot>
		</origam-defaults-provider>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, ref, StyleValue, toRef } from 'vue'
	import OrigamDefaultsProvider from '../DefaultsProvider/OrigamDefaultsProvider.vue'
	import OrigamExpandY from '../Transition/OrigamExpandY.vue'
	import OrigamListGroupActivator from './OrigamListGroupActivator.vue'
	import OrigamListItem from './OrigamListItem.vue'
	import OrigamTransition from '../Transition/OrigamTransition.vue'

	import { useBothColor } from '../../composables/Commons/bothColor.composable'
	import { useHover } from '../../composables/Commons/hover.composable'
	import { useList } from '../../composables/List/list.composable'
	import { useNestedItem } from '../../composables/Commons/nestedItem.composable'
	import { usePassedProps } from '../../composables/Commons/passedProps.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useSsrBoot } from '../../composables/Commons/ssrBoot.composable'
	import { useStateEffect } from '../../composables/Commons/stateEffect.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import vContrast from '../../directives/Contrast/contrast.directive'

	import { omitUndefined } from '../../utils/Commons/commons.util'

	import { MDI_ICONS } from '../../enums/Commons/mdi.enum'

	import type { IListActivatorProps, IListGroupProps } from '../../interfaces/List/list-group.interface'

	import type { IListGroupEmits, IListGroupSlots } from '../../interfaces/List/list-group.interface'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IListGroupProps>(), {
		tag: 'div',
		expandIcon: MDI_ICONS.CHEVRON_DOWN,
		collapseIcon: MDI_ICONS.CHEVRON_UP
	})

	const emits = defineEmits<IListGroupEmits>()

	defineSlots<IListGroupSlots>()


	const {isHover, hoverState} = useHover(props)
	const {
		borderClasses, borderStyles,
		roundedClasses, roundedStyles,
		paddingClasses, paddingStyles,
		marginClasses, marginStyles,
	} = useStateEffect(props, isHover, undefined, hoverState, undefined)
	const {filterProps} = useProps<IListGroupProps>(props)

	// Push visual-token props down to every descendant `<origam-list-item>` as
	// DEFAULTS — items that pass their own props still win.
	// Forward ONLY what the consumer actually passed — see #263. `color` /
	// `bgColor` are `TColor`, which includes `false`, so Vue coerces them to a
	// concrete `false` when unset and `omitUndefined` alone cannot see it.
	const wasPropPassed = usePassedProps(props)
	const slotDefaults = computed(() => ({
		'origam-list-item': omitUndefined({
			color: wasPropPassed('color') ? props.color : undefined,
			bgColor: wasPropPassed('bgColor') ? props.bgColor : undefined
		})
	}))

	// Phase 3 (Vague D) — class-first companion alongside inline styles.
	/*********************************************************
	 * Composables
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))
	const {isOpen, open, id: _id} = useNestedItem(toRef(props, 'value'), true)
	const id = computed(() => `origam-list-group--id-${String(_id.value)}`)
	const list = useList()
	const {isBooted} = useSsrBoot()
	const transition = ref({component: OrigamExpandY})

	const toggleIcon = computed(() => {
		if (isOpen.value) {
			return props.collapseIcon
		}

		return props.expandIcon
	})
	const activatorProps = computed(() => {
		return {
			class: 'origam-list-group__header',
			id: id.value,
			'onClick': handleClick
		} as IListActivatorProps
	})

	const activatorEvents = computed(() => ({}))

	const prependActivatorIcon = computed(() => {
		return props.prependIcon
	})
	const appendActivatorIcon = computed(() => {
		return props.appendIcon || toggleIcon.value
	})

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleClick = (e: Event) => {
		emits('click:activator', {open: !isOpen.value, event: e})

		open(!isOpen.value, e)
	}

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const listGroupStyles = computed(() => {
		return [
			colorStyles.value,
			roundedStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			props.style
		] as StyleValue
	})
	const listGroupClasses = computed(() => {
		return [
			'origam-list-group',
			{
				'origam-list-group--prepend': list && list.hasPrepend.value,
				'origam-list-group--append': list && list.hasAppend.value,
				'origam-list-group--fluid': props.fluid,
				'origam-list-group--open': isOpen.value
			},
			colorClasses.value,
			roundedClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})
	const {id: styleId, css, load, isLoaded, unload} = useStyle(listGroupStyles, () => props.id)


	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		isOpen,
		filterProps,
		css,
		id,
		load,
		unload,
		isLoaded,
		styleId
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-list-group {
		$this: &;

		&--fluid {
			--origam-list-group---list-indent-size: var(--origam-list-group--fluid---list-indent-size, 0px);

			&#{$this}--prepend {
				--origam-list-group---parent-padding: var(--origam-list---indent-padding, 0px);
			}
		}

		&--prepend {
			--origam-list-group---parent-padding: calc(var(--origam-list---indent-padding, 0px) + var(--origam-list-group---prepend-width, 16px));
		}

		&__items {
			--origam-list---indent-padding: calc(var(--origam-list-group---parent-padding, 0px) + var(--origam-list-group---list-indent-size, 16px));
		}

		&__header {
			.origam-list-item {
				$item: &;

				&--active {
					&:not(:focus-visible) {
						#{$item}__overlay {
							opacity: var(--origam-list-group__header--active---opacity, 0);
						}
					}

					&:hover {
						#{$item}__overlay {
							opacity: var(--origam-list-group__header--active--hover---opacity, calc(0.04 * 1));
						}
					}
				}
			}
		}
	}
</style>

