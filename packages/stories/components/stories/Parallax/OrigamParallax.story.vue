<template>
	<Story
			group="components"
			title="Parallax/OrigamParallax"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IParallaxProps>>({ bgColor: 'primary' })"
		>
			<template #default="{ state }">
				<origam-parallax
						:color="state.color"
						:bg-color="state.bgColor"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:width="state.width"
						:height="state.height || '320px'"
						:padding="state.padding"
						:margin="state.margin"
				>
					<origam-parallax-element :strength="30">
						<div :style="layerStyle">Design preview</div>
					</origam-parallax-element>
				</origam-parallax>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IParallaxProps>>({
					tag: 'div',
					event: PARALLAX_EVENT.MOVE,
					active: true,
					duration: 1000,
					easing: PARALLAX_EASING.LINEAR,
					perspective: 1000,
					direction: PARALLAX_DIRECTION.VERTICAL,
					speed: 0.5,
					disabled: false,
					threshold: 0
				})"
		>
			<template #default="{ state }">
				<origam-parallax
						:tag="state.tag"
						:event="state.event"
						:active="state.active"
						:disabled="state.disabled"
						:duration="state.duration"
						:easing="state.easing"
						:perspective="state.perspective"
						:direction="state.direction"
						:speed="state.speed"
						:threshold="state.threshold"
						:style="hostStyle"
				>
					<origam-parallax-element :strength="30">
						<div :style="layerStyle">
							{{ state.disabled ? 'Disabled' : state.active ? 'Active' : 'Frozen' }}
						</div>
					</origam-parallax-element>
				</origam-parallax>
				<div :style="scrollFiller"></div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.active"   title="Active"/>
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
				<StoryGroup title="Event">
					<HstSelect v-model="state.event"     title="Event"     :options="PARALLAX_EVENT_OPTIONS"/>
					<HstSelect v-model="state.direction" title="Direction" :options="PARALLAX_DIRECTION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Animation">
					<HstSelect v-model="state.easing"      title="Easing"           :options="PARALLAX_EASING_OPTIONS"/>
					<HstNumber v-model="state.duration"    title="Duration (ms)"    :min="0" :max="5000" :step="100"/>
					<HstNumber v-model="state.perspective" title="Perspective (px)" :min="100" :max="5000" :step="100"/>
					<HstNumber v-model="state.speed"       title="Speed"            :min="-2" :max="2" :step="0.1"/>
					<HstNumber v-model="state.threshold"   title="Threshold (0–1)"  :min="0" :max="1" :step="0.05"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Emit — scroll">
			<origam-parallax :style="hostStyleTall" :event="PARALLAX_EVENT.SCROLL">
				<origam-parallax-element :strength="40" type="translate">
					<div :style="layerMid">Scroll the page to see movement</div>
				</origam-parallax-element>
			</origam-parallax>
			<div :style="scrollFiller"></div>
		</Variant>

		<Variant title="Emit — orientation">
			<origam-parallax :style="hostStyleTall" :event="PARALLAX_EVENT.ORIENTATION">
				<origam-parallax-element :strength="40" type="translate">
					<div :style="layerMid">Tilt your device to see movement</div>
				</origam-parallax-element>
			</origam-parallax>
		</Variant>

		<Variant title="Mode — multi-layer (scroll-driven)">
			<origam-parallax :style="hostStyleTall" :event="PARALLAX_EVENT.SCROLL" :easing="PARALLAX_EASING.SPRING">
				<origam-parallax-layer :speed="0.2">
					<div :style="{ ...layerMid, backgroundColor: 'rgba(33, 150, 243, 0.5)' }">Layer 1 (slow)</div>
				</origam-parallax-layer>
				<origam-parallax-layer :speed="0.5">
					<div :style="{ ...layerMid, backgroundColor: 'rgba(255, 64, 128, 0.5)' }">Layer 2 (mid)</div>
				</origam-parallax-layer>
				<origam-parallax-layer :speed="0.8">
					<div :style="{ ...layerMid, backgroundColor: 'rgba(76, 175, 80, 0.5)' }">Layer 3 (fast)</div>
				</origam-parallax-layer>
			</origam-parallax>
			<div :style="scrollFiller"></div>
		</Variant>

		<Variant title="Prop — direction (horizontal)">
			<div style="display: flex; flex-direction: column; gap: 16px;">
				<origam-parallax
						:style="hostStyle"
						:event="PARALLAX_EVENT.MOVE"
						:direction="PARALLAX_DIRECTION.HORIZONTAL"
						data-cy="parallax-horizontal"
				>
					<origam-parallax-element :strength="30">
						<div :style="layerStyle">Horizontal direction</div>
					</origam-parallax-element>
				</origam-parallax>
			</div>
		</Variant>

		<Variant title="Emit — @enter / @leave">
			<origam-parallax
					:style="hostStyleTall"
					:event="PARALLAX_EVENT.SCROLL"
					@enter="enterCount++"
					@leave="leaveCount++"
			>
				<origam-parallax-layer :speed="0.4">
					<div :style="layerMid">enter: {{ enterCount }} / leave: {{ leaveCount }}</div>
				</origam-parallax-layer>
			</origam-parallax>
			<div :style="scrollFiller"></div>
		</Variant>

		<Variant title="Events - enter">
			<origam-parallax :style="hostStyleTall" :event="PARALLAX_EVENT.SCROLL" @enter="logEvent('enter', $event)">
				<origam-parallax-layer :speed="0.4">
					<div :style="layerMid">Scroll to trigger enter</div>
				</origam-parallax-layer>
			</origam-parallax>
			<div :style="scrollFiller"></div>
		</Variant>

		<Variant title="Events - leave">
			<origam-parallax :style="hostStyleTall" :event="PARALLAX_EVENT.SCROLL" @leave="logEvent('leave', $event)">
				<origam-parallax-layer :speed="0.4">
					<div :style="layerMid">Scroll past to trigger leave</div>
				</origam-parallax-layer>
			</origam-parallax>
			<div :style="scrollFiller"></div>
		</Variant>

		<Variant title="Events - scroll-progress">
			<origam-parallax
					:style="hostStyleTall"
					:event="PARALLAX_EVENT.SCROLL"
					:easing="PARALLAX_EASING.SPRING"
					@scroll-progress="logEvent('scroll-progress', $event)"
			>
				<origam-parallax-layer :speed="0.5">
					<div :style="layerMid">Scroll to emit progress</div>
				</origam-parallax-layer>
			</origam-parallax>
			<div :style="scrollFiller"></div>
		</Variant>

		<Variant title="Slots - Default">
			<origam-parallax :style="hostStyle">
				<origam-parallax-element :strength="15" type="translate">
					<div :style="{ ...layerStyle, fontSize: '0.875rem', opacity: '0.85' }">Background layer</div>
				</origam-parallax-element>
				<origam-parallax-element :strength="40" type="translate">
					<div :style="layerStyle">Foreground layer</div>
				</origam-parallax-element>
			</origam-parallax>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IParallaxProps>({
					tag: 'div',
					event: PARALLAX_EVENT.MOVE,
					active: true,
					duration: 1000,
					easing: PARALLAX_EASING.LINEAR,
					perspective: 1000,
					direction: PARALLAX_DIRECTION.VERTICAL,
					speed: 0.5,
					disabled: false,
					threshold: 0
				})"
		>
			<template #default="{ state }">
				<origam-parallax v-bind="state" :style="hostStyle" @enter="logEvent('enter', $event)" @leave="logEvent('leave', $event)" @scroll-progress="logEvent('scroll-progress', $event)">
					<origam-parallax-element :strength="30">
						<div :style="layerStyle">Playground</div>
					</origam-parallax-element>
				</origam-parallax>
				<div :style="scrollFiller"></div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.border"    title="Border"    :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.event"       title="Event"            :options="PARALLAX_EVENT_OPTIONS"/>
					<HstSelect   v-model="state.direction"   title="Direction"        :options="PARALLAX_DIRECTION_OPTIONS"/>
					<HstSelect   v-model="state.easing"      title="Easing"           :options="PARALLAX_EASING_OPTIONS"/>
					<HstCheckbox v-model="state.active"      title="Active"/>
					<HstCheckbox v-model="state.disabled"    title="Disabled"/>
					<HstNumber   v-model="state.duration"    title="Duration (ms)"    :min="0" :max="5000" :step="100"/>
					<HstNumber   v-model="state.perspective" title="Perspective (px)" :min="100" :max="5000" :step="100"/>
					<HstNumber   v-model="state.speed"       title="Speed"            :min="-2" :max="2" :step="0.1"/>
					<HstNumber   v-model="state.threshold"   title="Threshold (0–1)"  :min="0" :max="1" :step="0.05"/>
					<HstSelect   v-model="state.tag"         title="Tag"              :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { logEvent } from 'histoire/client'

	import { OrigamParallax, OrigamParallaxElement, OrigamParallaxLayer } from '@origam/components'
	import { PARALLAX_DIRECTION, PARALLAX_EASING, PARALLAX_EVENT } from '@origam/enums'
	import type { IOptions, IParallaxProps } from '@origam/interfaces'
	import type { TParallaxDirection, TParallaxEasing, TParallaxEvent } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	import { ref, type CSSProperties } from 'vue'

	const PARALLAX_EVENT_OPTIONS: Array<IOptions<TParallaxEvent | undefined>> = [
		{ label: '(default — move)', value: undefined },
		{ label: 'Move (mouse / device-orientation on touch)', value: PARALLAX_EVENT.MOVE },
		{ label: 'Scroll (window scroll)', value: PARALLAX_EVENT.SCROLL },
		{ label: 'Orientation (device-orientation only)', value: PARALLAX_EVENT.ORIENTATION }
	]

	const PARALLAX_DIRECTION_OPTIONS: Array<IOptions<TParallaxDirection>> = [
		{ label: 'Vertical', value: PARALLAX_DIRECTION.VERTICAL },
		{ label: 'Horizontal', value: PARALLAX_DIRECTION.HORIZONTAL },
		{ label: 'Both (2D mouse-driven)', value: PARALLAX_DIRECTION.BOTH }
	]

	const PARALLAX_EASING_OPTIONS: Array<IOptions<TParallaxEasing | string>> = [
		{ label: 'Linear', value: PARALLAX_EASING.LINEAR },
		{ label: 'Ease-out', value: PARALLAX_EASING.EASE_OUT },
		{ label: 'Spring (lerp-based)', value: PARALLAX_EASING.SPRING }
	]

	const enterCount = ref(0)
	const leaveCount = ref(0)

	const hostStyle: CSSProperties = {
		width: '100%',
		height: '320px',
		backgroundImage: "url('https://picsum.photos/seed/origam-parallax/1600/900')",
		backgroundSize: 'cover',
		backgroundPosition: 'center'
	}

	const hostStyleTall: CSSProperties = {
		...hostStyle,
		height: '420px',
		backgroundColor: '#222'
	}

	const layerStyle: CSSProperties = {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
		height: '100%',
		fontWeight: '600',
		fontSize: '1.25rem',
		color: '#fff',
		textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)'
	}

	const layerMid: CSSProperties = {
		...layerStyle,
		backgroundColor: 'rgba(255, 64, 128, 0.5)',
		fontSize: '1.4rem'
	}

	const scrollFiller: CSSProperties = {
		height: '80vh'
	}
</script>

<docs lang="md" src="@docs/components/Parallax/OrigamParallax.md"/>
