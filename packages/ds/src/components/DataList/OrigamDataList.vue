<template>
	<dl
			v-contrast
			:class="dataListClasses"
			:style="dataListStyles"
	>
		<template v-if="isKvMode">
			<slot
					name="default"
					v-bind="{items: kvItems}"
			>
				<template
						v-for="(item, index) in kvItems"
						:key="item.id ?? item.key ?? index"
				>
					<div
							:class="['origam-data-list__kv-row']"
							:data-cy="`data-list-kv-row-${toKebabCase(item.key)}`"
					>
						<dt class="origam-data-list__kv-key">
							<slot
									:name="`item-${index}.key`"
									v-bind="{key: item.key, item, index}"
							>
								<slot
										name="key"
										v-bind="{key: item.key, item, index}"
								>
									{{ item.key }}
								</slot>
							</slot>
						</dt>
						<dd class="origam-data-list__kv-value">
							<slot
									:name="`item-${index}.value`"
									v-bind="{key: item.key, value: item.value, item, index}"
							>
								<slot
										name="value"
										v-bind="{key: item.key, value: item.value, item, index}"
								>
									<template v-if="isComponentValue(item.value)">
										<component
												:is="getComponentTag(item.value)"
												v-bind="getComponentProps(item.value)"
										>
											<template v-if="getComponentChildren(item.value) !== undefined">
												{{ getComponentChildren(item.value) }}
											</template>
										</component>
									</template>
									<template v-else-if="isVNodeValue(item.value)">
										<component :is="item.value"/>
									</template>
									<template v-else>
										{{ item.value }}
									</template>
								</slot>
							</slot>
						</dd>
					</div>
				</template>
			</slot>
		</template>

		<template v-else-if="slots.default || hasItems">
			<slot
					name="default"
					v-bind="{items: avatarItems}"
			>
				<template
						v-for="(item, index) in avatarItems"
						:key="index"
				>
					<slot
							:name="`item-${index}`"
							v-bind="{item, index}"
					>
						<slot
								name="item"
								v-bind="{item, index}"
						>
							<template v-if="item.title">
								<origam-data-title
										:append-avatar="appendAvatar"
										:append-icon="appendIcon"
										:density="density"
										:prepend-avatar="prependAvatar"
										:prepend-icon="prependIcon"
										class="origam-data-list__title"
										v-bind="{...item.title}"
								>
									<template
											v-if="slots['item.title.append'] || slots[`item-${index}.title.append`]"
											#append
									>
										<slot :name="`item-${index}.title.append`">
											<slot name="item.title.append"/>
										</slot>
									</template>

									<template
											v-if="slots['item.title'] || slots[`item-${index}.title`]"
											#default="props"
									>
										<slot
												:name="`item-${index}.title`"
												v-bind="props"
										>
											<slot
													name="item.title"
													v-bind="props"
											/>
										</slot>
									</template>

									<template
											v-if="slots['item.title.prepend'] || slots[`item-${index}.title.prepend`]"
											#prepend
									>
										<slot :name="`item-${index}.title.prepend`">
											<slot name="item.title.prepend"/>
										</slot>
									</template>
								</origam-data-title>
							</template>

							<template v-if="item.text">
								<template
										v-for="(data, i) in getTextItems(item)"
										:key="i"
								>
									<origam-data-text
											:id="`${i}-data-text`"
											:density="density"
											class="origam-data-list__text"
											v-bind="{...data}"
									>
										<template
												v-if="slots['item.text.append'] || slots[`item-${index}.text.append`]"
												#append
										>
											<slot :name="`item-${index}.text.append`">
												<slot name="item.text.append"/>
											</slot>
										</template>

										<template #default>
											<slot :name="`item-${index}.text`">
												<slot name="item.text"/>
											</slot>
										</template>

										<template
												v-if="slots['item.text.prepend'] || slots[`item-${index}.text.prepend`]"
												#prepend
										>
											<slot :name="`item-${index}.text.prepend`">
												<slot name="item.text.prepend"/>
											</slot>
										</template>
									</origam-data-text>
								</template>
							</template>
						</slot>
					</slot>
				</template>
			</slot>
		</template>
	</dl>
</template>

<script
		lang="ts"
		setup
