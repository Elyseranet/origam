<template>
	<teleport to="body">
		<transition name="origam-command-palette--fade">
			<div
					v-if="isActive"
					ref="rootRef"
					:class="rootClasses"
					:style="rootStyles"
					:data-cy="dataCy"
					@click.self="handleBackdropClick"
					@keydown="handleKeydown"
			>
				<div
						ref="dialogRef"
						:aria-labelledby="inputId"
						:class="dialogClasses"
						:style="dialogStyles"
						aria-modal="true"
						role="dialog"
						tabindex="-1"
				>
					<div class="origam-command-palette__search">
						<origam-icon
								:icon="MDI_ICONS.MAGNIFY"
								:size="20"
								aria-hidden="true"
								class="origam-command-palette__search-icon"
						/>
						<input
								:id="inputId"
								ref="inputRef"
								v-model="query"
								:aria-activedescendant="activeOptionId"
								:aria-controls="listboxId"
								:aria-expanded="hasResults"
								:placeholder="placeholder"
								:style="inputTypographyStyles"
								aria-autocomplete="list"
								autocomplete="off"
								class="origam-command-palette__input"
								role="combobox"
								spellcheck="false"
								type="text"
								@input="handleInput"
								@keydown.down.prevent="moveActive(1)"
								@keydown.up.prevent="moveActive(-1)"
								@keydown.enter.prevent="handleEnter"
								@keydown.escape.prevent="handleEscape"
						/>
					</div>

					<div
							:id="listboxId"
							:aria-label="placeholder"
							:style="listStyles"
							class="origam-command-palette__list"
							role="listbox"
					>
						<div
								v-if="loading"
								class="origam-command-palette__loading"
						>
							<origam-icon
									:icon="MDI_ICONS.LOADING"
									:size="20"
									class="origam-command-palette__loading-icon"
							/>
						</div>

						<template
								v-else-if="hasResults"
						>
							<template
									v-for="group in groupedResults"
									:key="group.label || '__default__'"
							>
								<div
										v-if="group.label"
										:style="groupTitleTypographyStyles"
										class="origam-command-palette__group-title"
								>
									{{ group.label }}
								</div>

								<button
										v-for="entry in group.items"
										:id="optionDomId(entry.item.id)"
										:key="entry.item.id"
										:aria-disabled="entry.item.disabled ? 'true' : 'false'"
										:aria-selected="entry.item.id === activeCommandId ? 'true' : 'false'"
										:class="itemClasses(entry.item)"
										:disabled="entry.item.disabled"
										role="option"
										tabindex="-1"
										type="button"
										@click="handleItemClick(entry.item)"
										@mousemove="handleItemHover(entry.item)"
								>
									<slot
											name="item"
											v-bind="{ command: entry.item, isActive: entry.item.id === activeCommandId }"
									>
										<origam-icon
												v-if="entry.item.icon"
												:icon="entry.item.icon"
												:size="18"
												class="origam-command-palette__item-icon"
										/>

										<span class="origam-command-palette__item-text">
											<span class="origam-command-palette__item-label">{{ entry.item.label }}</span>
											<span
													v-if="entry.item.description"
													class="origam-command-palette__item-description"
											>
												{{ entry.item.description }}
											</span>
										</span>

										<origam-kbd
												v-if="entry.item.kbd && entry.item.kbd.length > 0"
												:combination="[...entry.item.kbd]"
												class="origam-command-palette__item-kbd"
												variant="outlined"
										/>
									</slot>
								</button>
							</template>
						</template>

						<div
								v-else
								class="origam-command-palette__empty"
						>
							<slot name="empty">
								{{ emptyText }}
							</slot>
						</div>
					</div>

					<div
							v-if="slots.footer || hasDefaultFooter"
							class="origam-command-palette__footer"
					>
						<slot name="footer">
							<span class="origam-command-palette__footer-hint">
								<origam-kbd :combination="['arrowup', 'arrowdown']" variant="tonal"/>
								{{ navigateText }}
							</span>
							<span class="origam-command-palette__footer-hint">
								<origam-kbd :combination="['enter']" variant="tonal"/>
								{{ selectText }}
							</span>
							<span class="origam-command-palette__footer-hint">
								<origam-kbd :combination="['esc']" variant="tonal"/>
								{{ closeText }}
							</span>
						</slot>
					</div>
				</div>
			</div>
		</transition>
	</teleport>
</template>

<script
		lang="ts"
		setup
