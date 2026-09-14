<template>
	<dt
			:id="id"
			v-contrast
			:class="dataTitleClasses"
			:style="dataTitleStyles"
	>
    <span
		    v-if="hasPrepend"
		    key="prepend"
		    class="origam-data-title__prepend"
		    :role="isPrependClickable ? 'button' : undefined"
		    :tabindex="isPrependClickable ? 0 : undefined"
		    @click="handleClickPrepend"
		    @keydown="handleKeydownPrepend"
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
				class="origam-data-title__content"
				data-no-activator=""
		>
      <slot
		      name="default"
		      v-bind="{text}"
      >
        {{ text }}
      </slot>
    </span>

		<span
				v-if="hasAppend"
				key="append"
				class="origam-data-title__append"
				:role="isAppendClickable ? 'button' : undefined"
				:tabindex="isAppendClickable ? 0 : undefined"
				@click="handleClickAppend"
				@keydown="handleKeydownAppend"
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
	</dt>
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

	import type { IDataTitleEmits, IDataTitleProps, IDataTitleSlots } from '../../interfaces/DataList/data-title.interface'
	import { computed, StyleValue, toRef } from "vue"

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IDataTitleProps>(), {})

	defineEmits<IDataTitleEmits>()

	defineSlots<IDataTitleSlots>()

	const {filterProps} = useProps<IDataTitleProps>(props)

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
		onKeydownPrepend: handleKeydownPrepend,
		onKeydownAppend: handleKeydownAppend,
		isPrependClickable,
		isAppendClickable,
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
	const dataTitleStyles = computed(() => {
		return [
			paddingStyles.value,
			marginStyles.value,
			colorStyles.value,
			props.style
		] as StyleValue
	})
	const dataTitleClasses = computed(() => {
		return [
			'origam-data-title',
			colorClasses.value,
			paddingClasses.value,
			marginClasses.value,
			densityClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(dataTitleStyles, () => props.id)


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

