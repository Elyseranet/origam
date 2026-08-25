<template>
	<origam-expand-y @after-leave="handleAfterLeave">
		<component
				:is="tag"
				v-show="isSelected"
				:id="`expansion-panel-content-${expansionPanel.id}`"
				v-contrast
				:aria-labelledby="`expansion-panel-header-${expansionPanel.id}`"
				:class="expansionPanelContentClasses"
				:style="expansionPanelContentStyles"
				role="region"
		>
			<div class="origam-expansion-panel-content__wrapper">
				<template v-if="loaderConfig.isActive && loaderConfig.kind === 'skeleton'">
					<slot name="loader">
						<origam-skeleton variant="text" :loading="true" v-bind="loaderConfig.overrides"/>
						<origam-skeleton variant="text" :loading="true" v-bind="loaderConfig.overrides"/>
						<origam-skeleton variant="text" :loading="true" v-bind="loaderConfig.overrides"/>
					</slot>
				</template>

				<template v-else-if="loaderConfig.isActive">
					<slot name="loader">
						<origam-progress
								:active="true"
								:indeterminate="loaderConfig.indeterminate"
								:model-value="loaderConfig.modelValue"
								:type="loaderConfig.kind === 'circular' ? PROGRESS_TYPE.CIRCULAR : PROGRESS_TYPE.LINEAR"
								:class="expansionPanelContentProgressClasses"
								thickness="4"
								v-bind="loaderConfig.overrides"
						/>
					</slot>
				</template>

				<template v-if="!loaderConfig.isActive || loaderConfig.kind !== 'skeleton'">
					<template v-if="hasContent">
						<slot name="default">
							<template v-if="isComponent">
								<component :is="content"/>
							</template>

							<template v-else>
								{{ content }}
							</template>
						</slot>
					</template>
				</template>
			</div>
		</component>
	</origam-expand-y>
</template>

<script
		lang="ts"
		setup
>
	import { computed, inject, StyleValue, toRef } from 'vue'
	import OrigamExpandY from '../Transition/OrigamExpandY.vue'
	import OrigamProgress from '../Progress/OrigamProgress.vue'
	import OrigamSkeleton from '../Skeleton/OrigamSkeleton.vue'

	import vContrast from '../../directives/Contrast/contrast.directive'

	import { useBorder } from '../../composables/Commons/border.composable'
	import { useBothColor } from '../../composables/Commons/bothColor.composable'
	import { useDensity } from '../../composables/Commons/density.composable'
	import { useLazy } from '../../composables/Commons/lazy.composable'
	import { useLoader } from '../../composables/Commons/loader.composable'
	import { useMargin } from '../../composables/Commons/margin.composable'
	import { usePadding } from '../../composables/Commons/padding.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useRounded } from '../../composables/Commons/rounded.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { LOADER_KIND } from '../../enums/Commons/loader.enum'
	import { PROGRESS_TYPE } from '../../enums/Progress/progress.enum'

	import { ORIGAM_EXPANSION_PANEL_KEY } from '../../consts/ExpansionPanel/expansion-panel.const'

	import type {
		IExpansionPanelContentEmits,
		IExpansionPanelContentProps,
		IExpansionPanelContentSlots
	} from '../../interfaces/ExpansionPanel/expansion-panel-content.interface'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and injection of the parent expansion panel context.
	 ********************************************************/
	const props = withDefaults(defineProps<IExpansionPanelContentProps>(), {
		tag: 'div'
	})

	defineEmits<IExpansionPanelContentEmits>()

	defineSlots<IExpansionPanelContentSlots>()

	const {filterProps} = useProps<IExpansionPanelContentProps>(props)

	const expansionPanel = inject(ORIGAM_EXPANSION_PANEL_KEY)

	if (!expansionPanel) throw new Error('[Origam] expansion-panel-content needs to be placed inside expansion-panel')

	/*********************************************************
	 * Lazy & Selection
	 *
	 * @description
	 * Deferred content rendering tied to the panel's selection state.
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {hasContent, onAfterLeave: handleAfterLeave} = useLazy(props, expansionPanel.isSelected)

	const isSelected = computed(() => {
		return expansionPanel.isSelected.value
	})
	const isComponent = computed(() => {
		return typeof props.content !== 'string'
	})

	/*********************************************************
	 * Loader
	 *
	 * @description
	 * Line/circular/skeleton loading state for the content area.
	 ********************************************************/
	const {loaderClasses, loaderConfig} = useLoader(props, LOADER_KIND.LINE)

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composable-driven class and style composition.
	 ********************************************************/
	const {borderClasses, borderStyles} = useBorder(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)
	const {densityClasses} = useDensity(props)
	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))
	const {roundedClasses, roundedStyles} = useRounded(props)

	const expansionPanelContentStyles = computed(() => {
		return [
			colorStyles.value,
			roundedStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			props.style
		] as StyleValue
	})
	const expansionPanelContentProgressClasses = computed(() => {
		return [
			'origam-expansion-panel-content__progress',
			`origam-expansion-panel-content__progress--${loaderConfig.value.kind === 'line' ? 'linear' : loaderConfig.value.kind}`
		]
	})
	const expansionPanelContentClasses = computed(() => {
		return [
			'origam-expansion-panel-content',
			loaderClasses.value,
			colorClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			densityClasses.value,
			roundedClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(expansionPanelContentStyles)


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
	.origam-expansion-panel-content {
		display: var(--origam-expansion-panel__content---display, flex);

		&__wrapper {
			padding-block-start: var(--origam-expansion-panel__content---padding-block-start, 8px);
			padding-block-end: var(--origam-expansion-panel__content---padding-block-end, 16px);
			padding-inline-start: var(--origam-expansion-panel__content---padding-inline-start, 24px);
			padding-inline-end: var(--origam-expansion-panel__content---padding-inline-end, 24px);
			flex: var(--origam-expansion-panel__content---flex, 1 1 auto);
			max-width: var(--origam-expansion-panel__content---max-width, 100%);
		}
	}
</style>

