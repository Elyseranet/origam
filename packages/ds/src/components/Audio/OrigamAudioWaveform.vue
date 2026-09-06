<template>
	<svg
			v-if="hasPeaks"
			:id="id"
			:class="rootClasses"
			:style="rootStyles"
			:viewBox="WAVEFORM_VIEW_BOX"
			preserveAspectRatio="none"
			aria-hidden="true"
			data-cy="origam-audio-waveform"
	>
		<rect
				v-for="(peak, index) in normalizedPeaks"
				:key="index"
				:x="(index / normalizedPeaks.length) * 100"
				:y="50 - (peak * 50)"
				:width="100 / normalizedPeaks.length"
				:height="peak * 100"
				:class="barClass(index)"
		/>
	</svg>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue } from 'vue'

	import { clamp } from '../../utils/Commons/commons.util'

	import { WAVEFORM_VIEW_BOX } from '../../consts/Audio/audio-waveform.const'

	import type { IAudioWaveformProps } from '../../interfaces/Audio/audio-waveform.interface'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Peak bars painted behind an audio scrubber. Extracted from
	 * `OrigamSliderField` (remarque utilisateur, ligne L169 du classeur) :
	 * ce SVG etait le SEUL markup que la seconde branche HTML du
	 * SliderField possedait en propre, et il est audio par nature — un
	 * slider de formulaire n'a pas de forme d'onde. C'est lui qui obligeait
	 * ce composant a porter deux branches de template entieres.
	 *
	 * @description
	 * Deliberement bete : aucun etat audio, aucune lecture d'un element
	 * media, aucune notion de « temps courant ». Il dessine des barres et
	 * les colore par rapport a un pourcentage que son parent calcule.
	 ********************************************************/
	const props = withDefaults(defineProps<IAudioWaveformProps>(), {
		peaks: () => [],
		progress: 0
	})

	/*********************************************************
	 * `class` et `style` ne sont PAS lies dans le template : Vue les
	 * fusionne automatiquement sur une racine unique, et `class` est un
	 * mot reserve JS que le parseur de template refuse en expression
	 * (vue/no-parsing-error). Les declarer dans ICommonsComponentProps
	 * suffit — le consommateur les passe, Vue les pose.
	 ********************************************************/
	const rootClasses = computed(() => [ 'origam-audio-waveform', props.class ])
	const rootStyles = computed<StyleValue>(() => props.style as StyleValue)

	const hasPeaks = computed(() => Array.isArray(props.peaks) && props.peaks.length > 0)

	/*********************************************************
	 * normalizedPeaks — une forme d'onde est decorative, elle ne doit
	 * JAMAIS lever sur une entree malformee. Les valeurs non finies
	 * deviennent 0, le reste est borne a [0..1].
	 ********************************************************/
	const normalizedPeaks = computed(() => (props.peaks ?? [])
		.map((peak) => clamp(Number.isFinite(peak) ? peak : 0, 0, 1)))

	function barClass (index: number): string {
		const barPct = (index / Math.max(1, normalizedPeaks.value.length)) * 100

		return barPct <= props.progress
			? 'origam-audio-waveform__bar origam-audio-waveform__bar--active'
			: 'origam-audio-waveform__bar origam-audio-waveform__bar--inactive'
	}
</script>

<style
		lang="scss"
		scoped
>
	.origam-audio-waveform {
		position: absolute;
		pointer-events: none;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.origam-audio-waveform__bar {
		&--active {
			fill: currentColor;
		}

		&--inactive {
			fill: color-mix(in srgb, currentColor 35%, transparent);
		}
	}
</style>
