<template>
	<origam-input
			ref="origamInputRef"
			v-model="model"
			:center-affix="isUniqueRow"
			:class="textareaFieldClasses"
			:focused="isFocused"
			:style="textareaFieldStyles"
			v-bind="{...rootAttrs, ...inputProps, rules: enrichedRules}"
			@click:prepend="handleClickPrepend"
			@click:append="handleClickAppend"
	>
		<template
				v-if="slots.prepend"
				#prepend
		>
			<slot name="prepend"/>
		</template>

		<template #default="{id, isDisabled, isDirty, isReadonly, isValid}">
			<origam-field
					:id="id"
					ref="origamFieldRef"
					:active="isActive || isDirty"
					:center-affix="isUniqueRow"
					:dirty="isDirty || dirty"
					:disabled="isDisabled"
					:error="isValid === false"
					:focused="isFocused"
					:style="textareaFieldFieldStyles"
					v-bind="{ ...fieldProps }"
					@click="handleControlClick"
					@mousedown="handleControlMousedown"
					@click:clear="handleClear"
					@click:prepend-inner="handleClickPrependInner"
					@click:append-inner="handleClickAppendInner"
			>
				<template
						v-if="slots.loader"
						#loader
				>
					<slot name="loader"/>
				</template>

				<template
						v-if="slots.prependInner"
						#prependInner
				>
					<slot name="prependInner"/>
				</template>

				<template
						v-if="slots.floatingLabel"
						#floatingLabel
				>
					<slot name="floatingLabel"/>
				</template>

				<template
						v-if="slots.label"
						#label
				>
					<slot name="label"/>
				</template>

				<template
						v-if="slots.prefix"
						#prefix
				>
					<slot name="prefix"/>
				</template>

				<template #default="{class: fieldSlotClass, ref, ...fieldSlotProps}">
					<div
							:class="fieldSlotClass"
							data-no-activator=""
					>
						<slot
								name="default"
								v-bind="{ref, ...fieldSlotProps}"
						/>
						<template v-if="isRichMode">
							<slot
									v-if="toolbarPosition !== TEXTAREA_TOOLBAR_POSITION.BOTTOM"
									name="toolbar"
									v-bind="toolbarSlotPayload"
							>
								<origam-rich-toolbar
										v-if="hasToolbar"
										:items="resolvedToolbar"
										:active="richActive"
										:position="toolbarPosition"
										:disabled="isDisabled"
										@format="handleRichFormat"
								/>
							</slot>
							<div
									ref="richHostRef"
									class="origam-textarea-field__rich"
									:style="typographyStyles"
									role="textbox"
									aria-multiline="true"
									:aria-disabled="isDisabled || undefined"
									:aria-readonly="isReadonly || undefined"
									:aria-label="placeholder || undefined"
									:contenteditable="(!isDisabled && !isReadonly) ? 'true' : 'false'"
									:data-empty="!hasRichContent"
									:data-placeholder="placeholder || ''"
									data-cy="origam-textarea-rich-host"
									@input="handleRichInput"
									@keydown="handleRichKeydown"
									@paste="handleRichPaste"
									@focus="handleFocus"
									@blur="handleBlur"
							/>
							<slot
									v-if="toolbarPosition === TEXTAREA_TOOLBAR_POSITION.BOTTOM"
									name="toolbar"
									v-bind="toolbarSlotPayload"
							>
								<origam-rich-toolbar
										v-if="hasToolbar"
										:items="resolvedToolbar"
										:active="richActive"
										:position="toolbarPosition"
										:disabled="isDisabled"
										@format="handleRichFormat"
								/>
							</slot>
						</template>
						<textarea
								v-else
								ref="textareaRef"
								v-intersect="intersect"
								:autofocus="autofocus"
								:disabled="isDisabled"
								:name="name"
								:placeholder="placeholder"
								:readonly="isReadonly"
								:required="required || undefined"
								:aria-required="required ? 'true' : undefined"
								:rows="rows"
								:value="model"
								v-bind="{ ...fieldSlotProps, ...inputAttrs }"
								@blur="handleBlur"
								@focus="handleFocus"
								@input="handleInput"
						/>
					</div>
					<div
							v-if="!autoGrow && !noResize && !isRichMode"
							ref="verticalDragger"
							class="origam-textarea-field__grip"
					>
						<svg
								aria-hidden="true"
								height="1em"
								preserveAspectRatio="xMidYMid meet"
								role="img"
								viewBox="0 0 24 24"
								width="1em"
								xmlns="http://www.w3.org/2000/svg"
								xmlns:xlink="http://www.w3.org/1999/xlink"
						>
							<path
									d="M21 11H3V9h18zm0 2H3v2h18z"
									fill="currentColor"
							></path>
						</svg>
					</div>
				</template>

				<template
						v-if="slots.suffix"
						#suffix
				>
					<slot name="suffix"/>
				</template>

				<template
						v-if="slots.appendInner"
						#appendInner
				>
					<slot name="appendInner"/>
				</template>

				<template
						v-if="slots.clear"
						#clear
				>
					<slot name="clear"/>
				</template>
			</origam-field>
		</template>

		<template
				v-if="slots.append"
				#append
		>
			<slot name="append"/>
		</template>

		<template
				v-if="hasDetails"
				#details="detailsSlotProps"
		>
			<slot
					name="details"
					v-bind="detailsSlotProps"
			>
				<origam-counter
						:active="persistentCounter || isFocused"
						:disabled="disabled"
						:max="max"
						:value="counterValue"
				>
					<template
							v-if="slots.counter"
							#default="{counter, max, value}"
					>
						<slot
								name="counter"
								v-bind="{counter, max, value}"
						/>
					</template>
				</origam-counter>
			</slot>
		</template>

		<template
				v-if="slots.messages"
				#messages="{hasMessages, messages}"
		>
			<slot
					name="messages"
					v-bind="{hasMessages, messages}"
			/>
		</template>

		<template
				v-if="slots.message"
				#message="{message}"
		>
			<slot
					name="message"
					v-bind="{message}"
			/>
		</template>
	</origam-input>
