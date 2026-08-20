<template>
	<nav
			:id="id"
			v-contrast
			:class="stepperClasses"
			:aria-label="t('origam.stepper.progress_steps', 'Progress steps')"
	>
		<slot name="default">
			<template v-if="hasItems">
				<template
						v-for="(item, index) in items"
						:key="index"
				>
					<template v-if="showConnectors && index > 0">
						<span
								:class="connectorClasses(index)"
								aria-hidden="true"
						/>
					</template>

					<origam-stepper-item
							v-bind="item"
							:index="index"
							:data-cy="`stepper-item-${index}`"
							@click="handleItemClick"
					/>
				</template>
			</template>
		</slot>
	</nav>
</template>

<script
		lang="ts"
		setup
>
	import { computed, provide, ref, StyleValue, useSlots, watch } from 'vue'

	import OrigamStepperItem from './OrigamStepperItem.vue'
	import { ORIGAM_STEPPER_KEY } from '../../consts/Stepper/stepper.const'
	import { DENSITY } from '../../enums/Commons/density.enum'
	import { DIRECTION } from '../../enums/Commons/direction.enum'
	import { SIZES } from '../../enums/Commons/size.enum'
	import vContrast from '../../directives/Contrast/contrast.directive'
	import { useDensity } from '../../composables/Commons/density.composable'
	import { useDimension } from '../../composables/Commons/dimension.composable'
	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useSize } from '../../composables/Commons/size.composable'
	import { useStateEffect } from '../../composables/Commons/stateEffect.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import type { IStepperEmits, IStepperProps, IStepperSlots } from '../../interfaces/Stepper/stepper.interface'
	import type { TStepperItemStatus } from '../../types/Stepper/stepper.type'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IStepperProps>(), {
		orientation: 'horizontal',
		clickable: false,
		showConnectors: true,
		modelValue: 0,
		density: DENSITY.DEFAULT,
		size: SIZES.DEFAULT
	})

	/*********************************************************
	 * Labels — localised through the DS i18n provider (`useLocale`).
	 * Keys live under `origam.stepper.*` in the shipped locale messages.
	 ********************************************************/
	const { t } = useLocale()

	const emit = defineEmits<IStepperEmits>()

	defineSlots<IStepperSlots>()

	const { filterProps } = useProps<IStepperProps>(props)

	const slots = useSlots()

	// Internal reactive model (writable ref synced with prop)
	const internalModel = ref<number>(props.modelValue ?? 0)

	watch(() => props.modelValue, (val) => {
		if (val !== undefined) internalModel.value = val
	})

	// Provide stepper context for child items
	provide(ORIGAM_STEPPER_KEY, {
		modelValue: internalModel,
		orientation: computed(() => props.orientation ?? DIRECTION.HORIZONTAL),
		clickable: computed(() => props.clickable ?? false),
		color: computed(() => props.color as string | undefined)
	})

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleItemClick = (index: number) => {
		if (!props.clickable) return
		internalModel.value = index
		emit('update:modelValue', index)
	}

	// Items either from prop or from slot
	const hasItems = computed(() => {
		return (props.items && props.items.length > 0) || !!slots.default
	})

	// Connector status between two items
	const connectorStatus = (index: number): TStepperItemStatus => {
		// Connector at position index is between item[index-1] and item[index]
		// It's "done" if item at index-1 is done or active (and model has passed it)
		const modelValue = internalModel.value
		if ((index - 1) < modelValue) return 'done'
		return 'pending'
	}

	const connectorClasses = (index: number) => [
		'origam-stepper__connector',
		`origam-stepper__connector--${connectorStatus(index)}`
	]

	/*********************************************************
	 * Class & Style
	 ********************************************************/

	const {
		colorClasses, colorStyles,
		borderClasses, borderStyles,
		roundedClasses, roundedStyles,
		elevationClasses, elevationStyles,
		paddingClasses, paddingStyles,
		marginClasses, marginStyles
	} = useStateEffect(props)
	const { densityClasses } = useDensity(props)
	const { sizeClasses } = useSize(props)
	const { dimensionStyles } = useDimension(props)

	const stepperStyles = computed(() => {
		return [
			colorStyles.value,
			roundedStyles.value,
			borderStyles.value,
			dimensionStyles.value,
			elevationStyles.value,
			marginStyles.value,
			paddingStyles.value,
			props.style
		] as StyleValue
	})

	const stepperClasses = computed(() => [
		'origam-stepper',
		`origam-stepper--${props.orientation ?? DIRECTION.HORIZONTAL}`,
		colorClasses.value,
		densityClasses.value,
		sizeClasses.value,
		roundedClasses.value,
		borderClasses.value,
		elevationClasses.value,
		marginClasses.value,
		paddingClasses.value,
		props.class
	])

	/*********************************************************
	 * useStyle
	 *
	 * @description
	 * #381 — the `id` returned by useStyle is a GENERATED identifier,
	 * only meant for the scoped stylesheet selector. Without
	 * `() => props.id` here, it shadowed the `id` PROP of the same
	 * name: the template's `:id="id"` on the root rendered the
	 * generated id, never the consumer's.
	 ********************************************************/
	const { id, css, load, isLoaded, unload } = useStyle(stepperStyles, () => props.id)

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

