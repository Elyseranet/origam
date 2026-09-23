<template>
	<origam-input
			:id="id"
			ref="origamInputRef"
			v-model="model"
			:aria-labelledby="groupLabelledBy"
			:aria-readonly="readonly || undefined"
			:class="ratingFieldClasses"
			:style="ratingFieldStyles"
			role="radiogroup"
			v-bind="{...rootAttrs, ...inputProps}"
	>
		<template
				v-if="slots.prepend"
				#prepend
		>
			<slot name="prepend"/>
		</template>

		<template #default="{id,messagesId,isDisabled,isReadonly,isValid}">
			<slot
					name="default"
					v-bind="{id,messagesId,isDisabled,isReadonly,isValid}"
			>
				<div
						:id="groupLabelId"
						class="origam-rating-field__label"
				>
					<slot name="label">
						<origam-label
								:required="required"
								:text="label"
								tag="span"
						/>
					</slot>
				</div>

				<div class="origam-rating-field__empty">
					<origam-rating-field-item
							ref="origamRatingFieldItemRef"
							:index="-1"
							:length="length"
							:show-star="false"
							:value="0"
							v-bind="{...itemState[0], ...eventState[0]}"
					/>
				</div>

				<origam-btn
						v-if="clearable && normalizedValue > 0 && !disabled && !readonly"
						:aria-label="t('origam.rating.clear')"
						:icon="MDI_ICONS.CLOSE_CIRCLE_OUTLINE"
						:variant="VARIANT.TEXT"
						class="origam-rating-field__clear"
						data-cy="rating-field-clear"
						size="small"
						@click="model = 0"
				/>

				<template
						v-for="(range, index) in ranges"
						:key="index"
				>
					<div class="origam-rating-field__wrapper">
						<template v-if="hasLabels && labelOnTop && (slots[`itemLabel.${index}`] || slots.itemLabel)">
							<slot
									:index="index"
									:label="itemLabels?.[index]"
									:name="`itemLabel.${index}`"
							>
								<slot
										:index="index"
										:label="itemLabels?.[index]"
										name="itemLabel"
								>
									<span>{{ itemLabels?.[index] ?? '&nbsp;' }}</span>
								</slot>
							</slot>
						</template>
						<div class="origam-rating-field__content">
							<template v-if="halfIncrements">
								<origam-rating-field-item
										:checked="isChecked(range - 0.5)"
										:index="index * 2"
										:length="length"
										:value="range - 0.5"
										v-bind="{...itemState[index * 2], ...eventState[(index * 2) + 1]}"
								/>
								<origam-rating-field-item
										:checked="isChecked(range)"
										:index="(index * 2) + 1"
										:length="length"
										:value="range"
										v-bind="{...itemState[(index * 2) + 1], ...eventState[(index * 2) + 2]}"
								/>
							</template>
							<template v-else>
								<origam-rating-field-item
										:checked="isChecked(range)"
										:index="index"
										:length="length"
										:value="range"
										v-bind="{...itemState[index], ...eventState[index + 1]}"
								/>
							</template>
						</div>
						<template v-if="hasLabels && labelOnBottom && (slots[`itemLabel.${index}`] || slots.itemLabel)">
							<slot
									:index="index"
									:label="itemLabels?.[index]"
									:name="`itemLabel.${index}`"
							>
								<slot
										:index="index"
										:label="itemLabels?.[index]"
										name="itemLabel"
								>
									<span>{{ itemLabels?.[index] ?? '&nbsp;' }}</span>
								</slot>
							</slot>
						</template>
					</div>
				</template>
			</slot>
		</template>

		<template
				v-if="slots.append"
				#append
		>
			<slot name="append"/>
		</template>

		<template
				v-if="slots.details"
				#details="detailsSlotProps"
		>
			<slot
					name="details"
					v-bind="detailsSlotProps"
			/>
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
</template>

<script
		lang="ts"
		setup
