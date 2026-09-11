<template>
	<component
			:is="tag"
			:cite="cite"
			:class="blockquoteClasses"
			:style="blockquoteStyles"
	>
		<span
				v-if="showQuoteMark"
				class="origam-blockquote__mark origam-blockquote__mark--bg"
				aria-hidden="true"
		>{{ openMark }}</span>

		<div class="origam-blockquote__body">
			<slot/>
		</div>

		<footer
				v-if="hasAttribution"
				class="origam-blockquote__attribution"
		>
			<span class="origam-blockquote__dash" aria-hidden="true">— </span>

			<span class="origam-blockquote__author">
				<slot name="author">{{ author }}</slot>
			</span>

			<span
					v-if="hasSource"
					class="origam-blockquote__separator"
					aria-hidden="true"
			>, </span>

			<cite
					v-if="hasSource"
					class="origam-blockquote__source"
			>
				<slot name="source">{{ source }}</slot>
			</cite>
		</footer>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import {
		computed,
		onMounted,
		ref,
		StyleValue,
		useSlots
} from 'vue'

	import {
		useBorder,
		useElevation,
		useMargin,
		usePadding,
		useRounded,
		useTypography
	} from '../../composables'

	import { QUOTE_MARKS_BY_LANG } from '../../consts/Blockquote/blockquote.const'

	import type { IBlockquoteProps } from '../../interfaces'

	import type { TBlockquoteLang, TColor } from '../../types'

	import { isIntent, warnDeprecatedProp } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props + defaults for `<OrigamBlockquote>`. The component renders a
	 * native `<blockquote>` (overridable via `tag`) with an optional
	 * attribution `<footer>` and variant-driven decoration (accent bar,
	 * decorative quote marks, pull-quote rules). All visual decisions
	 * are token-driven — the SCSS only branches on the variant class.
	 ********************************************************/
	const props = withDefaults(defineProps<IBlockquoteProps>(), {
		tag: 'blockquote',
		variant: 'default',
		lang: 'auto'
	})

	const slots = useSlots()

	/*********************************************************
	 * Locale resolution for decorative quote marks
	 *
	 * @description
	 * `lang="auto"` reads `document.documentElement.lang` once at mount
	 * and falls back to `'en'` when nothing is reachable. Other values
	 * resolve straight from the `QUOTE_MARKS_BY_LANG` map. Resolution
	 * is deferred to `onMounted` so the component stays SSR-safe — the
	 * server emits the `'en'` pair by default and the client swaps after
	 * hydration if needed (the glyph swap is visually unobtrusive).
	 ********************************************************/
	const resolvedLang = ref<Exclude<TBlockquoteLang, 'auto'>>('en')

	const lookupLangFromDOM = (): Exclude<TBlockquoteLang, 'auto'> => {
		if (typeof document === 'undefined') return 'en'
		const raw = (document.documentElement.lang || '').toLowerCase().trim()
		const head = raw.split('-')[0]
		if (head === 'fr' || head === 'en' || head === 'es' || head === 'de') return head
		return 'en'
	}

	onMounted(() => {
		if (props.lang === 'auto') {
			resolvedLang.value = lookupLangFromDOM()
		} else {
			resolvedLang.value = props.lang as Exclude<TBlockquoteLang, 'auto'>
		}
	})

	const effectiveLang = computed<Exclude<TBlockquoteLang, 'auto'>>(() => {
		if (props.lang === 'auto') return resolvedLang.value
		return props.lang as Exclude<TBlockquoteLang, 'auto'>
	})

	const openMark = computed(() => QUOTE_MARKS_BY_LANG[effectiveLang.value].open)
	const closeMark = computed(() => QUOTE_MARKS_BY_LANG[effectiveLang.value].close)

	const showQuoteMark = computed(() => props.variant === 'quoted')

	/*********************************************************
	 * Attribution visibility
	 *
	 * @description
	 * The `<footer>` only renders when there is something to display.
	 * Slot overrides take priority over props — passing `#author` with
	 * no `author` prop still surfaces the footer.
	 ********************************************************/
	const hasAuthor = computed(() => Boolean(slots.author) || (props.author?.length ?? 0) > 0)
	const hasSource = computed(() => Boolean(slots.source) || (props.source?.length ?? 0) > 0)
	const hasAttribution = computed(() => hasAuthor.value || hasSource.value)

	/*********************************************************
	 * Alignment resolution
	 *
	 * @description
	 * `pull` defaults to `center`; every other variant defaults to
	 * `left`. An explicit `align` prop always wins over the per-variant
	 * default — consumers can pull a left-aligned pull quote if they
	 * really want to.
	 ********************************************************/
	const effectiveAlign = computed(() => {
		if (props.align) return props.align
		return props.variant === 'pull' ? 'center' : 'left'
	})

	/*********************************************************
	 * Cross-cutting surfaces (rounded / elevation / border / spacing)
	 ********************************************************/
	const {roundedClasses, roundedStyles} = useRounded(props)
	const {elevationClasses} = useElevation(props)
	const {borderClasses, borderStyles} = useBorder(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)
	const {typographyStyles} = useTypography(props, 'blockquote')

	/*********************************************************
	 * Colour axes — `color` = text, `accentColor` = accent
	 *
	 * @description
	 * Two independent intents. Tokenised values resolve through static
	 * `--color-{intent}` (text) / `--accent-{intent}` (bar, glyph, author)
	 * modifier classes; custom values fall back to inline CSS-var overrides
	 * (classes-first, style-as-escape-hatch). `accentColor` never paints a
	 * surface fill — it only drives the accent vars.
	 *
	 * `bgColor` is a deprecated alias (see `IBlockquoteProps` JSDoc) — read
	 * only when `accentColor` is unset, and warns once via
	 * `warnDeprecatedProp`.
	 ********************************************************/
	const colorIsIntent = computed(() => typeof props.color === 'string' && isIntent(props.color))

	const resolvedAccentColor = computed<TColor>(() => {
		// Truthy checks, not `!== undefined`: Vue's runtime prop defaults
		// coalesce an unset `TColor` prop to `false` (the type includes
		// `false` in its union, so the compiler-generated default mirrors
		// plain `boolean` props) — `!== undefined` would therefore always
		// be true and permanently short-circuit the `bgColor` fallback.
		// Same idiom as `useColorEffect`'s `hoverColor`/`hoverBgColor`
		// resolution (`props.hoverBgColor ? props.hoverBgColor : props.bgColor`).
		if (props.accentColor) return props.accentColor
		if (props.bgColor) {
			warnDeprecatedProp('OrigamBlockquote', 'bgColor', 'accentColor')
			return props.bgColor
		}
		return undefined
	})

	const accentIsIntent = computed(() => typeof resolvedAccentColor.value === 'string' && isIntent(resolvedAccentColor.value))

	const customColorStyles = computed<Record<string, string>>(() => {
		const styles: Record<string, string> = {}

		if (props.color && !colorIsIntent.value) {
			styles['--origam-blockquote---color'] = String(props.color)
			styles['--origam-blockquote__source---color'] = String(props.color)
		}

		if (resolvedAccentColor.value && !accentIsIntent.value) {
			const accent = String(resolvedAccentColor.value)
			styles['--origam-blockquote---resolved-accent-color'] = accent
			styles['--origam-blockquote---resolved-quote-mark-color'] = accent
			styles['--origam-blockquote---resolved-author-color'] = accent
		}

		return styles
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const blockquoteClasses = computed(() => {
		return [
			'origam-blockquote',
			`origam-blockquote--variant-${props.variant}`,
			`origam-blockquote--align-${effectiveAlign.value}`,
			{
				[`origam-blockquote--color-${props.color}`]: colorIsIntent.value,
				[`origam-blockquote--accent-${resolvedAccentColor.value}`]: accentIsIntent.value,
				'origam-blockquote--has-attribution': hasAttribution.value
			},
			roundedClasses.value,
			elevationClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})

	const blockquoteStyles = computed<StyleValue>(() => {
		return [
			roundedStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			typographyStyles.value,
			customColorStyles.value,
			props.style
		] as StyleValue
	})

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		effectiveLang,
		effectiveAlign,
		openMark,
		closeMark,
		showQuoteMark,
		hasAttribution
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-blockquote {
		--origam-blockquote---resolved-padding-block: var(--origam-blockquote---padding-block, 16px);
		--origam-blockquote---resolved-padding-inline: var(--origam-blockquote---padding-inline, 24px);
		--origam-blockquote---resolved-font-family: var(--origam-blockquote---font-family, Inter, system-ui, sans-serif);
		--origam-blockquote---resolved-font-size: var(--origam-blockquote---font-size, 1rem);
		--origam-blockquote---resolved-font-style: var(--origam-blockquote---font-style, normal);
		--origam-blockquote---resolved-font-weight: var(--origam-blockquote---font-weight, 400);
		--origam-blockquote---resolved-line-height: var(--origam-blockquote---line-height, 1.625);
		--origam-blockquote---resolved-accent-color: var(--origam-blockquote__accent---color, var(--origam-color__action--primary---bg, #7c3aed));
		--origam-blockquote---resolved-quote-mark-color: var(--origam-blockquote---quote-mark-color, var(--origam-color__action--primary---bg, #7c3aed));
		--origam-blockquote---resolved-author-color: var(--origam-blockquote__author---color, var(--origam-color__text---secondary, #525252));

		position: relative;
		margin: 0;
		padding-block: var(--origam-blockquote---resolved-padding-block);
		padding-inline: var(--origam-blockquote---resolved-padding-inline);
		font-family: var(--origam-blockquote---resolved-font-family);
		font-size: var(--origam-blockquote---resolved-font-size);
		font-style: var(--origam-blockquote---resolved-font-style);
		font-weight: var(--origam-blockquote---resolved-font-weight);
		line-height: var(--origam-blockquote---resolved-line-height);
		color: var(--origam-blockquote---color, var(--origam-color__text---primary, #171717));
		box-sizing: border-box;
	}

	.origam-blockquote__body {
		display: block;
	}

	.origam-blockquote__attribution {
		display: block;
		margin-top: var(--origam-blockquote__author---margin-top, 12px);
		font-size: var(--origam-blockquote__author---font-size, 0.875rem);
		font-style: var(--origam-blockquote__author---font-style, normal);
		font-weight: var(--origam-blockquote__author---font-weight, 500);
		color: var(--origam-blockquote---resolved-author-color);
	}

	.origam-blockquote__author {
		font-style: inherit;
	}

	.origam-blockquote__source {
		color: var(--origam-blockquote__source---color, var(--origam-color__text---secondary, #525252));
		font-size: var(--origam-blockquote__source---font-size, 0.875rem);
		font-style: var(--origam-blockquote__source---font-style, italic);
	}

	.origam-blockquote__mark {
		font-family: serif;
		user-select: none;
		color: var(--origam-blockquote---resolved-quote-mark-color);
	}

	.origam-blockquote__mark--bg {
		position: absolute;
		top: var(--origam-blockquote--quoted---glyph-offset-top, -0.1em);
		left: var(--origam-blockquote--quoted---glyph-offset-left, -0.05em);
		z-index: 0;
		font-size: var(--origam-blockquote--quoted---glyph-size, 8rem);
		line-height: 1;
		opacity: var(--origam-blockquote--quoted---glyph-opacity, 0.08);
		pointer-events: none;
	}

	.origam-blockquote--align-left {
		text-align: left;
	}

	.origam-blockquote--align-center {
		text-align: center;
	}

	.origam-blockquote--align-right {
		text-align: right;
	}

	.origam-blockquote--variant-default {
		border-inline-start: var(--origam-blockquote__accent---width, 4px) solid var(--origam-blockquote---resolved-accent-color);
		padding-inline-start: calc(var(--origam-blockquote---resolved-padding-inline) + var(--origam-blockquote__accent---width, 4px));
	}

	.origam-blockquote--variant-elegant {
		font-family: var(--origam-blockquote__elegant---font-family, Georgia, 'Times New Roman', serif);
		font-size: var(--origam-blockquote__elegant---font-size, 1.125rem);
		font-style: var(--origam-blockquote__elegant---font-style, italic);
		line-height: var(--origam-blockquote__elegant---line-height, 2);
		padding-block: var(--origam-blockquote__elegant---padding-block, 24px);
		border-inline-start: var(--origam-blockquote__accent---width, 4px) solid var(--origam-blockquote---resolved-accent-color);
		padding-inline-start: calc(var(--origam-blockquote---resolved-padding-inline) + var(--origam-blockquote__accent---width, 4px));
	}

	.origam-blockquote--variant-quoted {
		padding-top: calc(var(--origam-blockquote---resolved-padding-block) + var(--origam-blockquote--quoted---glyph-padding-extra, 1rem));

		.origam-blockquote__body {
			position: relative;
			z-index: 1;
		}

		.origam-blockquote__attribution {
			position: relative;
			z-index: 1;
		}
	}

	.origam-blockquote--variant-minimal {
		font-size: var(--origam-blockquote__minimal---font-size, 0.875rem);
		font-style: var(--origam-blockquote__minimal---font-style, italic);
		padding-inline: var(--origam-blockquote__minimal---padding-inline, 12px);
		padding-block: 0;
		border-inline-start: var(--origam-blockquote--minimal---accent-width, 2px) solid var(--origam-blockquote---resolved-accent-color);
		padding-inline-start: calc(var(--origam-blockquote__minimal---padding-inline, 12px) + var(--origam-blockquote--minimal---accent-width, 2px));
	}

	.origam-blockquote--variant-pull {
		font-family: var(--origam-blockquote__pull---font-family, Georgia, 'Times New Roman', serif);
		font-size: var(--origam-blockquote__pull---font-size, 1.5rem);
		font-weight: var(--origam-blockquote__pull---font-weight, 500);
		line-height: var(--origam-blockquote__pull---line-height, 1.375);
		padding-block: var(--origam-blockquote__pull---padding-block, 24px);
		padding-inline: var(--origam-blockquote---resolved-padding-inline);
		border-block-start: var(--origam-blockquote__pull---rule-width, 2px) solid var(--origam-blockquote---resolved-accent-color);
		border-block-end: var(--origam-blockquote__pull---rule-width, 2px) solid var(--origam-blockquote---resolved-accent-color);
	}

	.origam-blockquote--accent-primary {
		--origam-blockquote---resolved-accent-color: var(--origam-color__action--primary---bg);
		--origam-blockquote---resolved-quote-mark-color: var(--origam-color__action--primary---bg);
		--origam-blockquote---resolved-author-color: var(--origam-color__action--primary---fgSubtle);
	}

	.origam-blockquote--accent-secondary {
		--origam-blockquote---resolved-accent-color: var(--origam-color__action--secondary---bg);
		--origam-blockquote---resolved-quote-mark-color: var(--origam-color__action--secondary---bg);
		--origam-blockquote---resolved-author-color: var(--origam-color__action--secondary---fgSubtle);
	}

	.origam-blockquote--accent-success {
		--origam-blockquote---resolved-accent-color: var(--origam-color__feedback--success---bg);
		--origam-blockquote---resolved-quote-mark-color: var(--origam-color__feedback--success---bg);
		--origam-blockquote---resolved-author-color: var(--origam-color__feedback--success---fgSubtle);
	}

	.origam-blockquote--accent-warning {
		--origam-blockquote---resolved-accent-color: var(--origam-color__feedback--warning---bg);
		--origam-blockquote---resolved-quote-mark-color: var(--origam-color__feedback--warning---bg);
		--origam-blockquote---resolved-author-color: var(--origam-color__feedback--warning---fgSubtle);
	}

	.origam-blockquote--accent-danger {
		--origam-blockquote---resolved-accent-color: var(--origam-color__feedback--danger---bg);
		--origam-blockquote---resolved-quote-mark-color: var(--origam-color__feedback--danger---bg);
		--origam-blockquote---resolved-author-color: var(--origam-color__feedback--danger---fgSubtle);
	}

	.origam-blockquote--accent-info {
		--origam-blockquote---resolved-accent-color: var(--origam-color__feedback--info---bg);
		--origam-blockquote---resolved-quote-mark-color: var(--origam-color__feedback--info---bg);
		--origam-blockquote---resolved-author-color: var(--origam-color__feedback--info---fgSubtle);
	}

	.origam-blockquote--accent-neutral {
		--origam-blockquote---resolved-accent-color: var(--origam-color__text---primary);
		--origam-blockquote---resolved-quote-mark-color: var(--origam-color__text---primary);
		--origam-blockquote---resolved-author-color: var(--origam-color__text---secondary);
	}

	.origam-blockquote--accent-ghost {
		--origam-blockquote---resolved-accent-color: var(--origam-color__border---subtle);
		--origam-blockquote---resolved-quote-mark-color: var(--origam-color__text---secondary);
		--origam-blockquote---resolved-author-color: var(--origam-color__text---secondary);
	}

	.origam-blockquote--color-primary {
		--origam-blockquote---color: var(--origam-color__action--primary---fgSubtle);
		--origam-blockquote__source---color: var(--origam-color__action--primary---fgSubtle);
	}

	.origam-blockquote--color-secondary {
		--origam-blockquote---color: var(--origam-color__action--secondary---fgSubtle);
		--origam-blockquote__source---color: var(--origam-color__action--secondary---fgSubtle);
	}

	.origam-blockquote--color-success {
		--origam-blockquote---color: var(--origam-color__feedback--success---fgSubtle);
		--origam-blockquote__source---color: var(--origam-color__feedback--success---fgSubtle);
	}

	.origam-blockquote--color-warning {
		--origam-blockquote---color: var(--origam-color__feedback--warning---fgSubtle);
		--origam-blockquote__source---color: var(--origam-color__feedback--warning---fgSubtle);
	}

	.origam-blockquote--color-danger {
		--origam-blockquote---color: var(--origam-color__feedback--danger---fgSubtle);
		--origam-blockquote__source---color: var(--origam-color__feedback--danger---fgSubtle);
	}

	.origam-blockquote--color-info {
		--origam-blockquote---color: var(--origam-color__feedback--info---fgSubtle);
		--origam-blockquote__source---color: var(--origam-color__feedback--info---fgSubtle);
	}

	.origam-blockquote--color-neutral {
		--origam-blockquote---color: var(--origam-color__text---primary);
		--origam-blockquote__source---color: var(--origam-color__text---secondary);
	}

	.origam-blockquote--color-ghost {
		--origam-blockquote---color: var(--origam-color__action--ghost---fg);
		--origam-blockquote__source---color: var(--origam-color__action--ghost---fg);
	}
</style>
