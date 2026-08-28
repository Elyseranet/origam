<template>
	<Story
			group="components"
			title="Parallax/OrigamParallaxLayer"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<IParallaxLayerProps>({
					tag: 'div',
					speed: 0.5,
					offsetX: 0,
					offsetY: 0,
					zIndex: undefined
				})"
		>
			<template #default="{ state }">
				<origam-parallax :style="hostStyleTall" :event="PARALLAX_EVENT.SCROLL" :easing="PARALLAX_EASING.EASE_OUT">
					<origam-parallax-layer
							:tag="state.tag"
							:speed="state.speed"
							:offset-x="state.offsetX"
							:offset-y="state.offsetY"
							:z-index="state.zIndex"
					>
						<div :style="layerStyle">speed: {{ state.speed }} / offsetX: {{ state.offsetX }} / offsetY: {{ state.offsetY }}</div>
					</origam-parallax-layer>
				</origam-parallax>
				<div :style="scrollFiller"></div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Motion">
					<HstNumber v-model="state.speed"   title="Speed"    :min="-2" :max="2" :step="0.1"/>
					<HstNumber v-model="state.offsetX" title="Offset X" :min="-200" :max="200" :step="10"/>
					<HstNumber v-model="state.offsetY" title="Offset Y" :min="-200" :max="200" :step="10"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.tag"    title="Tag"     :options="TAG_OPTIONS"/>
					<HstNumber v-model="state.zIndex" title="Z-Index" :step="1"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<origam-parallax :style="hostStyleTall" :event="PARALLAX_EVENT.SCROLL">
				<origam-parallax-layer :speed="0.4">
					<strong :style="layerStyle">Custom slot content</strong>
				</origam-parallax-layer>
			</origam-parallax>
			<div :style="scrollFiller"></div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IParallaxLayerProps>({
					tag: 'div',
					speed: 0.5,
					offsetX: 0,
					offsetY: 0,
					zIndex: undefined
				})"
		>
			<template #default="{ state }">
				<origam-parallax :style="hostStyleTall" :event="PARALLAX_EVENT.SCROLL" :easing="PARALLAX_EASING.SPRING">
					<origam-parallax-layer v-bind="state">
						<div :style="layerStyle">Playground</div>
					</origam-parallax-layer>
				</origam-parallax>
				<div :style="scrollFiller"></div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstNumber v-model="state.speed"   title="Speed"    :min="-2" :max="2" :step="0.1"/>
					<HstNumber v-model="state.offsetX" title="Offset X" :min="-200" :max="200" :step="10"/>
					<HstNumber v-model="state.offsetY" title="Offset Y" :min="-200" :max="200" :step="10"/>
					<HstNumber v-model="state.zIndex"  title="Z-Index"  :step="1"/>
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

	import { OrigamParallax, OrigamParallaxLayer } from '@origam/components'
	import { PARALLAX_EASING, PARALLAX_EVENT } from '@origam/enums'
	import type { IParallaxLayerProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import { TAG_OPTIONS } from '@stories/const'

	const hostStyleTall: CSSProperties = {
		width: '100%',
		height: '420px',
		backgroundColor: '#222',
		backgroundImage: "url('https://picsum.photos/seed/origam-parallax-layer/1600/900')",
		backgroundSize: 'cover',
		backgroundPosition: 'center'
	}

	const layerStyle: CSSProperties = {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
		height: '100%',
		fontWeight: '600',
		fontSize: '1.1rem',
		color: '#fff',
		textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
		textAlign: 'center',
		padding: '0 16px'
	}

	const scrollFiller: CSSProperties = {
		height: '80vh'
	}
</script>

<docs lang="md" src="@docs/components/Parallax/OrigamParallaxLayer.md"/>
