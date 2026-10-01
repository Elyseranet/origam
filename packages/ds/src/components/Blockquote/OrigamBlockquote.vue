<template>
	<component
			:is="tag"
			:id="id"
			:cite="cite"
			:class="blockquoteClasses"
			:style="blockquoteStyles"
	>
		<span
				v-if="quoteMark"
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
			<span
					v-if="hasAuthor"
					class="origam-blockquote__dash"
					aria-hidden="true"
			>— </span>

			<span class="origam-blockquote__author">
				<slot name="author">{{ author }}</slot>
			</span>

			<span
					v-if="hasAuthor && hasSource"
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

	import { useBorder } from '../../composables/Commons/border.composable'
	import { useElevation } from '../../composables/Commons/elevation.composable'
	import { useMargin } from '../../composables/Commons/margin.composable'
	import { usePadding } from '../../composables/Commons/padding.composable'
	import { useRounded } from '../../composables/Commons/rounded.composable'
	import { useTypography } from '../../composables/Commons/typography.composable'

	import { QUOTE_MARKS_BY_LANG } from '../../consts/Blockquote/blockquote.const'

	import type { IBlockquoteEmits, IBlockquoteProps, IBlockquoteSlots } from '../../interfaces/Blockquote/blockquote.interface'

	import type { TBlockquoteLang } from '../../types/Blockquote/blockquote.type'
	import type { TColor } from '../../types/Commons/color.type'

	import { isIntent, warnDeprecatedProp } from '../../utils/Commons/color.util'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props + defaults for `<OrigamBlockquote>`. The component renders a
	 * native `<blockquote>` (overridable via `tag`) with an optional
	 * attribution `<footer>` and an optional decorative quote glyph.
	 *
	 * @description
	 * ⛔ LE `variant` N'EST PLUS UNE COUCHE SCSS — ADR-005 D7, lot #1015.
	 * Les cinq valeurs sont des PRESETS DE PROPS
	 * (`BLOCKQUOTE_VARIANT_PRESETS`, `consts/Blockquote/blockquote.const.ts`)
	 * que le resolveur de props applique au rang le plus faible de la
	 * chaine. Le DS n'attache plus aucune regle a
	 * `.origam-blockquote--variant-{valeur}` : la classe est toujours emise,
	 * mais elle appartient au CONSOMMATEUR comme crochet d'override. Le
	 * garde `no-variant-css` tient cette moitie du contrat.
	 *
	 * @description
	 * ⛔ CE FICHIER N'IMPORTE PAS SA PROPRE TABLE, et ne doit jamais le
	 * faire : le seul chemin est `consts/Commons/variant-preset.const.ts`
	 * -> `VARIANT_PRESETS` -> `createOrigam()`. Si l'on se surprend a
	 * vouloir lire la table ici, le rang voulu est deja resolu sur `props`.
	 *
	 * @description
	 * Les valeurs ci-dessous sont des LITTERAUX INLINE, jamais
	 * `BLOCKQUOTE_DEFAULTS.x` : le compilateur SFC ne resout pas un acces
	 * de propriete et rendrait l'objet `props` entierement `undefined`.
	 * `align: 'left'` n'existe que comme PLANCHER sans variant — le preset
	 * de `pull`, un rang plus haut, le bat.
	 ********************************************************/
	const props = withDefaults(defineProps<IBlockquoteProps>(), {
		tag: 'blockquote',
		variant: 'default',
		lang: 'auto',
		align: 'left'
	})

	defineEmits<IBlockquoteEmits>()

	defineSlots<IBlockquoteSlots>()

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
		// Same truthy-fallback idiom used across the DS color composables
		// (e.g. `props.bgColor || props.color`) to route around the `false`
		// default rather than `undefined`.
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
			`origam-blockquote--align-${props.align}`,
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
	 *
	 * @description
	 * ⚠️ `effectiveAlign` et `showQuoteMark` ont DISPARU de cette surface
	 * (lot #1015). Les deux calculaient une valeur depuis `variant`, ce que
	 * le preset fait desormais un rang plus haut : lire `align` ou
	 * `quoteMark` sur les props rend exactement la meme chose. Rupture
	 * assumee plutot qu'alias de compatibilite — aucun consommateur ne les
	 * lisait (verifie : zero occurrence hors ce fichier).
	 ********************************************************/
	defineExpose({
		effectiveLang,
		openMark,
		closeMark,
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
		--origam-blockquote---resolved-letter-spacing: var(--origam-blockquote---letter-spacing, normal);
		--origam-blockquote---resolved-accent-color: var(--origam-blockquote__accent---color, var(--origam-color__action--primary---bg, #7c3aed));
		--origam-blockquote---resolved-quote-mark-color: var(--origam-blockquote---quote-mark-color, var(--origam-color__action--primary---bg, #7c3aed));
		--origam-blockquote---resolved-author-color: var(--origam-blockquote__author---color, var(--origam-color__text---secondary, #525252));

		position: relative;

		// ⛔ #950 — zero-specificity defaults. `:where(&)` compiles to
		// `:where(.origam-blockquote[data-v-hash])` = (0,0,0), so the
		// scale-driven utility classes (`.origam--p-6`, `.origam--m-6`)
		// win the cascade. Without it the scoped compiler pushes this rule
		// to (0,2,0) and beats the utility's (0,1,0).
		//
		// ⚠️ #950's caveat about a competing variant rule is OBSOLETE since
		// ADR-005 D7 (lot #1015): there is no longer any variant rule to
		// compete with. A variant's spacing now arrives as an INLINE
		// declaration from its props preset, which outranks both this rule
		// and the utility class — so the accent-bar offset still cannot
		// lose to a utility, by a stronger mechanism than specificity.
		// This rule is what a variant that sets no spacing falls back to.
		:where(&) {
			margin: 0;
			padding-block: var(--origam-blockquote---resolved-padding-block);
			padding-inline: var(--origam-blockquote---resolved-padding-inline);
		}

		font-family: var(--origam-blockquote---resolved-font-family);
		font-size: var(--origam-blockquote---resolved-font-size);
		font-style: var(--origam-blockquote---resolved-font-style);
		font-weight: var(--origam-blockquote---resolved-font-weight);
		line-height: var(--origam-blockquote---resolved-line-height);
		letter-spacing: var(--origam-blockquote---resolved-letter-spacing);
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

	.origam-blockquote__mark--bg + .origam-blockquote__body,
	.origam-blockquote__mark--bg ~ .origam-blockquote__attribution {
		position: relative;
		z-index: 1;
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
