<template>
	<div
			:class="datePickerHeaderClasses"
			:style="datePickerHeaderStyles"
			@click="handleClick"
	>
		<template v-if="hasPrepend">
			<div
					key="prepend"
					class="origam-date-picker-header__prepend"
					@click="handleClickPrepend"
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
					@click="handleClickAppend"
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
	import { OrigamAvatar, OrigamIcon, OrigamTransition } from "../../components"

	import { useAdjacent, useDensity, useProps , useStyle} from "../../composables"

	import type { IDatePickerHeaderProps} from "../../interfaces"

	import type { IDatePickerHeaderEmits } from '../../interfaces/DatePicker/date-picker-header.interface'

	import { computed, StyleValue, toRef, useSlots } from "vue"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits and composables.
	 ********************************************************/

	const props = withDefaults(defineProps<IDatePickerHeaderProps>(), {})

	const emits = defineEmits<IDatePickerHeaderEmits>()

	const {filterProps} = useProps<IDatePickerHeaderProps>(props)

	const slots = useSlots()

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
	 ********************************************************/

	const handleClick = () => {
		emits('click')
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
	const {id, css, load, isLoaded, unload} = useStyle(datePickerHeaderStyles)


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
		height: 70px;
		display: grid;
		grid-template-areas: "prepend content append";
		grid-template-columns: min-content minmax(0, 1fr) min-content;
		overflow: hidden;
		padding-inline: 24px 12px;
		padding-bottom: 12px;

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
			font-size: 32px;
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
