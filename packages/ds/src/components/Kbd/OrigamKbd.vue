<template>
	<kbd
			:id="id"
			v-contrast
			:class="kbdClasses"
			:style="kbdStyles"
	>
		<template v-if="$slots.default">
			<slot/>
		</template>

		<template v-else-if="hasCombination">
			<template
					v-for="(key, index) in combination"
					:key="index"
			>
				<kbd
						class="origam-kbd__key"
						:style="surfaceStyles"
				>{{ key }}</kbd>
				<span
						v-if="index < lastKeyIndex"
						class="origam-kbd__separator"
						aria-hidden="true"
				>{{ separator }}</span>
			</template>
		</template>

		<template v-else>{{ text }}</template>
	</kbd>
</template><script
		lang="ts"
		setup
>
	import vContrast from '../../directives/Contrast/contrast.directive'

	import { useBorder } from '../../composables/Commons/border.composable'
	import { useBothColor } from '../../composables/Commons/bothColor.composable'
	import { useElevation } from '../../composables/Commons/elevation.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useRounded } from '../../composables/Commons/rounded.composable'
	import { useSize } from '../../composables/Commons/size.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useTypography } from '../../composables/Commons/typography.composable'

	import type { IKbdEmits, IKbdProps, IKbdSlots } from '../../interfaces/Kbd/kbd.interface'

	import { computed, StyleValue, toRef } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and composable setup.
	 ********************************************************/
	const props = withDefaults(defineProps<IKbdProps>(), {
		separator: '+',
		variant: 'outlined',
	})

	const { filterProps } = useProps<IKbdProps>(props)

	defineEmits<IKbdEmits>()

	defineSlots<IKbdSlots>()

	/*********************************************************
	 * Composables
	 ********************************************************/

	const { sizeClasses, sizeStyles } = useSize(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { borderClasses, borderStyles } = useBorder(props)
	const { elevationClasses, elevationStyles } = useElevation(props)
	// Phase 3 (Vague D) — class-first companion alongside inline styles.
	const { typographyStyles } = useTypography(props, 'kbd')

	/*********************************************************
	 * Color
	 ********************************************************/

	const { colorClasses, colorStyles } = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))

	/*********************************************************
	 * Combination
	 *
	 * @description
	 * `hasCombination` decide AUSSI quel element est la surface peinte —
	 * voir la section Surface. `lastKeyIndex` sort du template le calcul
	 * qui place les separateurs.
	 ********************************************************/
	const hasCombination = computed(() => !!props.combination && props.combination.length > 0)

	const lastKeyIndex = computed(() => (props.combination?.length ?? 0) - 1)

	/*********************************************************
	 * Surface
	 *
	 * @description
	 * ADR-005 lot 2 — par ou `key-surface` recoit desormais sa couleur.
	 *
	 * @description
	 * Le variant n'est plus un bloc SCSS mais un preset de props
	 * (`KBD_VARIANT_PRESETS`), resolu au rang le plus faible par le
	 * resolveur. Les composables en tirent des declarations INLINE, et une
	 * declaration inline se pose sur UN element : il faut donc dire lequel.
	 *
	 * @description
	 * ⛔ LES DEUX SURFACES NE COEXISTENT JAMAIS, et c'est ce qui rend la
	 * regle simple. Sans combinaison, la touche EST la racine et aucun
	 * `__key` n'est rendu. Avec combinaison, la racine n'est qu'une
	 * enveloppe — `&--combination` la rend transparente, sans bordure ni
	 * ombre — et les touches sont les `__key`. La surface va donc a la
	 * racine dans le premier cas, a chaque `__key` dans le second.
	 *
	 * @description
	 * ⛔ POURQUOI LA RACINE DOIT ETRE PRIVEE DE CES STYLES EN COMBINAISON.
	 * `&--combination` neutralise l'enveloppe depuis une regle scopee ;
	 * une declaration inline la battrait. Laisser la surface sur la racine
	 * ferait donc peindre l'enveloppe DERRIERE des touches deja peintes —
	 * un cadre colore qui n'existe pas aujourd'hui.
	 *
	 * @description
	 * ⚠️ Consequence ASSUMEE sur le canal du consommateur. Avant, un
	 * `bg-color` pose sur une combinaison peignait l'ENVELOPPE (l'inline
	 * battait le `transparent` de la regle) et laissait les touches au
	 * variant ; il peint desormais LES TOUCHES. C'est le comportement que
	 * la regle `&--combination` visait depuis le debut, et le cas est
	 * mesure sous `override-combo-tonal` dans `audit:kbd-preset`.
	 *
	 * @description
	 * ⛔ ET POURQUOI `&--combination` NEUTRALISE DESORMAIS AVEC
	 * `border-width: 0` AU LIEU DE `--origam-kbd---border-width: 0`. C'est
	 * la cause racine de toute l'affaire. Une propriete custom HERITE :
	 * posee sur l'enveloppe pour la desepaissir, elle descendait dans
	 * chaque `__key`, dont `key-surface` lit precisement
	 * `var(--origam-kbd---border-width, …)` — les touches perdaient donc
	 * leur bordure. C'est pour la RATTRAPER que chaque regle de variant
	 * devait se redeclarer une seconde fois en `&--variant-x &__key`, et
	 * c'est ce doublon qui rendait le variant inconvertible. La propriete
	 * physique, elle, n'herite pas : elle neutralise l'enveloppe et laisse
	 * les descendants sur le defaut du composant.
	 *
	 * @description
	 * `rounded`, `size` et la typographie restent sur la racine, inchanges :
	 * ils atteignent les `__key` par la propriete custom que leurs classes
	 * posent, qui elle herite — le meme heritage, utilise a bon escient.
	 ********************************************************/
	const surfaceStyles = computed(() => {
		return [
			borderStyles.value,
			colorStyles.value,
			elevationStyles.value,
		] as StyleValue
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composable-driven class and style composition.
	 ********************************************************/
	const kbdClasses = computed(() => {
		return [
			'origam-kbd',
			{
				[`origam-kbd--variant-${props.variant}`]: props.variant,
				'origam-kbd--combination': hasCombination.value,
			},
			colorClasses.value,
			sizeClasses.value,
			roundedClasses.value,
			borderClasses.value,
			elevationClasses.value,
			props.class,
		]
	})

	const kbdStyles = computed(() => {
		return [
			sizeStyles.value,
			roundedStyles.value,
			hasCombination.value ? [] : surfaceStyles.value,
			typographyStyles.value,
			props.style,
		] as StyleValue
	})
	const {id, css, load, isLoaded, unload} = useStyle(kbdStyles, () => props.id)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Forwards filterProps to parent components.
	 ********************************************************/
	defineExpose({ filterProps,
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
	@mixin key-surface {
		display: inline-flex;
		align-items: center;
		justify-content: center;

		font-family: var(--origam-kbd---font-family, JetBrains Mono, Fira Code, monospace);
		font-size: inherit;
		font-weight: var(--origam-kbd---font-weight, 500);
		line-height: 1;
		white-space: nowrap;
		vertical-align: baseline;

		min-width: 1.6em;
		padding-block: var(--origam-kbd---padding-block, 0.2em);
		padding-inline: var(--origam-kbd---padding-inline, 0.5em);

		border-radius: var(--origam-kbd---border-radius, 4px);
		border-width: var(--origam-kbd---border-width, 1px);
		border-style: solid;
		border-color: var(--origam-kbd---border-color, var(--origam-color__border---subtle, #d4d4d4));

		background-color: var(--origam-kbd---background-color, var(--origam-color__surface---raised, #fff));
		color: var(--origam-kbd---color, var(--origam-color__text---primary, #171717));

		box-shadow: var(
			--origam-kbd---box-shadow,
			0 1px 0 0 color-mix(in srgb, currentColor 12%, transparent),
			inset 0 1px 0 0 color-mix(in srgb, white 50%, transparent)
		);
	}

	.origam-kbd {
		@include key-surface;

		font-size: var(--origam-kbd---font-size, 0.875em);

		gap: var(--origam-kbd---gap, 4px);

		&--combination {
			display: inline-flex;
			align-items: center;
			gap: var(--origam-kbd---gap, 4px);

			padding-block: 0;
			padding-inline: 0;
			border-width: 0;
			background-color: transparent;
			border-color: transparent;
			box-shadow: none;
			min-width: 0;
		}

		&__key {
			@include key-surface;
		}

		&--size-x-small { font-size: var(--origam-kbd---font-size, var(--origam-kbd---font-size-xs, 0.625rem)); }
		&--size-small   { font-size: var(--origam-kbd---font-size, var(--origam-kbd---font-size-sm, 0.75rem)); }
		&--size-default { font-size: var(--origam-kbd---font-size, var(--origam-kbd---font-size-md, 0.875rem)); }
		&--size-large   { font-size: var(--origam-kbd---font-size, var(--origam-kbd---font-size-lg, 1rem)); }
		&--size-x-large { font-size: var(--origam-kbd---font-size, var(--origam-kbd---font-size-xl, 1.125rem)); }

		&--rounded         { --origam-kbd---border-radius: var(--origam-radius---sm, 4px); }
		&--rounded-x-small { --origam-kbd---border-radius: var(--origam-radius---xs, 2px); }
		&--rounded-small   { --origam-kbd---border-radius: var(--origam-radius---sm, 4px); }
		&--rounded-default { --origam-kbd---border-radius: var(--origam-radius---md, 8px); }
		&--rounded-medium  { --origam-kbd---border-radius: var(--origam-radius---lg, 12px); }
		&--rounded-large   { --origam-kbd---border-radius: var(--origam-radius---xl, 16px); }
		&--rounded-x-large { --origam-kbd---border-radius: var(--origam-radius---2xl, 24px); }

		&__separator {
			color: var(--origam-kbd__separator---color, var(--origam-color__text---secondary, rgba(0, 0, 0, 0.55)));
			font-family: inherit;
			font-size: inherit;
			user-select: none;
		}
	}
</style>