>
	import { computed, nextTick, ref, shallowRef, StyleValue, useAttrs, useSlots } from 'vue'
	import OrigamBtn from '../Btn/OrigamBtn.vue'
	import OrigamInput from '../Input/OrigamInput.vue'
	import OrigamLabel from '../Label/OrigamLabel.vue'
	import OrigamRatingFieldItem from './OrigamRatingFieldItem.vue'

	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useVModel } from '../../composables/Commons/vModel.composable'

	import {
		RATING_FIELD_ENABLED_RADIO_SELECTOR,
		RATING_FIELD_MUTATING_KEYS,
		RATING_FIELD_ROOT_SELECTOR
	} from '../../consts/RatingField/rating-field.const'

	import { BLOCK } from '../../enums/Commons/anchor.enum'
	import { DENSITY } from '../../enums/Commons/density.enum'
	import { KEYBOARD_VALUES } from '../../enums/Commons/hotkey.enum'
	import { MDI_ICONS } from '../../enums/Commons/mdi.enum'
	import { SIZES } from '../../enums/Commons/size.enum'
	import { VARIANT } from '../../enums/Commons/variant.enum'

	import type { IRatingFieldProps } from '../../interfaces/RatingField/rating-field.interface'

	import type { IRatingFieldEmits, IRatingFieldSlots } from '../../interfaces/RatingField/rating-field.interface'

	import type { TOrigamInput } from '../../types/Input/input.type'
	import type { TOrigamRatingFieldItem } from '../../types/RatingField/rating-field-item.type'

	import { clamp, createRange } from '../../utils/Commons/commons.util'
	import { filterInputAttrs } from '../../utils/Input/input.util'
	import { getUid } from '../../utils/Commons/getCurrentInstance.util'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits and filterProps for the RatingField component.
	 ********************************************************/
	const props = withDefaults(defineProps<IRatingFieldProps>(), {
		length: 5,
		modelValue: 0,
		itemLabelPosition: BLOCK.TOP,
		tag: 'div',
		density: DENSITY.DEFAULT,
		size: SIZES.DEFAULT
	})

	defineEmits<IRatingFieldEmits>()

	defineSlots<IRatingFieldSlots>()

	const {filterProps} = useProps<IRatingFieldProps>(props)

	/*********************************************************
	 * DOM refs
	 *
	 * @description
	 * Refs to sub-components for forward-prop delegation.
	 ********************************************************/
	const origamInputRef = ref<TOrigamInput>()
	const origamRatingFieldItemRef = ref<TOrigamRatingFieldItem>()

	/*********************************************************
	 * Value & model
	 *
	 * @description
	 * Slots, locale, v-model binding and attrs.
	 ********************************************************/
	const slots = useSlots()
	const {t} = useLocale()

	/*********************************************************
	 * Value
	 ********************************************************/

	const model = useVModel(props, 'modelValue')
	const attrs = useAttrs()

	/*********************************************************
	 * Range & items
	 *
	 * @description
	 * Derived ranges, increments, item name and hover state
	 * for the rating items row.
	 ********************************************************/
	const normalizedValue = computed(() => {
		return clamp(parseFloat(model.value), 0, +props.length)
	})
	const ranges = computed(() => {
		return createRange(Number(props.length), 1)
	})
	const increments = computed(() => {
		return ranges.value.flatMap((v) => props.halfIncrements ? [v - 0.5, v] : [v])
	})
	const name = computed(() => {
		return props.name ?? `origam-rating-${getUid()}`
	})

	const hoverIndex = shallowRef(-1)

	/*********************************************************
	 * Keyboard (#812)
	 *
	 * @description
	 * What the PLATFORM already does for a radio group sharing one `name`,
	 * measured in Chromium on a bare `<input type="radio">` group:
	 *
	 *   Tab                    one stop for the whole group, entering on the
	 *                          checked radio (or the first when none is)
	 *   Arrow{Right,Down}      focus AND selection to the next, wrapping
	 *   Arrow{Left,Up}         focus AND selection to the previous, wrapping
	 *   Space                  checks the focused radio when it is not already
	 *   Home / End / Enter     NOTHING — plain no-ops
	 *
	 * The first four lines are the WAI-ARIA roving-tabindex behaviour, written
	 * by the browser. They were unreachable only because every radio carried
	 * `tabindex="-1"`; dropping it is the whole navigation fix. So this handler
	 * implements strictly the remainder:
	 *
	 *   - `Home` / `End`, which the pattern asks for and the platform omits;
	 *   - cancelling the native default while `readonly`, so the group stays
	 *     REACHABLE and announced instead of being dropped out of the tab
	 *     order (arrows are cancelable — verified: with `preventDefault()`,
	 *     focus and `:checked` both stayed put).
	 *
	 * `Enter` is left as the no-op it natively is. The radiogroup pattern
	 * assigns it no role, and claiming it here would break form submission for
	 * a consumer who put the field in a `<form>`.
	 *
	 * `focus()` then `click()`, in that order and both needed: a scripted
	 * `.click()` fires `change` but does NOT move focus (measured), and a bare
	 * `focus()` on a radio changes no selection.
	 ********************************************************/
	const handleKeydown = (e: KeyboardEvent) => {
		if (props.disabled || props.readonly) {
			if (RATING_FIELD_MUTATING_KEYS.includes(e.key)) e.preventDefault()

			return
		}

		if (e.key !== KEYBOARD_VALUES.HOME && e.key !== KEYBOARD_VALUES.END) return

		const group = (e.target as Element | null)?.closest(RATING_FIELD_ROOT_SELECTOR)

		if (!group) return

		const radios = Array.from(group.querySelectorAll<HTMLInputElement>(RATING_FIELD_ENABLED_RADIO_SELECTOR))

		if (!radios.length) return

		e.preventDefault()

		const target = e.key === KEYBOARD_VALUES.HOME ? radios[0] : radios[radios.length - 1]

		target.focus()

		if (!target.checked) target.click()
	}

	const itemState = computed(() => {
		return increments.value.map((value) => {
			const isFilled = normalizedValue.value >= value
			const isHovered = hoverIndex.value >= value
			const isHovering = props.hover && hoverIndex.value > -1
			const ratingFieldItemProps = origamRatingFieldItemRef.value?.filterProps(props, ['class', 'style', 'id', 'name'])

			return {isFilled, isHovered, isHovering, name: name.value, ...ratingFieldItemProps}
		})
	})
	const eventState = computed(() => {
		return [0, ...increments.value].map((value) => {
			const onMouseenter = () => {
				hoverIndex.value = value
			}

			const onMouseleave = () => {
				hoverIndex.value = -1
			}

			const onClick = (e?: MouseEvent) => {
				if (!props.disabled && !props.readonly) {
					model.value = normalizedValue.value === value && props.clearable ? 0 : value
				}

				nextTick(() => resyncRadios(e?.target as Element | null))
			}

			/*********************************************************
			 * onChange — the keyboard's ONLY signal
			 *
			 * @description
			 * `onClick` above is wired to the star `<div>`; the browser's radio
			 * navigation never goes through it. Arrows and `Space` fire `click`
			 * + `change` on the `<input>` that just became checked, and nothing
			 * was listening — the DOM moved, the model did not.
			 *
			 * @description
			 * ⛔ No `clearable` toggle here, deliberately: a `change` only fires
			 * when the checked radio ACTUALLY changes, so "re-select the current
			 * value to clear it" has no keyboard equivalent to hook. The clear
			 * affordance stays the `__clear` button.
			 ********************************************************/
			const onChange = (e?: Event) => {
				if (!props.disabled && !props.readonly) {
					model.value = value
				}

				nextTick(() => resyncRadios(e?.target as Element | null))
			}

			return {
				onMouseenter: props.hover ? onMouseenter : undefined,
				onMouseleave: props.hover ? onMouseleave : undefined,
				onClick,
				onChange,
				onKeydown: handleKeydown
			}
		})
	})
	const isChecked = (value: number) => {
		return normalizedValue.value === value
	}

	/*********************************************************
	 * resyncRadios (#827)
	 *
	 * @description
	 * A CONTROLLED input must show only what the model says — nothing else.
	 * Under this radiogroup, the browser is the one that flips `.checked`:
	 * clicking a label, or the native arrow/Home/End navigation, sets the DOM
	 * property directly on the radios it touches, `change` fires, and only
	 * THEN does our handler run `model.value = value`. Two independent DOM
	 * radios move on a single interaction — the one that becomes checked AND,
	 * because they share one `name`, the sibling the browser un-checks at the
	 * same time — while Vue's own patch only re-touches a `checked` binding
	 * whose COMPUTED VALUE differs from the previous render.
	 *
	 * @description
	 * When the parent accepts the new value, that computed value does differ
	 * next render and Vue's normal patch already lines the DOM back up — this
	 * function is then a no-op. When the parent silently refuses it (never
	 * writes `modelValue` back), `isChecked(...)` returns the exact same
	 * booleans as before for every item, Vue sees no prop change and never
	 * revisits `checked` on either radio, and the browser's own mutation is
	 * left standing indefinitely. Measured in Chromium (built Histoire, the
	 * "Default" playground variant, `v-bind="state"` with no
	 * `state.modelValue = $event`): clicking star 1 while the model holds 3
	 * left `{value:"1",checked:true}` AND `{value:"3",checked:false}` in the
	 * DOM — both wrong, only one of them the radio the click landed on.
	 *
	 * @description
	 * `nextTick` is required, not optional: reading `model.value` (hence
	 * `isChecked`) synchronously right after emitting `update:modelValue`
	 * still sees the PRE-update props — a parent that accepts the value only
	 * applies it once Vue flushes its render queue, and `props[prop]` here
	 * only reflects that after the same flush. Deferring to `nextTick` lets
	 * that queue drain (Vue's own patch included) before this reads the
	 * settled state and reasserts it on every radio in the group — the
	 * "accepts" and "refuses" cases end up going through the exact same code
	 * path, which is what keeps this a correction rather than a bespoke
	 * branch per outcome.
	 ********************************************************/
	const resyncRadios = (source: Element | null | undefined) => {
		const group = source?.closest<HTMLElement>(RATING_FIELD_ROOT_SELECTOR)

		if (!group) return

		group.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((radio) => {
			const shouldBeChecked = isChecked(parseFloat(radio.value))

			if (radio.checked !== shouldBeChecked) radio.checked = shouldBeChecked
		})
	}

	/*********************************************************
	 * Label position
	 *
	 * @description
	 * Whether item labels appear above or below the star row.
	 ********************************************************/
	const hasLabels = computed(() => {
		return !!props.itemLabels?.length || slots.itemLabel
	})
	const labelOnTop = computed(() => {
		return props.itemLabelPosition === BLOCK.TOP
	})
	const labelOnBottom = computed(() => {
		return props.itemLabelPosition === BLOCK.BOTTOM
	})

	/*********************************************************
	 * Forwarded props
	 *
	 * @description
	 * Attrs split between root and control; props forwarded to
	 * Input sub-component via filterProps.
	 ********************************************************/
	const [rootAttrs, _controlAttrs] = filterInputAttrs(attrs)

	const inputProps = computed(() => {
		return origamInputRef.value?.filterProps(props, ['class', 'style', 'modelValue', 'id', 'focused'])
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * ratingFieldStyles and ratingFieldClasses compose the BEM block.
	 ********************************************************/
	const ratingFieldStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const ratingFieldClasses = computed(() => {
		return [
			'origam-rating-field',
			{
				'origam-rating-field--hover': props.hover,
				'origam-rating-field--readonly': props.readonly
			},
			props.class
		]
	})
	/*********************************************************
	 * useStyle
	 *
	 * @description
	 * #381 — the `id` returned by useStyle is a GENERATED identifier,
	 * only meant for the scoped stylesheet selector. Without
	 * `() => props.id` here, it shadowed the `id` PROP of the same
	 * name: the template's `:id="id"` on <origam-input> (line 3)
	 * rendered the generated id, never the consumer's.
	 ********************************************************/
	const {id, css, load, isLoaded, unload} = useStyle(ratingFieldStyles, () => props.id)

	/*********************************************************
	 * Group naming (#810)
	 *
	 * @description
	 * This component used to render `<origam-label :for="id">`. That `for`
	 * RESOLVED TO NOTHING — measured in Chromium against the built
	 * Histoire, on the story's own "Default" variant and with no consumer
	 * `id` at all: `for="origam-rating-field-v-2"`,
	 * `document.getElementById(...)` → `null`. The id the Input exposes to
	 * its `#default` slot lands on `…-messages`, never on an element the
	 * `for` could reach.
	 *
	 * ⛔ Making `OrigamInput` honour that id would have been WORSE, not
	 * better: the Input root is a `<div>`, which is not a labelable
	 * element, so the `for` would have started "resolving" while a screen
	 * reader still announced nothing. A detectable orphan would have become
	 * an undetectable dead relation.
	 *
	 * So the label no longer labels a single control — it names the GROUP,
	 * which is what a rating actually is (WAI-ARIA radiogroup pattern). The
	 * `aria-labelledby` target is the WRAPPER `div`, not the `<origam-label>`
	 * inside it, so a consumer overriding the `label` slot still gets a named
	 * group. The `<origam-label>` renders as a `span`: a bare `<label>` with
	 * no associated control would be exactly the dangling relation this
	 * change removes.
	 *
	 * The name is only claimed when there IS one. Pointing `aria-labelledby`
	 * at an empty wrapper would reproduce the defect in a new form, and
	 * fabricating a fallback string is explicitly rejected in this DS
	 * (#622 — a guessed name silences the audit tool and tells the user
	 * nothing).
	 ********************************************************/
	const groupLabelId = computed(() => `${id.value}-label`)
	const groupLabelledBy = computed(() => {
		return (props.label || slots.label) ? groupLabelId.value : undefined
	})

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
	.origam-rating-field {
		max-width: 100%;
		display: inline-flex;
		white-space: nowrap;

		&__wrapper {
			align-items: center;
			display: inline-flex;
			flex-direction: column;
		}

		&__content {
			display: inline-flex;
			position: relative;
		}

		&--readonly {
			pointer-events: none;
		}

	}
</style>
