<template>
	<Story
			group="components"
			title="Audio/OrigamAudioWaveform"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IAudioWaveformProps>>({
					peaks: DEMO_PEAKS,
					progress: 40
				})"
		>
			<template #default="{ state }">
				<div class="waveform-shell">
					<origam-audio-waveform
							:peaks="state.peaks"
							:progress="state.progress"
					/>
				</div>
			</template>

			<template #controls="{ state }">
				<StoryGroup title="Data">
					<HstNumber
							v-model="state.progress"
							title="Progress (%)"
							:min="0"
							:max="100"
							:step="1"
					/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional - empty peaks"
				:init-state="() => useStoryInitState<Partial<IAudioWaveformProps>>({
					peaks: [],
					progress: 0
				})"
		>
			<template #default="{ state }">
				<div class="waveform-shell waveform-shell--outlined">
					<origam-audio-waveform
							:peaks="state.peaks"
							:progress="state.progress"
					/>
				</div>
			</template>
		</Variant>

		<Variant
				title="Functional - malformed peaks"
				:init-state="() => useStoryInitState<Partial<IAudioWaveformProps>>({
					peaks: MALFORMED_PEAKS,
					progress: 50
				})"
		>
			<template #default="{ state }">
				<div class="waveform-shell">
					<origam-audio-waveform
							:peaks="state.peaks"
							:progress="state.progress"
					/>
				</div>
			</template>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IAudioWaveformProps>({
					peaks: DEMO_PEAKS,
					progress: 40
				})"
		>
			<template #default="{ state }">
				<div class="waveform-shell">
					<origam-audio-waveform v-bind="state"/>
				</div>
			</template>

			<template #controls="{ state }">
				<StoryGroup title="Data">
					<HstNumber
							v-model="state.progress"
							title="Progress (%)"
							:min="0"
							:max="100"
							:step="1"
					/>
				</StoryGroup>
			</template>
		</Variant>

	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamAudioWaveform } from '@origam/components'
	import type { IAudioWaveformProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'

	const DEMO_PEAKS = [0.2, 0.55, 0.8, 0.35, 1, 0.6, 0.25, 0.9, 0.45, 0.7, 0.3, 0.85, 0.5, 0.15, 0.65]

	/*
	 * Valeurs volontairement hors contrat : negatives, > 1, NaN, Infinity.
	 * Le composant borne a [0..1] et remplace le non-fini par 0 — une forme
	 * d'onde est decorative, elle ne doit jamais lever ni deformer le rendu
	 * sur une entree malformee. Cette Variant est la pour le PROUVER a l'oeil.
	 */
	const MALFORMED_PEAKS = [-0.5, 1.8, Number.NaN, 0.4, Number.POSITIVE_INFINITY, 0.9]
</script>

<style scoped lang="scss">
	.waveform-shell {
		position: relative;
		width: 320px;
		height: 64px;
		color: var(--origam-color__action--primary---bg);
	}

	.waveform-shell--outlined {
		border: 1px dashed var(--origam-color__border---default);
	}
</style>

<docs
		lang="md"
		src="@docs/components/Audio/OrigamAudioWaveform.md"
/>
