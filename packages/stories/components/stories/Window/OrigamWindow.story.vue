<template>
	<Story
			group="components"
			title="Window/OrigamWindow"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IWindowProps>>({
					direction: DIRECTION.HORIZONTAL,
					showArrows: true,
					nextIcon: MDI_ICONS.CHEVRON_RIGHT,
					prevIcon: MDI_ICONS.CHEVRON_LEFT,
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-window
							v-model="designStep"
							:direction="state.direction"
							:show-arrows="state.showArrows"
							:next-icon="state.nextIcon || undefined"
							:prev-icon="state.prevIcon || undefined"
							:border="state.border"
							:border-color="state.borderColor"
							:border-style="state.borderStyle"
							:rounded="state.rounded"
							:elevation="state.elevation"
							:padding="state.padding"
							:margin="state.margin"
							:style="hostStyle"
					>
						<origam-window-item v-for="n in 3" :key="n" :value="n">
							<div :style="slideStyle(n)">Slide {{ n }}</div>
						</origam-window-item>
					</origam-window>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Direction">
					<HstSelect v-model="state.direction" title="Direction" :options="DIRECTION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Arrows">
					<HstSelect v-model="state.showArrows" title="Show Arrows" :options="SHOW_ARROWS_OPTIONS"/>
					<HstSelect v-model="state.nextIcon"   title="Next Icon"   :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.prevIcon"   title="Prev Icon"   :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IWindowProps> & { step: number }>({
					step: 1,
					continuous: false,
					reverse: false,
					touch: true,
					disabled: false,
					mandatory: true,
					tag: 'div',
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-window
							v-model="state.step"
							:continuous="state.continuous"
							:reverse="state.reverse"
							:touch="state.touch"
							:disabled="state.disabled"
							:mandatory="state.mandatory"
							:tag="state.tag"
							show-arrows
							:style="hostStyle"
					>
						<origam-window-item v-for="n in 3" :key="n" :value="n">
							<div :style="slideStyle(n)">Slide {{ n }}</div>
						</origam-window-item>
					</origam-window>
					<div class="story-status">Active: <strong>{{ state.step }}</strong></div>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Navigation">
					<HstCheckbox v-model="state.continuous" title="Continuous"/>
					<HstCheckbox v-model="state.reverse"    title="Reverse"/>
					<HstCheckbox v-model="state.touch"      title="Touch / Swipe"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled"  title="Disabled"/>
					<HstCheckbox v-model="state.mandatory" title="Mandatory"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<div class="story-shell">
				<origam-window
						v-model="emitStep"
						show-arrows
						:style="hostStyle"
						@update:model-value="logEvent('update:modelValue', $event)"
				>
					<origam-window-item v-for="n in 3" :key="n" :value="n">
						<div :style="slideStyle(n)">Slide {{ n }}</div>
					</origam-window-item>
				</origam-window>
				<div class="story-status">Active: <strong>{{ emitStep }}</strong></div>
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<div class="story-shell">
				<origam-window v-model="slotStep" :style="hostStyle">
					<template #default>
						<origam-window-item :value="1">
							<div :style="slideStyle(1)">Slide 1 (default slot)</div>
						</origam-window-item>
						<origam-window-item :value="2">
							<div :style="slideStyle(2)">Slide 2 (default slot)</div>
						</origam-window-item>
					</template>
				</origam-window>
			</div>
		</Variant>

		<Variant title="Slots - Additional">
			<div class="story-shell">
				<origam-window v-model="slotStep" show-arrows :style="hostStyle">
					<origam-window-item v-for="n in 3" :key="n" :value="n">
						<div :style="slideStyle(n)">Slide {{ n }}</div>
					</origam-window-item>
					<template #additional>
						<div class="story-slot-additional">Additional slot — slide {{ slotStep }} of 3</div>
					</template>
				</origam-window>
			</div>
		</Variant>

		<Variant title="Slots - Arrows">
			<div class="story-shell">
				<origam-window v-model="slotStep" show-arrows :style="hostStyle">
					<origam-window-item v-for="n in 3" :key="n" :value="n">
						<div :style="slideStyle(n)">Slide {{ n }}</div>
					</origam-window-item>
					<template #arrows="{ prevProps, nextProps, canMoveBack, canMoveForward }">
						<button v-if="canMoveBack"    v-bind="prevProps" class="story-arrow story-arrow--prev">Prev</button>
						<button v-if="canMoveForward" v-bind="nextProps" class="story-arrow story-arrow--next">Next</button>
					</template>
				</origam-window>
			</div>
		</Variant>

		<Variant title="Slots - Prev">
			<div class="story-shell">
				<origam-window v-model="slotStep" show-arrows :style="hostStyle">
					<origam-window-item v-for="n in 3" :key="n" :value="n">
						<div :style="slideStyle(n)">Slide {{ n }}</div>
					</origam-window-item>
					<template #prev="{ props: btnProps, canMove }">
						<button v-if="canMove" v-bind="btnProps" class="story-arrow story-arrow--prev">Prev</button>
					</template>
				</origam-window>
			</div>
		</Variant>

		<Variant title="Slots - Next">
			<div class="story-shell">
				<origam-window v-model="slotStep" show-arrows :style="hostStyle">
					<origam-window-item v-for="n in 3" :key="n" :value="n">
						<div :style="slideStyle(n)">Slide {{ n }}</div>
					</origam-window-item>
					<template #next="{ props: btnProps, canMove }">
						<button v-if="canMove" v-bind="btnProps" class="story-arrow story-arrow--next">Next</button>
					</template>
				</origam-window>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IWindowProps>({
					direction: DIRECTION.HORIZONTAL,
					continuous: false,
					reverse: false,
					showArrows: true,
					touch: true,
					mandatory: true,
					tag: 'div',
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-window
							v-model="playgroundStep"
							v-bind="state"
							:style="hostStyle"
					>
						<origam-window-item v-for="n in 4" :key="n" :value="n">
							<div :style="slideStyle(n)">Slide {{ n }}</div>
						</origam-window-item>
					</origam-window>
					<div class="story-status">Active: <strong>{{ playgroundStep }}</strong></div>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect   v-model="state.direction"  title="Direction"   :options="DIRECTION_OPTIONS"/>
					<HstSelect   v-model="state.showArrows" title="Show Arrows" :options="SHOW_ARROWS_OPTIONS"/>
					<HstSelect   v-model="state.rounded"    title="Rounded"     :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation"  title="Elevation"   :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.continuous" title="Continuous"/>
					<HstCheckbox v-model="state.reverse"    title="Reverse"/>
					<HstCheckbox v-model="state.touch"      title="Touch / Swipe"/>
					<HstCheckbox v-model="state.disabled"   title="Disabled"/>
					<HstCheckbox v-model="state.mandatory"  title="Mandatory"/>
					<HstSelect   v-model="state.tag"        title="Tag"         :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import type { CSSProperties } from 'vue'
	import { ref } from 'vue'

	import { logEvent } from 'histoire/client'

	import { OrigamWindow, OrigamWindowItem } from '@origam/components'
	import { DIRECTION, MDI_ICONS } from '@origam/enums'
	import type { IWindowProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		ELEVATION_OPTIONS,
		ICON_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const designStep    = ref(1)
	const slotStep      = ref(1)
	const emitStep      = ref(1)
	const playgroundStep = ref(1)

	const DIRECTION_OPTIONS = [
		{ label: 'horizontal', value: DIRECTION.HORIZONTAL },
		{ label: 'vertical',   value: DIRECTION.VERTICAL },
	]

	const SHOW_ARROWS_OPTIONS = [
		{ label: 'true (always visible)', value: true },
		{ label: 'false (hidden)',         value: false },
		{ label: 'hover (on hover only)',  value: 'hover' },
	]

	const hostStyle: CSSProperties = {
		width: '100%',
		height: '180px',
		border: '1px solid var(--origam-color__border---subtle, rgba(0, 0, 0, 0.12))',
		borderRadius: '6px',
		backgroundColor: 'var(--origam-color__surface---default, rgba(0, 0, 0, 0.03))',
	}

	const palette = ['#5B8DEF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6']

	function slideStyle(n: number): CSSProperties {
		return {
			width: '100%',
			height: '100%',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			fontWeight: '600',
			fontSize: '1.25rem',
			color: '#fff',
			background: palette[(n - 1) % palette.length],
		}
	}
</script>

<style scoped>
	.story-shell { display: flex; flex-direction: column; gap: 12px; }
	.story-status { font: 0.875rem/1.4 system-ui, sans-serif; color: var(--origam-color__text---secondary, rgba(0, 0, 0, 0.66)); }
	.story-slot-additional { text-align: center; padding: 4px; font-size: 0.75rem; opacity: 0.7; }
	.story-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: white; border: 1px solid #ccc; border-radius: 4px; padding: 4px 8px; cursor: pointer; }
	.story-arrow--prev { left: 8px; }
	.story-arrow--next { right: 8px; }
</style>

<docs lang="md" src="@docs/components/Window/OrigamWindow.md"/>
