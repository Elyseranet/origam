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
	import OrigamDefaultsProvider from '../DefaultsProvider/OrigamDefaultsProvider.vue'
	import OrigamSlideGroup from '../Slide/OrigamSlideGroup.vue'

	import { useBorder } from '../../composables/Commons/border.composable'
	import { useGroup } from '../../composables/Commons/group.composable'
	import { useMargin } from '../../composables/Commons/margin.composable'
	import { usePadding } from '../../composables/Commons/padding.composable'
	import { usePassedProps } from '../../composables/Commons/passedProps.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useRounded } from '../../composables/Commons/rounded.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { ORIGAM_CHIP_GROUP_KEY } from '../../consts/Chip/chip-group.const'

	import { DIRECTION } from '../../enums/Commons/direction.enum'
	import { MDI_ICONS } from '../../enums/Commons/mdi.enum'

	import type { IChipGroupProps } from '../../interfaces/Chip/chip-group.interface'

	import type { IChipGroupEmits, IChipGroupSlots } from '../../interfaces/Chip/chip-group.interface'

	import type { TOrigamSlideGroup } from '../../types/Slide/slide-group.type'

	import { omitUndefined } from '../../utils/Commons/commons.util'

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

	defineSlots<IChipGroupSlots>()

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
	// Forward ONLY what the consumer actually passed — see #263 and the same
	// guard on `OrigamBtnGroup` / `OrigamAvatarGroup`. `color` / `bgColor` are
	// `TColor` (which includes `false`) and `hover` / `active` are
	// `boolean | IHoverState / IActiveState`, so Vue coerces every one of them
	// to a concrete `false` when unset — `omitUndefined` alone cannot see it.
	// Pre-fix, the forwarded `color: false` won the `mergeDeep` against the
	// baseline theme's `'origam-chip': { color: 'primary' }`, so chips lost
	// their themed colour merely by being wrapped in a group.
	const wasPropPassed = usePassedProps(props)
	const slotDefaults = computed(() => ({
		'origam-chip': omitUndefined({
			color: wasPropPassed('color') ? props.color : undefined,
			bgColor: wasPropPassed('bgColor') ? props.bgColor : undefined,
			active: wasPropPassed('active') ? props.active : undefined,
			hover: wasPropPassed('hover') ? props.hover : undefined
		})
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
