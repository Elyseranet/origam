<template>
	<div
			:id="id"
			:class="datePickerHeaderClasses"
			:style="datePickerHeaderStyles"
			:role="isClickable ? 'button' : undefined"
			:tabindex="isClickable ? 0 : undefined"
			@click="handleClick"
			@keydown="handleKeydown"
	>
		<template v-if="hasPrepend">
			<div
					key="prepend"
					class="origam-date-picker-header__prepend"
					:role="isPrependClickable ? 'button' : undefined"
					:tabindex="isPrependClickable ? 0 : undefined"
					@click="handleClickPrepend"
					@keydown="handleKeydownPrepend"
			>
				<slot name="prepend">
					<origam-avatar
							v-if="prependAvatar"
							key="prepend-avatar"
							:density="density"
							:image="prependAvatar"
					/>
					<origam-icon
							v-if="prependIcon"
							key="prepend-icon"
							:density="density"
							:icon="prependIcon"
					/>
				</slot>
			</div>
		</template>

		<template v-if="hasContent">
			<origam-transition
					key="content"
					:transition="transition"
			>
				<div
						:key="header"
						class="origam-date-picker-header__content"
				>
					<slot name="default">
						{{ header }}
					</slot>
				</div>
			</origam-transition>
		</template>

		<template v-if="hasAppend">
			<div
					key="append"
					class="origam-date-picker-header__append"
					:role="isAppendClickable ? 'button' : undefined"
					:tabindex="isAppendClickable ? 0 : undefined"
					@click="handleClickAppend"
					@keydown="handleKeydownAppend"
			>
				<slot name="append">
					<origam-avatar
							v-if="appendAvatar"
							key="append-avatar"
							:density="density"
							:image="appendAvatar"
					/>
					<origam-icon
							v-if="appendIcon"
							key="append-icon"
							:density="density"
							:icon="appendIcon"
					/>
				</slot>
			</div>
		</template>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import OrigamAvatar from '../Avatar/OrigamAvatar.vue'
	import OrigamIcon from '../Icon/OrigamIcon.vue'
	import OrigamTransition from '../Transition/OrigamTransition.vue'

	import { useAdjacent } from '../../composables/Commons/adjacent.composable'
	import { useDensity } from '../../composables/Commons/density.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { KEYBOARD_VALUES } from '../../enums/Commons/hotkey.enum'

	import type { IDatePickerHeaderProps } from '../../interfaces/DatePicker/date-picker-header.interface'

	import type { IDatePickerHeaderEmits, IDatePickerHeaderSlots } from '../../interfaces/DatePicker/date-picker-header.interface'

	import { hasEvent } from '../../utils/Commons/commons.util'
	import { getCurrentInstance } from '../../utils/Commons/getCurrentInstance.util'

	import { computed, StyleValue, toRef, useAttrs, useSlots } from "vue"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits and composables.
	 ********************************************************/

	const props = withDefaults(defineProps<IDatePickerHeaderProps>(), {})

	const emits = defineEmits<IDatePickerHeaderEmits>()

	defineSlots<IDatePickerHeaderSlots>()

	const {filterProps} = useProps<IDatePickerHeaderProps>(props)

	const slots = useSlots()

	const vm = getCurrentInstance('OrigamDatePickerHeader')
	const attrs = useAttrs()

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {densityClasses} = useDensity(props)

	/*********************************************************
	 * Icon
	 ********************************************************/

	const {
		onClickPrepend: handleClickPrepend,
		onClickAppend: handleClickAppend,
		onKeydownPrepend: handleKeydownPrepend,
		onKeydownAppend: handleKeydownAppend,
		isPrependClickable,
		isAppendClickable,
		hasAppend,
		hasPrepend
	} = useAdjacent(props, toRef(props, 'prependIcon'), toRef(props, 'appendIcon'))

	/*********************************************************
	 * Content
	 *
	 * @description
	 * Derived content visibility and click forwarding.
	 ********************************************************/

	const hasContent = computed(() => {
		return !!(slots.default || props.header)
	})

	/*********************************************************
	 * Event handlers
	 *
	 * @description
	 * ⛔ issue #443 — the root `@click` is a REAL action: `OrigamDatePicker`
	 * wires it to `handleHeaderClick`, which switches back to month view
	 * whenever the header is showing months/years. `click` is a declared
	 * emit (`IDatePickerHeaderEmits`), so — same #397-shaped gap as
	 * `useLink.isClickable` / `useAdjacent.isPrependClickable` — `$attrs`
	 * alone would miss the listener; `vm.vnode.props` (raw, pre-split)
	 * doesn't.
	 ********************************************************/

	const isClickable = computed(() => {
		return hasEvent(attrs, 'click') || hasEvent(vm.vnode.props ?? {}, 'click')
	})

	const handleClick = () => {
		emits('click')
	}

	const handleKeydown = (e: KeyboardEvent) => {
		if (!isClickable.value) return
		if (e.key !== KEYBOARD_VALUES.ENTER && e.key !== KEYBOARD_VALUES.EMPTY) return

		e.preventDefault()
		handleClick()
	}

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes and inline styles.
	 ********************************************************/

	const datePickerHeaderStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const datePickerHeaderClasses = computed(() => {
		return [
			'origam-date-picker-header',
			densityClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(datePickerHeaderStyles, () => props.id)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface exposed to parent components.
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
	.origam-date-picker-header {
		$this: &;

		align-items: flex-end;
		height: var(--origam-date-picker__header---min-height, 70px);
		display: grid;
		grid-template-areas: "prepend content append";
		grid-template-columns: min-content minmax(0, 1fr) min-content;
		overflow: hidden;
		padding-inline: var(--origam-date-picker__header---padding-inline, 24px 12px);
		padding-block: var(--origam-date-picker__header---padding-block, 0 12px);

		&__append {
			grid-area: append;
		}

		&__prepend {
			grid-area: prepend;
			padding-inline-start: 8px;
		}

		&__content {
			align-items: center;
			display: inline-flex;
			font-size: var(--origam-date-picker__header---font-size, 32px);
			line-height: 40px;
			grid-area: content;
			justify-content: space-between;
		}

		&--clickable {
			#{$this}__content {
				cursor: pointer;

				&:not(:hover) {
					opacity: .7
				}
			}
		}
	}
</style>
