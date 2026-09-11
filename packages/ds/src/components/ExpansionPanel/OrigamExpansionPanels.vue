<template>
	<component
			:is="tag"
			:class="expansionPanelsClasses"
			:style="expansionPanelsStyles"
	>
		<origam-defaults-provider :defaults="slotDefaults">
			<slot name="default">
				<template
						v-for="(item, index) in items"
						:key="index"
				>
					<slot
							:name="`item.${index}`"
							v-bind="{collapseIcon, expandIcon, hideActions, item, index}"
					>
						<slot
								name="item"
								v-bind="{collapseIcon, expandIcon, hideActions, item, index}"
						>
							<origam-expansion-panel v-bind="{collapseIcon, expandIcon, hideActions, ...item}">
								<template
										v-if="slots[`header.${index}`] || slots.header"
										#header="headerSlotProps"
								>
									<slot
											:name="`header.${index}`"
											v-bind="headerSlotProps"
									>
										<slot
												name="header"
												v-bind="headerSlotProps"
										/>
									</slot>
								</template>

								<template
										v-if="slots[`prepend.${index}`] || slots.prepend"
										#prepend="prependSlotProps"
								>
									<slot
											:name="`prepend.${index}`"
											v-bind="prependSlotProps"
									>
										<slot
												name="prepend"
												v-bind="prependSlotProps"
										/>
									</slot>
								</template>

								<template
										v-if="slots[`title.${index}`] || slots.title"
										#title="titleSlotProps"
								>
									<slot
											:name="`title.${index}`"
											v-bind="titleSlotProps"
									>
										<slot
												name="title"
												v-bind="titleSlotProps"
										/>
									</slot>
								</template>

								<template
										v-if="slots[`append.${index}`] || slots.append"
										#append="appendSlotProps"
								>
									<slot
											:name="`append.${index}`"
											v-bind="appendSlotProps"
									>
										<slot
												name="append"
												v-bind="appendSlotProps"
										/>
									</slot>
								</template>

								<template
										v-if="slots[`wrapper.${index}`] || slots.wrapper"
										#wrapper="wrapperSlotProps"
								>
									<slot
											:name="`wrapper.${index}`"
											v-bind="wrapperSlotProps"
									>
										<slot
												name="wrapper"
												v-bind="wrapperSlotProps"
										/>
									</slot>
								</template>

								<template
										v-if="slots[`content.${index}`] || slots.content"
										#default
								>
									<slot :name="`content.${index}`">
										<slot name="content"/>
									</slot>
								</template>
							</origam-expansion-panel>
						</slot>
					</slot>
				</template>
			</slot>
		</origam-defaults-provider>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue, toRef, useSlots } from 'vue'
	import { OrigamDefaultsProvider, OrigamExpansionPanel } from '../../components'

	import {
		useActive,
		useBothColor,
		useDensity,
		useElevation,
		useGroup,
		useHover,
		useLoader,
		useProps,
		useStateEffect,
		useStyle
} from '../../composables'

	import { ORIGAM_EXPANSION_PANEL_KEY } from '../../consts'

	import type { IExpansionPanelsProps} from '../../interfaces'

	import type { IExpansionPanelsEmits } from '../../interfaces/ExpensionPanel/expansion-panels.interface'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, group registration, and slot defaults that cascade
	 * visual-token props to child expansion panels.
	 ********************************************************/
	const props = withDefaults(defineProps<IExpansionPanelsProps>(), {
		tag: 'div'
	})

	defineEmits<IExpansionPanelsEmits>()

	const {filterProps} = useProps<IExpansionPanelsProps>(props)

	// Push visual-token props down to every descendant `<origam-expansion-panel>`
	// as DEFAULTS — panels that pass their own props still win.
	const slotDefaults = computed(() => ({
		'origam-expansion-panel': {
			density: props.density,
			color: props.color,
			bgColor: props.bgColor,
			rounded: props.rounded,
			border: props.border
		}
	}))

	useGroup(props, ORIGAM_EXPANSION_PANEL_KEY)

	const slots = useSlots()

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composable-driven class and style composition.
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/
	const {densityClasses} = useDensity(props)

	const {isHover, hoverState} = useHover(props)
	const {isActive, activeState} = useActive(props)
	const {
		borderClasses, borderStyles,
		roundedClasses, roundedStyles,
		paddingClasses, paddingStyles,
		marginClasses, marginStyles,
	} = useStateEffect(props, isHover, isActive, hoverState, activeState)
	const {elevationClasses} = useElevation(props, toRef(props, 'flat'))
	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))
	/*********************************************************
	 * Loader
	 ********************************************************/

	const {loaderClasses} = useLoader(props, 'line')

	const expansionPanelsStyles = computed(() => {
		return [
			colorStyles.value,
			roundedStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			props.style
		] as StyleValue
	})
	const expansionPanelsClasses = computed(() => {
		return [
			'origam-expansion-panels',
			{
				'origam-expansion-panels--flat': props.flat,
				'origam-expansion-panels--accordion': props.accordion,
				'origam-expansion-panels--popout': props.popout,
				'origam-expansion-panels--inset': props.inset
			},
			loaderClasses.value,
			colorClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			densityClasses.value,
			roundedClasses.value,
			elevationClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(expansionPanelsStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Forwards filterProps to parent components.
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
	.origam-expansion-panels {
		$this: &;

		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		list-style-type: none;
		padding: 0;
		width: 100%;
		position: relative;
		z-index: 1;

		&:not(.origam-expansion-panels--accordion) {
			> * {
				&:not(:first-child) {
					&:not(:last-child) {
						&:not(.origam-expansion-panel--active) {
							&:not(.origam-expansion-panel--before-active) {
								border-bottom-left-radius: 0;
								border-bottom-right-radius: 0;
							}

							&:not(.origam-expansion-panel--after-active) {
								border-top-left-radius: 0;
								border-top-right-radius: 0;
							}
						}
					}
				}

				&:first-child {
					&:not(:last-child) {
						&:not(.origam-expansion-panel--active) {
							&:not(.origam-expansion-panel--before-active) {
								border-bottom-left-radius: 0;
								border-bottom-right-radius: 0;
							}
						}
					}
				}

				&:last-child {
					&:not(:first-child) {
						&:not(.origam-expansion-panel--active) {
							&:not(.origam-expansion-panel--after-active) {
								border-top-left-radius: 0;
								border-top-right-radius: 0;
							}
						}
					}
				}
			}
		}

		&#{$this}--accordion {
			> * {
				&:first-child {
					&:not(:last-child) {
						border-bottom-left-radius: 0;
						border-bottom-right-radius: 0;
					}
				}

				&:last-child {
					&:not(:first-child) {
						border-top-left-radius: 0;
						border-top-right-radius: 0;

						:deep(.origam-expansion-panel-header--active) {
							border-bottom-left-radius: initial;
							border-bottom-right-radius: initial;
						}
					}
				}

				&:not(:first-child) {
					&:not(:last-child) {
						border-radius: 0;
					}
				}
			}

			:deep(.origam-expansion-panel-header__overlay) {
				transition: var(--origam-expansion-panel__accordion---header-overlay-transition, 0.3s) border-radius var(--origam-expansion-panel---transition-timing-function, cubic-bezier(0.4, 0, 0.2, 1));
			}

			> .origam-expansion-panel {
				margin-top: 0;

				&:after {
					opacity: 1;
				}
			}
		}

		&#{$this}--popout {
			> .origam-expansion-panel {
				max-width: var(--origam-expansion-panel__popout---max-width, calc(100% - 32px));

				&--active {
					max-width: var(--origam-expansion-panel__popout---max-width-active, calc(100% + 16px));
				}
			}
		}

		&#{$this}--inset {
			> .origam-expansion-panel {
				max-width: var(--origam-expansion-panel__inset---max-width, 100%);

				&--active {
					max-width: var(--origam-expansion-panel__inset---max-width-active, calc(100% - 32px));
				}
			}
		}

		&#{$this}--flat {
			> .origam-expansion-panel {
				&:after {
					border-top: none;
				}

				:deep(.origam-expansion-panel__shadow) {
					display: none;
				}
			}
		}

		&--rounded {
			--origam-expansion-panels---border-radius: var(--origam-radius---2xl, 24px);
			border-radius: var(--origam-expansion-panels---border-radius);
		}

		&--rounded-x-small {
			--origam-expansion-panels---border-radius: var(--origam-radius---xs, 2px);
			border-radius: var(--origam-expansion-panels---border-radius);
		}

		&--rounded-small {
			--origam-expansion-panels---border-radius: var(--origam-radius---sm, 4px);
			border-radius: var(--origam-expansion-panels---border-radius);
		}

		&--rounded-default {
			--origam-expansion-panels---border-radius: var(--origam-radius---md, 8px);
			border-radius: var(--origam-expansion-panels---border-radius);
		}

		&--rounded-medium {
			--origam-expansion-panels---border-radius: var(--origam-radius---lg, 12px);
			border-radius: var(--origam-expansion-panels---border-radius);
		}

		&--rounded-large {
			--origam-expansion-panels---border-radius: var(--origam-radius---xl, 16px);
			border-radius: var(--origam-expansion-panels---border-radius);
		}

		&--rounded-x-large {
			--origam-expansion-panels---border-radius: var(--origam-radius---2xl, 24px);
			border-radius: var(--origam-expansion-panels---border-radius);
		}
	}
</style>

