<template>
	<component
			:is="tag"
			:class="ratingFieldItemClasses"
			:style="ratingFieldItemStyles"
	>
		<template v-if="showStar">
			<label
					:for="id"
					class="origam-rating-field-item__label"
			>
				<span class="origam-rating-field-item__hidden">{{ t(itemAriaLabel, value, length) }}</span>
				<slot
						name="item"
						v-bind="{props: ratingBtnProps, value}"
				>
					<origam-btn
							ref="origamBtnRef"
							v-bind="{...ratingBtnProps}"
							@click="handleClick"
							@mouseenter="handleMouseEnter"
							@mouseleave="handleMouseLeave"
					/>
				</slot>
			</label>

			<input
					:id="id"
					:aria-readonly="readonly || undefined"
					:checked="checked"
					:disabled="disabled"
					:name="name"
					:value="value"
					class="origam-rating-field-item__hidden"
					type="radio"
					@change="handleChange"
					@keydown="handleKeydown"
			/>
		</template>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, ref, StyleValue } from 'vue'
	import OrigamBtn from '../Btn/OrigamBtn.vue'

	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { MDI_ICONS } from '../../enums/Commons/mdi.enum'
	import { VARIANT } from '../../enums/Commons/variant.enum'

	import type { IRatingFieldItemProps, IRatingFieldItemSlots } from '../../interfaces/RatingField/rating-field-item.interface'

	import type { IRatingFieldItemEmits } from '../../interfaces/RatingField/rating-field-item.interface'

	import type { TOrigamBtn } from '../../types/Btn/btn.type'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits and filterProps for the RatingFieldItem component.
	 ********************************************************/
	const props = withDefaults(defineProps<IRatingFieldItemProps>(), {
		index: -1,
		showStar: true,
		emptyIcon: MDI_ICONS.STAR_OUTLINE,
		fullIcon: MDI_ICONS.STAR,
		tag: 'div',
		itemAriaLabel: 'origam.rating.aria_label.item'
	})

	const emits = defineEmits<IRatingFieldItemEmits>()

	defineSlots<IRatingFieldItemSlots>()

	const {filterProps} = useProps<IRatingFieldItemProps>(props)

	/*********************************************************
	 * Decorators
	 *
	 * @description
	 * Locale helper and btn ref for forward-prop delegation.
	 ********************************************************/
	const {t} = useLocale()

	const origamBtnRef = ref<TOrigamBtn>()

	/*********************************************************
	 * Rating btn props
	 *
	 * @description
	 * Derives the icon and props forwarded to the inner Btn.
	 * `variant: text` so each star reads as an icon-only
	 * affordance — the rating field should look like a row of
	 * stars, not a row of pill-buttons. The user reported
	 * "il faut que les btn soit en text, on ne doit pas voir
	 * le background". Spread last so a consumer override on
	 * the item itself still wins.
	 ********************************************************/
	/*********************************************************
	 * id
	 *
	 * @description
	 * #372 — a consumer-supplied `id` must win over the per-item generated
	 * one. Without the `props.id ||` fallback here, `props.id` was a
	 * homonym-shadowed dead prop: this local `id` (used below for the
	 * `<label for>` / `<input id>` pairing) never read it, so it was
	 * silently accepted and discarded.
	 ********************************************************/
	const id = computed(() => {
		return props.id || `${props.name}-${String(props.value).replace('.', '-')}`
	})

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const ratingBtnProps = computed(() => {
		const isFullIcon = props.isHovering ? props.isHovered : props.isFilled
		const icon = isFullIcon ? props.fullIcon : props.emptyIcon
		const btnProps = origamBtnRef.value?.filterProps(props, ['class', 'style', 'id', 'bgColor'])

		return {variant: VARIANT.TEXT, ...btnProps, icon}
	})

	/*********************************************************
	 * Event handlers
	 *
	 * @description
	 * Mouse and click events forwarded to the parent RatingField.
	 *
	 * #812 — `change` and `keydown` are the KEYBOARD channels, and they come
	 * from the radio, not from the star. The pointer path goes
	 * star `<div>` -> `@click` -> parent; the browser's own radio-group
	 * navigation never touches that `<div>`, it fires `click` + `change` on
	 * the newly checked `<input>`. With no listener there, every arrow press
	 * changed the DOM's `:checked` and the model stayed behind — which is the
	 * defect #812 reported as "arrows do nothing".
	 ********************************************************/
	const handleMouseEnter = (e: MouseEvent) => {
		emits('mouseenter', e)
	}
	const handleMouseLeave = (e: MouseEvent) => {
		emits('mouseleave', e)
	}
	const handleClick = (e: MouseEvent) => {
		emits('click', e)
	}
	const handleChange = (e: Event) => {
		emits('change', e)
	}
	const handleKeydown = (e: KeyboardEvent) => {
		emits('keydown', e)
	}

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * ratingFieldItemStyles and ratingFieldItemClasses compose
	 * the BEM block.
	 ********************************************************/
	const ratingFieldItemStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const ratingFieldItemClasses = computed(() => {
		return [
			'origam-rating-field-item',
			{
				'origam-rating-field-item--half': props.halfIncrements && props.value % 1 > 0,
				'origam-rating-field-item--full': props.halfIncrements && props.value % 1 === 0
			},
			props.class
		]
	})
	const {id: styleId, css, load, isLoaded, unload} = useStyle(ratingFieldItemStyles)


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
		isLoaded,
		styleId
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-rating-field-item {
		/*
		 * #812 — WCAG 2.4.7 (Focus Visible).
		 *
		 * The control a keyboard user focuses is the native
		 * `<input type="radio">`, and `&__hidden` below makes it
		 * `height:0; width:0; opacity:0`. Putting it back in the tab order
		 * without this rule would have swapped one defect for another: the
		 * group would become operable while the focus indicator landed on a
		 * 0x0 transparent element. That is the trade #810 refused to make and
		 * #812 names explicitly.
		 *
		 * `:has()` is the CSS-first answer — the ring is painted on the STAR,
		 * which is the box the user actually sees, while focus stays on the
		 * input that owns the radio semantics. No JS, no second focusable
		 * element, no `tabindex` bookkeeping.
		 *
		 * `:focus-visible` (not `:focus`) so a mouse click on a star does not
		 * leave a ring behind — the browser's own heuristic, not ours.
		 */
		&:has(:focus-visible) {
			outline: var(--origam-border__width---2, 2px) solid var(--origam-color__border---focus, currentColor);
			outline-offset: var(--origam-space---1, 4px);
		}

		&__label {
			cursor: pointer;

			.origam-btn {
				opacity: 1;
				transition-property: transform;

				:deep(.origam-icon) {
					transition: inherit;
					transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
				}
			}
		}

		&__hidden {
			height: 0;
			opacity: 0;
			position: absolute;
			width: 0;
		}

		&--half {
			overflow: hidden;
			position: absolute;
			clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);
			z-index: 1;

			/*
			 * #812 — a `clip-path` clips the element's OWN outline too, not
			 * just its descendants. Measured: with the shared
			 * `outline-offset: 4px` above, focusing a half-step radio painted
			 * a ring entirely outside the polygon — computed `outline-width`
			 * read `2px` while the screenshot showed nothing at all. That is
			 * the exact shape of a false green: the property is set, the pixel
			 * is not there.
			 *
			 * An INSET offset puts the ring back inside the clipped region, so
			 * it survives and outlines precisely the half the step selects.
			 */
			&:has(:focus-visible) {
				outline-offset: calc(-1 * var(--origam-border__width---2, 2px));
			}

			&,
			&:hover {
				:deep(.origam-btn__overlay) {
					opacity: 0;
				}
			}
		}
	}
</style>

