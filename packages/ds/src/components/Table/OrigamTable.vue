<template>
	<component
			:is="props.tag"
			:class="tableClasses"
			:style="tableStyles"
			@mouseenter="onMouseenter"
			@mouseleave="onMouseleave"
	>
		<slot name="top"/>

		<div
				:class="tableWrapperClasses"
				:style="tableWrapperStyles"
		>
			<slot name="wrapper">
				<table :aria-rowcount="ariaRowcount || undefined">
					<caption
							v-if="caption"
							:class="['origam-table__caption', {'origam-table__caption--visible': captionVisible}]"
							:style="captionTypographyStyles"
					>{{ caption }}</caption>
					<slot name="default"/>
				</table>
			</slot>
		</div>

		<slot name="bottom"/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue, useSlots } from 'vue'
	import {
		useDefaults,
		useDensity,
		useDimension,
		useHover,
		useProps,
		useStateEffect,
		useStyle,
		useTypography
} from '../../composables'

	import { DENSITY } from '../../enums'

	import type { ITableProps } from '../../interfaces'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props with defaults, filterProps utility, and slot ref.
	 ********************************************************/

	const _props = withDefaults(defineProps<ITableProps>(), {
		tag: 'div',
		density: DENSITY.DEFAULT
	})

	// `useDefaults` resolves each prop against theme.components['origam-table']
	// (OrigamBtn pattern) — without this, theme.components['origam-table']
	// (tag, border, rounded, …) was a silent no-op.
	//
	// IMPORTANT: `<script setup>` auto-exposes every `defineProps()` key to
	// the template as a BARE binding pointing at the component's raw
	// `$props` — that binding is generated at compile time from the
	// `defineProps` macro call itself, NOT from whichever local variable
	// captures the return value. A bare `:is="tag"` in the template
	// therefore reads the UNRESOLVED prop, silently bypassing this Proxy,
	// even though every composable that receives the `props` variable
	// explicitly (useBorder(props), useRounded(props), …) resolves
	// correctly. Discovered here because `tag` is the only prop this
	// component reads directly in the template rather than through a
	// composable/computed — fixed by writing `props.tag` explicitly.
	// Audit any OTHER useDefaults-wired component for the same bare
	// binding before assuming "useDefaults(_props) is enough".
	const props = useDefaults(_props)

	const {filterProps} = useProps<ITableProps>(props)

	const slots = useSlots()

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element and wrapper classes / styles.
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {densityClasses} = useDensity(props)
	const {dimensionStyles} = useDimension(props)
	const {isHover, hoverState, hoverClasses, onMouseenter, onMouseleave} = useHover(props)
	const {
		borderClasses, borderStyles,
		roundedClasses, roundedStyles,
		elevationClasses,
		paddingClasses, paddingStyles,
		marginClasses, marginStyles,
	} = useStateEffect(props, isHover, undefined, hoverState)

	// Typography — 3 surfaces:
	//   'table'             → --origam-table---font-size         (root body)
	//   'table__caption'    → --origam-table__caption---font-size (caption element)
	//   'table__header-cell'→ --origam-table__header-cell---font-weight (cascades to :deep(th))
	const { typographyStyles: tableTypographyStyles } = useTypography(props, 'table')
	const { typographyStyles: captionTypographyStyles } = useTypography(props, 'table__caption')
	const { typographyStyles: headerCellTypographyStyles } = useTypography(props, 'table__header-cell')

	const tableStyles = computed(() => {
		return [
			borderStyles.value,
			roundedStyles.value,
			paddingStyles.value,
			marginStyles.value,
			tableTypographyStyles.value,
			headerCellTypographyStyles.value,
			props.style
		] as StyleValue
	})
	const tableClasses = computed(() => {
		return [
			'origam-table',
			{
				'origam-table--fixed-header': props.fixedHeader,
				'origam-table--fixed-footer': props.fixedFooter,
				'origam-table--has-top': slots.top,
				'origam-table--has-bottom': slots.bottom
			},
			densityClasses.value,
			hoverClasses.value,
			borderClasses.value,
			roundedClasses.value,
			elevationClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})
	const tableWrapperStyles = computed(() => {
		return [
			dimensionStyles.value,
			props.style
		] as StyleValue
	})
	const tableWrapperClasses = computed(() => {
		return [
			'origam-table__wrapper',
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(tableStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface exposed to parent refs.
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
	.origam-table {
		background-color: var(--origam-table---background-color, var(--origam-color__surface---default));
		color: var(--origam-table---color, var(--origam-color__text---primary));
		font-size: var(--origam-table---font-size, 0.875rem);
		border-radius: var(--origam-table---border-radius, 0);
		overflow: hidden;

		&__caption {
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap;
			border: 0;

			&--visible {
				position: static;
				width: auto;
				height: auto;
				padding: var(--origam-table__caption---padding, 8px 16px);
				margin: 0;
				overflow: visible;
				clip: auto;
				white-space: normal;
				font-size: var(--origam-table__caption---font-size, 0.875rem);
				color: var(--origam-table__caption---color, var(--origam-color__text---secondary));
				text-align: var(--origam-table__caption---text-align, start);
			}
		}

		&__wrapper {
			overflow-x: auto;

			table {
				border-collapse: var(--origam-table---border-collapse, collapse);
				width: 100%;
			}

			:deep(th) {
				background-color: var(--origam-table__header-cell---background-color, var(--origam-color__surface---overlay));
				color: var(--origam-table__header-cell---color, var(--origam-color__text---primary));
				font-weight: var(--origam-table__header-cell---font-weight, 600);
				padding-block: var(--origam-table__header-cell---padding-block, 12px);
				padding-inline: var(--origam-table__header-cell---padding-inline, 16px);
				border-bottom: var(--origam-table__header-cell---border-bottom-width, 2px) solid var(--origam-table__header-cell---border-bottom-color, var(--origam-color__border---default));
				text-align: start;
			}

			:deep(td) {
				padding-block: var(--origam-table__cell---padding-block, 12px);
				padding-inline: var(--origam-table__cell---padding-inline, 16px);
				border-bottom: var(--origam-table__cell---border-width, 1px) solid var(--origam-table__cell---border-color, var(--origam-color__border---subtle));
			}

			:deep(tr:hover td) {
				background-color: var(--origam-table__row---hover-background-color, var(--origam-color__surface---sunken));
			}
		}

		&--density-compact {
			--origam-table__header-cell---padding-block: 6px;
			--origam-table__header-cell---padding-inline: 8px;
			--origam-table__cell---padding-block: 6px;
			--origam-table__cell---padding-inline: 8px;
		}

		&--density-default {
			--origam-table__header-cell---padding-block: 12px;
			--origam-table__header-cell---padding-inline: 16px;
			--origam-table__cell---padding-block: 12px;
			--origam-table__cell---padding-inline: 16px;
		}

		&--density-comfortable {
			--origam-table__header-cell---padding-block: 18px;
			--origam-table__header-cell---padding-inline: 24px;
			--origam-table__cell---padding-block: 18px;
			--origam-table__cell---padding-inline: 24px;
		}

		&--rounded {
			--origam-table---border-radius: var(--origam-table--rounded---border-radius, 4px);
		}

		&--rounded-x-small {
			--origam-table---border-radius: var(--origam-radius---xs, 2px);
		}

		&--rounded-small {
			--origam-table---border-radius: var(--origam-radius---sm, 4px);
		}

		&--rounded-default {
			--origam-table---border-radius: var(--origam-radius---md, 8px);
		}

		&--rounded-medium {
			--origam-table---border-radius: var(--origam-radius---lg, 12px);
		}

		&--rounded-large {
			--origam-table---border-radius: var(--origam-radius---xl, 16px);
		}

		&--rounded-x-large {
			--origam-table---border-radius: var(--origam-radius---2xl, 24px);
		}

		&--fixed-header {
			.origam-table__wrapper {
				overflow-y: auto;
			}

			:deep(thead th) {
				position: sticky;
				top: 0;
				z-index: 1;
				background-color: var(--origam-table__header-cell---background-color, var(--origam-color__surface---overlay));
			}
		}

		&--fixed-footer {
			.origam-table__wrapper {
				overflow-y: auto;
			}

			:deep(tfoot td),
			:deep(tfoot th) {
				position: sticky;
				bottom: 0;
				z-index: 1;
				background-color: var(--origam-table__header-cell---background-color, var(--origam-color__surface---overlay));
			}
		}
	}
</style>
