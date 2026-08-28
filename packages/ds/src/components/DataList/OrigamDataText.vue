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

	import type { IDataTextEmits, IDataTextProps, IDataTextSlots } from '../../interfaces/DataList/data-text.interface'
	import { computed, StyleValue, toRef } from "vue"

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IDataTextProps>(), {})

	defineEmits<IDataTextEmits>()

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

	// `hoverColor` / `hoverBgColor` (flat props) were removed — this
	// component never wired an `isHover` state to them (no `useStateFlag`,
	// no `@mouseenter`), so the override was dead code: `color`/`bgColor`
	// always resolved to `props.color`/`props.bgColor`. Reading the base
	// props directly is behaviourally identical, not a regression.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))

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

