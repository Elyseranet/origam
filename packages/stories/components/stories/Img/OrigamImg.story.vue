<template>
	<Story
			group="components"
			title="Img/OrigamImg"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IImgProps>>({
					src: 'https://picsum.photos/seed/origam-img-design/640/360',
					alt: 'Design demo',
					aspectRatio: 16 / 9,
					cover: true
				})"
		>
			<template #default="{ state }">
				<origam-img
						:alt="state.alt"
						:aspect-ratio="state.aspectRatio"
						:bg-color="state.bgColor"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:color="state.color"
						:cover="state.cover"
						:gradient="state.gradient"
						:height="state.height"
						:margin="state.margin"
						:max-height="state.maxHeight"
						:max-width="state.maxWidth"
						:min-height="state.minHeight"
						:min-width="state.minWidth"
						:padding="state.padding"
						:position="state.position"
						:rounded="state.rounded"
						:src="state.src"
						:width="state.width"
						style="max-width: 480px;"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded" title="Rounded" :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Overlay">
					<HstText v-model="state.gradient" title="Gradient (CSS linear-gradient args)"/>
				</StoryGroup>
				<StoryGroup title="Fit">
					<HstCheckbox v-model="state.cover"    title="Cover (object-fit: cover)"/>
					<HstText     v-model="state.position" title="Position (object-position)"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstNumber v-model="state.aspectRatio" title="Aspect Ratio" :step="0.1"/>
					<HstText   v-model="state.width"       title="Width"/>
					<HstText   v-model="state.height"      title="Height"/>
					<HstText   v-model="state.minWidth"    title="Min Width"/>
					<HstText   v-model="state.minHeight"   title="Min Height"/>
					<HstText   v-model="state.maxWidth"    title="Max Width"/>
					<HstText   v-model="state.maxHeight"   title="Max Height"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IImgProps>>({
					src: 'https://picsum.photos/seed/origam-img-func/640/360',
					alt: 'Functional demo',
					aspectRatio: 16 / 9,
					eager: true,
					cover: true
				})"
		>
			<template #default="{ state }">
				<origam-img
						:alt="state.alt"
						:aspect-ratio="state.aspectRatio"
						:cover="state.cover"
						:crossorigin="state.crossorigin || undefined"
						:draggable="state.draggable"
						:eager="state.eager"
						:inline="state.inline"
						:lazy-src="state.lazySrc || undefined"
						:referrerpolicy="state.referrerpolicy || undefined"
						:sizes="state.sizes || undefined"
						:src="state.src"
						:srcset="state.srcset || undefined"
						style="max-width: 480px;"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Source">
					<HstText v-model="state.src"     title="Src"/>
					<HstText v-model="state.lazySrc" title="Lazy Src (preload blur)"/>
					<HstText v-model="state.srcset"  title="Srcset"/>
					<HstText v-model="state.sizes"   title="Sizes"/>
					<HstText v-model="state.alt"     title="Alt"/>
				</StoryGroup>
				<StoryGroup title="Loading">
					<HstCheckbox v-model="state.eager" title="Eager (skip IntersectionObserver)"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.inline" title="Inline"/>
				</StoryGroup>
				<StoryGroup title="Attributes">
					<HstCheckbox v-model="state.draggable"     title="Draggable"/>
					<HstText     v-model="state.crossorigin"   title="Crossorigin"/>
					<HstText     v-model="state.referrerpolicy" title="Referrerpolicy"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - load">
			<origam-img
					:aspect-ratio="16 / 9"
					alt="Load emit demo"
					cover
					eager
					src="https://picsum.photos/seed/origam-img-emit-load/640/360"
					style="max-width: 480px;"
					@load="logEvent('load', $event)"
			/>
		</Variant>

		<Variant title="Events - loadstart">
			<origam-img
					:aspect-ratio="16 / 9"
					alt="Loadstart emit demo"
					cover
					eager
					src="https://picsum.photos/seed/origam-img-emit-loadstart/640/360"
					style="max-width: 480px;"
					@loadstart="logEvent('loadstart', $event)"
			/>
		</Variant>

		<Variant title="Events - error">
			<origam-img
					:aspect-ratio="16 / 9"
					alt="Error emit demo"
					eager
					src="https://this-host-does-not-exist.invalid/broken.png"
					style="max-width: 480px;"
					@error="logEvent('error', $event)"
			/>
		</Variant>

		<Variant title="Slots - Placeholder">
			<origam-img
					:aspect-ratio="16 / 9"
					alt="Placeholder slot demo"
					eager
					src="https://picsum.photos/seed/origam-img-slot-placeholder/1600/900"
					style="max-width: 480px;"
			>
				<template #placeholder>
					<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: var(--origam-color__text---secondary, #4b5563); background: var(--origam-color__surface---overlay, #f3f4f6);">
						Loading...
					</div>
				</template>
			</origam-img>
		</Variant>

		<Variant title="Slots - Default">
			<origam-img
					:aspect-ratio="16 / 9"
					alt="Default slot overlay demo"
					cover
					src="https://picsum.photos/seed/origam-img-slot-default/640/360"
					style="max-width: 480px;"
			>
				<div style="display: flex; align-items: flex-end; height: 100%; padding: 12px; color: white; background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.4));">
					Caption overlay
				</div>
			</origam-img>
		</Variant>

		<Variant title="Slots - Error">
			<origam-img
					:aspect-ratio="16 / 9"
					alt="Error slot demo"
					eager
					src="https://this-host-does-not-exist.invalid/broken.png"
					style="max-width: 480px; background: var(--origam-color__surface---overlay, #f3f4f6);"
			>
				<template #error>
					<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: var(--origam-color__feedback--danger---fg, #b91c1c);">
						Failed to load image
					</div>
				</template>
			</origam-img>
		</Variant>

		<Variant title="Prop — src & alt">
			<origam-img
					alt="Demo image"
					:aspect-ratio="16 / 9"
					src="https://picsum.photos/seed/origam-img-basic/640/360"
					style="max-width: 480px;"
			/>
		</Variant>

		<Variant
				title="Prop — cover & position"
				:init-state="() => useStoryInitState<Partial<IImgProps>>({ cover: false })"
		>
			<template #default="{ state }">
				<origam-img
						alt="Cover demo"
						:aspect-ratio="1"
						:cover="state.cover"
						:position="state.position"
						src="https://picsum.photos/seed/origam-img-cover/640/360"
						style="max-width: 480px;"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Fit">
					<HstCheckbox v-model="state.cover"    title="Cover (object-fit: cover)"/>
					<HstText     v-model="state.position" title="Position (object-position)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Prop — rounded"
				:init-state="() => useStoryInitState<Partial<IImgProps>>({ rounded: 'default' })"
		>
			<template #default="{ state }">
				<origam-img
						alt="Rounded demo"
						:aspect-ratio="1"
						cover
						:rounded="state.rounded"
						src="https://picsum.photos/seed/origam-img-rounded/640/640"
						style="max-width: 240px;"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded" title="Rounded" :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Prop — aspectRatio"
				:init-state="() => useStoryInitState<Partial<IImgProps>>({ aspectRatio: 16 / 9 })"
		>
			<template #default="{ state }">
				<origam-img
						alt="Aspect ratio demo"
						:aspect-ratio="state.aspectRatio"
						cover
						src="https://picsum.photos/seed/origam-img-ar/640/360"
						style="max-width: 480px;"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Dimension">
					<HstNumber v-model="state.aspectRatio" title="Aspect Ratio" :step="0.1"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Prop — lazySrc (preload blur)">
			<origam-img
					alt="Lazy src demo"
					:aspect-ratio="16 / 9"
					cover
					lazy-src="https://picsum.photos/seed/origam-img-lazy/40/22"
					src="https://picsum.photos/seed/origam-img-lazy/1600/900"
					style="max-width: 480px;"
			/>
		</Variant>

		<Variant
				title="Prop — gradient"
				:init-state="() => useStoryInitState<Partial<IImgProps>>({ gradient: 'to bottom, transparent 40%, rgba(0,0,0,0.6) 100%' })"
		>
			<template #default="{ state }">
				<origam-img
						alt="Gradient demo"
						:aspect-ratio="16 / 9"
						cover
						:gradient="state.gradient"
						src="https://picsum.photos/seed/origam-img-grad/640/360"
						style="max-width: 480px;"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Overlay">
					<HstText v-model="state.gradient" title="Gradient (CSS linear-gradient args)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slot — error">
			<origam-img
					:aspect-ratio="16 / 9"
					alt="Error slot demo"
					eager
					src="https://this-host-does-not-exist.invalid/broken.png"
					style="max-width: 480px; background: var(--origam-color__surface---overlay, #f3f4f6);"
			>
				<template #error>
					<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: var(--origam-color__feedback--danger---fg, #b91c1c);">
						Failed to load image
					</div>
				</template>
			</origam-img>
		</Variant>

				<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IImgProps>>({
					src: 'https://picsum.photos/seed/origam-img-playground/640/360',
					alt: 'Playground',
					aspectRatio: 16 / 9,
					cover: true,
					eager: true
				})"
		>
			<template #default="{ state }">
				<origam-img
						v-bind="state"
						style="max-width: 480px;"
						@load="logEvent('load', $event)"
						@loadstart="logEvent('loadstart', $event)"
						@error="logEvent('error', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.src"     title="Src"/>
					<HstText v-model="state.alt"     title="Alt"/>
					<HstText v-model="state.lazySrc" title="Lazy Src"/>
					<HstText v-model="state.gradient" title="Gradient"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstNumber   v-model="state.aspectRatio" title="Aspect Ratio" :step="0.1"/>
					<HstCheckbox v-model="state.cover"       title="Cover"/>
					<HstText     v-model="state.position"    title="Position"/>
					<HstSelect   v-model="state.rounded"     title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.color"       title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.bgColor"     title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstText     v-model="state.width"       title="Width"/>
					<HstText     v-model="state.height"      title="Height"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.eager"  title="Eager"/>
					<HstCheckbox v-model="state.inline" title="Inline"/>
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

	import { OrigamImg } from '@origam/components'
	import type { IImgProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'
</script>

<docs lang="md" src="@docs/components/Img/OrigamImg.md"/>
