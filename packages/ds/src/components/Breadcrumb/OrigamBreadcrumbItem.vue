<template>
	<component
			:is="link.tag.value"
			v-contrast
			:aria-current="isActive ? 'page' : undefined"
			:class="breadcrumbItemClasses"
			:href="link.href"
			:style="breadcrumbItemStyles"
			@click="link.navigate"
			@mouseenter="handleMouseenter"
			@mouseleave="handleMouseleave"
	>
		<template v-if="hasPrepend">
      <span
		      key="prepend"
		      class="origam-breadcrumb-item__prepend"
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
		</template>

		<slot name="default">
			<span>{{ title }}</span>
		</slot>

		<template v-if="hasAppend">
      <span
		      key="append"
		      class="origam-breadcrumb-item__append"
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
		</template>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import OrigamAvatar from '../Avatar/OrigamAvatar.vue'
	import OrigamIcon from '../Icon/OrigamIcon.vue'

	import vContrast from '../../directives/Contrast/contrast.directive'

	import { useActive } from '../../composables/Commons/active.composable'
	import { useAdjacent } from '../../composables/Commons/adjacent.composable'
	import { useDensity } from '../../composables/Commons/density.composable'
	import { useHover } from '../../composables/Commons/hover.composable'
	import { useLink } from '../../composables/Commons/link.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStateEffect } from '../../composables/Commons/stateEffect.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { DENSITY } from '../../enums/Commons/density.enum'

	import type { IBreadcrumbItemProps } from '../../interfaces/Breadcrumb/breadcrumb-item.interface'

	import type { IBreadcrumbItemEmits, IBreadcrumbItemSlots } from '../../interfaces/Breadcrumb/breadcrumb-item.interface'

	import { computed, ComputedRef, StyleValue, toRef, useAttrs } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props resolved against the closest OrigamBreadcrumb
	 * defaults provider.
	 ********************************************************/
	const props = withDefaults(defineProps<IBreadcrumbItemProps>(), {tag: 'span', density: DENSITY.DEFAULT})

	defineEmits<IBreadcrumbItemEmits>()

	defineSlots<IBreadcrumbItemSlots>()

	const {filterProps} = useProps<IBreadcrumbItemProps>(props)

	const attrs = useAttrs()

	const link = useLink(props, attrs)

	/*********************************************************
	 * Effect
	 *
	 * @description
	 * Hover, active state and color resolution.
	 ********************************************************/
	const {isHover, hoverState, onMouseenter: handleMouseenter, onMouseleave: handleMouseleave} = useHover(props)
	const {isActive: active, activeState, activeClasses} = useActive(props)

	const isActive = computed(() => {
		return active.value || link.isActive?.value
	})

	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const { colorClasses, colorStyles, borderClasses, borderStyles, roundedClasses, roundedStyles, paddingClasses, paddingStyles, marginClasses, marginStyles } = useStateEffect(props, isHover, isActive as unknown as ComputedRef<boolean>, hoverState, activeState, computed(() => !!props.disabled))

	/*********************************************************
	 * Adjacent (prepend / append)
	 *
	 * @description
	 * Resolves prepend/append icons and click handlers.
	 ********************************************************/

	/*********************************************************
	 * Icon
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {
		hasAppend,
		hasPrepend,
		onClickPrepend: handleClickPrepend,
		onClickAppend: handleClickAppend
	} = useAdjacent(props, toRef(props, 'prependIcon'), toRef(props, 'appendIcon'))

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes all spacing, color and variant classes/styles.
	 ********************************************************/
	const {densityClasses} = useDensity(props)
	const breadcrumbItemStyles = computed(() => {
		return [
			colorStyles.value,
			roundedStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			props.style
		] as StyleValue
	})
	const breadcrumbItemClasses = computed(() => {
		return [
			'origam-breadcrumb-item',
			{
				'origam-breadcrumb-item--link': !!link.href.value,
				'origam-breadcrumb-item--disabled': props.disabled
			},
			activeClasses.value,
			colorClasses.value,
			densityClasses.value,
			roundedClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})

	const {id, css, load, isLoaded, unload} = useStyle(breadcrumbItemStyles)

	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface: filterProps, style utilities.
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

<style
		lang="scss"
		scoped
>
	.origam-breadcrumb-item {
		--origam-breadcrumb-item---text-decoration: none;
		--origam-breadcrumb-item---border-top-width: 0px;
		--origam-breadcrumb-item---border-left-width: 0px;
		--origam-breadcrumb-item---border-bottom-width: 0px;
		--origam-breadcrumb-item---border-right-width: 0px;
		--origam-breadcrumb-item---border-width: var(--origam-breadcrumb-item---border-top-width) var(--origam-breadcrumb-item---border-left-width) var(--origam-breadcrumb-item---border-bottom-width) var(--origam-breadcrumb-item---border-right-width);
		--origam-breadcrumb-item---border-color: currentColor;
		--origam-breadcrumb-item---border-style: solid;
		--origam-breadcrumb-item---border-radius: 0px;
		--origam-breadcrumb-item---density: 0px;
		--origam-breadcrumb-item---box-shadow: var(--origam-shadow---none, none);
		--origam-breadcrumb-item---color: var(--origam-breadcrumb-item---color-token, inherit);
		--origam-breadcrumb-item---opacity: 1;
		--origam-breadcrumb-item---background: transparent;
		--origam-breadcrumb-item---margin-inline-start: 0px;
		--origam-breadcrumb-item---margin-inline-end: 0px;
		--origam-breadcrumb-item---margin-block-start: 0px;
		--origam-breadcrumb-item---margin-block-end: 0px;
		--origam-breadcrumb-item---padding-block-start: 8px;
		--origam-breadcrumb-item---padding-block-end: 8px;
		--origam-breadcrumb-item---padding-inline-start: 8px;
		--origam-breadcrumb-item---padding-inline-end: 8px;
		--origam-breadcrumb-item---transition-duration: 0.2s, 0.1s;
		--origam-breadcrumb-item---transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		--origam-breadcrumb-item---transition-property: transform, color;
		--origam-breadcrumb-item---transition: var(--origam-breadcrumb-item---transition-property) var(--origam-breadcrumb-item---transition-duration) var(--origam-breadcrumb-item---transition-timing-function);

		align-items: center;
		display: inline-flex;
		vertical-align: middle;

		text-decoration: var(--origam-breadcrumb-item---text-decoration);

		transition: var(--origam-breadcrumb-item---transition);

		background: var(--origam-breadcrumb-item---background);
		box-shadow: var(--origam-breadcrumb-item---box-shadow);
		color: var(--origam-breadcrumb-item---color);
		opacity: var(--origam-breadcrumb-item---opacity);

		border-color: var(--origam-breadcrumb-item---border-color);
		border-style: var(--origam-breadcrumb-item---border-style);
		border-width: var(--origam-breadcrumb-item---border-width);
		border-radius: var(--origam-breadcrumb-item---border-radius);

		padding-block-start: calc(var(--origam-breadcrumb-item---padding-block-start) - var(--origam-breadcrumb-item---density));
		padding-block-end: calc(var(--origam-breadcrumb-item---padding-block-end) - var(--origam-breadcrumb-item---density));
		padding-inline-start: calc(var(--origam-breadcrumb-item---padding-inline-start) - var(--origam-breadcrumb-item---density));
		padding-inline-end: calc(var(--origam-breadcrumb-item---padding-inline-end) - var(--origam-breadcrumb-item---density));

		margin-block-start: var(--origam-breadcrumb-item---margin-block-start);
		margin-block-end: var(--origam-breadcrumb-item---margin-block-end);
		margin-inline-start: var(--origam-breadcrumb-item---margin-inline-start);
		margin-inline-end: var(--origam-breadcrumb-item---margin-inline-end);

		&--disabled {
			--origam-breadcrumb-item---opacity: var(--origam-breadcrumb-item---opacity-disabled, 0.5);
			pointer-events: none;
		}

		&--density-comfortable {
			--origam-breadcrumb-item---density: -8px;
		}

		&--density-default {
			--origam-breadcrumb-item---density: 0px;
		}

		&--density-compact {
			--origam-breadcrumb-item---density: 8px;
		}

		&__prepend,
		&__append {
			align-items: center;
			display: inline-flex;
		}
	}
</style>