>
	import { computed, nextTick, ref, StyleValue, useSlots, watch } from 'vue'

	import { OrigamIcon, OrigamKbd } from '../../components'

	import { useCommand } from '../../composables/CommandPalette/command.composable'

	import { useHotkey } from '../../composables/Commons/hotkey.composable'

	import { useTypography } from '../../composables/Commons/typography.composable'

	import { useVModel } from '../../composables/Commons/vModel.composable'

	import {
		COMMAND_PALETTE_DEFAULT_HOTKEY,
		COMMAND_PALETTE_DEFAULT_MAX_HEIGHT,
		COMMAND_PALETTE_DEFAULT_WIDTH,
		IN_BROWSER
	} from '../../consts'

	import { MDI_ICONS } from '../../enums'

	import type { ICommand, ICommandPaletteProps, ICommandPaletteSlots} from '../../interfaces'

	import type { ICommandPaletteEmits } from '../../interfaces/CommandPalette/command-palette.interface'

	import { getUid } from '../../utils'

	import { fuzzyMatch, type IFuzzyMatchResult } from '../../utils/CommandPalette/fuzzy-match.util'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<ICommandPaletteProps>(), {
		modelValue: false,
		hotkey: () => COMMAND_PALETTE_DEFAULT_HOTKEY,
		placeholder: 'Search…',
		emptyText: 'No results',
		maxHeight: COMMAND_PALETTE_DEFAULT_MAX_HEIGHT,
		width: COMMAND_PALETTE_DEFAULT_WIDTH,
		loading: false,
		closeOnSelect: true,
		closeOnEscape: true,
		closeOnBackdrop: true
	})

	const emit = defineEmits<ICommandPaletteEmits>()

	defineSlots<ICommandPaletteSlots>()
	const slots = useSlots()

	/*********************************************************
	 * v-model — single source of truth for open/close.
	 *
	 * @description
	 * `useVModel` keeps `isActive` in sync with both the prop and the
	 * registry singleton (`useCommand`). Components mounted without an
	 * explicit `commands` prop fall back to the global registry.
	 ********************************************************/

	const isActive = useVModel(props, 'modelValue')
	const { commands: registryCommands, isOpen: registryOpen } = useCommand()

	// When a consumer drives the palette through `useCommand().open()`,
	// mirror the registry's open state onto the local v-model so the
	// declarative prop API stays consistent.
	watch(registryOpen, (next) => {
		if (next !== isActive.value) isActive.value = next
	})

	watch(isActive, (next) => {
		if (next !== registryOpen.value) registryOpen.value = next
	})

	/*********************************************************
	 * IDs & refs
	 ********************************************************/

	const uid = getUid()
	const inputId = computed(() => `origam-command-palette-input-${uid}`)
	const listboxId = computed(() => `origam-command-palette-listbox-${uid}`)
	const dataCy = computed(() => 'origam-command-palette')

	const rootRef = ref<HTMLElement>()
	const dialogRef = ref<HTMLElement>()
	const inputRef = ref<HTMLInputElement>()

	/*********************************************************
	 * Hotkey registration
	 *
	 * @description
	 * `useHotkey` returns a cleanup closure. We collect every closure
	 * from each combination so the listeners can be torn down together
	 * if the prop changes at runtime (rare but supported).
	 ********************************************************/

	const normalizedHotkeys = computed<ReadonlyArray<ReadonlyArray<string>>>(() => {
		const raw = props.hotkey

		if (!raw) return []
		if (raw.length === 0) return []

		// A nested array means the user passed multiple combinations.
		if (Array.isArray(raw[0])) {
			return raw as ReadonlyArray<ReadonlyArray<string>>
		}

		return [raw as ReadonlyArray<string>]
	})

	const toggle = (): void => {
		isActive.value = !isActive.value
	}

	if (IN_BROWSER) {
		const installed: Array<() => void> = []

		watch(normalizedHotkeys, (next) => {
			while (installed.length > 0) {
				const dispose = installed.pop()
				try {
					dispose?.()
				} catch {
					// `useHotkey` swallows its own errors — defensive guard
					// so a misbehaving cleanup never crashes the component.
				}
			}

			next.forEach((combo) => {
				const keysAsString = combo.join('+')
				// `useHotkey` itself ignores key combinations when focus is
				// inside an INPUT / TEXTAREA / contentEditable element
				// (its `inputs: false` default). That matches the brief —
				// we don't want to grab ⌘K typed inside a user input.
				const cleanup = useHotkey(keysAsString, () => toggle())
				installed.push(cleanup)
			})
		}, { immediate: true })
	}

	/*********************************************************
	 * Data source — declarative prop vs global registry.
	 ********************************************************/

	const sourceCommands = computed<ReadonlyArray<ICommand>>(() => {
		if (props.commands && props.commands.length > 0) return props.commands

		return registryCommands.value
	})

	/*********************************************************
	 * Query + filtering
	 ********************************************************/

	const query = ref<string>('')

	const filtered = computed<ReadonlyArray<IFuzzyMatchResult<ICommand>>>(() => {
		return fuzzyMatch(sourceCommands.value as ReadonlyArray<ICommand>, query.value, (cmd) => ({
			label: cmd.label,
			haystack: [
				cmd.label,
				...(cmd.keywords ?? []),
				cmd.description ?? ''
			].join(' ')
		}))
	})

	const hasResults = computed<boolean>(() => filtered.value.length > 0)

	/*********************************************************
	 * Grouping
	 *
	 * @description
	 * When `query` is empty we honour the `group` field on each command
	 * — commands without a group fall in a leading default bucket.
	 * When the query is non-empty we keep the fuzzy ranking flat
	 * (groups would conflict with score-based ordering).
	 ********************************************************/

	interface IRenderedGroup {
		label: string | null
		items: ReadonlyArray<IFuzzyMatchResult<ICommand>>
	}

	const groupedResults = computed<ReadonlyArray<IRenderedGroup>>(() => {
		if (query.value.trim().length > 0) {
			// Flat view when ranked.
			return [{ label: null, items: filtered.value }]
		}

		const buckets = new Map<string | null, Array<IFuzzyMatchResult<ICommand>>>()
		const order: Array<string | null> = []

		filtered.value.forEach((entry) => {
			const key = entry.item.group ?? null

			if (!buckets.has(key)) {
				buckets.set(key, [])
				order.push(key)
			}

			buckets.get(key)!.push(entry)
		})

		return order.map((key) => ({
			label: key,
			items: buckets.get(key) ?? []
		}))
	})

	/*********************************************************
	 * Active selection (keyboard cursor)
	 ********************************************************/

	const flatResults = computed<ReadonlyArray<ICommand>>(() => {
		const flat: Array<ICommand> = []

		groupedResults.value.forEach((g) => {
			g.items.forEach((entry) => flat.push(entry.item))
		})

		return flat
	})

	const activeIndex = ref<number>(0)

	const activeCommandId = computed<string | undefined>(() => {
		return flatResults.value[activeIndex.value]?.id
	})

	const activeOptionId = computed<string | undefined>(() => {
		if (!activeCommandId.value) return undefined

		return optionDomId(activeCommandId.value)
	})

	function optionDomId (commandId: string): string {
		return `origam-command-palette-option-${uid}-${commandId}`
	}

	// Reset the active cursor whenever the result set changes — keeps
	// the highlight on the first match instead of pointing past the
	// end of a shorter list.
	watch(filtered, () => {
		activeIndex.value = 0
		nextTick(() => scrollActiveIntoView())
	})

	function moveActive (delta: number): void {
		const len = flatResults.value.length

		if (len === 0) return

		// Skip disabled commands — they cannot be activated.
		let next = activeIndex.value
		for (let i = 0; i < len; i++) {
			next = (next + delta + len) % len
			if (!flatResults.value[next].disabled) break
		}

		activeIndex.value = next
		nextTick(() => scrollActiveIntoView())
	}

	function scrollActiveIntoView (): void {
		if (!IN_BROWSER) return
		const id = activeCommandId.value
		if (!id) return

		const el = document.getElementById(optionDomId(id))
		el?.scrollIntoView({ block: 'nearest' })
	}

	/*********************************************************
	 * Selection
	 ********************************************************/

	async function selectCommand (cmd: ICommand): Promise<void> {
		if (cmd.disabled) return

		emit('select', cmd)

		try {
			await cmd.perform()
		} finally {
			if (props.closeOnSelect) {
				isActive.value = false
			}
		}
	}

	function handleItemClick (cmd: ICommand): void {
		void selectCommand(cmd)
	}

	function handleItemHover (cmd: ICommand): void {
		const idx = flatResults.value.findIndex(item => item.id === cmd.id)
		if (idx !== -1) activeIndex.value = idx
	}

	function handleEnter (): void {
		const cmd = flatResults.value[activeIndex.value]
		if (cmd) void selectCommand(cmd)
	}

	function handleEscape (): void {
		if (props.closeOnEscape) isActive.value = false
	}

	function handleBackdropClick (): void {
		if (props.closeOnBackdrop) isActive.value = false
	}

	function handleKeydown (e: KeyboardEvent): void {
		// Tab key — focus trap. There is nothing else inside the dialog
		// after the input + options + footer slot, so we keep focus on
		// the input element so the user can keep typing.
		if (e.key === 'Tab') {
			e.preventDefault()
			inputRef.value?.focus()
		}
	}

	function handleInput (): void {
		emit('query', query.value)
	}

	/*********************************************************
	 * Focus management — restore the previously focused element on close.
	 ********************************************************/

	let returnFocusEl: HTMLElement | null = null

	watch(isActive, async (next) => {
		if (next) {
			if (IN_BROWSER) {
				returnFocusEl = document.activeElement as HTMLElement | null
			}

			query.value = ''
			activeIndex.value = 0
			await nextTick()
			inputRef.value?.focus({ preventScroll: true })
		} else {
			returnFocusEl?.focus?.({ preventScroll: true })
			returnFocusEl = null
		}
	})

	/*********************************************************
	 * Footer fallback strings
	 ********************************************************/

	const navigateText = 'Navigate'
	const selectText = 'Select'
	const closeText = 'Close'
	const hasDefaultFooter = computed<boolean>(() => true)

	/*********************************************************
	 * Typography
	 *
	 * @description
	 * Two BEM surfaces consume a font-size token:
	 *   __group-title  → --origam-command-palette__group-title---font-size
	 *   __input        → --origam-command-palette__input---font-size
	 * Both are driven by the same `fontSize` prop (ITypographyProps).
	 * Other typography props (fontWeight, letterSpacing, …) emit their
	 * CSS vars but the SCSS does not read them on either surface — they
	 * have no visual effect and are not exposed in the story controls.
	 ********************************************************/

	const { typographyStyles: groupTitleTypographyStyles } = useTypography(props, 'command-palette__group-title')
	const { typographyStyles: inputTypographyStyles } = useTypography(props, 'command-palette__input')

	/*********************************************************
	 * Class & Style
	 ********************************************************/

	function itemClasses (cmd: ICommand) {
		return [
			'origam-command-palette__item',
			{
				'origam-command-palette__item--active': cmd.id === activeCommandId.value,
				'origam-command-palette__item--disabled': cmd.disabled
			}
		]
	}

	function toUnit (value: number | string | undefined): string | undefined {
		if (value === undefined) return undefined
		if (typeof value === 'number') return `${value}px`

		return value
	}

	const rootClasses = computed(() => {
		return [
			'origam-command-palette',
			props.class
		]
	})

	const rootStyles = computed<StyleValue>(() => {
		return [props.style] as StyleValue
	})

	const dialogClasses = computed(() => {
		return ['origam-command-palette__dialog']
	})

	const dialogStyles = computed<StyleValue>(() => {
		return [
			{ '--origam-command-palette---width': toUnit(props.width) }
		] as StyleValue
	})

	const listStyles = computed<StyleValue>(() => {
		return [
			{ '--origam-command-palette---max-height': toUnit(props.maxHeight) }
		] as StyleValue
	})

	/*********************************************************
	 * Expose
	 ********************************************************/

	defineExpose({
		query,
		filtered,
		activeIndex,
		isActive
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-command-palette {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding-top: var(--origam-command-palette---padding-top, 18vh);
		z-index: var(--origam-command-palette---z-index, 2500);
		background-color: var(--origam-command-palette--backdrop---background-color, rgba(0, 0, 0, 0.45));
		backdrop-filter: var(--origam-command-palette--backdrop---backdrop-filter, blur(6px));

		&__dialog {
			display: flex;
			flex-direction: column;
			width: min(var(--origam-command-palette---width, 640px), calc(100vw - 32px));
			max-height: calc(100vh - 96px);
			background-color: var(--origam-command-palette---background-color, var(--origam-color__surface---elevated, #fff));
			border: var(--origam-command-palette---border-width, 1px) solid var(--origam-command-palette---border-color, var(--origam-color__border---subtle, rgba(0, 0, 0, 0.12)));
			border-radius: var(--origam-command-palette---border-radius, 12px);
			box-shadow: var(--origam-command-palette---box-shadow, 0 24px 48px rgba(0, 0, 0, 0.18));
			overflow: hidden;
			color: var(--origam-command-palette---color, var(--origam-color__text---primary, #171717));
		}

		&__search {
			display: flex;
			align-items: center;
			gap: 10px;
			padding: var(--origam-command-palette__input---padding, 12px 16px);
			border-bottom: 1px solid var(--origam-command-palette__input---border-color, var(--origam-color__border---subtle, rgba(0, 0, 0, 0.08)));
		}

		&__search-icon {
			flex: 0 0 auto;
			color: var(--origam-command-palette__input---icon-color, var(--origam-color__text---secondary, rgba(0, 0, 0, 0.55)));
		}

		&__input {
			flex: 1 1 auto;
			background: transparent;
			border: 0;
			outline: none;
			color: inherit;
			font: inherit;
			font-size: var(--origam-command-palette__input---font-size, 1rem);
			padding: 0;

			&::placeholder {
				color: var(--origam-command-palette__input---placeholder-color, var(--origam-color__text---tertiary, rgba(0, 0, 0, 0.4)));
			}
		}

		&__list {
			max-height: var(--origam-command-palette---max-height, 480px);
			overflow-y: auto;
			padding: var(--origam-command-palette__list---padding, 6px);
		}

		&__group-title {
			padding: var(--origam-command-palette__group-title---padding, 10px 12px 6px);
			color: var(--origam-command-palette__group-title---color, var(--origam-color__text---secondary, rgba(0, 0, 0, 0.55)));
			font-size: var(--origam-command-palette__group-title---font-size, 0.75rem);
			text-transform: uppercase;
			letter-spacing: 0.04em;
			font-weight: 600;
			user-select: none;
		}

		&__item {
			display: flex;
			align-items: center;
			gap: 12px;
			width: 100%;
			background: transparent;
			border: 0;
			text-align: start;
			cursor: pointer;
			color: inherit;
			font: inherit;
			padding: var(--origam-command-palette__item---padding, 8px 12px);
			min-height: var(--origam-command-palette__item---height, 40px);
			border-radius: var(--origam-command-palette__item---border-radius, 8px);
			background-color: var(--origam-command-palette__item---background-color, transparent);
			transition: background-color 80ms ease;

			&--active {
				background-color: var(--origam-command-palette__item---background-color-active, var(--origam-color__action--neutral---bgSubtle, rgba(0, 0, 0, 0.06)));
				color: var(--origam-command-palette__item---color-active, var(--origam-color__text---primary, #171717));
			}

			&--disabled {
				cursor: not-allowed;
				opacity: 0.45;
			}

			&:focus-visible {
				outline: 2px solid currentColor;
				outline-offset: 2px;
			}
		}

		&__item-icon {
			flex: 0 0 auto;
			color: var(--origam-command-palette__item---icon-color, var(--origam-color__text---secondary, rgba(0, 0, 0, 0.6)));
		}

		&__item-text {
			display: flex;
			flex-direction: column;
			gap: 2px;
			flex: 1 1 auto;
			min-width: 0;
		}

		&__item-label {
			font-weight: 500;
			line-height: 1.3;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		&__item-description {
			font-size: 0.8125rem;
			color: var(--origam-command-palette__item---description-color, var(--origam-color__text---secondary, rgba(0, 0, 0, 0.55)));
			line-height: 1.2;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		&__item-kbd {
			flex: 0 0 auto;
			margin-inline-start: auto;
			gap: var(--origam-command-palette__item-kbd---gap, 4px);
		}

		&__empty {
			padding: 32px 16px;
			text-align: center;
			color: var(--origam-command-palette__empty---color, var(--origam-color__text---secondary, rgba(0, 0, 0, 0.55)));
			font-size: 0.875rem;
		}

		&__loading {
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 24px;
		}

		&__loading-icon {
			animation: origam-command-palette-spin 800ms linear infinite;
		}

		&__footer {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			gap: 16px;
			padding: var(--origam-command-palette__footer---padding, 8px 12px);
			border-top: 1px solid var(--origam-command-palette__footer---border-color, var(--origam-color__border---subtle, rgba(0, 0, 0, 0.08)));
			color: var(--origam-command-palette__footer---color, var(--origam-color__text---secondary, rgba(0, 0, 0, 0.55)));
			font-size: 0.75rem;
		}

		&__footer-hint {
			display: inline-flex;
			align-items: center;
			gap: 6px;
		}
	}

	@keyframes origam-command-palette-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-command-palette__loading-icon {
			animation: none;
		}
	}

	.origam-command-palette--fade-enter-active,
	.origam-command-palette--fade-leave-active {
		transition: opacity 140ms ease;
	}

	.origam-command-palette--fade-enter-from,
	.origam-command-palette--fade-leave-to {
		opacity: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-command-palette--fade-enter-active,
		.origam-command-palette--fade-leave-active {
			transition: opacity 60ms ease;
		}
	}
</style>
