<template>
	<origam-input
			:id="id"
			ref="origamInputRef"
			v-model="model"
			:class="ratingFieldClasses"
			:style="ratingFieldStyles"
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
				<div class="origam-rating-field__label">
					<slot name="label">
						<origam-label
								:for="id"
								:required="required"
								:text="label"
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
						<template v-if="hasLabels && labelOnTop && slots[`itemLabel.${index}`]">
							<slot :name="`itemLabel.${index}`">
								<slot name="itemLabel">
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
						<template v-if="hasLabels && labelOnBottom && slots[`itemLabel.${index}`]">
							<slot :name="`itemLabel.${index}`">
								<slot name="itemLabel">
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
	import { computed, ref, shallowRef, StyleValue, useAttrs, useSlots } from 'vue'
	import OrigamBtn from '../Btn/OrigamBtn.vue'
	import OrigamInput from '../Input/OrigamInput.vue'
	import OrigamLabel from '../Label/OrigamLabel.vue'
	import OrigamRatingFieldItem from './OrigamRatingFieldItem.vue'

	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useVModel } from '../../composables/Commons/vModel.composable'

	import { BLOCK } from '../../enums/Commons/anchor.enum'
	import { DENSITY } from '../../enums/Commons/density.enum'
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

			const onClick = () => {
				if (props.disabled || props.readonly) return
				model.value = normalizedValue.value === value && props.clearable ? 0 : value
			}

			return {
				onMouseenter: props.hover ? onMouseenter : undefined,
				onMouseleave: props.hover ? onMouseleave : undefined,
				onClick
			}
		})
	})
	const isChecked = (value: number) => {
		return normalizedValue.value === value
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
