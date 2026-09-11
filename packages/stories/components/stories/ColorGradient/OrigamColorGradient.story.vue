<template>
	<Story
			group="components"
			title="ColorGradient/OrigamColorGradient"
	>

		<Variant title="Design - Raw CSS string">
			<div style="display: flex; flex-direction: column; gap: 16px; padding: 24px; align-items: flex-start;">
				<origam-btn
						bg-color="linear-gradient(135deg, #ff0080, #7928ca)"
						text="Pink to violet"
						data-cy="raw-string-btn-1"
				/>
				<origam-btn
						bg-color="linear-gradient(90deg, #00b09b, #96c93d)"
						text="Mint to lime"
						data-cy="raw-string-btn-2"
				/>
				<origam-btn
						bg-color="radial-gradient(circle, #fff, #2193b0)"
						text="Radial sky"
						data-cy="raw-string-btn-3"
				/>
			</div>
		</Variant>

		<Variant title="Design - IGradient object">
			<div style="display: flex; flex-direction: column; gap: 16px; padding: 24px; align-items: flex-start;">
				<origam-btn
						:bg-color="{ from: 'primary', to: 'success', direction: 135 }"
						text="primary → success"
						data-cy="object-btn-1"
				/>
				<origam-btn
						:bg-color="{ from: 'warning', to: 'danger', direction: 90 }"
						text="warning → danger"
						data-cy="object-btn-2"
				/>
				<origam-btn
						:bg-color="{ from: 'primary', via: 'warning', to: 'danger' }"
						text="primary → warning → danger"
						data-cy="object-btn-3"
				/>
				<origam-btn
						:bg-color="{
							stops: [
								{ color: 'primary', position: 0 },
								{ color: '#ffffff', position: 50 },
								{ color: 'success', position: 100 }
							]
						}"
						text="3-stop with positions"
						data-cy="object-btn-4"
				/>
			</div>
		</Variant>

		<Variant title="Design - Preset names">
			<div style="display: flex; flex-direction: column; gap: 16px; padding: 24px; align-items: flex-start;">
				<origam-btn bg-color="gradient-sunset"   text="Sunset"   data-cy="preset-btn-sunset"/>
				<origam-btn bg-color="gradient-ocean"    text="Ocean"    data-cy="preset-btn-ocean"/>
				<origam-btn bg-color="gradient-forest"   text="Forest"   data-cy="preset-btn-forest"/>
				<origam-btn bg-color="gradient-fire"     text="Fire"     data-cy="preset-btn-fire"/>
				<origam-btn bg-color="gradient-midnight" text="Midnight" data-cy="preset-btn-midnight"/>
			</div>
		</Variant>

		<Variant title="Design - Text gradient (background-clip: text)">
			<div style="display: flex; flex-direction: column; gap: 16px; padding: 24px; align-items: flex-start;">
				<origam-title
						:color="{ from: 'primary', to: 'success' }"
						style="font-size: 48px; font-weight: 700;"
						data-cy="text-gradient-title"
				>
					Gradient title
				</origam-title>
				<origam-label
						color="gradient-sunset"
						style="font-size: 24px; font-weight: 600;"
						data-cy="text-gradient-label"
				>
					Sunset label
				</origam-label>
				<origam-title
						color="linear-gradient(90deg, #ff0080, #7928ca, #2193b0)"
						style="font-size: 36px; font-weight: 700;"
						data-cy="text-gradient-raw"
				>
					Raw CSS gradient
				</origam-title>
			</div>
		</Variant>

		<Variant title="Design - Multi-component matrix">
			<div style="display: flex; flex-direction: column; gap: 16px; padding: 24px; align-items: flex-start;">
				<origam-btn   bg-color="gradient-sunset" text="Sunset button" data-cy="matrix-btn"/>
				<origam-card
						bg-color="gradient-ocean"
						style="padding: 24px; min-width: 240px; color: white;"
						data-cy="matrix-card"
				>
					Ocean card surface
				</origam-card>
				<origam-chip  bg-color="gradient-forest" text="Forest chip" data-cy="matrix-chip"/>
				<origam-badge :bg-color="{ from: 'primary', to: 'danger' }" content="3" data-cy="matrix-badge">
					<origam-btn text="Inbox" variant="outlined"/>
				</origam-badge>
			</div>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<IFunctionalState>({
					type: 'linear',
					from: 'primary',
					to: 'success',
					via: undefined,
					direction: 135
				})"
		>
			<template #default="{ state }">
				<div style="display: flex; flex-direction: column; gap: 16px; padding: 24px; align-items: flex-start;">
					<origam-btn
							:bg-color="buildGradient(state)"
							text="Gradient button"
							data-cy="functional-btn"
					/>
					<origam-card
							:bg-color="buildGradient(state)"
							style="padding: 24px; min-width: 240px; color: white;"
							data-cy="functional-card"
					>
						Gradient card surface
					</origam-card>
					<pre style="margin-top: 8px; padding: 12px; background: var(--origam-color__surface---overlay); border-radius: 8px; font-size: 12px; max-width: 100%;">{{ JSON.stringify(buildGradient(state), null, 2) }}</pre>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Gradient Type">
					<HstSelect v-model="state.type" title="Type" :options="GRADIENT_TYPE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color Stops">
					<HstSelect v-model="state.from" title="From" :options="INTENT_OPTIONS"/>
					<HstSelect v-model="state.via"  title="Via"  :options="INTENT_OPTIONS"/>
					<HstSelect v-model="state.to"   title="To"   :options="INTENT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Direction">
					<HstNumber v-model="state.direction" title="Direction (deg)" :min="0" :max="360" :step="15"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IFunctionalState>({
					type: 'linear',
					from: 'primary',
					to: 'success',
					via: undefined,
					direction: 135
				})"
		>
			<template #default="{ state }">
				<div style="display: flex; flex-direction: column; gap: 16px; padding: 24px; align-items: flex-start;">
					<origam-btn
							:bg-color="buildGradient(state)"
							text="Gradient button"
							data-cy="playground-btn"
					/>
					<origam-card
							:bg-color="buildGradient(state)"
							style="padding: 24px; min-width: 240px; color: white;"
							data-cy="playground-card"
					>
						Gradient card surface
					</origam-card>
					<pre style="margin-top: 8px; padding: 12px; background: var(--origam-color__surface---overlay); border-radius: 8px; font-size: 12px; max-width: 100%;">{{ JSON.stringify(buildGradient(state), null, 2) }}</pre>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.type" title="Type" :options="GRADIENT_TYPE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color Stops">
					<HstSelect v-model="state.from" title="From" :options="INTENT_OPTIONS"/>
					<HstSelect v-model="state.via"  title="Via"  :options="INTENT_OPTIONS"/>
					<HstSelect v-model="state.to"   title="To"   :options="INTENT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstNumber v-model="state.direction" title="Direction (deg)" :min="0" :max="360" :step="15"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamBadge, OrigamBtn, OrigamCard, OrigamChip, OrigamLabel, OrigamTitle } from '@origam/components'
	import type { IGradient } from '@origam/interfaces'
	import type { TIntent } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import { INTENT_OPTIONS } from '@stories/const'

	interface IFunctionalState {
		type: 'linear' | 'radial' | 'conic'
		from: TIntent
		to: TIntent
		via?: TIntent
		direction: number
	}

	const GRADIENT_TYPE_OPTIONS = [
		{ label: 'Linear', value: 'linear' },
		{ label: 'Radial', value: 'radial' },
		{ label: 'Conic',  value: 'conic' }
	]

	function buildGradient (state: IFunctionalState): IGradient {
		return {
			type:      state.type,
			from:      state.from,
			to:        state.to,
			via:       state.via,
			direction: state.direction
		}
	}
</script>
