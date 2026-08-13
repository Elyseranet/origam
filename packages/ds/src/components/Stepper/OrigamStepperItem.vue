<template>
	<component
			:is="isClickable ? 'button' : 'div'"
			:class="itemClasses"
			:type="isClickable ? 'button' : undefined"
			:aria-current="resolvedStatus === 'active' ? 'step' : undefined"
			:aria-label="stepAriaLabel"
			:disabled="isClickable && resolvedStatus === 'active' ? true : undefined"
			@click="handleClick"
	>
		<span
				v-contrast
				:class="indicatorClasses"
				aria-hidden="true"
		>
			<template v-if="resolvedStatus === 'done'">
				<origam-icon :icon="MDI_ICONS.CHECK" />
			</template>
			<template v-else-if="resolvedStatus === 'error'">
				<origam-icon :icon="MDI_ICONS.EXCLAMATION" />
			</template>
			<template v-else-if="icon">
				<origam-icon :icon="icon" />
			</template>
			<template v-else>
				{{ (index ?? 0) + 1 }}
			</template>
		</span>

		<span class="origam-stepper-item__label">
			<span
					v-if="title"
					class="origam-stepper-item__title"
			>{{ title }}</span>
			<span
					v-if="subtitle"
					class="origam-stepper-item__subtitle"
			>{{ subtitle }}</span>
		</span>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, inject } from 'vue'

	import { OrigamIcon } from '../../components'
	import { ORIGAM_STEPPER_KEY } from '../../consts'
	import { MDI_ICONS } from '../../enums'
	import { useLocale, useProps } from '../../composables'
	import { vContrast } from '../../directives'

	import type { IStepperItemEmits, IStepperItemProps } from '../../interfaces'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IStepperItemProps>(), {
		index: 0
	})

	/*********************************************************
	 * Labels — localised through the DS i18n provider (`useLocale`).
	 * Keys live under `origam.stepper.*` in the shipped locale messages.
	 * `stepAriaLabel` uses positional interpolation: {0} = step number, {1} = title.
	 ********************************************************/
	const { t } = useLocale()

	const stepAriaLabel = computed<string | undefined>(() => {
		if (!props.title) return undefined
		return t('origam.stepper.step_aria_label', (props.index ?? 0) + 1, props.title)
	})

	const emit = defineEmits<IStepperItemEmits>()

	const { filterProps } = useProps<IStepperItemProps>(props)

	// Inject stepper context from parent
	const stepper = inject(ORIGAM_STEPPER_KEY)

	// Resolved clickable: parent wrapper's `clickable` prop wins by default
	// (set via provide/inject), and the item-level `clickable` prop can
	// only OVERRIDE it when explicitly `true`. Pre-fix this used a
	// `props.clickable !== undefined` check, but Vue 3 auto-coerces
	// unprovided Boolean props to `false` (not `undefined`), so the item
	// always reported `clickable=false` and never consulted the inject —
	// reproduced by the `Clickable item click updates the active step`
	// e2e (item rendered as `<div>` instead of `<button>`).
	const isClickable = computed(() => {
		if (props.clickable === true) return true
		return stepper?.clickable.value ?? false
	})

	// Status resolution: explicit prop wins, else compute from modelValue
	const resolvedStatus = computed(() => {
		if (props.status !== undefined) return props.status
		const modelValue = stepper?.modelValue.value ?? 0
		const idx = props.index ?? 0
		if (idx < modelValue) return 'done'
		if (idx === modelValue) return 'active'
		return 'pending'
	})

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleClick = () => {
		if (!isClickable.value) return
		emit('click', props.index ?? 0)
		if (stepper) {
			stepper.modelValue.value = props.index ?? 0
		}
	}

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const orientation = computed(() => stepper?.orientation.value ?? 'horizontal')

	const itemClasses = computed(() => [
		'origam-stepper-item',
		`origam-stepper-item--${resolvedStatus.value}`,
		`origam-stepper-item--${orientation.value}`,
		{
			'origam-stepper-item--clickable': isClickable.value
		},
		props.class
	])

	const indicatorClasses = computed(() => [
		'origam-stepper-item__indicator',
		`origam-stepper-item__indicator--${resolvedStatus.value}`
	])

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		filterProps,
		resolvedStatus
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-stepper-item {
		$this: &;

		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--origam-stepper---gap, 8px);
		flex: 1;
		min-width: 0;
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		cursor: default;
		text-decoration: none;

		&--clickable {
			cursor: pointer;

			&:hover {
				#{$this}__indicator {
					opacity: 0.85;
				}
			}

			&:focus-visible {
				outline: 2px solid var(--origam-stepper---indicator-active-bg, var(--origam-color__action--primary---bg));
				outline-offset: 2px;
				border-radius: var(--origam-radius---full, 9999px);
			}
		}

		&__indicator {
			display: flex;
			align-items: center;
			justify-content: center;
			width: var(--origam-stepper---indicator-size, 32px);
			height: var(--origam-stepper---indicator-size, 32px);
			border-radius: var(--origam-radius---full, 9999px);
			font-size: var(--origam-stepper---indicator-font-size, 0.75rem);
			font-weight: var(--origam-stepper---indicator-font-weight, 500);
			flex-shrink: 0;
			transition: background-color 0.2s ease, color 0.2s ease;

			background-color: var(--origam-stepper---indicator-bg, var(--origam-color__surface---overlay));
			color: var(--origam-stepper---indicator-color, var(--origam-color__text---secondary));
			border: var(--origam-stepper---indicator-border-width, 2px) solid currentColor;

			:deep(.origam-icon) {
				font-size: calc(var(--origam-stepper---indicator-font-size, 0.75rem) * 1.4);
				line-height: 1;
			}

			&--active,
			&--done {
				color: var(
					--origam-stepper---color,
					var(--origam-color__action--primary---bg)
				);
				border-color: var(
					--origam-stepper---color,
					var(--origam-color__action--primary---bg)
				);
				background-color: var(
					--origam-stepper---background-color,
					color-mix(
						in srgb,
						var(--origam-stepper---color, var(--origam-color__action--primary---bg)) 16%,
						transparent
					)
				);
			}

			&--error {
				background-color: var(--origam-stepper---indicator-error-bg, var(--origam-color__feedback--danger---bg));
				color: var(--origam-stepper---indicator-error-color, var(--origam-color__feedback--danger---fg));
				border-color: var(--origam-stepper---indicator-error-bg, var(--origam-color__feedback--danger---bg));
			}
		}

		&__label {
			display: flex;
			flex-direction: column;
			align-items: center;
			text-align: center;
			min-width: 0;
		}

		&--vertical {
			flex-direction: row;
			align-items: flex-start;
			gap: var(--origam-stepper---gap, 8px);

			#{$this}__label {
				align-items: flex-start;
				text-align: start;
			}
		}

		&__title {
			font-size: var(--origam-stepper---title-font-size, 0.875rem);
			font-weight: var(--origam-stepper---title-font-weight, 500);
			color: var(--origam-stepper---title-color, var(--origam-color__text---primary));
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			max-width: 100%;
		}

		&__subtitle {
			font-size: var(--origam-stepper---subtitle-font-size, 0.75rem);
			color: var(--origam-stepper---subtitle-color, var(--origam-color__text---secondary));
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			max-width: 100%;
		}
	}
</style>
