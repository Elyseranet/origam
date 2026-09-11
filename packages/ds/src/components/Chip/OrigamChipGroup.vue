<template>
	<origam-slide-group
			ref="origamSlideGroupRef"
			:class="chipGroupClasses"
			:style="chipGroupStyles"
			v-bind="{...slideGroupProps}"
	>
		<origam-defaults-provider :defaults="slotDefaults">
			<slot
					name="default"
					v-bind="{isSelected, select, next, prev, selected}"
			/>
		</origam-defaults-provider>
	</origam-slide-group>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamDefaultsProvider, OrigamSlideGroup } from '../../components'

	import { useBorder, useGroup, useMargin, usePadding, useProps, useRounded, useStyle } from "../../composables"

	import { ORIGAM_CHIP_GROUP_KEY } from "../../consts"

	import { DIRECTION, MDI_ICONS } from '../../enums'

	import type { IChipGroupProps} from '../../interfaces'

	import type { IChipGroupEmits } from '../../interfaces/Chip/chip-group.interface'

	import type { TOrigamSlideGroup } from "../../types"

	import { computed, ref, StyleValue } from "vue";

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, group selection and defaults propagation
	 * to child chips.
	 ********************************************************/

	const props = withDefaults(defineProps<IChipGroupProps>(), {
		direction: DIRECTION.HORIZONTAL,
		nextIcon: MDI_ICONS.CHEVRON_RIGHT,
		prevIcon: MDI_ICONS.CHEVRON_LEFT,
		selectedClass: 'origam-chip--selected'
	})

	defineEmits<IChipGroupEmits>()

	const {filterProps} = useProps<IChipGroupProps>(props)

	const origamSlideGroupRef = ref<TOrigamSlideGroup>()

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {isSelected, select, next, prev, selected} = useGroup(props, ORIGAM_CHIP_GROUP_KEY)

	/*********************************************************
	 * Spacing / border / rounded
	 ********************************************************/

	const {marginClasses, marginStyles} = useMargin(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {borderClasses, borderStyles} = useBorder(props)
	const {roundedClasses, roundedStyles} = useRounded(props)

	// Push the visual-token props down to every descendant `<origam-chip>`
	// as DEFAULTS (children that pass their own value still win). Same
	// pattern as `OrigamBtnGroup` — see the propagation contract there.
	const slotDefaults = computed(() => ({
		'origam-chip': {
			color: props.color,
			bgColor: props.bgColor,
			active: props.active,
			hover: props.hover,
		}
	}))

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const slideGroupProps = computed(() => {
		return origamSlideGroupRef.value?.filterProps(props)
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes BEM modifier classes and passes through host styles.
	 ********************************************************/

	const chipGroupStyles = computed(() => {
		return [
			marginStyles.value,
			paddingStyles.value,
			borderStyles.value,
			roundedStyles.value,
			props.style
		] as StyleValue
	})
	const chipGroupClasses = computed(() => {
		return [
			'origam-chip-group',
			{
				'origam-chip-group--column': props.column
			},
			marginClasses.value,
			paddingClasses.value,
			borderClasses.value,
			roundedClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(chipGroupStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface: filterProps.
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
