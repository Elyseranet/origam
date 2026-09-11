<template>
	<div
			:id="name"
			role="group"
			:class="selectionControlGroupClasses"
			:style="selectionControlGroupStyles"
	>
		<origam-defaults-provider :defaults="slotDefaults">
			<slot
					name="default"
					v-bind="{items}"
			>
				<template
						v-for="(item, index) in items"
						:key="index"
				>
					<slot
							:name="`item.${index}`"
							v-bind="{item}"
					>
						<slot
								name="item"
								v-bind="{item, index}"
						/>
					</slot>
				</template>
			</slot>
		</origam-defaults-provider>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import { computed, onScopeDispose, provide, StyleValue } from 'vue'
	import { OrigamDefaultsProvider } from '../../components'
	import {
	useProps,
	useStyle,
	useVModel
} from '../../composables'

	import { ORIGAM_SELECTION_CONTROL_GROUP_KEY } from '../../consts'

	import { DENSITY } from '../../enums'

	import type { ISelectionControlGroupProps, ISelectionControlGroupSlots} from "../../interfaces"

	import type { ISelectionControlGroupEmits } from '../../interfaces/SelectionControl/selection-control-group.interface'

	import { getUid } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, slots and filterProps for the
	 * SelectionControlGroup component.
	 ********************************************************/
	const props = withDefaults(defineProps<ISelectionControlGroupProps>(), {
		tag: 'div',
		density: DENSITY.DEFAULT,
		items: () => []
	})

	defineEmits<ISelectionControlGroupEmits>()

	defineSlots<ISelectionControlGroupSlots>()

	const {filterProps} = useProps<ISelectionControlGroupProps>(props)

	/*********************************************************
	 * Slot defaults (group → children)
	 *
	 * @description
	 * Push visual-token + behavioural props down to every
	 * descendant `<origam-selection-control>` as DEFAULTS —
	 * controls that pass their own value still win.
	 * Previously only `density` + `color` were forwarded, so
	 * passing `type="radio"` left every child without a `type`
	 * attribute — clicks never fired `change`, the model never
	 * updated and the radio looked broken. Forward `type` plus
	 * the rest of the group-level surface. (Closes task #24.)
	 ********************************************************/
	const slotDefaults = computed(() => ({
		'origam-selection-control': {
			density: props.density,
			color: props.color,
			type: props.type,
			disabled: props.disabled,
			readonly: props.readonly,
			error: props.error,
			multiple: props.multiple,
			name: props.name,
			ripple: props.ripple,
			falseIcon: props.falseIcon,
			trueIcon: props.trueIcon,
			valueComparator: props.valueComparator
		}
	}))

	/*********************************************************
	 * Value
	 ********************************************************/

	const modelValue = useVModel(props, 'modelValue')
	const uid = getUid()
	const id = computed(() => {
		return props.id || `origam-selection-control-group-${uid}`
	})
	const name = computed(() => {
		return props.name || id.value
	})

	const updateHandlers = new Set<() => void>()

	provide(ORIGAM_SELECTION_CONTROL_GROUP_KEY, {
		modelValue,
		forceUpdate: () => {
			updateHandlers.forEach(fn => fn())
		},
		onForceUpdate: (cb) => {
			updateHandlers.add(cb)

			onScopeDispose(() => {
				updateHandlers.delete(cb)
			})
		}
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * selectionControlGroupStyles and selectionControlGroupClasses
	 * compose the BEM block.
	 ********************************************************/
	const selectionControlGroupStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const selectionControlGroupClasses = computed(() => {
		return [
			'origam-selection-control-group',
			{'origam-selection-control-group--inline': props.inline},
			props.class
		]
	})
	const {id: styleId, css, load, isLoaded, unload} = useStyle(selectionControlGroupStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Exposes filterProps to parent ref consumers.
	 ********************************************************/
	defineExpose({
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
	.origam-selection-control-group {
		display: var(--origam-selection-control-group---display, flex);
		flex-direction: var(--origam-selection-control-group---flex-direction, column);
		flex-wrap: var(--origam-selection-control-group---flex-wrap, wrap);
		gap: var(--origam-selection-control-group---gap, 8px);
		padding-block: var(--origam-selection-control-group---padding-block, 0);
		padding-inline: var(--origam-selection-control-group---padding-inline, 0);

		&--inline {
			flex-direction: var(--origam-selection-control-group---flex-direction-inline, row);
		}
	}
</style>
