<template>
	<component
			:is="tag"
			:id="id"
			:class="rowClasses"
			:style="rowStyles"
	>
		<slot name="default"/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, type Ref, StyleValue, toRef } from 'vue'
	import { useBorder } from '../../composables/Commons/border.composable'
	import { useBothColor } from '../../composables/Commons/bothColor.composable'
	import { useDensity } from '../../composables/Commons/density.composable'
	import { useMargin } from '../../composables/Commons/margin.composable'
	import { usePadding } from '../../composables/Commons/padding.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { DENSITY } from '../../enums/Commons/density.enum'
	import { ROW_GUTTER_RUNGS } from '../../consts/Grids/row.const'

	import type {
		IRowEmits,
		IRowProps,
		IRowSlots
	} from '../../interfaces/Grids/row.interface'
	import type { TColor } from '../../types/Commons/color.type'
	import type { TRowGutterRung } from '../../types/Grids/row.type'

	import {
		convertToUnit,
		toKebabCase
	} from '../../utils/Commons/commons.util'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and composable setup.
	 ********************************************************/
	const props = withDefaults(defineProps<IRowProps>(), {tag: 'div', density: DENSITY.DEFAULT})

	const {filterProps} = useProps<IRowProps>(props)

	defineEmits<IRowEmits>()

	defineSlots<IRowSlots>()

	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(
		toRef(props, 'bgColor') as Ref<TColor | undefined>,
		toRef(props, 'color') as Ref<TColor | undefined>
	)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {densityClasses} = useDensity(props)

	/*********************************************************
	 * Gouttiere (#417)
	 *
	 * @description
	 * `gutters` etait declaree, exposee par deux controles de la story, et
	 * ne faisait rien — seulement un avertissement de prop non supportee.
	 * Elle pilote desormais reellement la grille, par UNE variable :
	 * `--origam-row---gutter`, la gouttiere TOTALE entre deux colonnes
	 * voisines.
	 *
	 * @description
	 * ⛔ C'est une variable HERITEE, et c'est tout le mecanisme : le row la
	 * pose sur lui-meme, chaque `<origam-col>` descendant la lit sans que
	 * le row ait rien a lui transmettre. Pas de `provide`/`inject`, pas de
	 * prop a faire descendre — le CSS fait deja circuler la valeur
	 * (principe « CSS-first » du depot). Un col hors d'un row retombe sur
	 * la valeur declaree au `:root`.
	 *
	 * @description
	 * Le partage echelon / valeur libre est celui du reste du DS : un
	 * echelon nomme sort en CLASSE (`origam-row--gutter-dense`), qui
	 * repointe la variable vers le token de l'echelon ; une longueur libre
	 * sort en DECLARATION EN LIGNE via `convertToUnit` (nombre -> px,
	 * longueur CSS preservee telle quelle).
	 *
	 * @description
	 * `computed` et non lecture eager : ADR-005, le resolveur de props de
	 * theme ecrit dans `beforeCreate`, donc APRES `setup()`.
	 ********************************************************/
	const gutterRung = computed(() => {
		const value = props.gutters

		return typeof value === 'string' && (ROW_GUTTER_RUNGS as ReadonlyArray<string>).includes(value)
			? value as TRowGutterRung
			: undefined
	})

	const gutterStyles = computed(() => {
		if (props.gutters === undefined || gutterRung.value) return undefined

		return {'--origam-row---gutter': convertToUnit(props.gutters)}
	})
	const {borderClasses, borderStyles} = useBorder(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composable-driven class and style composition.
	 ********************************************************/
	const rowStyles = computed(() => {
		return [
			gutterStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			colorStyles.value,
			props.style
		] as StyleValue
	})
	const rowClasses = computed(() => {
		const classes = [
			'origam-row',
			gutterRung.value ? `origam-row--gutter-${gutterRung.value}` : undefined,
			colorClasses.value,
			densityClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]

		const propFamilies = {
			align:     ['align',   'alignSm',   'alignMd',   'alignLg',   'alignXl',   'alignXxl'],
			justify:   ['justify', 'justifySm', 'justifyMd', 'justifyLg', 'justifyXl', 'justifyXxl'],
			direction: ['direction']
		}

		for (const family in propFamilies) {
			propFamilies[family as keyof typeof propFamilies].forEach((prop) => {
				const value = props[prop as keyof typeof props]
				if (value) classes.push(`origam-row--${toKebabCase(prop)}-${value}`)
			})
		}

		return classes
	})
	const {id, css, load, isLoaded, unload} = useStyle(rowStyles, () => props.id)


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
	$breakpoints: ('sm': 600px, 'md': 960px, 'lg': 1280px, 'xl': 1920px, 'xxl': 2560px);
	$justifies: ('start': flex-start, 'end': flex-end, 'center': center, 'space-between': space-between, 'space-around': space-around, 'space-evenly': space-evenly);
	$aligns: ('start': flex-start, 'end': flex-end, 'center': center, 'baseline': baseline, 'stretch': stretch);

	.origam-row {
		display: var(--origam-row---display);
		flex-direction: var(--origam-row---flex-direction);
		flex-wrap: var(--origam-row---flex-wrap);
		flex: var(--origam-row---flex);
		align-items: var(--origam-row---align-items);
		justify-content: var(--origam-row---justify-content);
		box-sizing: var(--origam-row---box-sizing);

		padding-block-start: var(--origam-row---padding-block-start);
		padding-block-end: var(--origam-row---padding-block-end);
		padding-inline-start: var(--origam-row---padding-inline-start);
		padding-inline-end: var(--origam-row---padding-inline-end);

		--origam-col---padding-block-start: calc(var(--origam-row---gutter) / 2);
		--origam-col---padding-block-end: calc(var(--origam-row---gutter) / 2);
		--origam-col---padding-inline-start: calc(var(--origam-row---gutter) / 2);
		--origam-col---padding-inline-end: calc(var(--origam-row---gutter) / 2);

		--origam-row---margin-block-start: calc(var(--origam-row---gutter) / -2);
		--origam-row---margin-block-end: calc(var(--origam-row---gutter) / -2);
		--origam-row---margin-inline-start: calc(var(--origam-row---gutter) / -2);
		--origam-row---margin-inline-end: calc(var(--origam-row---gutter) / -2);

		margin-block-start: calc(var(--origam-row---margin-block-start) + var(--origam-row---density));
		margin-block-end: calc(var(--origam-row---margin-block-end) + var(--origam-row---density));
		margin-inline-start: calc(var(--origam-row---margin-inline-start) + var(--origam-row---density));
		margin-inline-end: calc(var(--origam-row---margin-inline-end) + var(--origam-row---density));

		+ .origam-row {
			margin-block-start: calc((var(--origam-row---margin-block-start) + var(--origam-row---density)) * -1);
		}

		@each $rung in (none, dense, default, comfortable) {
			&--gutter-#{$rung} {
				--origam-row---gutter: var(--origam-row--gutter-#{$rung}---gap);
			}
		}

		&--density-default {
			--origam-row---density: 0px;
		}

		&--density-compact {
			--origam-row---density: -8px;
		}

		&--density-comfortable {
			--origam-row---density: 8px;
		}

		&--border {
			border-width: var(--origam-row--border---border-width);
			box-shadow: var(--origam-row--border---box-shadow);
		}

		@each $align, $alignAttr in $aligns {
			&--align-#{$align} {
				--origam-row---align-items: #{$alignAttr};
			}
		}

		@each $justify, $justifyAttr in $justifies {
			&--justify-#{$justify} {
				--origam-row---justify-content: #{$justifyAttr};
			}
		}

		@each $direction in (row, row-reverse, column, column-reverse) {
			&--direction-#{$direction} {
				--origam-row---flex-direction: #{$direction};
			}
		}

		@each $breakpoint, $breakpointSize in $breakpoints {
			@each $align, $alignAttr in $aligns {
				&--align-#{$breakpoint}-#{$align} {
					@media (min-width: $breakpointSize) {
						--origam-row---align-items: #{$alignAttr};
					}
				}
			}

			@each $justify, $justifyAttr in $justifies {
				&--justify-#{$breakpoint}-#{$justify} {
					@media (min-width: $breakpointSize) {
						--origam-row---justify-content: #{$justifyAttr};
					}
				}
			}
		}
	}
</style>

<style>
	:root {
		--origam-row---display: flex;
		--origam-row---flex-direction: row;
		--origam-row---flex-wrap: wrap;
		--origam-row---flex: 1 1 auto;

		--origam-row---box-sizing: border-box;

		--origam-row---padding-block-start: 0;
		--origam-row---padding-block-end: 0;
		--origam-row---padding-inline-start: 0;
		--origam-row---padding-inline-end: 0;

		--origam-row---density: 0px;

		--origam-row---align-items: stretch;
		--origam-row---justify-content: flex-start
	}
</style>
