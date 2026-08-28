<template>
	<component
			:is="tag"
			:id="id"
			ref="resizeRef"
			:aria-label="ariaLabel"
			:class="paginationClasses"
			:style="paginationStyles"
			@keydown="handleKeydown"
	>
		<span
				v-if="withInfo"
				class="origam-pagination__info"
				:style="typographyStyles"
				data-cy="pagination-info"
		>
			<slot
					name="info"
					v-bind="{ start: infoStart, end: infoEnd, total: totalInt }"
			>
				{{ t(infoText, infoStart, infoEnd, totalInt) }}
			</slot>
		</span>

		<template v-if="compact">
			<ul class="origam-pagination__list origam-pagination__list--compact">
				<template v-if="showFirstLastPage">
					<li
							key="first"
							class="origam-pagination__first"
					>
						<slot
								name="first"
								v-bind="{...controls.first}"
						>
							<origam-btn v-bind="{...controls.first }"/>
						</slot>
					</li>
				</template>

				<li
						key="prev"
						class="origam-pagination__prev"
				>
					<slot
							name="prev"
							v-bind="{...controls.prev}"
					>
						<origam-btn v-bind="{...controls.prev }"/>
					</slot>
				</li>

				<li class="origam-pagination__compact-label">
					<span>{{ t(pageText) }}</span>
					<input
							ref="compactInputRef"
							:value="page"
							:min="start"
							:max="length"
							:disabled="disabled"
							type="number"
							class="origam-pagination__compact-input"
							:aria-label="t(pageNumberAriaLabel)"
							data-cy="pagination-compact-input"
							@change="handleCompactInput"
							@keydown.enter.prevent="handleCompactInput"
					/>
					<span>{{ t(ofText) }}</span>
					<span>{{ length }}</span>
				</li>

				<li
						key="next"
						class="origam-pagination__next"
				>
					<slot
							name="next"
							v-bind="{...controls.next}"
					>
						<origam-btn v-bind="{...controls.next }"/>
					</slot>
				</li>

				<template v-if="showFirstLastPage">
					<li
							key="last"
							class="origam-pagination__last"
					>
						<slot
								name="last"
								v-bind="{...controls.last}"
						>
							<origam-btn v-bind="{...controls.last }"/>
						</slot>
					</li>
				</template>
			</ul>
		</template>

		<template v-else>
			<ul class="origam-pagination__list">
				<template v-if="showFirstLastPage">
					<li
							key="first"
							class="origam-pagination__first"
					>
						<slot
								name="first"
								v-bind="{...controls.first}"
						>
							<origam-btn v-bind="{...controls.first }"/>
						</slot>
					</li>
				</template>

				<li
						key="prev"
						class="origam-pagination__prev"
				>
					<slot
							name="prev"
							v-bind="{...controls.prev}"
					>
						<origam-btn v-bind="{...controls.prev }"/>
					</slot>
				</li>

				<template
						v-for="(item) in items"
						:key="item.key"
				>
					<li
							:class="{'origam-pagination__item--is-active': item.isActive}"
							class="origam-pagination__item"
					>
						<slot :name="`item-${item.key}`">
							<slot name="item">
								<origam-btn
										:text="item.page.toString()"
										v-bind="{ ...item.props }"
								/>
							</slot>
						</slot>
					</li>
				</template>

				<li
						key="next"
						class="origam-pagination__next"
				>
					<slot
							name="next"
							v-bind="{...controls.next}"
					>
						<origam-btn v-bind="{...controls.next }"/>
					</slot>
				</li>

				<template v-if="showFirstLastPage">
					<li
							key="last"
							class="origam-pagination__last"
					>
						<slot
								name="last"
								v-bind="{...controls.last}"
						>
							<origam-btn v-bind="{...controls.last }"/>
						</slot>
					</li>
				</template>
			</ul>
		</template>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { ComponentPublicInstance, computed, nextTick, ref, shallowRef, StyleValue } from "vue"
	import OrigamBtn from '../Btn/OrigamBtn.vue'

	import { useBorder } from '../../composables/Commons/border.composable'
	import { useDensity } from '../../composables/Commons/density.composable'
	import { useDisplay } from '../../composables/Commons/display.composable'
	import { useElevation } from '../../composables/Commons/elevation.composable'
	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useMargin } from '../../composables/Commons/margin.composable'
	import { usePadding } from '../../composables/Commons/padding.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useRefs } from '../../composables/Commons/refs.composable'
	import { useResizeObserver } from '../../composables/Commons/resizeObserver.composable'
	import { useSize } from '../../composables/Commons/size.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useTypography } from '../../composables/Commons/typography.composable'
	import { useVModel } from '../../composables/Commons/vModel.composable'

	import { KEYBOARD_VALUES } from '../../enums/Commons/hotkey.enum'
	import { MDI_ICONS } from '../../enums/Commons/mdi.enum'
	import { VARIANT } from '../../enums/Commons/variant.enum'

	import type { IPaginationProps } from '../../interfaces/Pagination/pagination.interface'

	import type { IPaginationEmits, IPaginationSlots } from '../../interfaces/Pagination/pagination.interface'

	import { createRange, int } from '../../utils/Commons/commons.util'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits and filterProps for the Pagination component.
	 ********************************************************/
	const props = withDefaults(defineProps<IPaginationProps>(), {
		prevIcon: MDI_ICONS.CHEVRON_LEFT,
		nextIcon: MDI_ICONS.CHEVRON_RIGHT,
		firstIcon: MDI_ICONS.CHEVRON_DOUBLE_LEFT,
		lastIcon: MDI_ICONS.CHEVRON_DOUBLE_RIGHT,
		tag: 'nav',
		ellipsis: '...',
		length: 1,
		start: 1,
		modelValue: 1, // TODO - Delete default value for modelValue
		ariaLabel: 'origam.pagination.aria_label.root',
		pageAriaLabel: 'origam.pagination.aria_label.page',
		currentPageAriaLabel: 'origam.pagination.aria_label.current_page',
		firstAriaLabel: 'origam.pagination.aria_label.first',
		previousAriaLabel: 'origam.pagination.aria_label.previous',
		nextAriaLabel: 'origam.pagination.aria_label.next',
		lastAriaLabel: 'origam.pagination.aria_label.last',
		compact: false,
		pageText: 'origam.pagination.page',
		ofText: 'origam.pagination.of',
		withInfo: false,
		infoText: 'origam.pagination.info',
		perPage: 10,
		pageNumberAriaLabel: 'origam.pagination.aria_label.page_number'
	})

	const emits = defineEmits<IPaginationEmits>()

	defineSlots<IPaginationSlots>()

	const {filterProps} = useProps<IPaginationProps>(props)

	const {t} = useLocale()

	/*********************************************************
	 * Value
	 *
	 * @description
	 * page is the controlled current-page number.
	 * width / maxButtons support the responsive total-visible calculation.
	 * The uncontrolled seed is passed as `() => props.start`, not
	 * `props.start` (#448): a plain read right here, in the setup body,
	 * would freeze the pre-theme value, since `useVModel` runs before the
	 * ADR-005 theme-props resolver patches `instance.props`. The getter
	 * form defers the read to `useVModel`'s internal `seed()`, which only
	 * runs on first actual access — after the resolver has already run.
	 ********************************************************/
	const page = useVModel(props, 'modelValue', () => props.start)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {width} = useDisplay()
	const maxButtons = shallowRef(-1)

	const {resizeRef} = useResizeObserver((entries: ResizeObserverEntry[]) => {
		if (!entries.length) return

		const {target, contentRect} = entries[0]

		const firstItem = target.querySelector('.origam-pagination__list > *') as HTMLElement

		if (!firstItem) return

		const totalWidth = contentRect.width
		const itemWidth =
				firstItem.offsetWidth +
				parseFloat(getComputedStyle(firstItem).marginRight) * 2

		maxButtons.value = getMax(totalWidth, itemWidth)
	})
	const {refs, updateRef} = useRefs<ComponentPublicInstance>()

	/*********************************************************
	 * Range & items
	 *
	 * @description
	 * length / start are int-coerced copies of the props.
	 * totalVisible computes how many page buttons fit.
	 * range produces the raw sequence (numbers + ellipsis strings).
	 * sharedBtnColorProps / controlColorProps forward the uniform six-field
	 * IColorProps contract to every btn in the row so `color`/`bgColor`
	 * changes repaint them all simultaneously.
	 * items maps range to the full button prop objects.
	 * controls produces the first/prev/next/last button prop objects.
	 ********************************************************/
	const length = computed(() => {
		return int(props.length)
	})
	const start = computed(() => {
		return int(props.start)
	})
	const totalVisible = computed(() => {
		if (props.totalVisible != null) {
			return int(props.totalVisible)
		}

		if (maxButtons.value >= 0) {
			return maxButtons.value
		}

		return getMax(width.value, 58)
	})
	const range = computed(() => {
		if (length.value <= 0 || isNaN(length.value) || length.value > Number.MAX_SAFE_INTEGER) return []

		// `withInfo` mode collapses the page-number row to just the
		// current page button — the spec (PDF: WITH INFO) shows a
		// single page indicator between the Prev / Next text buttons,
		// since the `Showing N–M of total` label on the left already
		// expresses position within the range. Pre-fix this rendered
		// the full numbered list, drowning the simpler info layout.
		if (props.withInfo) {
			return [page.value]
		}

		if (totalVisible.value <= 0) return []
		else if (totalVisible.value === 1) return [page.value]

		if (length.value <= totalVisible.value) {
			return createRange(length.value, start.value)
		}

		const even = totalVisible.value % 2 === 0
		const middle = even ? totalVisible.value / 2 : Math.floor(totalVisible.value / 2)
		const left = even ? middle : middle + 1
		const right = length.value - middle

		if (left - page.value >= 0) {
			return [...createRange(Math.max(1, totalVisible.value - 1), start.value), props.ellipsis, length.value]
		} else if (page.value - right >= (even ? 1 : 0)) {
			const rangeLength = totalVisible.value - 1
			const rangeStart = length.value - rangeLength + start.value
			return [start.value, props.ellipsis, ...createRange(rangeLength, rangeStart)]
		} else {
			const rangeLength = Math.max(1, totalVisible.value - 3)
			const rangeStart = rangeLength === 1 ? page.value : page.value - Math.ceil(rangeLength / 2) + start.value
			return [start.value, props.ellipsis, ...createRange(rangeLength, rangeStart), props.ellipsis, length.value]
		}
	})
	// Uniform color contract — every btn in the row (page items 1..n,
	// the ellipsis, AND first / prev / next / last) receives the SAME
	// six IColorProps fields. Changing `color` repaints every text/icon,
	// changing `bgColor` repaints every surface, hover/active rungs
	// work identically. The active item differentiates itself via
	// `active: true` only; a disabled btn shows its standard --disabled
	// veil (Btn's opacity rule), nothing intent-specific.
	// User report: "putain pourquoi tous les btn ne sont pas gérés de
	// la même manière sur la pagination ; je change la couleur, tous
	// les btns voient leur couleur changer ; etc."
	const sharedBtnColorProps = computed(() => {
		// ── Surface / text contrast synthesis (colored mode) ──────────
		// In `--colored` mode the pagination paints the inner btn's
		// surface via the SCSS `--bg-base` CSS var — useStateEffect on
		// the inner btn doesn't see the bg side of the contract because
		// the consumer didn't necessarily pass `bgColor` to the
		// pagination root. Without that info, the btn's fg resolves to
		// `tokenForegroundForIntent(color)` = the same-hue subtle rung
		// (e.g. primary.fgSubtle = primary.700 — dark violet on a
		// primary.500 surface, the very "violet-on-violet" the user
		// just spotted on screen).
		//
		// Synthesise bgColor = color when the consumer only specified
		// `color`: the inner btn's useStateEffect then detects the
		// color-clash (`color === bgColor` both intents) and swaps fg
		// to the bg's paired contrast token (primary.fg = white). The
		// JS-side bg is the same intent the SCSS already paints, so the
		// inline declaration is harmless (same value), and the fg now
		// wins by virtue of being on the same axis as the synthesised
		// bg.
		// NB: `TColor = string | false | null | undefined`, and Vue's
		// defineProps emits `false` (not `undefined`) when a TColor prop
		// is omitted. We MUST use `||` (truthy fallback), NOT `??`
		// (nullish only) — `false ?? "primary"` keeps `false` and the
		// synthesis silently no-ops, while `false || "primary"` falls
		// through to the consumer's chosen intent as intended.
		//
		// hover / active are NOT forwarded here: the inner `<OrigamBtn>`
		// derives its own hover/active darken cascade (bgHover / bgActive
		// token rungs) from ITS OWN `hover` / `active` state via
		// `useStateFlag` + `useStateEffect` — Pagination never had a
		// `hover` / `active` object prop of its own to relay, and the
		// legacy flat `hoverColor` / `hoverBgColor` / `activeColor` /
		// `activeBgColor` props this comment used to describe forwarding
		// were removed (`OrigamBtn` had already stopped reading them —
		// this forwarding was dead code). The active PAGE item still
		// differentiates itself via the per-item `active: true` boolean
		// (see `controls` below), which IS live.
		const baseBg = props.bgColor || props.color
		return {
			// In colored mode force `flat` so the btn actually PAINTS the
			// pagination-driven `--origam-btn---background-color`. The theme's
			// default `text` variant sets `background-color: transparent
			// !important`, which would otherwise swallow the colored fill. When
			// no color is set, leave `variant` undefined → the neutral text look.
			variant: baseBg ? VARIANT.FLAT : undefined,
			color: props.color,
			bgColor: baseBg,
			// Size / density flow through to every nav btn so the whole row
			// scales consistently — matches the PDF spec which shows the
			// pagination at sm / default / lg sizes (no per-btn override).
			size: props.size,
			density: props.density,
		}
	})
	const controlColorProps = sharedBtnColorProps

	const items = computed(() => {
		return range.value.map((item, index) => {
			const ref = (e: any) => updateRef(e, index)

			if (typeof item === 'string') {
				return {
					isActive: false,
					key: `ellipsis-${index}`,
					page: item,
					props: {
						ref,
						// Same six IColorProps as the rest of the row —
						// even though the ellipsis is non-clickable
						// (`disabled: true`), it must read as visually
						// part of the same nav row, just dimmed by the
						// Btn's --disabled veil. Pre-fix it rendered
						// in the default neutral grey while the
						// surrounding btns took the consumer's bgColor,
						// breaking the user's "tous les btn ensemble"
						// expectation.
						...sharedBtnColorProps.value,
						ellipsis: true,
						icon: true,
						disabled: true
					}
				}
			} else {
				const isActive = item === page.value
				return {
					isActive,
					key: item,
					page: item,
					props: {
						ref,
						...sharedBtnColorProps.value,
						ellipsis: false,
						// `icon: true` keeps the btn in icon-mode so its
						// width clamps to its height — a 36×36 square at
						// the default size. The pagination SCSS override
						// re-sets the corner radius from the btn's
						// default 50% to 8px, producing the rounded-SQUARE
						// shape the PDF prescribes (NOT a full circle).
						// Inactive page btns paint a transparent surface
						// via the `&:not(&--colored) .origam-btn:not(--active)`
						// rule below, so they read as plain numbers; only
						// the active page paints the intent-coloured fill.
						icon: true,
						disabled: !!props.disabled || +props.length < 2,
						// `active: true` lets the inner `<origam-btn>`
						// add its own --active overlay so the current
						// page reads as selected — without forcing the
						// non-active items into a different shape. All
						// six IColorProps fields are forwarded
						// uniformly via `sharedBtnColorProps` (above),
						// so a `color` / `bgColor` change on the
						// pagination updates EVERY btn at once — the
						// behaviour the user expects from a uniform row
						// of nav buttons.
						active: isActive,
						'aria-current': isActive ? 'page' : undefined,
						'aria-label': t(isActive ? props.currentPageAriaLabel : props.pageAriaLabel, item),
						onClick: (e: Event) => setValue(e, item)
					}
				}
			}
		})
	})
	const controls = computed(() => {
		const prevDisabled = !!props.disabled || page.value <= start.value
		const nextDisabled = !!props.disabled || page.value >= start.value + length.value - 1

		// `withInfo` mode renders Prev / Next as TEXT BUTTONS with the
		// chevron as a prepend / append icon (PDF spec: WITH INFO).
		// Default mode keeps them icon-only (the chevron alone). The
		// first / last controls always stay icon-only — they only show
		// when `showFirstLastPage` is set and are decorative anchors.
		const prevTextual = props.withInfo
			? {
				text: t(props.previousText ?? 'origam.pagination.previous'),
				prependIcon: props.prevIcon,
				icon: false,
			}
			: {
				icon: props.prevIcon,
			}
		const nextTextual = props.withInfo
			? {
				text: t(props.nextText ?? 'origam.pagination.next'),
				appendIcon: props.nextIcon,
				icon: false,
			}
			: {
				icon: props.nextIcon,
			}

		return {
			first: {
				...controlColorProps.value,
				icon: props.firstIcon,
				onClick: (e: Event) => setValue(e, start.value, 'first'),
				disabled: prevDisabled,
				'aria-label': props.firstAriaLabel,
				'aria-disabled': prevDisabled
			},
			prev: {
				...controlColorProps.value,
				...prevTextual,
				onClick: (e: Event) => setValue(e, page.value - 1, 'prev'),
				disabled: prevDisabled,
				'aria-label': props.previousAriaLabel,
				'aria-disabled': prevDisabled
			},
			next: {
				...controlColorProps.value,
				...nextTextual,
				onClick: (e: Event) => setValue(e, page.value + 1, 'next'),
				disabled: nextDisabled,
				'aria-label': props.nextAriaLabel,
				'aria-disabled': nextDisabled
			},
			last: {
				...controlColorProps.value,
				icon: props.lastIcon,
				onClick: (e: Event) => setValue(e, start.value + length.value - 1, 'last'),
				disabled: nextDisabled,
				'aria-label': props.lastAriaLabel,
				'aria-disabled': nextDisabled
			}
		}
	})

	/*********************************************************
	 * Keyboard navigation
	 *
	 * @description
	 * handleKeydown moves the page with arrow keys and updates focus.
	 * getMax computes the maximum visible buttons from available width.
	 * setValue sets the page value and fires the named event.
	 * updateFocus focuses the newly-active page button.
	 ********************************************************/
	const getMax = (totalWidth: number, itemWidth: number) => {
		const minButtons = props.showFirstLastPage ? 5 : 3
		return Math.max(0, Math.floor(
				// Round to two decimal places to avoid floating point errors
				+((totalWidth - itemWidth * minButtons) / itemWidth).toFixed(2)
		))
	}
	const setValue = (e: Event, value: number, event?: any) => {
		e.preventDefault()
		page.value = value

		if (event) {
			emits(event, value)
		}
	}
	const updateFocus = () => {
		const currentIndex = page.value - start.value

		refs.value[currentIndex]?.$el.focus()
	}

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === KEYBOARD_VALUES.LEFT && !props.disabled && page.value > +props.start) {
			page.value = page.value - 1
			nextTick(updateFocus)
		} else if (e.key === KEYBOARD_VALUES.RIGHT && !props.disabled && page.value < start.value + length.value - 1) {
			page.value = page.value + 1
			nextTick(updateFocus)
		}
	}

	/*********************************************************
	 * Compact mode
	 *
	 * @description
	 * compactInputRef holds the native number input for compact mode.
	 * handleCompactInput clamps and applies the typed value.
	 ********************************************************/
	const compactInputRef = ref<HTMLInputElement | null>(null)

	const handleCompactInput = (e: Event) => {
		const input = e.target as HTMLInputElement
		const raw = parseInt(input.value, 10)
		const clamped = isNaN(raw)
			? start.value
			: Math.min(Math.max(raw, start.value), length.value)

		// Sync the input's displayed value to the clamped value
		input.value = String(clamped)
		page.value = clamped
	}

	/*********************************************************
	 * With-info label
	 *
	 * @description
	 * "Showing 21-40 of 248" range label.
	 * `total` (items count) drives the right-hand bound; `perPage` slices
	 * the range; `currentPage` (== `page.value`) anchors it. When `total`
	 * is omitted we fall back to `length * perPage` so the label still
	 * renders something sensible. End is clamped to `total` so the last
	 * page reads "41-43 of 43" rather than "41-50 of 43".
	 ********************************************************/
	const perPageInt = computed(() => {
		const v = int(props.perPage)
		return Number.isFinite(v) && v > 0 ? v : 10
	})
	const totalInt = computed(() => {
		if (props.total != null) return int(props.total)
		return length.value * perPageInt.value
	})
	const infoStart = computed(() => {
		if (totalInt.value <= 0) return 0
		return (page.value - start.value) * perPageInt.value + 1
	})
	const infoEnd = computed(() => {
		if (totalInt.value <= 0) return 0
		return Math.min(infoStart.value + perPageInt.value - 1, totalInt.value)
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * `--colored` modifier is toggled as soon as the consumer passes any
	 * truthy intent on `color`/`bgColor`. Drives the SCSS branch that
	 * lets the inner OrigamBtn instances render with their own intent
	 * fill (PDF "stylé" look). When absent, the SCSS overrides the
	 * btn's default surface to a transparent neutral so the row reads
	 * as a subtle, ghost-like nav.
	 ********************************************************/
	const isColored = computed(() => !!(props.color || props.bgColor))

	const { sizeClasses } = useSize(props)
	const { densityClasses } = useDensity(props)
	const { typographyStyles } = useTypography(props, 'pagination--info')

	/*********************************************************
	 * Spacing / border / elevation
	 *
	 * @description
	 * `IPaginationProps` extends IPaddingProps / IMarginProps / IBorderProps /
	 * IElevationProps. None of the four were consumed: the row could not be
	 * padded, spaced, bordered or raised despite the types promising it.
	 * These paint the pagination ROW itself — the per-page buttons keep
	 * taking their own size / density through `btnProps` above.
	 ********************************************************/
	const { paddingClasses, paddingStyles } = usePadding(props)
	const { marginClasses, marginStyles } = useMargin(props)
	const { borderClasses, borderStyles } = useBorder(props)
	const { elevationClasses, elevationStyles } = useElevation(props)

	const paginationClasses = computed(() => {
		return [
			'origam-pagination',
			{
				'origam-pagination--colored': isColored.value,
				'origam-pagination--compact': !!props.compact,
				'origam-pagination--with-info': !!props.withInfo
			},
			sizeClasses.value,
			densityClasses.value,
			borderClasses.value,
			elevationClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})
	const paginationStyles = computed(() => {
		return [
			borderStyles.value,
			elevationStyles.value,
			marginStyles.value,
			paddingStyles.value,
			props.style
		] as StyleValue
	})
	const {id, css, load, isLoaded, unload} = useStyle(paginationStyles, () => props.id)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Exposes filterProps to parent ref consumers.
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
	.origam-pagination {
		// ── Unified color logic ────────────────────────────────────
		//
		// Single derivation rule, identical to what every component
		// in the design system should do (cf. ADR on color logic):
		//
		//     normal  →  bgColor
		//     hover   →  color-mix(bgColor, black 20 %)   ← derived
		//     active  →  color-mix(bgColor, black 30 %)   ← derived
		//
		// Consumers can short-circuit any state by setting the
		// matching CSS var (the JS-level `activeBgColor` /
		// `hoverBgColor` props funnel into these vars upstream).
		//
		//   --origam-pagination---background-color           (normal)
		//   --origam-pagination---background-color-hover     (hover  override)
		//   --origam-pagination__item--is-active---background-color
		//                                                    (active override)
		//
		// `--colored` just repoints the base bg to the intent
		// token (and the paired fg) — every state cascades from it
		// automatically, so we no longer maintain two branches.
		//
		// IMPORTANT: these CSS-custom-property declarations live BEFORE
		// the nested rules below. Modern Sass (and the future CSS spec)
		// will hoist nested rules above bare declarations, so keeping
		// the order is "declarations → nested rules" prevents the
		// `mixed-decls` deprecation warning.
		--bg-base: var(--origam-pagination---background-color, transparent);
		--fg-base: var(--origam-pagination---color, currentColor);

		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: var(--origam-pagination---gap-info, 16px);
		padding-block: var(--origam-pagination---padding-block, 0);
		padding-inline: var(--origam-pagination---padding-inline, 0);

		&--with-info {
			justify-content: space-between;
		}

		&__info {
			display: inline-flex;
			align-items: center;
			color: var(--origam-pagination--info---color, currentColor);
			font-size: var(--origam-pagination--info---font-size, 0.75rem);
			font-weight: var(--origam-pagination--info---font-weight, 400);
			white-space: nowrap;
		}

		&__list {
			display: inline-flex;
			list-style-type: none;
			justify-content: center;
			margin: 0;
			padding: 0;
		}

		&--colored {
			--bg-base: var(
				--origam-pagination---background-color-colored,
				var(--origam-color__action--primary---bg)
			);
			--fg-base: var(
				--origam-pagination---color-colored,
				var(--origam-color__action--primary---fg)
			);

			:deep(.origam-btn) {
				box-shadow: var(--origam-pagination--primary---box-shadow, none);
			}
		}

		// Normal state — every non-hover, non-active btn paints --bg-base.
		:deep(.origam-btn:not(:hover):not(.origam-btn--active)) {
			--origam-btn---background-color: var(--bg-base);
			--origam-btn---color: var(--fg-base);
		}

		// Hover state — derived: 20 % darker than --bg-base.
		// Consumer can override via --origam-pagination---background-color-hover.
		:deep(.origam-btn:hover:not(.origam-btn--active)) {
			--origam-btn---background-color: var(
				--origam-pagination---background-color-hover,
				color-mix(in srgb, var(--bg-base), black 20%)
			);
			--origam-btn---color: var(--origam-pagination---color-hover, var(--fg-base));
		}

		// Same "text-variant blocks background-color" contract as the
		// active state below — `--origam-btn---background-color` set on
		// `.origam-btn:hover` above has zero visual effect in uncolored/
		// ghost mode, regardless of what it resolves to. Unlike the active
		// state, `.origam-btn`'s NATIVE hover feedback (its own
		// `.origam-btn__overlay`, opacity 0.12) isn't suppressed by any
		// Pagination rule — but that overlay's default paint colour
		// (`--origam-color__overlay---scrim`) is WHITE in the light theme,
		// so a 12 % white tint over an already-transparent/white page is
		// imperceptible in practice (verified via getComputedStyle: overlay
		// background rgb(255, 255, 255) at opacity 0.12). Repaint it with
		// the SAME `--origam-pagination---background-color-hover` token the
		// (dead, for this branch) rule above already references — it's
		// seeded globally at :root (→ neutral action-secondary-bgHover,
		// #e6e6e6 in the light theme), so this is the first rule that
		// actually surfaces the value everyone already had access to.
		&:not(&--colored) :deep(.origam-btn:hover:not(.origam-btn--active) .origam-btn__overlay) {
			background-color: var(--origam-pagination---background-color-hover);
			opacity: 1;
		}

		// Active state — derived: 30 % darker than --bg-base.
		// Consumer can override via the matching `is-active` vars.
		&__item--is-active :deep(.origam-btn) {
			--origam-btn---background-color: var(
				--origam-pagination__item--is-active---background-color,
				color-mix(in srgb, var(--bg-base), black 30%)
			);
			--origam-btn---color: var(
				--origam-pagination__item--is-active---color,
				var(--fg-base)
			);
			--origam-btn---border-color: var(
				--origam-pagination__item--is-active---border-color,
				transparent
			);
		}

		// The `--origam-btn---background-color` derivation above (and the
		// hover rule before it) can NEVER visually apply in uncolored/ghost
		// mode. The origam baseline theme (packages/ds/src/themes/
		// origam.theme.ts, since 9a082b90) sets `'origam-btn': { variant:
		// 'text', size: 'small' }` as the default for every Btn that doesn't
		// receive an explicit `variant` prop — which is exactly this
		// branch's inner buttons (`variant: baseBg ? VARIANT.FLAT :
		// undefined`, undefined here). `.origam-btn--variant-text` then
		// unconditionally forces `background-color: transparent !important`
		// — a deliberate, tested contract (btn.spec.ts:591, "--variant-text:
		// background-color declaration is transparent !important"), NOT a
		// bug this component may work around by feeding the CSS var a
		// different value. Confirmed: overriding
		// `--origam-btn---background-color` here has zero visual effect
		// on a text-variant button, on any engine.
		//
		// Before 9a082b90 introduced that theme default, these inner
		// buttons had no forced variant and the color-mix background fill
		// genuinely worked (cb10d654's commit message recorded the
		// then-correct `color(srgb 0 0 0 / 0.3)` result for this exact
		// case) — the theme change silently broke it, reproducing the
		// exact "indistinguishable active page" defect this file's
		// user-reported origin (652a770e) was fixed for.
		//
		// The only mechanism that CAN still paint a text-variant button is
		// its own `.origam-btn__overlay` — a separate absolutely-positioned
		// element Btn itself uses for native hover/active feedback, exempt
		// from the `--variant-text` rule (which only targets `.origam-btn`
		// itself). Its default `background-color` token
		// (`--origam-color__overlay---scrim`) is WHITE in the light theme
		// (verified via getComputedStyle) — useless for a darkening effect
		// — so paint it with the same neutral-200 target color instead, at
		// full opacity, which composites to exactly the intended
		// rgb(230, 230, 230) over the (transparent) resting surface.
		&:not(&--colored) &__item--is-active :deep(.origam-btn__overlay) {
			background-color: var(
				--origam-pagination__item--is-active---background-color,
				var(--origam-color__neutral---200, #e6e6e6)
			);
			opacity: var(--origam-pagination__item--is-active---active-overlay-opacity, 1);
		}

		&__item--is-active :deep(.origam-btn__overlay) {
			// Colored mode: the flat-variant background derivation above
			// (color-mix 30 % darker) already carries the contrast on
			// `.origam-btn` itself — collapse the overlay so it doesn't
			// double-darken on top of that fill. The uncolored-branch rule
			// above wins over this one for uncolored instances (extra
			// `:not(&--colored)` specificity), so it isn't shadowed by this
			// default.
			opacity: var(--origam-pagination__item--is-active---active-overlay-opacity, 0);
		}

		&__item,
		&__first,
		&__prev,
		&__next,
		&__last {
			margin: var(--origam-pagination---gap, 4px);
		}

		// All pagination buttons (numbered pages + prev / next chevrons
		// + ellipsis) share a single rounded-square shape (PDF spec:
		// active "2" rendered as an ~8px-radius purple square, NOT a
		// circle). The earlier `--icon` override forced 9999px on every
		// btn that received `icon: true|"mdi-…"` — producing the round
		// page numbers + round chevrons the user reported as a mismatch
		// against the print mockups.
		:deep(.origam-btn) {
			border-radius: var(--origam-pagination---border-radius, 8px);
		}

		:deep(.origam-btn--rounded) {
			border-radius: var(--origam-pagination---border-radius-rounded, 24px);
		}

		// Explicitly override the `--icon` btn's default 50% radius back
		// to the pagination shape. Without this the inner OrigamBtn's
		// own `&--icon { border-radius: 50% }` (set inside the btn's
		// scoped styles) wins, restoring the circular pages.
		:deep(.origam-btn--icon) {
			--origam-btn---border-radius: var(--origam-pagination---border-radius, 8px);
			--origam-btn---border-radius-icon: var(--origam-pagination---border-radius, 8px);
			border-radius: var(--origam-pagination---border-radius, 8px);
		}

		:deep(.origam-btn__overlay) {
			transition: none;
		}

		&__list--compact {
			flex-wrap: nowrap;
			align-items: center;
			width: auto;
		}

		&__compact-label {
			display: inline-flex;
			align-items: center;
			gap: var(--origam-pagination---label-gap, 8px);
			list-style: none;
			margin: var(--origam-pagination---gap, 4px);
			white-space: nowrap;
		}

		&__compact-input {
			display: inline-block;
			width: var(--origam-pagination---input-width, 3em);
			padding-inline: var(--origam-pagination---input-padding-inline, 4px);
			text-align: center;
			border: 1px solid currentColor;
			border-radius: var(--origam-pagination---border-radius, 4px);
			font: inherit;
			line-height: 1.5;

			appearance: textfield;

			&::-webkit-inner-spin-button,
			&::-webkit-outer-spin-button {
				appearance: none;
				margin: 0;
			}

			&:focus-visible {
				outline: 2px solid currentColor;
				outline-offset: 2px;
			}
		}
	}
</style>
