<template>
	<Story
			group="components"
			title="Parallax/OrigamParallaxElement"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IParallaxElementProps>>({ rounded: undefined })"
		>
			<template #default="{ state }">
				<origam-parallax :style="hostStyle">
					<origam-parallax-element
							:border="state.border"
							:border-color="state.borderColor"
							:border-style="state.borderStyle"
							:rounded="state.rounded"
							:elevation="state.elevation"
							:padding="state.padding"
							:padding-top="state.paddingTop"
							:padding-bottom="state.paddingBottom"
							:padding-left="state.paddingLeft"
							:padding-right="state.paddingRight"
							:margin="state.margin"
							:margin-top="state.marginTop"
							:margin-bottom="state.marginBottom"
							:margin-left="state.marginLeft"
							:margin-right="state.marginRight"
							:strength="30"
					>
						<div :style="layerStyle">Design</div>
					</origam-parallax-element>
				</origam-parallax>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Spacing — Padding">
					<HstText v-model="state.padding"       title="Padding"/>
					<HstText v-model="state.paddingTop"    title="Padding Top"/>
					<HstText v-model="state.paddingBottom" title="Padding Bottom"/>
					<HstText v-model="state.paddingLeft"   title="Padding Left"/>
					<HstText v-model="state.paddingRight"  title="Padding Right"/>
				</StoryGroup>
				<StoryGroup title="Spacing — Margin">
					<HstText v-model="state.margin"       title="Margin"/>
					<HstText v-model="state.marginTop"    title="Margin Top"/>
					<HstText v-model="state.marginBottom" title="Margin Bottom"/>
					<HstText v-model="state.marginLeft"   title="Margin Left"/>
					<HstText v-model="state.marginRight"  title="Margin Right"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IParallaxElementProps>>({
					type: PARALLAX_ELEMENT_TYPE.TRANSLATE,
					strength: 30,
					axis: undefined,
					transformOrigin: 'center',
					originX: 50,
					originY: 50,
					minX: undefined,
					maxX: undefined,
					minY: undefined,
					maxY: undefined,
					cycle: 0,
					audioIndex: 50,
					tag: 'div'
				})"
		>
			<template #default="{ state }">
				<origam-parallax :style="hostStyle">
					<origam-parallax-element
							:type="state.type"
							:strength="state.strength"
							:axis="state.axis"
							:transform-origin="state.transformOrigin"
							:origin-x="state.originX"
							:origin-y="state.originY"
							:min-x="state.minX"
							:max-x="state.maxX"
							:min-y="state.minY"
							:max-y="state.maxY"
							:cycle="state.cycle"
							:audio-index="state.audioIndex"
							:tag="state.tag"
					>
						<div :style="layerStyle">Functional</div>
					</origam-parallax-element>
				</origam-parallax>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Transform">
					<HstSelect v-model="state.type"            title="Type"             :options="PARALLAX_ELEMENT_TYPE_OPTIONS"/>
					<HstNumber v-model="state.strength"        title="Strength"/>
					<HstSelect v-model="state.axis"            title="Axis"             :options="AXIS_OPTIONS"/>
					<HstText   v-model="state.transformOrigin" title="Transform Origin"/>
				</StoryGroup>
				<StoryGroup title="Origin">
					<HstNumber v-model="state.originX" title="Origin X (0–100)" :min="0" :max="100" :step="1"/>
					<HstNumber v-model="state.originY" title="Origin Y (0–100)" :min="0" :max="100" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Clamping">
					<HstNumber v-model="state.minX" title="Min X"/>
					<HstNumber v-model="state.maxX" title="Max X"/>
					<HstNumber v-model="state.minY" title="Min Y"/>
					<HstNumber v-model="state.maxY" title="Max Y"/>
				</StoryGroup>
				<StoryGroup title="Cycle / Audio">
					<HstNumber v-model="state.cycle"      title="Cycle (count)" :min="0" :step="1"/>
					<HstNumber v-model="state.audioIndex" title="Audio Index"   :min="0" :max="255" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<origam-parallax :style="hostStyle">
				<origam-parallax-element :strength="30">
					<strong :style="layerStyle">Custom slot content</strong>
				</origam-parallax-element>
			</origam-parallax>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IParallaxElementProps>({
					tag: 'div',
					type: PARALLAX_ELEMENT_TYPE.TRANSLATE,
					strength: 30,
					axis: undefined,
					transformOrigin: 'center',
					originX: 50,
					originY: 50,
					cycle: 0,
					audioIndex: 50
				})"
		>
			<template #default="{ state }">
				<origam-parallax :style="hostStyle">
					<origam-parallax-element v-bind="state">
						<div :style="layerStyle">Playground</div>
					</origam-parallax-element>
				</origam-parallax>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
					<HstSelect v-model="state.rounded"     title="Rounded"      :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation"   title="Elevation"    :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect v-model="state.type"            title="Type"             :options="PARALLAX_ELEMENT_TYPE_OPTIONS"/>
					<HstNumber v-model="state.strength"        title="Strength"/>
					<HstSelect v-model="state.axis"            title="Axis"             :options="AXIS_OPTIONS"/>
					<HstText   v-model="state.transformOrigin" title="Transform Origin"/>
					<HstNumber v-model="state.originX"         title="Origin X"         :min="0" :max="100" :step="1"/>
					<HstNumber v-model="state.originY"         title="Origin Y"         :min="0" :max="100" :step="1"/>
					<HstNumber v-model="state.cycle"           title="Cycle"            :min="0" :step="1"/>
					<HstNumber v-model="state.audioIndex"      title="Audio Index"      :min="0" :max="255" :step="1"/>
					<HstSelect v-model="state.tag"             title="Tag"              :options="TAG_OPTIONS"/>
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

	import { OrigamParallax, OrigamParallaxElement } from '@origam/components'
	import { AXIS, PARALLAX_ELEMENT_TYPE } from '@origam/enums'
	import type { IOptions, IParallaxElementProps } from '@origam/interfaces'
	import type { TAxis, TParallaxElementType } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const PARALLAX_ELEMENT_TYPE_OPTIONS: Array<IOptions<TParallaxElementType | undefined>> = [
		{ label: '(default — translate)', value: undefined },
		{ label: 'Translate', value: PARALLAX_ELEMENT_TYPE.TRANSLATE },
		{ label: 'Rotate', value: PARALLAX_ELEMENT_TYPE.ROTATE },
		{ label: 'Scale', value: PARALLAX_ELEMENT_TYPE.SCALE },
		{ label: 'Scale X', value: PARALLAX_ELEMENT_TYPE.SCALE_X },
		{ label: 'Scale Y', value: PARALLAX_ELEMENT_TYPE.SCALE_Y },
		{ label: 'Depth (Z translate)', value: PARALLAX_ELEMENT_TYPE.DEPTH },
		{ label: 'Depth — inverted', value: PARALLAX_ELEMENT_TYPE.DEPTH_INV },
		{ label: 'Custom (consumer-driven)', value: PARALLAX_ELEMENT_TYPE.CUSTOM }
	]

	const AXIS_OPTIONS: Array<IOptions<TAxis | undefined>> = [
		{ label: '(none — both axes)', value: undefined },
		{ label: 'X', value: AXIS.X },
		{ label: 'Y', value: AXIS.Y }
	]

	const hostStyle: CSSProperties = {
		height: '280px',
		width: '100%',
		background: 'var(--origam-color__surface---overlay)'
	}

	const layerStyle: CSSProperties = {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
		height: '100%',
		fontWeight: '600',
		color: 'var(--origam-color__text---primary)'
	}
</script>

<docs lang="md" src="@docs/components/Parallax/OrigamParallaxElement.md"/>
