<template>
	<component
			:is="tag"
			:id="`expansion-panel-header-${expansionPanel.id}`"
			v-ripple="ripple"
			v-contrast
			:aria-controls="`expansion-panel-content-${expansionPanel.id}`"
			:aria-expanded="isSelected"
			:class="expansionPanelHeaderClasses"
			:disabled="isDisabled"
			:style="expansionPanelHeaderStyles"
			:tabindex="isDisabled ? -1 : undefined"
			type="button"
			@click="handleExpand"
	>
		<span class="origam-expansion-panel-header__overlay"/>

		<div class="origam-expansion-panel-header__wrapper">
      <span
		      v-if="hasPrepend"
		      key="prepend"
		      class="origam-expansion-panel-header__prepend"
		      @click="handleClickPrepend"
      >
        <slot
		        name="prepend"
		        v-bind="slotProps"
        >
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
					v-if="hasTitle"
					class="origam-expansion-panel-header__title"
			>
        <slot
		        name="title"
		        v-bind="slotProps"
        >
          <slot
			        name="default"
			        v-bind="slotProps"
          >
            {{ title }}
          </slot>
        </slot>
      </span>

			<span
					v-if="hasAppend || !hideActions"
					key="append"
					class="origam-expansion-panel-header__append"
					@click="handleClickAppend"
			>
        <slot
		        name="append"
		        v-bind="slotProps"
        >
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
          <origam-icon
		          v-if="!hideActions"
		          :icon="isSelected ? collapseIcon : expandIcon"
          />
        </slot>
      </span>
		</div>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, inject, StyleValue, toRef, useSlots } from 'vue'
	import OrigamAvatar from '../Avatar/OrigamAvatar.vue'
	import OrigamIcon from '../Icon/OrigamIcon.vue'

	import { useActive } from '../../composables/Commons/active.composable'
	import { useAdjacent } from '../../composables/Commons/adjacent.composable'
	import { useBothColor } from '../../composables/Commons/bothColor.composable'
	import { useDensity } from '../../composables/Commons/density.composable'
	import { useHover } from '../../composables/Commons/hover.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStateEffect } from '../../composables/Commons/stateEffect.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useTypography } from '../../composables/Commons/typography.composable'

	import { ORIGAM_EXPANSION_PANEL_KEY } from '../../consts/ExpansionPanel/expansion-panel.const'

	import vContrast from '../../directives/Contrast/contrast.directive'
	import vRipple from '../../directives/Ripple/ripple.directive'

	import { MDI_ICONS } from '../../enums/Commons/mdi.enum'

	import type { IExpansionPanelHeaderProps } from '../../interfaces/ExpansionPanel/expansion-panel-header.interface'

	import type { IExpansionPanelHeaderEmits, IExpansionPanelHeaderSlots } from '../../interfaces/ExpansionPanel/expansion-panel-header.interface'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and injection of the parent expansion panel context.
	 ********************************************************/
	const props = withDefaults(defineProps<IExpansionPanelHeaderProps>(), {
		tag: 'button',
		expandIcon: MDI_ICONS.CHEVRON_DOWN,
		collapseIcon: MDI_ICONS.CHEVRON_UP
	})

	defineEmits<IExpansionPanelHeaderEmits>()

	defineSlots<IExpansionPanelHeaderSlots>()

	const {filterProps} = useProps<IExpansionPanelHeaderProps>(props)

	const expansionPanel = inject(ORIGAM_EXPANSION_PANEL_KEY)

	if (!expansionPanel) throw new Error('[Origam] expansion-panel-content needs to be placed inside expansion-panel')

	const slots = useSlots()

	/*********************************************************
	 * Group & Expand
	 *
	 * @description
	 * Selection state, expand/collapse toggle, and slot props.
	 ********************************************************/

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleExpand = () => {
		if (!props.readonly) {
			expansionPanel.toggle()
		}
	}

	const isSelected = computed(() => {
		return expansionPanel.isSelected.value
	})
	const isDisabled = computed(() => {
		return expansionPanel.disabled.value
	})

	const slotProps = computed(() => {
		return {
			collapseIcon: props.collapseIcon,
			disabled: expansionPanel.disabled.value,
			expanded: expansionPanel.isSelected.value,
			expandIcon: props.expandIcon,
			readonly: props.readonly
		}
	})

	const hasTitle = computed(() => {
		return slots.title || slots.default || props.title != null
	})

	/*********************************************************
	 * Adjacent
	 *
	 * @description
	 * Prepend/append icon slots and click handlers.
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
	 * Composable-driven class and style composition.
	 ********************************************************/
	const {densityClasses} = useDensity(props)

	const {isHover, hoverState} = useHover(props)
	const {isActive, activeState} = useActive(props)
	const {
		borderClasses, borderStyles,
		roundedClasses, roundedStyles,
		paddingClasses, paddingStyles,
		marginClasses, marginStyles,
	} = useStateEffect(props, isHover, isActive, hoverState, activeState)
	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))
	const {typographyStyles} = useTypography(props, 'expansion-panel__header')
	const expansionPanelHeaderStyles = computed(() => {
		return [
			colorStyles.value,
			roundedStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			typographyStyles.value,
			props.style
		] as StyleValue
	})
	const expansionPanelHeaderClasses = computed(() => {
		return [
			'origam-expansion-panel-header',
			{
				'origam-expansion-panel-header--active': expansionPanel.isSelected.value,
				'origam-expansion-panel-header--focusable': props.focusable,
				'origam-expansion-panel-header--static': props.static
			},
			colorClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			densityClasses.value,
			roundedClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(expansionPanelHeaderStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Forwards filterProps to parent components.
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
	.origam-expansion-panel-header {
		$this: &;

		outline: var(--origam-expansion-panel__header---outline, none);
		border-radius: var(--origam-expansion-panel__header---border-radius, inherit);
		font-size: var(--origam-expansion-panel__header---font-size, 0.9375rem);
		line-height: var(--origam-expansion-panel__header---line-height, 1);
		min-height: var(--origam-expansion-panel__header---min-height, 48px);
		width: var(--origam-expansion-panel__header---width, 100%);
		border: var(--origam-expansion-panel__header---border, none);

		&__wrapper {
			align-items: var(--origam-expansion-panel__header__wrapper---align-items, center);
			text-align: start;
			display: var(--origam-expansion-panel__header__wrapper---display, flex);
			width: 100%;
			height: 100%;
			padding-block: var(--origam-expansion-panel__header__wrapper---padding-block, 16px);
			padding-inline: var(--origam-expansion-panel__header__wrapper---padding-inline, 24px);
			position: relative;
			transition: var(--origam-expansion-panel__header__wrapper---transition-duration, 0.3s) min-height var(--origam-expansion-panel__header__wrapper---transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
			justify-content: var(--origam-expansion-panel__header__wrapper---justify-content, space-between);
		}

		&__overlay {
			position: var(--origam-expansion-panel__header__overlay---position, absolute);
			top: var(--origam-expansion-panel__header__overlay---top, 0);
			left: var(--origam-expansion-panel__header__overlay---left, 0);
			width: 100%;
			height: 100%;
			background-color: currentColor;
			border-radius: var(--origam-expansion-panel__header__overlay---border-radius, inherit);
			opacity: var(--origam-expansion-panel__header__overlay---opacity, 0);
		}

		&__append,
		&__prepend {
			display: inline-flex;
			margin-bottom: var(--origam-expansion-panel__header__append---margin-block, -4px);
			margin-top: var(--origam-expansion-panel__header__append---margin-block, -4px);
			user-select: none;
		}

		&__append {
			margin-inline-start: var(--origam-expansion-panel__header__append---margin-inline-start, auto);
		}

		&__prepend {
			margin-inline-end: var(--origam-expansion-panel__header__prepend---margin-inline-end, 8px);
		}

		&:hover {
			.origam-expansion-panel-header__overlay {
				opacity: calc(0.04 * 1);
			}
		}

		&:focus-visible,
		&:focus {
			.origam-expansion-panel-header__overlay {
				opacity: var(--origam-expansion-panel__header---focus-overlay-opacity, calc(0.12 * 1));
			}
		}

		&--focusable {
			&#{$this}--active {

				.origam-expansion-panel-header__overlay {
					opacity: var(--origam-expansion-panel__header---focus-overlay-opacity, calc(0.12 * 1));
				}

				&:hover {
					.origam-expansion-panel-header__overlay {
						opacity: calc((0.12 + 0.04) * 1);
					}
				}

				&:focus-visible,
				&:focus {
					.origam-expansion-panel-header__overlay {
						opacity: calc((0.12 + 0.12) * 1);
					}
				}
			}
		}
	}

</style>

