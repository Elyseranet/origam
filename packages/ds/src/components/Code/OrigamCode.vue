<template>
	<component
			:is="props.tag"
			v-contrast
			:class="codeClasses"
			:style="codeStyles"
	>
		<component :is="headerTag" v-if="showHeader" class="origam-code__header">
			<slot
					name="header"
					:filename="filename"
					:lang-name="lang"
					:copy="handleCopy"
					:copied="copied"
			>
				<span v-if="filename" class="origam-code__filename" data-cy="origam-code-filename">{{ filename }}</span>
				<span v-else class="origam-code__lang-badge" data-cy="origam-code-lang">{{ lang }}</span>
				<origam-btn
						v-if="copyable"
						variant="text"
						class="origam-code__copy origam-code__copy--header"
						:text="copyButtonLabel"
						:aria-label="copyAriaLabel"
						:style="copyBtnStyle"
						aria-live="polite"
						data-cy="origam-code-copy"
						@click="handleCopy"
				/>
			</slot>
		</component>

		<origam-btn
				v-if="copyable && !showHeader && !compact"
				variant="text"
				class="origam-code__copy origam-code__copy--floating"
				:text="copyButtonLabel"
				:aria-label="copyAriaLabel"
				:style="copyBtnStyle"
				aria-live="polite"
				data-cy="origam-code-copy"
				@click="handleCopy"
		/>

		<span v-if="compact && prompt" class="origam-code__prompt" aria-hidden="true" data-cy="origam-code-prompt">{{ prompt }}</span>

		<div class="origam-code__scroller" :style="scrollerStyles">
			<pre class="origam-code__pre" :class="preClasses"><code
					ref="codeRef"
					class="origam-code__code"
					:data-lang="lang"
			></code></pre>
		</div>

		<origam-btn
				v-if="copyable && compact"
				variant="text"
				size="x-small"
				class="origam-code__copy origam-code__copy--compact"
				:icon="compactCopyIcon"
				:aria-label="copyAriaLabel"
				aria-live="polite"
				data-cy="origam-code-copy"
				@click="handleCopy"
		/>

		<footer v-if="$slots.footer" class="origam-code__footer">
			<slot name="footer"/>
		</footer>

		<slot/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, onMounted, ref, toRef, useSlots, watch } from 'vue'

	import { OrigamBtn } from '../../components'

	import {
		useBorder,
		useBothColor,
		useClipboard,
		useCode,
		useDimension,
		useElevation,
		useLocale,
		useDefaults,
		useMargin,
		usePadding,
		useRounded,
		useTypography
	} from '../../composables'

	import { vContrast } from '../../directives'

	import { CODE_DEFAULTS } from '../../consts'
	import { CODE_LANG } from '../../enums'

	import type { ICodeEmits, ICodeProps, ICodeSlots } from '../../interfaces'

	import { parseHighlightLines } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props + defaults for `<OrigamCode>`. The component is a thin wrapper
	 * around shiki: it owns the DOM (header / copy button / line gutter /
	 * scroller) while the highlighted HTML is produced by the `useCode`
	 * singleton and injected via `innerHTML` on a `<code>` ref. We do NOT
	 * use `v-html` because we need to post-process shiki's output to add
	 * row-level classes for line-numbers + highlight-lines.
	 *
	 * Theme integration:
	 * shiki uses the `css-variables` built-in theme which emits spans with
	 * `style="color: var(--shiki-token-keyword)"` etc. The SCSS block below
	 * maps every `--shiki-*` variable to an origam design token so colours
	 * follow `<html data-theme="…">` automatically — no JS re-render on
	 * theme switch.
	 ********************************************************/
	const _props = withDefaults(defineProps<ICodeProps>(), {
		tag: 'figure',
		lang: CODE_LANG.PLAINTEXT,
		lineNumbers: false,
		copyable: true,
		wrap: false,
		format: false,
		compact: false,
		prompt: undefined,
		code: undefined,
		highlightLines: null,
		filename: undefined
	})

	// `useDefaults` resolves each prop against theme.components['origam-code']
	// (OrigamBtn pattern) — without this, the theme's `{ tag: 'figure',
	// rounded: 'lg', compact: true }` config was a silent no-op.
	//
	// NOTE: the root `<component :is="…">` reads `props.tag` explicitly
	// (not bare `tag`) — `<script setup>` auto-exposes every `defineProps()`
	// key to the template pointing at the raw, UNRESOLVED `$props`,
	// independent of this `props` variable. See OrigamTable.vue for the
	// full writeup. `headerTag` (nested `<component :is>`) is already safe:
	// it's a `computed(() => props.tag === 'figure' ? …)`.
	const props = useDefaults(_props)

	const emit = defineEmits<ICodeEmits>()

	defineSlots<ICodeSlots>()

	const slots = useSlots()

	/*********************************************************
	 * Composables (chrome)
	 ********************************************************/
	const { borderClasses, borderStyles } = useBorder(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { elevationClasses } = useElevation(props)
	const { paddingClasses, paddingStyles } = usePadding(props)
	const { marginClasses, marginStyles } = useMargin(props)
	const { colorClasses, colorStyles } = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))
	const { dimensionStyles } = useDimension(props)
	const { typographyStyles } = useTypography(props, 'code')
	const { highlight } = useCode()
	const { t } = useLocale()

	/*********************************************************
	 * Source extraction — prop wins over slot, slot used as fallback.
	 *
	 * The slot path is what authors usually want for multi-line snippets
	 * that read better in the template. We re-extract every time the
	 * default slot changes (rare, but possible with v-if), so the
	 * computed depends on `slots.default?.()` length.
	 ********************************************************/
	function extractSlotText (): string {
		const nodes = slots.default?.()
		if (!nodes || nodes.length === 0) return ''
		const parts: string[] = []
		const visit = (vnode: unknown) => {
			if (vnode == null) return
			if (typeof vnode === 'string') { parts.push(vnode); return }
			if (typeof vnode === 'number' || typeof vnode === 'boolean') { parts.push(String(vnode)); return }
			if (Array.isArray(vnode)) { vnode.forEach(visit); return }
			const obj = vnode as { children?: unknown }
			if (obj && 'children' in obj) visit(obj.children)
		}
		visit(nodes)
		return parts.join('')
	}

	const sourceCode = computed(() => {
		if (typeof props.code === 'string') return props.code
		const fromSlot = extractSlotText()
		return fromSlot.replace(/^\n+/, '').replace(/\n+$/, '')
	})

	/*********************************************************
	 * Format — currently a no-op past whitespace normalisation.
	 *
	 * Prettier weighs ~600 KB and we don't want to bundle it at runtime
	 * for a niche convenience. When `format` is true we collapse Windows
	 * line endings + strip trailing whitespace, which is enough for the
	 * 90 % of cases where the input came from a copy-paste.
	 ********************************************************/
	let _formatWarned = false
	const formattedCode = computed(() => {
		const raw = sourceCode.value
		if (!props.format) return raw
		if (!_formatWarned) {
			_formatWarned = true
			console.warn(
				'[origam] OrigamCode: the `format` prop is a stub in v2.x. ' +
				'Prettier is intentionally not bundled at runtime; the current ' +
				'implementation normalises whitespace only. Full formatting is planned for v3.'
			)
		}
		return raw.replace(/\r\n/g, '\n').split('\n').map((l) => l.replace(/[ \t]+$/, '')).join('\n')
	})

	/*********************************************************
	 * Highlight pipeline.
	 *
	 * We track:
	 *   - `renderedHtml`: shiki's raw `<pre class="shiki"><code>...</code></pre>`
	 *
	 * The watcher re-runs on source / lang changes. We swallow stale promise
	 * results so a fast lang-switch doesn't paint the wrong tokens.
	 *
	 * Theme changes are handled entirely by CSS: shiki emits
	 * `style="color: var(--shiki-token-keyword)"` spans and the SCSS
	 * block maps `--shiki-*` to origam tokens that change with data-theme.
	 ********************************************************/
	const codeRef = ref<HTMLElement | null>(null)
	const isHighlighting = ref(false)
	let _renderToken = 0

	const highlightedLines = computed<Set<number>>(() => {
		const arr = parseHighlightLines(props.highlightLines)
		return new Set(arr)
	})

	async function rebuild () {
		const token = ++_renderToken
		isHighlighting.value = true
		try {
			const html = await highlight(formattedCode.value, props.lang)
			if (token !== _renderToken) return
			paintIntoDom(html)
		} finally {
			if (token === _renderToken) isHighlighting.value = false
		}
	}

	/**
	 * Post-process shiki's HTML to expose per-row hooks for line numbers +
	 * line-highlighting. shiki emits `<pre class="shiki ...">\n<code>\n<span class="line">…</span>\n…</code>\n</pre>`.
	 * We extract only the inner `<code>...</code>` and wrap each `.line`
	 * span with a `.origam-code__row` element that carries our data-* hooks.
	 */
	function paintIntoDom (rawHtml: string) {
		const target = codeRef.value
		if (!target) return

		// Strip outer <pre>... </pre> — we already render our own.
		const innerMatch = rawHtml.match(/<code[^>]*>([\s\S]*?)<\/code>/)
		const inner = innerMatch ? innerMatch[1] : rawHtml

		// Split on line spans. shiki emits `<span class="line">…</span>\n`
		// per logical line; the regex preserves the order and lets us wrap
		// each one with our own row container.
		const lines = inner.split(/\n/).filter((l, idx, arr) => !(idx === arr.length - 1 && l.trim() === ''))
		const highlightSet = highlightedLines.value
		const rows = lines.map((line, i) => {
			const lineNo = i + 1
			const isHl = highlightSet.has(lineNo) ? ' origam-code__row--highlighted' : ''
			return `<span class="origam-code__row${isHl}" data-line="${lineNo}">${line || '&nbsp;'}</span>`
		}).join('')

		// Background colour comes from origam tokens via SCSS — we ignore
		// any background colour shiki would emit because our surface is
		// always themed by the design system tokens.
		target.innerHTML = rows
	}

	watch(
		[formattedCode, () => props.lang],
		() => { void rebuild() },
		{ immediate: false }
	)

	// Highlight-lines is purely a class swap on already-rendered rows — no
	// shiki re-render needed.
	watch(highlightedLines, () => {
		const target = codeRef.value
		if (!target) return
		target.querySelectorAll<HTMLElement>('.origam-code__row').forEach((row) => {
			const lineNo = Number(row.dataset.line)
			row.classList.toggle('origam-code__row--highlighted', highlightedLines.value.has(lineNo))
		})
	})

	onMounted(() => { void rebuild() })

	/*********************************************************
	 * Copy-to-clipboard with feedback.
	 ********************************************************/
	const { copy, copied } = useClipboard({ feedbackDuration: CODE_DEFAULTS.copyFeedbackDurationMs })

	async function handleCopy () {
		const text = formattedCode.value
		if (await copy(text)) emit('copy', text)
	}

	/*********************************************************
	 * Labels — localised through the DS i18n provider (`useLocale`).
	 * Keys live under `origam.code.*` in the shipped locale messages.
	 ********************************************************/
	const copyButtonLabel = computed(() => copied.value
		? t('origam.code.copied', 'Copied!')
		: t('origam.code.copy', 'Copy')
	)
	const copyAriaLabel = computed(() => copied.value
		? t('origam.code.copied_aria_label', 'Code copied to clipboard')
		: t('origam.code.copy_aria_label', 'Copy code to clipboard')
	)

	const copyBtnStyle = {
		padding: 'var(--origam-code__copy---padding-block) var(--origam-code__copy---padding-inline)'
	}

	/*********************************************************
	 * Class & Style.
	 ********************************************************/
	const showHeader = computed(() => !props.compact && (!!props.filename || !!slots.header || props.copyable))

	/**
	 * Compact-mode copy control is an icon button, not a text "Copy". It swaps
	 * to a check mark while the "copied" feedback window is open so the inline
	 * pill never grows / reflows (a text label would).
	 */
	const compactCopyIcon = computed(() => copied.value ? 'mdi-check' : 'mdi-content-copy')

	/**
	 * `<figcaption>` is only valid as a child of `<figure>` (W3C HTML5 Living
	 * Standard). When the consumer overrides `tag` to something other than
	 * `'figure'` (back-compat usage with `tag="div"`) we fall back to a
	 * plain `<div>` for the header so the rendered markup stays W3C-correct.
	 */
	const headerTag = computed(() => props.tag === 'figure' ? 'figcaption' : 'div')

	const codeClasses = computed(() => [
		'origam-code',
		`origam-code--lang-${props.lang}`,
		{
			'origam-code--compact': props.compact,
			'origam-code--line-numbers': props.lineNumbers && !props.compact,
			'origam-code--wrap': props.wrap,
			'origam-code--has-header': showHeader.value,
			'origam-code--copyable': props.copyable,
			'origam-code--max-height': props.maxHeight != null
		},
		borderClasses.value,
		roundedClasses.value,
		elevationClasses.value,
		paddingClasses.value,
		marginClasses.value,
		colorClasses.value
	])

	const codeStyles = computed(() => [
		borderStyles.value,
		roundedStyles.value,
		paddingStyles.value,
		marginStyles.value,
		colorStyles.value,
		dimensionStyles.value,
		typographyStyles.value
	])

	const preClasses = computed(() => ({
		'origam-code__pre--line-numbers': props.lineNumbers,
		'origam-code__pre--wrap': props.wrap
	}))

	const scrollerStyles = computed(() => {
		if (props.maxHeight == null) return {}
		const value = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
		return { '--origam-code---max-height': value, maxHeight: value }
	})

	defineExpose({ rebuild, copied, codeRef })
