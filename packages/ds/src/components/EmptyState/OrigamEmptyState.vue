<template>
	<component
			:is="tag"
			:class="emptyStateClasses"
			:style="emptyStateStyles"
			role="status"
			aria-live="polite"
	>
		<slot v-if="hasDefaultSlot"/>

		<template v-else>
			<div
					class="origam-empty-state__icon"
					aria-hidden="true"
			>
				<slot name="icon">
					<origam-icon
							:icon="resolvedIcon"
							class="origam-empty-state__icon-glyph"
					/>
				</slot>
			</div>

			<div
					v-if="hasTitle"
					class="origam-empty-state__title"
					:style="titleTypographyStyles"
			>
				<slot name="title">{{ title }}</slot>
			</div>

			<div
					v-if="hasDescription"
					class="origam-empty-state__description"
					:style="descriptionTypographyStyles"
			>
				<slot name="description">{{ description }}</slot>
			</div>

			<div
					v-if="hasActions"
					class="origam-empty-state__actions"
			>
				<slot name="actions"/>
			</div>
		</template>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import {
		computed,
		StyleValue,
		useSlots
	} from 'vue'

	import { OrigamIcon } from '../Icon'

	import { useTypography } from '../../composables'

	import { EMPTY_STATE_PRESET_CONFIG } from '../../consts/EmptyState/empty-state.const'

	import type { IEmptyStateProps } from '../../interfaces'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props + defaults for `<OrigamEmptyState>`. The component renders
	 * a flex stack (icon / title / description / actions) inside a
	 * `role="status"` container. All visual decisions are token-driven
	 * — the SCSS layer only branches on the size, align and intent
	 * modifier classes.
	 *
	 * The five built-in presets (no-data / no-results / error /
	 * offline / locked) are resolved via `EMPTY_STATE_PRESET_CONFIG`
	 * (`src/consts/EmptyState/empty-state.const.ts`); they bundle a
	 * default icon and intent so callers do not have to wire those by
	 * hand for the 95% case. Either side can be overridden via the
	 * `icon` and `iconColor` props.
	 ********************************************************/
	const props = withDefaults(defineProps<IEmptyStateProps>(), {
		tag: 'div',
		preset: 'no-data',
		size: 'md',
		align: 'center'
	})

	const slots = useSlots()

	/*********************************************************
	 * Preset resolution
	 *
	 * @description
	 * Resolves the (icon, intent) bundle for the current `preset` and
	 * applies the user-provided `icon` / `iconColor` overrides on top.
	 ********************************************************/
	const presetConfig = computed(() => EMPTY_STATE_PRESET_CONFIG[props.preset!])

	const resolvedIcon = computed(() => props.icon ?? presetConfig.value.icon)

	const resolvedIntent = computed(() => props.iconColor ?? presetConfig.value.intent)

	/*********************************************************
	 * Slot resolution
	 *
	 * @description
	 * Slot overrides take priority over props — passing `#title` with
	 * no `title` prop still surfaces the heading. The default slot, if
	 * provided, fully replaces the built-in layout (icon + title +
	 * description + actions).
	 ********************************************************/
	const hasDefaultSlot = computed(() => Boolean(slots.default))
	const hasTitle = computed(() => Boolean(slots.title) || (props.title?.length ?? 0) > 0)
	const hasDescription = computed(() => Boolean(slots.description) || (props.description?.length ?? 0) > 0)
	const hasActions = computed(() => Boolean(slots.actions))

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * The size + align + intent are materialised through static
	 * modifier classes. The SCSS layer translates those into the right
	 * token overrides; the component never branches on the variant at
	 * the JS level.
	 ********************************************************/
	const emptyStateClasses = computed(() => {
		return [
			'origam-empty-state',
			`origam-empty-state--size-${props.size}`,
			`origam-empty-state--align-${props.align}`,
			`origam-empty-state--preset-${props.preset}`,
			`origam-empty-state--intent-${resolvedIntent.value}`,
			props.class
		]
	})

	const emptyStateStyles = computed<StyleValue>(() => {
		return [props.style] as StyleValue
	})

	/*********************************************************
	 * Typography
	 *
	 * @description
	 * The shared `ITypographyProps` set drives BOTH text surfaces at
	 * once: one `useTypography` call per BEM surface, each re-pointing the
	 * matching `--origam-empty-state__{title|description}---*` variable.
	 * `fontSize` overrides the size-driven font-size via the generic-first
	 * read in the `font-size` declaration of each surface.
	 ********************************************************/
	const {typographyStyles: titleTypographyStyles} = useTypography(props, 'empty-state__title')
	const {typographyStyles: descriptionTypographyStyles} = useTypography(props, 'empty-state__description')

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		resolvedIcon,
		resolvedIntent,
		hasDefaultSlot,
		hasTitle,
		hasDescription,
		hasActions
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-empty-state {
		--origam-empty-state---resolved-padding-block: var(--origam-empty-state---padding-block-md, var(--origam-empty-state---padding-block, 40px));
		--origam-empty-state---resolved-padding-inline: var(--origam-empty-state---padding-inline, 24px);
		--origam-empty-state---resolved-gap: var(--origam-empty-state---gap-md, var(--origam-empty-state---gap, 16px));
		--origam-empty-state---resolved-max-width: var(--origam-empty-state---max-width, 480px);
		--origam-empty-state---resolved-icon-size: var(--origam-empty-state__icon---size-md, var(--origam-empty-state__icon---size, 64px));
		--origam-empty-state---resolved-icon-color: var(--origam-empty-state__icon---color, var(--origam-color__text---secondary, #525252));
		--origam-empty-state---resolved-title-color: var(--origam-empty-state__title---color, var(--origam-color__text---primary, #171717));
		--origam-empty-state---resolved-title-font-size: var(--origam-empty-state__title---font-size-md, var(--origam-empty-state__title---font-size, 1.25rem));
		--origam-empty-state---resolved-description-color: var(--origam-empty-state__description---color, var(--origam-color__text---secondary, #525252));
		--origam-empty-state---resolved-description-font-size: var(--origam-empty-state__description---font-size-md, var(--origam-empty-state__description---font-size, 1rem));

		display: flex;
		flex-direction: column;
		gap: var(--origam-empty-state---resolved-gap);
		padding-block: var(--origam-empty-state---resolved-padding-block);
		padding-inline: var(--origam-empty-state---resolved-padding-inline);
		box-sizing: border-box;
		width: 100%;
	}

	.origam-empty-state__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--origam-empty-state---resolved-icon-color);
		font-size: var(--origam-empty-state---resolved-icon-size);
		line-height: 1;
	}

	.origam-empty-state__icon-glyph {
		font-size: inherit;
		color: inherit;
	}

	.origam-empty-state__title {
		color: var(--origam-empty-state---resolved-title-color);
		font-family: var(--origam-empty-state__title---font-family, Inter, system-ui, sans-serif);
		font-weight: var(--origam-empty-state__title---font-weight, 600);
		font-size: var(--origam-empty-state__title---font-size, var(--origam-empty-state---resolved-title-font-size));
		line-height: var(--origam-empty-state__title---line-height, 1.375);
		margin: 0;
	}

	.origam-empty-state__description {
		color: var(--origam-empty-state---resolved-description-color);
		font-family: var(--origam-empty-state__description---font-family, Inter, system-ui, sans-serif);
		font-weight: var(--origam-empty-state__description---font-weight, 400);
		font-size: var(--origam-empty-state__description---font-size, var(--origam-empty-state---resolved-description-font-size));
		line-height: var(--origam-empty-state__description---line-height, 1.625);
		max-width: var(--origam-empty-state---resolved-max-width);
		margin: 0;
	}

	.origam-empty-state__actions {
		display: inline-flex;
		flex-wrap: wrap;
		gap: var(--origam-empty-state__actions---gap, 12px);
		margin-top: var(--origam-empty-state__actions---margin-top, 8px);
	}

	.origam-empty-state--align-center {
		align-items: center;
		text-align: center;
	}

	.origam-empty-state--align-center .origam-empty-state__description {
		margin-inline: auto;
	}

	.origam-empty-state--align-left {
		align-items: flex-start;
		text-align: left;
	}

	.origam-empty-state--size-sm {
		--origam-empty-state---resolved-padding-block: var(--origam-empty-state---padding-block-sm, 24px);
		--origam-empty-state---resolved-gap: var(--origam-empty-state---gap-sm, 12px);
		--origam-empty-state---resolved-icon-size: var(--origam-empty-state__icon---size-sm, 48px);
		--origam-empty-state---resolved-title-font-size: var(--origam-empty-state__title---font-size-sm, 1.125rem);
		--origam-empty-state---resolved-description-font-size: var(--origam-empty-state__description---font-size-sm, 0.875rem);
	}

	.origam-empty-state--size-md {
		--origam-empty-state---resolved-padding-block: var(--origam-empty-state---padding-block-md, 40px);
		--origam-empty-state---resolved-gap: var(--origam-empty-state---gap-md, 16px);
		--origam-empty-state---resolved-icon-size: var(--origam-empty-state__icon---size-md, 64px);
		--origam-empty-state---resolved-title-font-size: var(--origam-empty-state__title---font-size-md, 1.25rem);
		--origam-empty-state---resolved-description-font-size: var(--origam-empty-state__description---font-size-md, 1rem);
	}

	.origam-empty-state--size-lg {
		--origam-empty-state---resolved-padding-block: var(--origam-empty-state---padding-block-lg, 64px);
		--origam-empty-state---resolved-gap: var(--origam-empty-state---gap-lg, 24px);
		--origam-empty-state---resolved-icon-size: var(--origam-empty-state__icon---size-lg, 96px);
		--origam-empty-state---resolved-title-font-size: var(--origam-empty-state__title---font-size-lg, 1.5rem);
		--origam-empty-state---resolved-description-font-size: var(--origam-empty-state__description---font-size-lg, 1.125rem);
	}

	.origam-empty-state--intent-neutral {
		--origam-empty-state---resolved-icon-color: var(--origam-color__text---secondary);
	}

	.origam-empty-state--intent-primary {
		--origam-empty-state---resolved-icon-color: var(--origam-color__action--primary---bg);
	}

	.origam-empty-state--intent-secondary {
		--origam-empty-state---resolved-icon-color: var(--origam-color__action--secondary---bg);
	}

	.origam-empty-state--intent-ghost {
		--origam-empty-state---resolved-icon-color: var(--origam-color__text---secondary);
	}

	.origam-empty-state--intent-success {
		--origam-empty-state---resolved-icon-color: var(--origam-color__feedback--success---bg);
	}

	.origam-empty-state--intent-warning {
		--origam-empty-state---resolved-icon-color: var(--origam-color__feedback--warning---bg);
	}

	.origam-empty-state--intent-danger {
		--origam-empty-state---resolved-icon-color: var(--origam-color__feedback--danger---bg);
	}

	.origam-empty-state--intent-info {
		--origam-empty-state---resolved-icon-color: var(--origam-color__feedback--info---bg);
	}
</style>
