<template>
	<Story
			group="components"
			title="Carousel/OrigamCarousel"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ICarouselProps>>({
					color: undefined,
					width: undefined,
					height: 300,
					hideDelimiters: false,
					hideDelimiterBackground: false,
					verticalDelimiters: false,
					delimiterIcon: undefined,
					rounded: undefined,
					elevation: undefined,
					border: undefined,
					borderColor: undefined,
					borderStyle: undefined
				})"
		>
			<template #default="{ state }">
				<origam-carousel
						:color="state.color"
						:bg-color="state.bgColor"
						:width="state.width"
						:height="state.height"
						:hide-delimiters="state.hideDelimiters"
						:hide-delimiter-background="state.hideDelimiterBackground"
						:vertical-delimiters="state.verticalDelimiters"
						:delimiter-icon="state.delimiterIcon || undefined"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						style="max-width: 600px"
				>
					<origam-carousel-item
							v-for="(slide, i) in slides"
							:key="i"
					>
						<div :style="{ background: slide.color, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }">
							{{ slide.label }}
						</div>
					</origam-carousel-item>
				</origam-carousel>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Delimiters">
					<HstCheckbox v-model="state.hideDelimiters"          title="Hide Delimiters"/>
					<HstCheckbox v-model="state.hideDelimiterBackground" title="Hide Delimiter Background"/>
					<HstSelect   v-model="state.verticalDelimiters"      title="Vertical Delimiters" :options="VERTICAL_DELIMITERS_OPTIONS"/>
					<HstSelect   v-model="state.delimiterIcon"           title="Delimiter Icon" :options="ICON_OPTIONS"/>
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
				<StoryGroup title="Dimension">
					<HstText   v-model="state.width"  title="Width"/>
					<HstNumber v-model="state.height" title="Height (px)" :min="100" :max="800"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<Partial<ICarouselProps>>({ bgColor: 'primary', modelValue: 0 })"
		>
			<template #default="{ state }">
				<origam-carousel
						v-model="state.modelValue"
						:color="state.color"
						:bg-color="state.bgColor"
						:hover="resolveHoverState(state.hover)"
						:active="resolveActiveState(state.active)"
						:height="220"
						show-arrows
						style="max-width: 600px"
				>
					<origam-carousel-item
							v-for="(slide, i) in slides"
							:key="i"
					>
						<div :style="{ background: slide.color, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }">
							{{ slide.label }}
						</div>
					</origam-carousel-item>
				</origam-carousel>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Surface">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Interaction">
					<HstSelect v-model="state.hover"  title="Hover"  :options="HOVER_OPTIONS"/>
					<HstSelect v-model="state.active" title="Active" :options="ACTIVE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ICarouselProps>>({
					cycle: false,
					interval: 6000,
					progress: false,
					showArrows: true,
					continuous: true,
					reverse: false,
					disabled: false,
					mandatory: true,
					direction: undefined,
					tag: undefined
				})"
		>
			<template #default="{ state }">
				<origam-carousel
						:cycle="state.cycle"
						:interval="state.interval"
						:progress="state.progress"
						:show-arrows="state.showArrows"
						:continuous="state.continuous"
						:reverse="state.reverse"
						:disabled="state.disabled"
						:mandatory="state.mandatory"
						:direction="state.direction"
						:tag="state.tag"
						style="max-width: 600px"
				>
					<origam-carousel-item
							v-for="(slide, i) in slides"
							:key="i"
					>
						<div :style="{ background: slide.color, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }">
							{{ slide.label }}
						</div>
					</origam-carousel-item>
				</origam-carousel>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled"  title="Disabled"/>
					<HstCheckbox v-model="state.mandatory" title="Mandatory"/>
				</StoryGroup>
				<StoryGroup title="Autoplay">
					<HstCheckbox v-model="state.cycle"    title="Cycle (autoplay)"/>
					<HstNumber   v-model="state.interval" title="Interval (ms)" :min="500" :max="30000" :step="500"/>
					<HstCheckbox v-model="state.progress" title="Show Progress Bar"/>
				</StoryGroup>
				<StoryGroup title="Navigation">
					<HstCheckbox v-model="state.showArrows" title="Show Arrows"/>
					<HstCheckbox v-model="state.continuous" title="Continuous"/>
					<HstCheckbox v-model="state.reverse"    title="Reverse"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstSelect v-model="state.direction" title="Direction" :options="DIRECTION_OPTIONS"/>
					<HstSelect v-model="state.tag"       title="Tag"       :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-carousel
					style="max-width: 600px"
					@update:model-value="logEvent('update:modelValue', $event)"
			>
				<origam-carousel-item
						v-for="(slide, i) in slides"
						:key="i"
				>
					<div :style="{ background: slide.color, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }">
						{{ slide.label }}
					</div>
				</origam-carousel-item>
			</origam-carousel>
		</Variant>

		<Variant title="Slots - Default">
			<origam-carousel style="max-width: 600px">
				<origam-carousel-item
						v-for="(slide, i) in slides"
						:key="i"
				>
					<div :style="{ background: slide.color, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }">
						{{ slide.label }}
					</div>
				</origam-carousel-item>
			</origam-carousel>
		</Variant>

		<Variant title="Slots - Additional">
			<origam-carousel style="max-width: 600px">
				<origam-carousel-item
						v-for="(slide, i) in slides"
						:key="i"
				>
					<div :style="{ background: slide.color, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }">
						{{ slide.label }}
					</div>
				</origam-carousel-item>
				<template #additional>
					<div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.6); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">
						Custom additional content
					</div>
				</template>
			</origam-carousel>
		</Variant>

		<Variant title="Slots - Item">
			<origam-carousel style="max-width: 600px">
				<origam-carousel-item
						v-for="(slide, i) in slides"
						:key="i"
				>
					<div :style="{ background: slide.color, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }">
						{{ slide.label }}
					</div>
				</origam-carousel-item>
				<template #item="{ props, index }">
					<origam-btn v-bind="props" :text="String(index + 1)" size="x-small"/>
				</template>
			</origam-carousel>
		</Variant>

		<Variant title="Slots - Prev">
			<origam-carousel style="max-width: 600px" show-arrows>
				<origam-carousel-item
						v-for="(slide, i) in slides"
						:key="i"
				>
					<div :style="{ background: slide.color, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }">
						{{ slide.label }}
					</div>
				</origam-carousel-item>
				<template #prev>
					<origam-btn color="white" icon text="←" size="small" style="margin: 0 4px;"/>
				</template>
			</origam-carousel>
		</Variant>

		<Variant title="Slots - Next">
			<origam-carousel style="max-width: 600px" show-arrows>
				<origam-carousel-item
						v-for="(slide, i) in slides"
						:key="i"
				>
					<div :style="{ background: slide.color, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }">
						{{ slide.label }}
					</div>
				</origam-carousel-item>
				<template #next>
					<origam-btn color="white" icon text="→" size="small" style="margin: 0 4px;"/>
				</template>
			</origam-carousel>
		</Variant>

		<Variant title="Slots - Arrows">
			<origam-carousel style="max-width: 600px">
				<origam-carousel-item
						v-for="(slide, i) in slides"
						:key="i"
				>
					<div :style="{ background: slide.color, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }">
						{{ slide.label }}
					</div>
				</origam-carousel-item>
				<template #arrows="{ canMoveBack, canMoveForward, prevProps, nextProps }">
					<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: space-between; pointer-events: none; padding: 0 8px;">
						<origam-btn v-bind="prevProps" :disabled="!canMoveBack"  color="white" size="small" style="pointer-events: all;">‹</origam-btn>
						<origam-btn v-bind="nextProps" :disabled="!canMoveForward" color="white" size="small" style="pointer-events: all;">›</origam-btn>
					</div>
				</template>
			</origam-carousel>
		</Variant>

		<Variant title="Slots - Progress">
			<origam-carousel style="max-width: 600px" progress :cycle="true" :interval="3000">
				<origam-carousel-item
						v-for="(slide, i) in slides"
						:key="i"
				>
					<div :style="{ background: slide.color, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }">
						{{ slide.label }}
					</div>
				</origam-carousel-item>
				<template #progress="{ percent }">
					<div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: rgba(255,255,255,0.3);">
						<div :style="{ width: percent + '%', height: '100%', background: 'white', transition: 'width 0.1s linear' }"/>
					</div>
				</template>
			</origam-carousel>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<ICarouselProps>>({
					color: undefined,
					height: 300,
					cycle: false,
					interval: 6000,
					progress: false,
					hideDelimiters: false,
					hideDelimiterBackground: false,
					verticalDelimiters: false,
					showArrows: true,
					continuous: true,
					reverse: false,
					disabled: false,
					rounded: undefined,
					elevation: undefined
				})"
		>
			<template #default="{ state }">
				<origam-carousel
						v-bind="state"
						style="max-width: 600px"
						@update:model-value="logEvent('update:modelValue', $event)"
				>
					<origam-carousel-item
							v-for="(slide, i) in slides"
							:key="i"
					>
						<div :style="{ background: slide.color, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }">
							{{ slide.label }}
						</div>
					</origam-carousel-item>
				</origam-carousel>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstNumber v-model="state.height"    title="Height (px)" :min="100" :max="800"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstCheckbox v-model="state.hideDelimiters"          title="Hide Delimiters"/>
					<HstCheckbox v-model="state.hideDelimiterBackground" title="Hide Delimiter Background"/>
					<HstSelect   v-model="state.verticalDelimiters"      title="Vertical Delimiters" :options="VERTICAL_DELIMITERS_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.cycle"       title="Cycle"/>
					<HstNumber   v-model="state.interval"    title="Interval (ms)" :min="500" :max="30000" :step="500"/>
					<HstCheckbox v-model="state.progress"    title="Progress"/>
					<HstCheckbox v-model="state.showArrows"  title="Show Arrows"/>
					<HstCheckbox v-model="state.continuous"  title="Continuous"/>
					<HstCheckbox v-model="state.reverse"     title="Reverse"/>
					<HstCheckbox v-model="state.disabled"    title="Disabled"/>
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

	import { OrigamBtn, OrigamCarousel, OrigamCarouselItem } from '@origam/components'
	import { DIRECTION } from '@origam/enums'
	import type { ICarouselProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		ACTIVE_OPTIONS,
		resolveActiveState,
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		HOVER_OPTIONS,
		resolveHoverState,
		ICON_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const slides = [
		{ label: 'Slide 1', color: '#1976d2' },
		{ label: 'Slide 2', color: '#388e3c' },
		{ label: 'Slide 3', color: '#d32f2f' },
		{ label: 'Slide 4', color: '#f57c00' },
	]

	const DIRECTION_OPTIONS = [
		{ label: '(default)', value: undefined },
		{ label: DIRECTION.HORIZONTAL, value: DIRECTION.HORIZONTAL },
		{ label: DIRECTION.VERTICAL, value: DIRECTION.VERTICAL },
	]

	const VERTICAL_DELIMITERS_OPTIONS = [
		{ label: 'false (bottom center)', value: false },
		{ label: 'true (left)', value: true },
		{ label: 'left', value: 'left' },
		{ label: 'right', value: 'right' },
	]
</script>

<docs lang="md" src="@docs/components/Carousel/OrigamCarousel.md"/>