<style
		lang="scss"
		scoped
>
	.origam-stepper {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		gap: 0;
		padding-block: var(--origam-stepper---padding-block, 8px);
		padding-inline: var(--origam-stepper---padding-inline, 8px);
		width: 100%;
		box-sizing: border-box;

		&--vertical {
			flex-direction: column;

			.origam-stepper__connector {
				width: var(--origam-stepper---connector-thickness, 2px);
				height: var(--origam-stepper---gap, 16px);
				min-width: 0;
				min-height: 16px;
				margin-inline-start: calc((var(--origam-stepper---indicator-size, 32px) / 2) - (var(--origam-stepper---connector-thickness, 2px) / 2));
				margin-block: 4px;
				align-self: flex-start;
			}
		}

		&__connector {
			flex: 1;
			height: var(--origam-stepper---connector-thickness, 2px);
			min-width: 16px;
			margin-inline: 4px;
			margin-block-start: calc((var(--origam-stepper---indicator-size, 32px) / 2) - (var(--origam-stepper---connector-thickness, 2px) / 2));
			align-self: flex-start;
			background-color: var(--origam-stepper---connector-color, var(--origam-color__border---subtle));
			border-radius: var(--origam-radius---full, 9999px);
			transition: background-color 0.2s ease;

			&--done {
				background-color: var(
					--origam-stepper---connector-color-done,
					var(--origam-stepper---color, var(--origam-color__action--primary---bg))
				);
			}

			.origam-stepper--vertical & {
				flex: 0 0 auto;
				margin-block-start: 0;
				align-self: flex-start;
			}
		}

		&--density-comfortable {
			padding-block: 12px;
			padding-inline: 12px;
		}

		&--density-default {
			padding-block: 8px;
			padding-inline: 8px;
		}

		&--density-compact {
			padding-block: 4px;
			padding-inline: 4px;
		}

		&--size-x-small {
			--origam-stepper---indicator-size: 24px;
			--origam-stepper---indicator-font-size: 0.625rem;
			--origam-stepper---title-font-size: 0.75rem;
			--origam-stepper---subtitle-font-size: 0.625rem;
		}

		&--size-small {
			--origam-stepper---indicator-size: 28px;
			--origam-stepper---indicator-font-size: 0.6875rem;
			--origam-stepper---title-font-size: 0.8125rem;
			--origam-stepper---subtitle-font-size: 0.6875rem;
		}

		&--size-default {
			--origam-stepper---indicator-size: 32px;
			--origam-stepper---indicator-font-size: 0.75rem;
			--origam-stepper---title-font-size: 0.875rem;
			--origam-stepper---subtitle-font-size: 0.75rem;
		}

		&--size-large {
			--origam-stepper---indicator-size: 40px;
			--origam-stepper---indicator-font-size: 0.875rem;
			--origam-stepper---title-font-size: 1rem;
			--origam-stepper---subtitle-font-size: 0.8125rem;
		}

		&--size-x-large {
			--origam-stepper---indicator-size: 48px;
			--origam-stepper---indicator-font-size: 1rem;
			--origam-stepper---title-font-size: 1.125rem;
			--origam-stepper---subtitle-font-size: 0.875rem;
		}
	}
</style>