>
	import { computed, isVNode, StyleValue, toRef, useSlots, type VNode } from "vue"
	import { OrigamDataText, OrigamDataTitle } from "../../components"

	import {
		useBorder,
		useBothColor,
		useDensity,
		useElevation,
		useLoader,
		useMargin,
		usePadding,
		useProps,
		useRounded,
		useStyle,
		useTypography
	} from "../../composables"
	import type {
		IDataItem,
		IDataListKVItem,
		IDataListKVItemValueComponent,
		IDataListProps,
		IDataTextProps
	} from "../../interfaces"
	// `isDataListKVItemValueComponent` is a type-guard FUNCTION — it
	// belongs in `src/utils/`, not `src/interfaces/`, per the global
	// CLAUDE.md rule that interface directories must contain interface
	// declarations only.
	import { vContrast } from "../../directives"
	import { isDataListKVItemValueComponent } from "../../utils"

	import { isEmpty, toKebabCase } from "../../utils"

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IDataListProps>(), {
		mode: 'avatar'
	})

	const {filterProps} = useProps<IDataListProps>(props)

	const slots = useSlots()

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {densityClasses} = useDensity(props)
	const {elevationClasses} = useElevation(props)

	/*********************************************************
	 * Loader
	 ********************************************************/

	const {loaderClasses} = useLoader(props)
	const {roundedClasses, roundedStyles} = useRounded(props)
	const {borderClasses, borderStyles} = useBorder(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)
	const {typographyStyles: titleTypographyStyles} = useTypography(props, 'data-list__title')
	const {typographyStyles: textTypographyStyles} = useTypography(props, 'data-list__text')

	const isKvMode = computed(() => props.mode === 'kv')

	const hasItems = computed(() => {
		return !isEmpty(props.items)
	})

	// In avatar mode we normalise to an `Array<IDataItem>` so that the
	// v-for in the template always iterates a typed array (not an
	// `Array | object` union that TypeScript widens to `unknown`).
	// Object inputs are flattened to their values; the iteration order
	// follows `Object.values` insertion order, consistent with JSON.
	const avatarItems = computed<Array<IDataItem>>(() => {
		if (isKvMode.value || !props.items) return []
		return Array.isArray(props.items)
			? (props.items as Array<IDataItem>)
			: (Object.values(props.items) as Array<IDataItem>)
	})

	// KV mode normalizes to an array — we need a deterministic order
	// AND a kebab-cased data-cy per row keyed off `item.key`, so an
	// object input is flattened to its values.
	const kvItems = computed<Array<IDataListKVItem>>(() => {
		if (!isKvMode.value || !props.items) return []
		return Array.isArray(props.items)
			? (props.items as Array<IDataListKVItem>)
			: (Object.values(props.items) as Array<IDataListKVItem>)
	})

	function isComponentValue (v: IDataListKVItem["value"]): v is IDataListKVItemValueComponent {
		// VNodes are objects too — disambiguate with the type-guard so
		// `<component :is>` only fires on the structured-descriptor shape.
		if (isVNode(v as VNode)) return false
		return isDataListKVItemValueComponent(v)
	}

	function isVNodeValue (v: IDataListKVItem["value"]): v is VNode {
		return isVNode(v as VNode)
	}

	// Template helpers — kept thin to avoid TS-cast gymnastics inside
	// the `<template>` block (Volar tolerates `as` casts but they
	// muddy the SFC IR; explicit functions read better in the markup).

	// Normalises `IDataItem.text` (which can be an array or a keyed
	// object) to a plain `Array<IDataTextProps>` so the v-for in the
	// template always iterates a typed array and the spread `{...data}`
	// never receives an `unknown` element.
	function getTextItems (item: IDataItem): Array<IDataTextProps> {
		if (!item.text) return []
		return Array.isArray(item.text)
			? (item.text as Array<IDataTextProps>)
			: (Object.values(item.text) as Array<IDataTextProps>)
	}

	function getComponentTag (v: IDataListKVItem["value"]): string | object {
		return (v as IDataListKVItemValueComponent).component
	}
	function getComponentProps (v: IDataListKVItem["value"]): Record<string, unknown> | undefined {
		return (v as IDataListKVItemValueComponent).props
	}
	function getComponentChildren (v: IDataListKVItem["value"]): string | number | undefined {
		return (v as IDataListKVItemValueComponent).children
	}

	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props.bgColor), toRef(props.color))

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const dataListStyles = computed(() => {
		return [
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			colorStyles.value,
			roundedStyles.value,
			titleTypographyStyles.value,
			textTypographyStyles.value,
			props.style
		] as StyleValue
	})
	const dataListClasses = computed(() => {
		return [
			'origam-data-list',
			`origam-data-list--mode-${props.mode}`,
			colorClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			densityClasses.value,
			elevationClasses.value,
			loaderClasses.value,
			roundedClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(dataListStyles)


	/*********************************************************
	 * Expose
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
	.origam-data-list {
		display: var(--origam-data-list---display, block);
		overflow: var(--origam-data-list---overflow, hidden);
		background-color: var(--origam-data-list---background-color, transparent);
		color: var(--origam-data-list---color, inherit);
		border-radius: var(--origam-data-list---border-radius, 0);
		padding: var(--origam-data-list---padding, 0);
		gap: var(--origam-data-list---gap, 0);

		&__title {
			font-size: var(--origam-data-list__title---font-size, 0.75rem);
			font-weight: var(--origam-data-list__title---font-weight, 500);
			color: var(--origam-data-list__title---color, inherit);
			line-height: var(--origam-data-list__title---line-height, 1.5);
			letter-spacing: var(--origam-data-list__title---letter-spacing, 0.009375em);
		}

		&__text {
			font-size: var(--origam-data-list__text---font-size, 0.875rem);
			color: var(--origam-data-list__text---color, inherit);
			line-height: var(--origam-data-list__text---line-height, 1.5);
			letter-spacing: var(--origam-data-list__text---letter-spacing, 0em);
		}

		&--mode-kv {
			display: var(--origam-data-list__kv---display, block);
		}

		&__kv-row {
			display: grid;
			grid-template-columns:
				var(--origam-data-list__kv---key-width, 160px)
				1fr;
			column-gap: var(--origam-data-list__kv---gap-key-value, 1rem);
			align-items: center;
			padding-block: var(--origam-data-list__kv---row-padding-block, 0.75rem);
			border-bottom: 1px solid var(--origam-data-list__kv---row-divider, transparent);

			&:last-child {
				border-bottom: 0;
			}
		}

		&__kv-key {
			color: var(--origam-data-list__kv---key-color, inherit);
			font-size: var(--origam-data-list__kv---key-font-size, 0.875rem);
			font-weight: var(--origam-data-list__kv---key-font-weight, 500);
			line-height: var(--origam-data-list__kv---key-line-height, 1.5);
			margin: 0;
		}

		&__kv-value {
			color: var(--origam-data-list__kv---value-color, inherit);
			font-size: var(--origam-data-list__kv---value-font-size, 0.875rem);
			line-height: var(--origam-data-list__kv---value-line-height, 1.5);
			margin: 0;
			min-width: 0;
			display: flex;
			align-items: center;
			gap: var(--origam-data-list__kv---value-inline-gap, 0.5rem);
			flex-wrap: wrap;
		}
	}
</style>
