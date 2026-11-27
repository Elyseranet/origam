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

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<IParallaxLayerProps>({
					speed: 0.3,
					mouseX: 40,
					mouseY: 24
				})"
		>
			<template #default="{ state }">
				<origam-parallax :style="hostStyleTall" :direction="PARALLAX_DIRECTION.BOTH">
					<origam-parallax-layer data-cy="parallax-layer-back" :speed="0.1" :mouse-x="10" :mouse-y="6">
						<div :style="layerStyle">back</div>
					</origam-parallax-layer>
					<origam-parallax-layer
							data-cy="parallax-layer-front"
							:speed="state.speed"
							:mouse-x="state.mouseX"
							:mouse-y="state.mouseY"
					>
						<div :style="layerStyle">front: mouse {{ state.mouseX }} / {{ state.mouseY }} px, scroll {{ state.speed }}</div>
					</origam-parallax-layer>
				</origam-parallax>
				<div :style="scrollFiller"></div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Mouse">
					<HstNumber v-model="state.mouseX" title="Mouse X" :min="-200" :max="200" :step="5"/>
					<HstNumber v-model="state.mouseY" title="Mouse Y" :min="-200" :max="200" :step="5"/>
				</StoryGroup>
				<StoryGroup title="Scroll">
					<HstNumber v-model="state.speed" title="Speed" :min="-2" :max="2" :step="0.1"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Origin"
				:init-state="() => useStoryInitState<Partial<IParallaxProps>>({
					origin: PARALLAX_ORIGIN.PAGE_TOP,
					speed: 0.35
				})"
		>
			<template #default="{ state }">
				<origam-parallax data-cy="parallax-origin-viewport" :style="hostStyleTall" :easing="PARALLAX_EASING.EASE_OUT" :origin="PARALLAX_ORIGIN.VIEWPORT">
					<origam-parallax-layer data-cy="parallax-origin-viewport-layer" :speed="state.speed">
						<div :style="layerStyle">origin: viewport (default)</div>
					</origam-parallax-layer>
				</origam-parallax>
				<origam-parallax data-cy="parallax-origin-top" :style="hostStyleTall" :easing="PARALLAX_EASING.EASE_OUT" :origin="state.origin">
					<origam-parallax-layer data-cy="parallax-origin-top-layer" :speed="state.speed">
						<div :style="layerStyle">origin: {{ state.origin }}</div>
					</origam-parallax-layer>
				</origam-parallax>
				<div :style="scrollFiller"></div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Scroll">
					<HstSelect v-model="state.origin" title="Origin" :options="PARALLAX_ORIGIN_OPTIONS"/>
					<HstNumber v-model="state.speed" title="Speed" :min="-2" :max="2" :step="0.05"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Scroll container">
			<origam-parallax data-cy="parallax-plain" :style="hostStyleTall">
				<origam-parallax-layer data-cy="parallax-plain-layer" :speed="0.4">
					<div :style="layerStyle">plain ancestor (CSS path)</div>
				</origam-parallax-layer>
			</origam-parallax>
			<div :style="{ overflow: 'hidden' }" data-cy="parallax-ancestor">
				<origam-parallax data-cy="parallax-clipped" :style="hostStyleTall">
					<origam-parallax-layer data-cy="parallax-clipped-layer" :speed="0.4">
						<div :style="layerStyle">overflow: hidden ancestor</div>
					</origam-parallax-layer>
				</origam-parallax>
			</div>
			<div :style="scrollFiller"></div>
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
					<HstNumber v-model="state.mouseX"  title="Mouse X"  :min="-200" :max="200" :step="5"/>
					<HstNumber v-model="state.mouseY"  title="Mouse Y"  :min="-200" :max="200" :step="5"/>
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
	import { PARALLAX_DIRECTION, PARALLAX_EASING, PARALLAX_EVENT, PARALLAX_ORIGIN } from '@origam/enums'
	import type { IOptions, IParallaxLayerProps, IParallaxProps } from '@origam/interfaces'
	import type { TParallaxOrigin } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import { TAG_OPTIONS } from '@stories/const'

	const PARALLAX_ORIGIN_OPTIONS: Array<IOptions<TParallaxOrigin>> = [
		{ label: 'Viewport (default)', value: PARALLAX_ORIGIN.VIEWPORT },
		{ label: 'Page top (rest = zero offset)', value: PARALLAX_ORIGIN.PAGE_TOP }
	]

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
