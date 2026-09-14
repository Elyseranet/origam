<template>
	<component
			:is="tag"
			:id="id"
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
			<origam-tooltip
					:model-value="copied"
					:text="resolvedFeedbackText"
					location="top"
			>
				<template #activator="{props: tooltipProps}">
					<origam-btn
							v-bind="tooltipProps"
							class="origam-clipboard__default-trigger"
							:class="{ 'origam-clipboard__default-trigger--copied': copied }"
							:icon="triggerIcon"
							:disabled="disabled"
							:aria-label="defaultAriaLabel"
							data-cy="origam-clipboard-default-trigger"
							@click="handleCopy"
					/>
				</template>

				<template #default>
					<slot
							name="feedback"
							:copied="copied"
					>{{ resolvedFeedbackText }}</slot>
				</template>
			</origam-tooltip>
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

	import { OrigamBtn } from '../Btn'
	import { OrigamTooltip } from '../Tooltip'

	import { useBorder } from '../../composables/Commons/border.composable'
	import { useBothColor } from '../../composables/Commons/bothColor.composable'
	import { useClipboard } from '../../composables/Clipboard/clipboard.composable'
	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useMargin } from '../../composables/Commons/margin.composable'
	import { usePadding } from '../../composables/Commons/padding.composable'
	import { useRounded } from '../../composables/Commons/rounded.composable'
	import { useTypography } from '../../composables/Commons/typography.composable'


	import type { IClipboardProps } from '../../interfaces/Clipboard/clipboard.interface'

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
		feedbackText: undefined,
		successText: undefined,
		disabled: false,
		icon: 'mdi:mdi-content-copy',
		copiedIcon: 'mdi:mdi-check'
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
	/*********************************************************
	 * const
	 *
	 * @description
	 * BEM-child surface: vars are read by .origam-clipboard__default-trigger
	 * (font-size / font-weight), but BOUND ON THE ROOT — custom properties
	 * inherit, and a DS component does not necessarily forward a received
	 * :style down to its rendered root element.
	 ********************************************************/
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

	const resolvedFeedbackText = computed(() => props.successText ?? props.feedbackText ?? t('origam.clipboard.copied'))

	/*********************************************************
	 * triggerIcon — swaps to the acknowledgement icon while `copied`.
	 *
	 * @description
	 * Both sides are now props (`icon` / `copiedIcon`) instead of the
	 * module-level `MDI_ICONS.CONTENT_COPY` constant this component used
	 * to hardcode: an icon a consumer could not pick was a dead surface,
	 * and a theme could not reach it either.
	 *
	 * @description
	 * Read inside a `computed`, never eagerly in the `setup()` body —
	 * ADR-005: the theme props resolver writes in `beforeCreate`, AFTER
	 * `setup()` runs, so a value captured eagerly never sees the theme.
	 ********************************************************/
	const triggerIcon = computed(() => copied.value ? props.copiedIcon : props.icon)

	const defaultAriaLabel = computed(() => copied.value
		? t('origam.clipboard.copied_aria_label')
		: t('origam.clipboard.copy_aria_label')
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

	/*********************************************************
	 * rootStyles
	 *
	 * @description
	 * Les `--origam-clipboard__feedback---*` vivent sur la RACINE, pas sur le
	 * declencheur : ce sont des proprietes personnalisees, donc elles HERITENT
	 * jusqu'au bouton, ou la regle SCSS `.origam-clipboard__default-trigger`
	 * les lit.
	 *
	 * @description
	 * ⛔ Les poser sur `<origam-btn>` ne fonctionnait pas — un composant DS ne
	 * fait pas forcement redescendre un `:style` recu jusqu'a l'element racine
	 * rendu.
	 ********************************************************/
	const rootStyles = computed<StyleValue>(() => [
		typographyStyles.value,
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

	/*********************************************************
	 * __default-trigger — now an <origam-btn>, not a raw <button>.
	 *
	 * @description
	 * The reset that used to live here (`all: unset` + a hand-rolled
	 * hover / focus-visible / disabled chrome) existed only because the
	 * trigger was a bare `<button>`. Applied to an `<origam-btn>` it would
	 * strip the DS button's own surface — its variant, density, focus ring
	 * and disabled treatment — and we would be re-implementing in this file
	 * what the DS already owns. It is gone.
	 *
	 * @description
	 * What remains is what the CLIPBOARD, and only it, has to say: the
	 * typography channel its own `--origam-clipboard__feedback---*` tokens
	 * drive, and the acknowledged state. Everything else is the button's.
	 ********************************************************/
	.origam-clipboard__default-trigger {
		font-size: var(--origam-clipboard__feedback---font-size, 0.75rem);
		font-weight: var(--origam-clipboard__feedback---font-weight, 500);
		transition: color var(--origam-clipboard__feedback---transition-duration, 160ms) ease,
		            background-color var(--origam-clipboard__feedback---transition-duration, 160ms) ease;
	}

	.origam-clipboard__default-trigger--copied {
		color: var(--origam-clipboard__feedback---color);
		background-color: var(--origam-clipboard__feedback---bg-color);
	}

</style>
