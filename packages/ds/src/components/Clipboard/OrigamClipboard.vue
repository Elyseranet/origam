<template>
	<component
			:is="tag"
			class="origam-clipboard"
			:class="rootClasses"
			:style="rootStyles"
			data-cy="origam-clipboard"
	>
		<slot
				:copy="handleCopy"
				:copied="copied"
				:error="error"
		>
			<button
					type="button"
					class="origam-clipboard__default-trigger"
					:class="{ 'origam-clipboard__default-trigger--copied': copied }"
					:style="typographyStyles"
					:disabled="disabled"
					:aria-label="defaultAriaLabel"
					data-cy="origam-clipboard-default-trigger"
					@click="handleCopy"
			>
				<origam-icon
						:icon="defaultIcon"
						class="origam-clipboard__default-icon"
						aria-hidden="true"
				/>
				<span
						v-if="copied"
						class="origam-clipboard__default-label"
						aria-live="polite"
				>{{ resolvedFeedbackText }}</span>
			</button>
		</slot>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import {
		computed,
		toRef,
		type StyleValue
	} from 'vue'

	import { OrigamIcon } from '../Icon'

	import { useBorder, useBothColor, useClipboard, useLocale, useMargin, usePadding, useRounded, useTypography } from '../../composables'

	import { MDI_ICONS } from '../../enums'

	import type {
		IClipboardProps
	} from '../../interfaces'

	import type { IClipboardEmits, IClipboardSlots } from '../../interfaces/Clipboard/clipboard.interface'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props + defaults for `<OrigamClipboard>`. The component is a thin
	 * wrapper around `useClipboard`: it auto-renders a default trigger
	 * button whose label flips to the feedback text while `copied` is
	 * true. Consumers needing a different feedback surface (toast, pill,
	 * inline status, …) replace the default with a custom `#default`
	 * scoped slot — the slot exposes `{ copy, copied, error }`.
	 *
	 * Defaults are inlined here (not pulled from a CLIPBOARD_DEFAULTS
	 * const) because the Vue SFC compiler analyses `withDefaults`
	 * statically and only resolves literals — cf. CLAUDE.md rule.
	 ********************************************************/
	const props = withDefaults(defineProps<IClipboardProps>(), {
		tag: 'span',
		feedbackDuration: 2000,
		feedbackText: 'Copied!',
		successText: undefined,
		disabled: false
	})

	const emit = defineEmits<IClipboardEmits>()

	defineSlots<IClipboardSlots>()

	/*********************************************************
	 * Color
	 ********************************************************/
	const { colorClasses, colorStyles } = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))

	/*********************************************************
	 * Composables — layout & chrome.
	 ********************************************************/
	const { borderClasses, borderStyles } = useBorder(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { marginClasses, marginStyles } = useMargin(props)
	const { paddingClasses, paddingStyles } = usePadding(props)
	// BEM-child surface: vars are read by .origam-clipboard__default-trigger
	// (font-size / font-weight). Bound directly on that element, not the root.
	const { typographyStyles } = useTypography(props, 'clipboard__feedback')

	/*********************************************************
	 * Composable — owns the copy pipeline + auto-resetting flag.
	 ********************************************************/
	const { copy, copied, error } = useClipboard({
		feedbackDuration: props.feedbackDuration
	})

	/*********************************************************
	 * Labels — localised through the DS i18n provider (`useLocale`).
	 * Keys live under `origam.clipboard.*` in the shipped locale messages.
	 ********************************************************/
	const { t } = useLocale()

	const resolvedFeedbackText = computed(() => props.successText ?? props.feedbackText ?? 'Copied!')

	const defaultIcon = MDI_ICONS.CONTENT_COPY

	const defaultAriaLabel = computed(() => copied.value
		? t('origam.clipboard.copied_aria_label', 'Value copied to clipboard')
		: t('origam.clipboard.copy_aria_label', 'Copy to clipboard')
	)

	/*********************************************************
	 * Handler — short-circuits when disabled, otherwise drives the
	 * composable and forwards success / error to the parent emit.
	 ********************************************************/
	async function handleCopy (): Promise<boolean> {
		if (props.disabled) return false
		const ok = await copy(props.value)
		if (ok) {
			emit('copy', props.value)
		} else if (error.value) {
			emit('error', error.value)
		}
		return ok
	}

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			'origam-clipboard--copied': copied.value,
			'origam-clipboard--disabled': props.disabled
		},
		colorClasses.value,
		borderClasses.value,
		roundedClasses.value,
		marginClasses.value,
		paddingClasses.value,
		props.class
	])

	const rootStyles = computed<StyleValue>(() => [
		colorStyles.value,
		borderStyles.value,
		roundedStyles.value,
		marginStyles.value,
		paddingStyles.value,
		props.style
	] as StyleValue)

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		copy: handleCopy,
		copied,
		error
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-clipboard {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: var(--origam-clipboard__feedback---gap, 4px);
	}

	.origam-clipboard--disabled {
		cursor: not-allowed;
	}

	.origam-clipboard__default-trigger {
		all: unset;
		box-sizing: border-box;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: var(--origam-clipboard__feedback---gap, 4px);
		padding: var(--origam-clipboard__feedback---padding-block, 4px)
		         var(--origam-clipboard__feedback---padding-inline, 8px);
		border-radius: var(--origam-clipboard__feedback---border-radius, 4px);
		font-size: var(--origam-clipboard__feedback---font-size, 0.75rem);
		font-weight: var(--origam-clipboard__feedback---font-weight, 500);
		color: var(--origam-color__text---secondary);
		transition: color var(--origam-clipboard__feedback---transition-duration, 160ms) ease,
		            background-color var(--origam-clipboard__feedback---transition-duration, 160ms) ease;
	}

	.origam-clipboard__default-trigger:hover:not(:disabled) {
		color: var(--origam-color__text---primary);
		background-color: var(--origam-color__surface---raised);
	}

	.origam-clipboard__default-trigger:focus-visible {
		outline: 2px solid var(--origam-color__action--primary---bg);
		outline-offset: 2px;
	}

	.origam-clipboard__default-trigger:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.origam-clipboard__default-trigger--copied {
		color: var(--origam-clipboard__feedback---color);
		background-color: var(--origam-clipboard__feedback---bg-color);
	}

	.origam-clipboard__default-icon {
		font-size: 1.125em;
		line-height: 1;
	}

	.origam-clipboard__default-label {
		font: inherit;
	}

</style>