</template><script
		lang="ts"
		setup
>
	import {
		computed,
		nextTick,
		onBeforeUnmount,
		ref,
		shallowRef,
		StyleValue,
		toRef,
		useAttrs,
		useSlots,
		watch,
		watchEffect
	} from 'vue'
	import { OrigamCounter, OrigamField, OrigamInput } from '../../components'

	import OrigamRichToolbar from './OrigamRichToolbar.vue'

	import {
	useAdjacent,
	useAdjacentInner,
	useDefaults,
	useDragResizer,
	useFocus,
	useLocale,
	useProps,
	useStyle,
	useTextareaRich,
	useTypography,
	useVModel
} from '../../composables'

	import { DEFAULT_TOOLBAR } from '../../consts'

	import { vIntersect } from '../../directives'

	import {
		AXIS,
		DENSITY,
		MDI_ICONS,
		TEXTAREA_MODE,
		TEXTAREA_OUTPUT,
		TEXTAREA_TOOLBAR_POSITION
	} from '../../enums'

	import type { ITextareaFieldProps, ITextareaFieldSlots} from '../../interfaces'

	import type { ITextareaFieldEmits } from '../../interfaces/TextareaField/textarea-field.interface'

	import type {
		TOrigamField,
		TOrigamInput,
		TTextareaToolbarCommand
	} from '../../types'

	import { clamp, convertToUnit, filterInputAttrs, forwardRefs, htmlToMarkdown, sanitizeHtml } from '../../utils'

	/*********************************************************
	 * Global
	 ********************************************************/

	const _props = withDefaults(defineProps<ITextareaFieldProps>(), {
		density: DENSITY.DEFAULT,
		clearIcon: MDI_ICONS.CLOSE_CIRCLE_OUTLINE,
		rounded: true,
		rows: 3,
		mode: TEXTAREA_MODE.PLAIN,
		output: TEXTAREA_OUTPUT.HTML,
		toolbar: () => DEFAULT_TOOLBAR as ReadonlyArray<TTextareaToolbarCommand>,
		toolbarPosition: TEXTAREA_TOOLBAR_POSITION.TOP
	})
	const props = useDefaults(_props)

	const emits = defineEmits<ITextareaFieldEmits>()

	defineSlots<ITextareaFieldSlots>()
	const slots = useSlots()

	const attrs = useAttrs()

	const {t} = useLocale()

	/*********************************************************
	 * Value
	 ********************************************************/

	const model = useVModel(props, 'modelValue')

	/*********************************************************
	 * Rich-text mode
	 *
	 * @description
	 * When mode === 'rich' we swap the <textarea> for a contenteditable
	 * surface. The useTextareaRich composable owns the formatting
	 * commands, active-state detection and HTML sanitisation; the host
	 * component just glues it to the existing Field shell and translates
	 * the sanitised HTML to Markdown when `output === 'markdown'`.
	 ********************************************************/

	const isRichMode = computed(() => props.mode === TEXTAREA_MODE.RICH)
	const hasToolbar = computed(() => props.toolbar !== false && resolvedToolbar.value.length > 0)
	const resolvedToolbar = computed<ReadonlyArray<TTextareaToolbarCommand>>(() => {
		if (props.toolbar === false) return []
		return Array.isArray(props.toolbar) ? (props.toolbar as ReadonlyArray<TTextareaToolbarCommand>) : DEFAULT_TOOLBAR
	})

	let isApplyingExternal = false

	const richInitialHtml = computed(() => {
		if (!isRichMode.value) return ''
		const v = (model.value ?? '').toString()
		// Markdown round-trip isn't symmetrical here — we expect HTML on
		// input even in markdown-output mode. The host is responsible for
		// pre-loading content as HTML.
		return sanitizeHtml(v)
	})

	const rich = useTextareaRich({
		disabled: () => !!attrs.disabled || !!props.readonly,
		value: () => richInitialHtml.value,
		onUpdate: (html: string) => {
			if (isApplyingExternal) return
			const next = props.output === TEXTAREA_OUTPUT.MARKDOWN ? htmlToMarkdown(html) : html
			if (model.value !== next) model.value = next
		},
		onFormat: (command, value) => {
			emits('format', command, value)
		}
	})

	const richHostRef = rich.hostRef
	const richActive = rich.active
	const handleRichInput = rich.onInput
	const handleRichKeydown = rich.onKeydown
	const handleRichPaste = rich.onPaste

	const handleRichFormat = (command: TTextareaToolbarCommand, value?: string) => {
		rich.format(command, value)
	}

	const hasRichContent = computed(() => {
		const v = (model.value ?? '').toString().trim()
		return v !== ''
	})

	const toolbarSlotPayload = computed(() => ({
		format: rich.format,
		isFormat: rich.isFormatActive,
		items: resolvedToolbar.value,
		active: richActive
	}))

	// Keep the contenteditable host in sync when the v-model changes
	// from the outside (e.g. parent resets the value). We only push
	// changes when the model actually diverges from the host innerHTML
	// to avoid clobbering the caret on every keystroke.
	watch(() => model.value, (next) => {
		if (!isRichMode.value || !richHostRef.value) return
		if (props.output === TEXTAREA_OUTPUT.MARKDOWN) {
			// Cannot meaningfully sync markdown back into the host —
			// only re-seed if the host is currently empty.
			if (!richHostRef.value.innerHTML) {
				isApplyingExternal = true
				rich.setValue(sanitizeHtml((next ?? '').toString()))
				isApplyingExternal = false
			}
			return
		}
		const cleaned = sanitizeHtml((next ?? '').toString())
		if (richHostRef.value.innerHTML !== cleaned) {
			isApplyingExternal = true
			rich.setValue(cleaned)
			isApplyingExternal = false
		}
	})

	/*********************************************************
	 * Adjacent inner
	 *
	 * @description
	 *
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {
		onClickAppendInner: handleClickAppendInner,
		onClickPrependInner: handleClickPrependInner
	} = useAdjacentInner(props)

	/*********************************************************
	 * Icon
	 ********************************************************/

	const {
		onClickPrepend: handleClickPrepend,
		onClickAppend: handleClickAppend
	} = useAdjacent(props, toRef(props, 'prependIcon'), toRef(props, 'appendIcon'))

	/*********************************************************
	 * Intersect
	 *
	 * @description
	 *
	 ********************************************************/
	const intersect = computed(() => {
		return [{
			handler: handleIntersect
		}, null, ['once']]
	})

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleIntersect = (isIntersecting: boolean, entries: IntersectionObserverEntry[]) => {
		if (!props.autofocus || !isIntersecting) return

		(entries[0].target as HTMLInputElement)?.focus?.()
	}

	/*********************************************************
	 * Reference Html
	 *
	 * @description
	 *
	 ********************************************************/
	const origamInputRef = ref<TOrigamInput>()
	const origamFieldRef = ref<TOrigamField>()
	const textareaRef = ref<HTMLTextAreaElement>()
	const verticalDragger = ref<HTMLElement>()

	/*********************************************************
	 * Events & controls
	 *
	 * @description
	 *
	 ********************************************************/

	/*********************************************************
	 * Effect
	 ********************************************************/

	const {isFocused, onFocus, onBlur: handleBlur} = useFocus(props)
	const isActive = computed(() => {
		return props.persistentPlaceholder || isFocused.value || props.active
	})

	const focus = () => {
		if (textareaRef.value !== document.activeElement) {
			textareaRef.value?.focus()
		}

		if (!isFocused.value) onFocus()
	}
	const handleControlClick = (e: MouseEvent) => {
		focus()

		emits('click:control', e)
	}
	const handleControlMousedown = (e: MouseEvent) => {
		emits('mousedown:control', e)
	}
	const handleClear = (e: MouseEvent) => {
		e.stopPropagation()

		focus()

		nextTick(() => {
			model.value = ''

			emits('click:clear', e)
		})
	}
	const handleInput = (e: Event) => {
		const el = e.target as HTMLTextAreaElement

		model.value = el.value

		if (typeof props.modelModifiers !== 'boolean' && props.modelModifiers?.trim) {
			const caretPosition = [el.selectionStart, el.selectionEnd]

			nextTick(() => {
				el.selectionStart = caretPosition[0]
				el.selectionEnd = caretPosition[1]
			})
		}
	}
	const handleFocus = () => {
		focus()
	}

	/*********************************************************
	 * Height management
	 *
	 * @description
	 *
	 ********************************************************/
	const rows = ref(+(props.rows ?? 3))

	const isUniqueRow = computed(() => {
		return rows.value === 1
	})

	watchEffect(() => {
		if (!props.autoGrow) rows.value = +(props.rows ?? 3)
	})

	const parseCssFloat = (value: string, fallback = 0): number => {
		const parsed = parseFloat(value)
		return Number.isNaN(parsed) ? fallback : parsed
	}

	const getPadding = (style: CSSStyleDeclaration): number => {
		return parseCssFloat(style.getPropertyValue('--origam-field---padding-top')) +
				parseCssFloat(style.getPropertyValue('--origam-input---padding-top')) +
				parseCssFloat(style.getPropertyValue('--origam-field---padding-bottom'))
	}

	const getLineHeight = (style: CSSStyleDeclaration): number => {
		const lh = parseCssFloat(style.lineHeight)
		return lh > 0 ? lh : parseCssFloat(style.fontSize, 16) * 1.5
	}

	const minHeight = computed(() => {
		if (!textareaRef.value || !origamFieldRef.value) return 0

		const style = getComputedStyle(textareaRef.value)
		const fieldStyle = getComputedStyle(origamFieldRef.value.$el)

		const padding = getPadding(style)
		const lineHeight = getLineHeight(style)
		const rowCount = +(props.rows ?? 3)
		const fieldMinHeight = parseCssFloat(fieldStyle.getPropertyValue('--origam-input__control---height'))

		return Math.max(
				rowCount * lineHeight + padding,
				fieldMinHeight
		)
	})
	const maxHeight = computed(() => {
		if (!textareaRef.value) return Infinity

		if (props.maxRows == null) return Infinity

		const style = getComputedStyle(textareaRef.value)

		const padding = getPadding(style)
		const lineHeight = getLineHeight(style)
		const maxRowCount = +(props.maxRows)

		if (Number.isNaN(maxRowCount) || maxRowCount <= 0) return Infinity

		return maxRowCount * lineHeight + padding
	})
	const controlHeight = shallowRef(0)

	const calculateInputHeight = () => {
		if (!props.autoGrow || isRichMode.value) return

		nextTick(() => {
			if (!textareaRef.value) return

			const padding = getPadding(getComputedStyle(textareaRef.value))

			// Reset height so scrollHeight reflects real content
			textareaRef.value.style.height = '0'
			const scrollHeight = textareaRef.value.scrollHeight
			textareaRef.value.style.height = ''

			controlHeight.value = clamp(scrollHeight + padding, minHeight.value, maxHeight.value)

			emits('update:height', controlHeight.value)
		})
	}

	watch([model, () => props.maxRows, () => props.density, () => props.rows], () => {
		calculateInputHeight()
	}, {immediate: true})
	watch(minHeight, () => {
		controlHeight.value = minHeight.value
	})
	watch([verticalDragger, minHeight, maxHeight], () => {
		if (!verticalDragger.value) return

		useDragResizer(verticalDragger.value, controlHeight, minHeight.value, maxHeight.value, AXIS.Y)
	})
	watch(controlHeight, (newHeight) => {
		nextTick(() => {
			if (!textareaRef.value) return

			const style = getComputedStyle(textareaRef.value)

			const padding = getPadding(style)
			const lineHeight = getLineHeight(style)

			if (lineHeight <= 0) return

			rows.value = Math.floor((newHeight - padding) / lineHeight)
		})
	})

	let observer: ResizeObserver | undefined
	watch(textareaRef, (val) => {
		if (val) {
			observer = new ResizeObserver(calculateInputHeight)
			observer.observe(textareaRef.value!)
		} else {
			observer?.disconnect()
		}
	})

	onBeforeUnmount(() => {
		observer?.disconnect()
	})

	/*********************************************************
	 * Counter & details
	 *
	 * @description
	 *
	 ********************************************************/
	const counterValue = computed(() => {
		return typeof props.counterValue === 'function'
				? props.counterValue(model.value)
				: (model.value || '').toString().length
	})
	const max = computed(() => {
		if (attrs.maxlength) return attrs.maxlength as string | number

		if (
				!props.counter ||
				(typeof props.counter !== 'number' &&
						typeof props.counter !== 'string')
		) return undefined

		return props.counter
	})
	const hasCounter = computed(() => {
		return slots.counter || props.counter || props.counterValue
	})
	const hasDetails = computed(() => {
		return hasCounter.value || slots.details
	})

	/*********************************************************
	 * Validation
	 *
	 * @description
	 *
	 ********************************************************/
	const enrichedRules = computed(() => {
		const base = Array.isArray(props.rules) ? [...props.rules] : []

		if (props.counter && typeof props.counter === 'number') {
			const limit = props.counter
			base.push((v: string) => !v || v.length <= limit || t('origam.validation.max_length', [limit]))
		}

		return base
	})

	/*********************************************************
	 * Props
	 *
	 * @description
	 *
	 ********************************************************/
	const [rootAttrs, inputAttrs] = filterInputAttrs(attrs)

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const inputProps = computed(() => {
		return origamInputRef.value?.filterProps(props, ['modelValue', 'class', 'style', 'id', 'focused', 'centerAffix'])
	})
	const fieldProps = computed(() => {
		return origamFieldRef.value?.filterProps(props, ['class', 'id', 'style', 'active', 'dirty', 'disabled', 'focused', 'error', 'centerAffix'])
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * textareaFieldClasses is a computed property that returns an array of classes for the textareaField element.
	 * textareaFieldStyles is a computed property that returns an array of styles for the textareaField element.
	 * textareaFieldFieldStyles is a computed property that returns an array of styles for the field element.
	 ********************************************************/
	const textareaFieldStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const textareaFieldClasses = computed(() => {
		return [
			'origam-textarea-field origam-text-field',
			{
				'origam-textarea-field--prefixed': props.prefix,
				'origam-textarea-field--suffixed': props.suffix,
				'origam-text-field--prefixed': props.prefix,
				'origam-text-field--suffixed': props.suffix,
				'origam-textarea-field--auto-grow': props.autoGrow,
				'origam-textarea-field--no-resize': props.noResize || props.autoGrow
			},
			props.class
		]
	})
	const textareaFieldFieldStyles = computed(() => {
		return {
			'--origam-textarea-field__control---height': convertToUnit(controlHeight.value)
		}
	})

	// BEM-child surface: var is read by .origam-textarea-field__rich
	// (line-height only — rich mode). Bound directly on that element, not the root.
	// font-size / font-weight / font-family / letter-spacing have no SCSS rule
	// on this component → they are NOT exposed as effective props.
	const { typographyStyles } = useTypography(props, 'textarea-field__rich-content')

	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Exposes functions and components to the world.
	 *    filterProps is a function that filters out props that are not defined in the `ITextareaFieldProps` interface.
	 ********************************************************/
	const {filterProps} = useProps<ITextareaFieldProps>(props)
	const {id, css, load, isLoaded, unload} = useStyle(textareaFieldStyles)


	defineExpose(forwardRefs({filterProps,
		css,
		id,
		load,
		unload,
		isLoaded
	}, origamFieldRef, origamInputRef, textareaRef))
</script>

<style
		lang="scss"
		scoped
>
	.origam-textarea-field {
		$this: &;

		--origam-field__input---padding-bottom: var(--origam-field__input---padding-top);

		:deep(.origam-field) {
			--origam-textarea-field__control---height: var(--origam-input__control---height);

			.origam-field__field {
				--origam-input__control---height: var(--origam-textarea-field__control---height);
			}

			.origam-field__input {
				flex: 1 1 auto;
				outline: none;
				-webkit-mask-image: linear-gradient(to bottom, transparent, transparent calc(var(--origam-field---padding-top, 0px) + calc(var(--origam-input---padding-top, 16px) + var(--origam-input---density, 0px)) - 6px), black calc(var(--origam-field---padding-top, 0px) + calc(var(--origam-input---padding-top, 16px) + var(--origam-input---density, 0px)) + 4px));
				mask-image: linear-gradient(to bottom, transparent, transparent calc(var(--origam-field---padding-top, 0px) + calc(var(--origam-input---padding-top, 16px) + var(--origam-input---density, 0px)) - 6px), black calc(var(--origam-field---padding-top, 0px) + calc(var(--origam-input---padding-top, 16px) + var(--origam-input---density, 0px)) + 4px));
			}

			&.origam-field--no-label,
			&.origam-field--active {
				textarea {
					opacity: 1;
				}
			}

			textarea {
				border: none;
				background: transparent;
				resize: none;
			}
		}

		:deep(textarea) {
			opacity: 0;
			flex: 1;
			min-width: 0;
			transition: 0.15s opacity cubic-bezier(0.4, 0, 0.2, 1);
			line-height: 1;

			&:focus,
			&:active {
				outline: none;
			}

			&:invalid {
				box-shadow: none;
			}
		}

		&--no-resize {
			:deep(.origam-field__input) {
				resize: none;
			}
		}

		&__grip {
			position: absolute;
			bottom: 0;
			left: calc(0px - var(--origam-field---padding-start));
			border: 1px solid var(--origam-textarea-field__grip---border-color, var(--origam-color__border---subtle));
			border-top-width: 0;
			cursor: ns-resize;
			height: var(--origam-textarea-field__grip---height, 9px);
			overflow: hidden;
			display: flex;
			justify-content: center;
			align-items: center;
			opacity: var(--origam-textarea-field__grip---opacity, 0.2);
			width: calc(100% + var(--origam-field---padding-start) + var(--origam-field---padding-end));

			&:hover {
				color: currentColor;
				background-color: color-mix(in srgb, currentColor 30%, transparent)
			}
		}

		&__rich {
			flex: 1 1 auto;
			width: 100%;
			min-height: var(--origam-textarea-field__rich-content---min-height);
			padding: var(--origam-textarea-field__rich-content---padding);
			outline: none;
			line-height: var(--origam-textarea-field__rich-content---line-height);
			color: inherit;
			white-space: pre-wrap;
			word-break: break-word;
			overflow-wrap: anywhere;

			&[data-empty="true"]::before {
				content: attr(data-placeholder);
				color: var(--origam-textarea-field__rich-content---placeholder-color);
				pointer-events: none;
			}

			:deep(p) {
				margin: 0 0 var(--origam-textarea-field__rich-content---paragraph-gap);
			}

			:deep(p:last-child) {
				margin-bottom: 0;
			}

			:deep(a) {
				color: var(--origam-textarea-field__rich-link---color);
				text-decoration: var(--origam-textarea-field__rich-link---text-decoration);
			}

			:deep(code) {
				background-color: var(--origam-textarea-field__rich-code-inline---bg-color);
				color: var(--origam-textarea-field__rich-code-inline---color);
				padding: 0.1em 0.35em;
				border-radius: 3px;
				font-family: var(--origam-font---code, ui-monospace, SFMono-Regular, monospace);
				font-size: 0.92em;
			}

			:deep(ul),
			:deep(ol) {
				margin: 0 0 var(--origam-textarea-field__rich-content---paragraph-gap);
				padding-inline-start: var(--origam-textarea-field__rich-list---padding-inline-start);
			}

			:deep(h1) {
				font-size: var(--origam-textarea-field__rich-heading---font-size-h1);
				font-weight: 700;
				margin: 0 0 var(--origam-textarea-field__rich-content---paragraph-gap);
			}

			:deep(h2) {
				font-size: var(--origam-textarea-field__rich-heading---font-size-h2);
				font-weight: 700;
				margin: 0 0 var(--origam-textarea-field__rich-content---paragraph-gap);
			}

			:deep(h3) {
				font-size: var(--origam-textarea-field__rich-heading---font-size-h3);
				font-weight: 600;
				margin: 0 0 var(--origam-textarea-field__rich-content---paragraph-gap);
			}
		}
	}
</style>
