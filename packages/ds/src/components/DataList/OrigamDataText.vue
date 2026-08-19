<template>
	<dd
			:id="id"
			v-contrast
			:class="dataTextClasses"
			:style="dataTextStyles"
	>
    <span
		    v-if="hasPrepend"
		    key="prepend"
		    class="origam-data-text__prepend"
		    @click="handleClickPrepend"
    >
      <slot name="prepend">
        <origam-avatar
		        v-if="prependAvatar"
		        key="prepend-avatar"
		        :density="density"
		        :image="prependAvatar"
        />
        <origam-icon
		        v-if="prependIcon"
		        key="prepend-icon"
		        :density="density"
		        :icon="prependIcon"
        />
      </slot>
    </span>

		<span
				class="origam-data-text__content"
				data-no-activator=""
		>
      <slot name="default">
        {{ text }}
      </slot>
    </span>

		<span
				v-if="hasAppend"
				key="append"
				class="origam-data-text__append"
				@click="handleClickAppend"
		>
      <slot name="append">
        <origam-avatar
		        v-if="appendAvatar"
		        key="append-avatar"
		        :density="density"
		        :image="appendAvatar"
        />
        <origam-icon
		        v-if="appendIcon"
		        key="append-icon"
		        :density="density"
		        :icon="appendIcon"
        />
     </slot>
    </span>
	</dd>
</template>

<script
		lang="ts"
		setup
>

	import OrigamAvatar from '../Avatar/OrigamAvatar.vue'
	import OrigamIcon from '../Icon/OrigamIcon.vue'
	import { useAdjacent } from '../../composables/Commons/adjacent.composable'
	import { useBothColor } from '../../composables/Commons/bothColor.composable'
	import { useDensity } from '../../composables/Commons/density.composable'
	import { useMargin } from '../../composables/Commons/margin.composable'
	import { usePadding } from '../../composables/Commons/padding.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import vContrast from '../../directives/Contrast/contrast.directive'

	import type { IDataTextProps, IDataTextSlots } from '../../interfaces/DataList/data-text.interface'
	import { computed, shallowRef, StyleValue, toRef } from "vue"

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IDataTextProps>(), {})

	defineSlots<IDataTextSlots>()

	const {filterProps} = useProps<IDataTextProps>(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {densityClasses} = useDensity(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)

	/*********************************************************
	 * Icon
	 ********************************************************/

	const {
		onClickPrepend: handleClickPrepend,
		onClickAppend: handleClickAppend,
		hasAppend,
		hasPrepend
	} = useAdjacent(props, toRef(props, 'prependIcon'), toRef(props, 'appendIcon'))

	const isHover = shallowRef(false)

	// `||` (not `??`) — Vue 3 coerces unset `TColor` props to `false`,
	// not `undefined`, so the nullish coalescing operator wouldn't fall
	// back. Same fix as the OrigamSwitch / OrigamDataTitle equivalent.
	const hoverColor = computed(() => {
		return props.hoverColor || props.color
	})
	const color = computed(() => {
		return isHover.value ? hoverColor.value : props.color
	})
	const hoverBgColor = computed(() => {
		return props.hoverBgColor || props.color
	})
	const bgColor = computed(() => {
		return isHover.value ? hoverBgColor.value : props.bgColor
	})

	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(bgColor, color)

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const dataTextStyles = computed(() => {
		return [
			paddingStyles.value,
			marginStyles.value,
			colorStyles.value,
			props.style
		] as StyleValue
	})
	const dataTextClasses = computed(() => {
		return [
			'origam-data-text',
			colorClasses.value,
			paddingClasses.value,
			marginClasses.value,
			densityClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(dataTextStyles, () => props.id)


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