</script>

<style lang="scss">
	.origam-code {
		position: relative;
		display: block;
		margin: 0;
		background-color: var(--origam-code---background-color);
		color: var(--origam-code---color);
		border: var(--origam-code---border-width) solid var(--origam-code---border-color);
		border-radius: var(--origam-code---border-radius);
		padding: var(--origam-code---padding-block) var(--origam-code---padding-inline);
		font-family: var(--origam-code---font-family);
		font-size: var(--origam-code---font-size);
		line-height: var(--origam-code---line-height);
		overflow: hidden;

	}

	/* Non-compact blocks lay their regions out as a vertical flex column so the
	 * scroller fills the leftover height when the host CONSTRAINS the block
	 * (grid cell, explicit height, max-height). With an auto height the column
	 * collapses to content, so unconstrained consumers are unaffected. Scoped
	 * to :not(.--compact) because the compact variant is an inline-flex ROW. */
	.origam-code:not(.origam-code--compact) {
		display: flex;
		flex-direction: column;
	}

	.origam-code:not(.origam-code--compact) .origam-code__scroller {
		flex: 1 1 auto;
		min-height: 0;
	}

	.origam-code--compact {
		display: inline-flex;
		align-items: center;
		gap: var(--origam-code__compact---gap, 0.5rem);
		padding: var(--origam-code__compact---padding-block) var(--origam-code__compact---padding-inline);
		line-height: var(--origam-code__compact---line-height);
		max-inline-size: 100%;
	}

	.origam-code--compact .origam-code__scroller {
		overflow: hidden;
		min-inline-size: 0;
	}

	.origam-code--compact .origam-code__pre,
	.origam-code--compact .origam-code__code,
	.origam-code--compact .origam-code__row {
		min-height: 0;
		white-space: nowrap;
	}

	.origam-code__prompt {
		flex: none;
		color: var(--origam-code__prompt---color);
		user-select: none;
	}

	.origam-code__copy--compact {
		flex: none;
		--origam-btn---min-height: 0;
		--origam-btn---min-width: 0;
		--origam-btn---height: auto;
		--origam-btn---padding-block: var(--origam-code__compact-copy---padding-block);
		--origam-btn---padding-inline: var(--origam-code__compact-copy---padding-inline);
		--origam-btn---border-radius: var(--origam-code__compact-copy---border-radius);
		--origam-btn---font-size: var(--origam-code__compact-copy---font-size);
		--origam-btn---color: var(--origam-code__copy---color);
		--origam-btn---background-color: var(--origam-code__compact-copy---background-color);
	}

	.origam-code__copy--compact:hover {
		--origam-btn---color: var(--origam-code__copy---color-hover);
		background-color: var(--origam-code__copy---background-color-hover) !important;
	}


	.origam-code__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--origam-code__header---gap);
		padding: var(--origam-code__header---padding-block) var(--origam-code__header---padding-inline);
		background-color: var(--origam-code__header---background-color);
		color: var(--origam-code__header---color);
		border-bottom: var(--origam-code---border-width) solid var(--origam-code---border-color);
		margin: calc(-1 * var(--origam-code---padding-block)) calc(-1 * var(--origam-code---padding-inline));
		margin-bottom: var(--origam-code---padding-block);
	}

	.origam-code__filename {
		font-weight: var(--origam-code__filename---font-weight);
		font-size: var(--origam-code__filename---font-size);
		color: var(--origam-code__filename---color);
	}

	.origam-code__lang-badge {
		font-size: var(--origam-code__filename---font-size);
		color: var(--origam-code__filename---color);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.origam-code__copy {
		--origam-btn---min-height: 0;
		--origam-btn---min-width: 0;
		--origam-btn---border-radius: var(--origam-code__copy---border-radius);
		--origam-btn---font-size: var(--origam-code__copy---font-size);
		--origam-btn---color: var(--origam-code__copy---color);
		--origam-btn---background-color: var(--origam-code__copy---background-color);
		gap: var(--origam-code__copy---gap);
	}

	.origam-code__copy:hover {
		--origam-btn---color: var(--origam-code__copy---color-hover);
		background-color: var(--origam-code__copy---background-color-hover) !important;
	}

	.origam-code__copy--floating {
		position: absolute;
		top: var(--origam-code__copy---offset);
		right: var(--origam-code__copy---offset);
		z-index: 1;
	}

	.origam-code__scroller {
		overflow: auto;
	}

	.origam-code--max-height .origam-code__scroller {
		max-height: var(--origam-code---max-height);
	}

	.origam-code__pre {
		margin: 0;
		padding: 0;
		background: transparent;
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
		counter-reset: line;
	}

	.origam-code__code {
		display: block;
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
	}

	.origam-code__row {
		display: block;
		padding-inline: var(--origam-code__row---padding-inline);
		white-space: pre;
		min-height: var(--origam-code---line-height);
	}

	.origam-code--wrap .origam-code__row {
		white-space: pre-wrap;
		word-break: break-word;
	}

	.origam-code--line-numbers .origam-code__row {
		counter-increment: line;
		position: relative;
		padding-inline-start: var(--origam-code---line-number-width);
	}

	.origam-code--line-numbers .origam-code__row::before {
		content: counter(line);
		position: absolute;
		left: 0;
		top: 0;
		box-sizing: border-box;
		width: var(--origam-code---line-number-width);
		padding-right: var(--origam-code---line-number-padding-right);
		text-align: right;
		color: var(--origam-code---line-number-color);
		user-select: none;
		font-variant-numeric: tabular-nums;
	}

	.origam-code__row--highlighted {
		background-color: var(--origam-code__line-highlight---background-color);
		box-shadow: inset 3px 0 0 var(--origam-code__line-highlight---accent-color);
	}

	.origam-code__footer {
		padding: var(--origam-code__header---padding-block) var(--origam-code__header---padding-inline);
		border-top: var(--origam-code---border-width) solid var(--origam-code---border-color);
		margin: var(--origam-code---padding-block) calc(-1 * var(--origam-code---padding-inline)) calc(-1 * var(--origam-code---padding-block));
		color: var(--origam-code__header---color);
	}

	.origam-code__scroller::-webkit-scrollbar {
		height: 8px;
		width: 8px;
	}

	.origam-code__scroller::-webkit-scrollbar-thumb {
		background-color: var(--origam-code__scrollbar---color);
		border-radius: 4px;
	}
</style>

<style lang="scss">
	/* Dual-theme shiki — UNSCOPED on purpose. shiki injects token spans
	 * via v-html, so they don't carry the parent SFC's data-v scoping
	 * attribute. A scoped selector (even :deep) doesn't reliably match
	 * the deeply-nested untagged spans. An unscoped block keeps the
	 * selector simple and reliable. We scope by the dedicated
	 * `.origam-code__code` class instead — collisions are impossible.
	 *
	 * shiki output per token: `<span style="--shiki-light:#X;--shiki-dark:#Y">`.
	 *
	 * The DS theming is TWO-AXIS: `data-theme` carries the brand identity and
	 * `data-mode` (always concrete: "light" | "dark") carries the light/dark
	 * choice (see useTheme). The light/dark token swap MUST therefore key on
	 * `data-mode`, NOT on `data-theme="dark"` — a brand theme like
	 * `data-theme="brand"` is never named "dark", so the old selector silently
	 * fell through to the `prefers-color-scheme` block and painted the dark
	 * (near-white) github-dark foreground on a LIGHT surface whenever the OS
	 * was in dark mode. We resolve `--shiki-light` by default, `--shiki-dark`
	 * when `data-mode="dark"`. Legacy single-axis `data-theme="dark"` (no
	 * `data-mode` present) is still honoured, and `prefers-color-scheme` is the
	 * fallback ONLY when neither axis pins a choice (SSR / un-themed host). */
	.origam-code__code span {
		color: var(--shiki-light);
	}

	.origam-code .shiki {
		background-color: var(--shiki-light-bg, transparent);
	}

	html[data-mode="dark"] .origam-code__code span,
	html:not([data-mode])[data-theme="dark"] .origam-code__code span {
		color: var(--shiki-dark);
	}

	html[data-mode="dark"] .origam-code .shiki,
	html:not([data-mode])[data-theme="dark"] .origam-code .shiki {
		background-color: var(--shiki-dark-bg, transparent);
	}

	@media (prefers-color-scheme: dark) {
		html:not([data-mode]):not([data-theme="light"]):not([data-theme="dark"]) .origam-code__code span {
			color: var(--shiki-dark);
		}

		html:not([data-mode]):not([data-theme="light"]):not([data-theme="dark"]) .origam-code .shiki {
			background-color: var(--shiki-dark-bg, transparent);
		}
	}
</style>
