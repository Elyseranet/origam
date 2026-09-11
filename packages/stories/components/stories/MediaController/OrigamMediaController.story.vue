<template>
	<Story
			group="components"
			title="MediaController/OrigamMediaController"
	>
		<Variant title="Default">
			<div
					class="story-shell"
					data-cy="media-controller-playground-host"
			>
				<audio
						ref="audioEl"
						src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
						preload="metadata"
						style="display:none"
				/>
				<origam-media-controller
						:state="state"
						:methods="methods"
						:playback-rates="[0.5, 0.75, 1, 1.25, 1.5, 2]"
						data-cy="media-controller-default-controller"
				/>
			</div>
		</Variant>

		<Variant title="Variant — inset (overlay over the media surface)">
			<div
					class="story-shell"
					data-cy="media-controller-inset-variant-shell"
			>
				<audio
						ref="audioElInset"
						src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
						preload="metadata"
						style="display:none"
				/>

				<div
						class="story-media-surface"
						data-cy="media-controller-inset-surface"
				>
					<origam-media-controller
							:state="stateInset"
							:methods="methodsInset"
							:inset="true"
							:visible="true"
							data-cy="media-controller-inset-on-host"
					/>
				</div>

				<div
						class="story-media-surface story-media-surface--offscreen"
						data-cy="media-controller-inset-off-surface"
				>
					<origam-media-controller
							:state="stateInset"
							:methods="methodsInset"
							data-cy="media-controller-inset-off-host"
					/>
				</div>
			</div>
		</Variant>

		<Variant title="Variant — #extraControlsRight slot">
			<div
					class="story-shell"
					data-cy="media-controller-extras-shell"
			>
				<audio
						ref="audioElExtras"
						src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
						preload="metadata"
						style="display:none"
				/>
				<origam-media-controller
						:state="stateExtras"
						:methods="methodsExtras"
						data-cy="media-controller-extras-controller"
				>
					<template #extraControlsRight>
						<origam-btn
								variant="text"
								density="compact"
								:icon="MDI_ICONS.SHARE"
								aria-label="Share"
								data-cy="media-controller-extras-share"
						/>
						<origam-btn
								variant="text"
								density="compact"
								:icon="MDI_ICONS.PIN"
								aria-label="Pin"
								data-cy="media-controller-extras-pin"
						/>
						<origam-btn
								variant="text"
								density="compact"
								:icon="MDI_ICONS.BOOKMARK"
								aria-label="Mark"
								data-cy="media-controller-extras-mark"
						/>
					</template>
				</origam-media-controller>
			</div>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { ref } from 'vue'

	import { OrigamBtn, OrigamMediaController } from '@origam/components'
	import { useMediaPlayer } from '@origam/composables'
	import { MDI_ICONS } from '@origam/enums'

	const audioEl = ref<HTMLAudioElement | null>(null)
	const { state, methods } = useMediaPlayer({ mediaRef: audioEl as any })

	const audioElInset = ref<HTMLAudioElement | null>(null)
	const { state: stateInset, methods: methodsInset } = useMediaPlayer({ mediaRef: audioElInset as any })

	const audioElExtras = ref<HTMLAudioElement | null>(null)
	const { state: stateExtras, methods: methodsExtras } = useMediaPlayer({ mediaRef: audioElExtras as any })
</script>

<style scoped>
	.story-shell {
		display: flex;
		flex-direction: column;
		gap: 24px;
		padding: 16px;
		max-width: 720px;
	}

	.story-media-surface {
		position: relative;
		width: 100%;
		min-height: 80px;
		background: var(--origam-color__surface---default, #1a1a2e);
		border-radius: 8px;
		overflow: hidden;
	}

	.story-media-surface--offscreen {
		background: var(--origam-color__surface---raised, #f5f5f5);
	}
</style>
