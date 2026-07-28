<template>
	<component
			:is="props.tag"
			v-contrast
			:class="expansionPanelClasses"
			:style="expansionPanelStyles"
	>
		<div
				:class="[...elevationClasses]"
				class="origam-expansion-panel__shadow"
		/>

		<template v-if="hasLoading">
			<slot name="loader">
				<div class="origam-expansion-panel__loader">
					<origam-progress
							v-if="loaderConfig.kind !== 'skeleton'"
							:active="true"
							:indeterminate="loaderConfig.indeterminate"
							:model-value="loaderConfig.modelValue"
							:type="loaderConfig.kind === 'circular' ? PROGRESS_TYPE.CIRCULAR : PROGRESS_TYPE.LINEAR"
							:class="expansionPanelProgressClasses"
							thickness="4"
							v-bind="loaderConfig.overrides"
					/>
				</div>
			</slot>
		</template>

		<template v-if="hasHeader">
			<slot
					name="header"
					v-bind="expansionPanelHeaderProps"
			>
				<origam-expansion-panel-header
						key="header"
						ref="origamExpansionPanelHeaderRef"
						class="origam-expansion-panel__header"
						v-bind="expansionPanelHeaderProps"
				>
					<template
							v-if="slots.prepend"
							#prepend="prependSlotProps"
					>
						<slot
								name="prepend"
								v-bind="prependSlotProps"
						/>
					</template>

					<template
							v-if="slots.title"
							#title="titleSlotProps"
					>
						<slot
								name="title"
								v-bind="titleSlotProps"
						>
							{{ title }}
						</slot>
					</template>

					<template
							v-if="slots.append"
							#append="appendSlotProps"
					>
						<slot
								name="append"
								v-bind="appendSlotProps"
						/>
					</template>
				</origam-expansion-panel-header>
			</slot>
		</template>

		<template v-if="hasContent">
			<slot
					name="wrapper"
					v-bind="expansionPanelContentProps"
			>
				<origam-expansion-panel-content
						key="content"
						ref="origamExpansionPanelContentRef"
						class="origam-expansion-panel__content"
						v-bind="expansionPanelContentProps"
				>
					<template
							v-if="slots.default"
							#default
					>
						<slot name="default"/>
					</template>
				</origam-expansion-panel-content>
			</slot>
		</template>

		<slot
				v-else
				name="default"
		/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, provide, ref, StyleValue, toRef, useSlots } from 'vue'
	import { OrigamExpansionPanelContent, OrigamExpansionPanelHeader, OrigamProgress } from '../../components'

	import {
		useActive,
		useBothColor,
		useDefaults,
		useDensity,
		useGroupItem,
		useHover,
		useLoader,
		useProps,
		useStateEffect,
		useStyle
} from '../../composables'

	import { vContrast } from '../../directives'

	import { ORIGAM_EXPANSION_PANEL_KEY } from '../../consts'

	import { PROGRESS_TYPE } from '../../enums'

	import type { IExpansionPanelProps} from '../../interfaces'

	import type { IExpansionPanelEmits } from '../../interfaces/ExpensionPanel/expansion-panel.interface'

	import type { TOrigamExpansionPanelContent, TOrigamExpansionPanelHeader } from "../../types"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props resolved through the parent OrigamExpansionPanels defaults
	 * provider, group registration, and composable setup.
	 ********************************************************/
	const _props = withDefaults(defineProps<IExpansionPanelProps>(), {
		tag: 'div'
	})

	// Resolve props against the closest `provideDefaults({ 'origam-expansion-panel': … })`
	// injected by a parent `OrigamExpansionPanels`.
	const props = useDefaults(_props)

	defineEmits<IExpansionPanelEmits>()

	const {filterProps} = useProps<IExpansionPanelProps>(props)

	const origamExpansionPanelHeaderRef = ref<TOrigamExpansionPanelHeader>()
	const origamExpansionPanelContentRef = ref<TOrigamExpansionPanelContent>()

	const groupItem = useGroupItem(props, ORIGAM_EXPANSION_PANEL_KEY)
	const slots = useSlots()

	/*********************************************************
	 * Group
	 *
	 * @description
	 * Tracks selection state, position relative to selected siblings,
	 * and provides the group context to child header/content.
	 ********************************************************/
	const isDisabled = computed(() => {
		return groupItem?.disabled.value || props.disabled
	})

	const selectedIndices = computed(() => {
		return groupItem?.group.items.value.reduce<number[]>((arr, item, index) => {
			if (groupItem?.group.selected.value.includes(item.id)) {
				arr.push(index)
			}

			return arr
		}, [])
	})

	const isBeforeSelected = computed(() => {
		const index = groupItem?.group.items.value.findIndex((item) => {
			return item.id === groupItem?.id
		}) ?? -1

		return !groupItem?.isSelected.value && selectedIndices.value?.some((selectedIndex) => {
			return selectedIndex - index === 1
		})
	})
	const isAfterSelected = computed(() => {
		const index = groupItem?.group.items.value.findIndex((item) => {
			return item.id === groupItem?.id
		}) ?? -1

		return !groupItem?.isSelected.value && selectedIndices.value?.some((selectedIndex) => {
			return selectedIndex - index === -1
		})
	})

	if (groupItem !== null) {
		provide(ORIGAM_EXPANSION_PANEL_KEY, groupItem)
	}

	/*********************************************************
	 * Loader
	 *
	 * @description
	 * Controls the line/circular/skeleton loader at the panel top.
	 ********************************************************/
	const {loaderClasses, loaderConfig} = useLoader(props, 'line')

	const hasLoading = computed(() => {
		return slots.loader || loaderConfig.value.isActive
	})

	/*********************************************************
	 * Slots
	 *
	 * @description
	 * Determines which structural sections to render.
	 ********************************************************/
	const hasContent = computed(() => {
		return slots.content || !!props.content
	})
	const hasHeader = computed(() => {
		return slots.header || slots.title || slots.prepend || slots.append || !!props.title
	})

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const expansionPanelHeaderProps = computed(() => {
		return origamExpansionPanelHeaderRef.value?.filterProps(props, ['class', 'id', 'style', 'tag'])
	})
	const expansionPanelContentProps = computed(() => {
		return origamExpansionPanelContentRef.value?.filterProps(props, ['class', 'id', 'style', 'tag'])
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composable-driven class and style composition.
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/
	const {densityClasses} = useDensity(props)

	const {isHover, hoverState} = useHover(props)
	const {isActive, activeState} = useActive(props)
	const {
		borderClasses, borderStyles,
		roundedClasses, roundedStyles,
		elevationClasses,
		paddingClasses, paddingStyles,
		marginClasses, marginStyles,
	} = useStateEffect(props, isHover, isActive, hoverState, activeState)
	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))
	const expansionPanelStyles = computed(() => {
		return [
			colorStyles.value,
			roundedStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			props.style
		] as StyleValue
	})
	const expansionPanelProgressClasses = computed(() => {
		return [
			'origam-expansion-panel__progress',
			`origam-expansion-panel__progress--${loaderConfig.value.kind === 'line' ? 'linear' : loaderConfig.value.kind}`
		]
	})
	const expansionPanelClasses = computed(() => {
		return [
			'origam-expansion-panel',
			{
				'origam-expansion-panel--active': groupItem?.isSelected.value,
				'origam-expansion-panel--before-active': isBeforeSelected.value,
				'origam-expansion-panel--after-active': isAfterSelected.value,
				'origam-expansion-panel--disabled': isDisabled.value
			},
			loaderClasses.value,
			colorClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			densityClasses.value,
			elevationClasses.value,
			roundedClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(expansionPanelStyles)


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
	.origam-expansion-panel {
		flex: var(--origam-expansion-panel---flex, 1 0 100%);
		max-width: var(--origam-expansion-panel---max-width, 100%);
		position: var(--origam-expansion-panel---position, relative);
		transition-duration: var(--origam-expansion-panel---transition-duration, 0.3s);
		transition-property: var(--origam-expansion-panel---transition-property, margin-top, border-radius, border, max-width);
		transition-timing-function: var(--origam-expansion-panel---transition-timing-function, cubic-bezier(0.4, 0, 0.2, 1));
		border-radius: var(--origam-expansion-panel---border-radius, 4px);

		&:not(:first-child) {
			&:after {
				border-top-style: solid;
				border-top-width: thin;
				border-top-color: var(--origam-expansion-panel---divider-color, var(--origam-color__border---subtle));
				opacity: var(--origam-expansion-panel---divider-opacity, 0.12);
				content: "";
				left: 0;
				position: absolute;
				right: 0;
				top: 0;
				transition: var(--origam-expansion-panel---transition-duration, 0.3s) opacity var(--origam-expansion-panel---transition-timing-function, cubic-bezier(0.4, 0, 0.2, 1));
			}
		}

		&--disabled {
			:deep(.origam-expansion-panel-header) {
				color: var(--origam-expansion-panel---disabled-color, var(--origam-color__text---disabled));
				pointer-events: var(--origam-expansion-panel---disabled-pointer-events, none);

				.origam-expansion-panel-header__overlay {
					opacity: var(--origam-expansion-panel---disabled-overlay-opacity, 0.4615384615);
				}
			}
		}

		&--active {
			&:not(:first-child),
			+ .origam-expansion-panel {
				margin-top: var(--origam-expansion-panel---active-margin-top, 16px);

				&:after {
					opacity: 0;
				}
			}

			:deep(.origam-expansion-panel-header) {
				border-bottom-left-radius: 0;
				border-bottom-right-radius: 0;

				&:not(.origam-expansion-panel-header--static) {
					min-height: var(--origam-expansion-panel__header---min-height-active, 64px);
				}
			}
		}

		&__shadow {
			position: var(--origam-expansion-panel__shadow---position, absolute);
			top: var(--origam-expansion-panel__shadow---top, 0);
			left: var(--origam-expansion-panel__shadow---left, 0);
			width: var(--origam-expansion-panel__shadow---width, 100%);
			height: var(--origam-expansion-panel__shadow---height, 100%);
			box-shadow: var(--origam-expansion-panel__shadow---box-shadow, var(--origam-shadow---sm));
			border-radius: var(--origam-expansion-panel__shadow---border-radius, inherit);
			z-index: var(--origam-expansion-panel__shadow---z-index, -1);
		}
	}
</style>

