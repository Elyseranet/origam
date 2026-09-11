<template>
	<origam-sheet
			ref="origamSheetRef"
			:class="pickerClasses"
			:style="pickerStyles"
			v-bind="{ ...sheetProps }"
	>
		<template #default>
			<template v-if="!hideHeader">
				<div
						key="header"
						:class="backgroundColorClasses"
						:style="backgroundColorStyles"
				>
					<template v-if="hasTitle">
						<slot name="title">
							<origam-picker-title
									key="picker-title"
									:title="title"
									class="origam-picker__title"
							/>
						</slot>
					</template>

					<template v-if="slots.header">
						<div class="origam-picker__header">
							<slot name="header"/>
						</div>
					</template>
				</div>
			</template>

			<div class="origam-picker__body">
				<slot name="default"/>
			</div>

			<template v-if="slots.actions">
				<div class="origam-picker__actions">
					<slot name="actions"/>
				</div>
			</template>
		</template>
	</origam-sheet>
</template>

<script
		lang="ts"
		setup
>
	import { computed, ref, StyleValue, toRef, useSlots } from "vue"
	import { OrigamPickerTitle, OrigamSheet } from "../../components"

	import { useBackgroundColor, useProps , useStyle} from "../../composables"

	import type { IPickerProps } from "../../interfaces"

	import type { TOrigamSheet } from "../../types"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, slots and filterProps for the Picker component.
	 ********************************************************/
	const props = withDefaults(defineProps<IPickerProps>(), {})

	const slots = useSlots()
	const {filterProps} = useProps<IPickerProps>(props)

	/*********************************************************
	 * Background color & title guard
	 *
	 * @description
	 * backgroundColorStyles drives the header background from bgColor.
	 * hasTitle guards the title slot / title prop render.
	 ********************************************************/
	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {backgroundColorClasses, backgroundColorStyles} = useBackgroundColor(toRef(props, 'bgColor'))

	const hasTitle = computed(() => {
		return !!(props.title || slots.title)
	})

	/*********************************************************
	 * Sheet ref
	 *
	 * @description
	 * origamSheetRef allows filtering Sheet props from the Picker's
	 * own props before passing them down.
	 ********************************************************/
	const origamSheetRef = ref<TOrigamSheet>()

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const sheetProps = computed(() => {
		return origamSheetRef.value?.filterProps(props, ['class', 'style'])
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * pickerStyles and pickerClasses compose the BEM root.
	 ********************************************************/
	const pickerStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const pickerClasses = computed(() => {
		return [
			'origam-picker',
			{
				'origam-picker--landscape': props.landscape,
				'origam-picker--has-actions': !!slots.actions
			},
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(pickerStyles)


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
	.origam-picker {
		$this: &;

		display: grid;
		grid-auto-rows: min-content;
		grid-template-areas: "title" "header" "body";
		overflow: hidden;
		background-color: var(--origam-picker---background-color);
		color: var(--origam-picker---color);
		box-shadow: var(--origam-picker---box-shadow);
		border-radius: var(--origam-picker---border-radius);

		&--landscape {
			grid-template-areas: "title" "header body" "header body";
		}

		&--has-actions {
			grid-template-areas: "title" "header" "body" "actions";

			&#{$this}--landscape {
				grid-template-areas: "title" "header body" "header actions"
			}
		}

		&__title {
			grid-area: title;
		}

		&__header {
			grid-area: header;
		}

		&__body {
			grid-area: body;
			overflow: hidden;
			position: relative;
		}

		&__actions {
			grid-area: actions;
			padding: var(--origam-picker__actions---padding, 0 12px 12px);
			display: flex;
			align-items: center;
			justify-content: flex-end;

			:deep(.origam-btn) {
				min-width: var(--origam-picker__actions__btn---min-width, 48px);

				&:not(:last-child) {
					margin-inline-end: var(--origam-picker__actions__btn---margin-inline-end, 8px);
				}
			}
		}
	}
</style>
