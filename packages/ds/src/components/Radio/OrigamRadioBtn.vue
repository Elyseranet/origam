<template>
	<origam-selection-control
			ref="origamSelectionControlRef"
			v-model="model"
			:class="radioBtnClasses"
			:false-icon="falseIcon"
			:style="radioBtnStyles"
			:true-icon="trueIcon"
			type="radio"
			v-bind="controlProps"
			@click:label="handleClickLabel"
	>
		<template
				v-if="slots.default"
				#default
		>
			<slot name="default"/>
		</template>

		<template
				v-if="slots.input"
				#input="{props, icon, model}"
		>
			<slot
					name="input"
					v-bind="{props, icon, model}"
			/>
		</template>

		<template
				v-if="slots.label"
				#label
		>
			<slot name="label"/>
		</template>
	</origam-selection-control>
</template>

<script
		lang="ts"
		setup
>
	import { computed, ref, StyleValue, useSlots } from 'vue'
	import { OrigamSelectionControl } from '../../components'

	import {
	useProps,
	useStyle,
	useVModel
} from '../../composables'

	import { DENSITY, MDI_ICONS } from '../../enums'

	import type { IRadioBtnProps} from '../../interfaces'

	import type { IRadioBtnEmits } from '../../interfaces/Radio/radio-btn.interface'

	import type { TOrigamSelectionControl } from "../../types"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits and filterProps for the RadioBtn component.
	 ********************************************************/
	const props = withDefaults(defineProps<IRadioBtnProps>(), {
		density: DENSITY.DEFAULT,
		trueIcon: MDI_ICONS.RADIOBOX_MARKED,
		falseIcon: MDI_ICONS.RADIOBOX_BLANK
	})

	const emits = defineEmits<IRadioBtnEmits>()

	const {filterProps} = useProps<IRadioBtnProps>(props)

	/*********************************************************
	 * DOM refs
	 *
	 * @description
	 * Ref to the SelectionControl sub-component for forward-prop
	 * delegation via filterProps.
	 ********************************************************/
	const origamSelectionControlRef = ref<TOrigamSelectionControl>()

	/*********************************************************
	 * Value & slots
	 *
	 * @description
	 * v-model binding and slots for conditional template delegation.
	 ********************************************************/

	/*********************************************************
	 * Value
	 ********************************************************/

	const model = useVModel(props, 'modelValue')

	const slots = useSlots()

	/*********************************************************
	 * Event handlers
	 *
	 * @description
	 * Label click forwarded up to Radio / RadioGroup.
	 ********************************************************/
	const handleClickLabel = (e: MouseEvent) => {
		emits('click:label', e)
	}

	/*********************************************************
	 * Forwarded props
	 *
	 * @description
	 * Props forwarded to SelectionControl via filterProps.
	 ********************************************************/
	const controlProps = computed(() => {
		return origamSelectionControlRef.value?.filterProps(props, ['class', 'style', 'id', 'modelValue', 'falseIcon', 'trueIcon', 'type'])
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * radioBtnStyles and radioBtnClasses compose the BEM block.
	 ********************************************************/
	const radioBtnStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const radioBtnClasses = computed(() => {
		return [
			'origam-radio-btn',
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(radioBtnStyles)


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
		isLoaded
	})
</script>
