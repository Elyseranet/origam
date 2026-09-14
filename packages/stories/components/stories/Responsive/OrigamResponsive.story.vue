<template>
	<Story
			group="components"
			title="Responsive/OrigamResponsive"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IResponsiveProps>>({
					aspectRatio: '16/9',
					maxWidth: 480
				})"
		>
			<template #default="{ state }">
				<origam-responsive
						:aspect-ratio="state.aspectRatio"
						:rounded="state.rounded"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:width="state.width"
						:height="state.height"
						:max-width="state.maxWidth"
						:min-width="state.minWidth"
						:max-height="state.maxHeight"
						:min-height="state.minHeight"
						:padding="state.padding"
						:margin="state.margin"
				>
					<div class="demo-fill">preview</div>
				</origam-responsive>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Aspect Ratio">
					<HstSelect v-model="state.aspectRatio" title="Aspect Ratio" :options="ASPECT_RATIO_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded" title="Rounded" :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"     title="Width"/>
					<HstText v-model="state.height"    title="Height"/>
					<HstText v-model="state.maxWidth"  title="Max Width"/>
					<HstText v-model="state.minWidth"  title="Min Width"/>
					<HstText v-model="state.maxHeight" title="Max Height"/>
					<HstText v-model="state.minHeight" title="Min Height"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IResponsiveProps>>({
					aspectRatio: '16/9'
				})"
		>
			<template #default="{ state }">
				<div style="max-width: 480px;">
					<origam-responsive
							:aspect-ratio="state.aspectRatio"
							:content-class="state.contentClass"
					>
						<div class="demo-fill"/>
					</origam-responsive>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstSelect v-model="state.aspectRatio"  title="Aspect Ratio"  :options="ASPECT_RATIO_OPTIONS"/>
					<HstText   v-model="state.contentClass" title="Content Class"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<origam-responsive aspect-ratio="16/9" :max-width="480">
				<div class="demo-fill">
					<strong>Default slot content</strong>
				</div>
			</origam-responsive>
		</Variant>

		<Variant title="Slots - Additional">
			<origam-responsive aspect-ratio="16/9" :max-width="480">
				<div class="demo-fill">main media</div>
				<template #additional>
					<span class="demo-badge">LIVE</span>
				</template>
			</origam-responsive>
		</Variant>

				<Variant title="Prop — aspectRatio">
			<div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-start;">
				<origam-responsive aspect-ratio="16/9" :max-width="200">
					<div style="width:100%;height:100%;background:var(--origam-color__surface---overlay,#ececec);display:flex;align-items:center;justify-content:center;">16/9</div>
				</origam-responsive>
				<origam-responsive aspect-ratio="4/3" :max-width="200">
					<div style="width:100%;height:100%;background:var(--origam-color__surface---overlay,#ececec);display:flex;align-items:center;justify-content:center;">4/3</div>
				</origam-responsive>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IResponsiveProps>({
					aspectRatio: '16/9',
					maxWidth: 480
				})"
		>
			<template #default="{ state }">
				<origam-responsive v-bind="state">
					<div class="demo-fill">playground</div>
				</origam-responsive>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.contentClass" title="Content Class"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.aspectRatio" title="Aspect Ratio" :options="ASPECT_RATIO_OPTIONS"/>
					<HstSelect v-model="state.rounded"     title="Rounded"      :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.maxWidth"    title="Max Width"/>
					<HstText   v-model="state.minWidth"    title="Min Width"/>
					<HstText   v-model="state.width"       title="Width"/>
					<HstText   v-model="state.height"      title="Height"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamResponsive } from '@origam/components'
	import type { IOptions, IResponsiveProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const ASPECT_RATIO_OPTIONS: Array<IOptions<string | number | undefined>> = [
		{ label: '(none)', value: undefined },
		{ label: '16/9', value: '16/9' },
		{ label: '4/3', value: '4/3' },
		{ label: '1/1 (square)', value: '1/1' },
		{ label: '3/4 (portrait)', value: '3/4' },
		{ label: '2.39/1 (cinema)', value: '2.39/1' },
	]
</script>

<style scoped>
	.demo-fill {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		background: var(--origam-color__surface---overlay, #ececec);
		border: 1px solid var(--origam-color__border---default, #e5e5e5);
		color: var(--origam-color__text---primary, #111);
		font-weight: 500;
	}

	.demo-badge {
		position: absolute;
		top: 8px;
		left: 8px;
		padding: 4px 8px;
		background: rgba(0, 0, 0, 0.6);
		color: var(--origam-color__text---on-dark, #fff);
		font-size: 0.75rem;
		border-radius: 4px;
	}
</style>

<docs lang="md" src="@docs/components/Responsive/OrigamResponsive.md"/>
