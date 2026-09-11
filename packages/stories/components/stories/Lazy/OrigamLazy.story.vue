<template>
	<Story
			group="components"
			title="Lazy/OrigamLazy"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ILazyComponentProps>>({ height: 120, width: undefined })"
		>
			<template #default="{ state }">
				<div style="height: 500px; overflow-y: auto; border: 1px solid var(--origam-color__border---default); padding: 16px; border-radius: 4px;">
					<p style="margin-bottom: 300px; opacity: 0.5;">Scroll down to reveal.</p>
					<origam-lazy
							:height="state.height"
							:width="state.width"
							:min-height="state.minHeight"
							:max-height="state.maxHeight"
							:min-width="state.minWidth"
							:max-width="state.maxWidth"
					>
						<div style="padding: 16px; background: var(--origam-color__surface---default); border-radius: 4px; font-weight: bold;">
							Lazy content!
						</div>
					</origam-lazy>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Dimension">
					<HstText v-model="state.height"    title="Height"/>
					<HstText v-model="state.width"     title="Width"/>
					<HstText v-model="state.minHeight" title="Min Height"/>
					<HstText v-model="state.maxHeight" title="Max Height"/>
					<HstText v-model="state.minWidth"  title="Min Width"/>
					<HstText v-model="state.maxWidth"  title="Max Width"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ILazyComponentProps>>({ tag: 'div', modelValue: false })"
		>
			<template #default="{ state }">
				<div style="height: 500px; overflow-y: auto; border: 1px solid var(--origam-color__border---default); padding: 16px; border-radius: 4px;">
					<p style="margin-bottom: 300px; opacity: 0.5;">Scroll down to reveal — or use controls.</p>
					<origam-lazy
							:tag="state.tag"
							:model-value="state.modelValue"
							:options="state.options"
							:transition="state.transition"
							:disabled="state.disabled"
							height="120"
					>
						<div style="padding: 16px; background: var(--origam-color__surface---default); border-radius: 4px; font-weight: bold;">
							Lazy content!
						</div>
					</origam-lazy>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled (transition)"/>
				</StoryGroup>
				<StoryGroup title="Data">
					<HstCheckbox v-model="state.modelValue" title="Model Value (visible)"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<div style="height: 400px; overflow-y: auto; border: 1px solid var(--origam-color__border---default); padding: 16px; border-radius: 4px;">
				<p style="margin-bottom: 200px; opacity: 0.5;">Scroll down to trigger the emit.</p>
				<origam-lazy
						height="100"
						@update:model-value="logEvent('update:modelValue', $event)"
				>
					<div style="padding: 16px; background: var(--origam-color__surface---default); border-radius: 4px; font-weight: bold;">
						Lazy emit fired!
					</div>
				</origam-lazy>
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<origam-lazy model-value height="120">
				<div style="padding: 16px; border-radius: 4px; border: 2px dashed var(--origam-color__border---default);">
					Custom lazy slot content
				</div>
			</origam-lazy>
		</Variant>

		<Variant title="Prop — height (scroll to reveal)">
			<div style="height: 500px; overflow-y: auto; border: 1px solid var(--origam-color__border---default); padding: 16px; border-radius: 4px;">
				<p style="margin-bottom: 300px; opacity: 0.5;">Scroll down to reveal.</p>
				<origam-lazy height="120">
					<div style="padding: 16px; background: var(--origam-color__surface---default); border-radius: 4px; font-weight: bold;">
						Lazy content revealed!
					</div>
				</origam-lazy>
			</div>
		</Variant>

		<Variant title="Prop — modelValue (controlled)">
			<div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;">
				<origam-lazy :model-value="lazyControlledVisible" height="80">
					<div style="padding: 16px; background: var(--origam-color__surface---default); border-radius: 4px;">
						Content is visible: {{ lazyControlledVisible }}
					</div>
				</origam-lazy>
				<origam-btn text="Toggle" @click="lazyControlledVisible = !lazyControlledVisible"/>
			</div>
		</Variant>

		<Variant title="Prop — options (intersection margin)">
			<div style="height: 500px; overflow-y: auto; border: 1px solid var(--origam-color__border---default); padding: 16px; border-radius: 4px;">
				<p style="margin-bottom: 300px; opacity: 0.5;">Scroll — triggers 200px before entering viewport.</p>
				<origam-lazy :options="{ rootMargin: '200px' }" height="100">
					<div style="padding: 16px; background: var(--origam-color__surface---default); border-radius: 4px; font-weight: bold;">
						Revealed with 200px margin!
					</div>
				</origam-lazy>
			</div>
		</Variant>

		<Variant title="Slot — default">
			<origam-lazy :model-value="lazySlotVisible" height="120">
				<div style="padding: 16px; border-radius: 4px; border: 2px dashed var(--origam-color__border---default);">
					Custom slot content revealed!
				</div>
			</origam-lazy>
			<origam-btn style="margin-top: 8px;" text="Reveal" @click="lazySlotVisible = true"/>
		</Variant>

		<Variant title="Emit — update:modelValue">
			<div style="height: 400px; overflow-y: auto; border: 1px solid var(--origam-color__border---default); padding: 16px; border-radius: 4px;">
				<p style="margin-bottom: 200px; opacity: 0.5;">Scroll down to trigger the emit.</p>
				<origam-lazy
						height="100"
						@update:model-value="logEvent('update:modelValue', $event)"
				>
					<div style="padding: 16px; background: var(--origam-color__surface---default); border-radius: 4px; font-weight: bold;">
						Lazy emit fired!
					</div>
				</origam-lazy>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ILazyComponentProps>({ height: 120, tag: 'div', modelValue: false })"
		>
			<template #default="{ state }">
				<div style="height: 500px; overflow-y: auto; border: 1px solid var(--origam-color__border---default); padding: 16px; border-radius: 4px;">
					<p style="margin-bottom: 300px; opacity: 0.5;">Scroll down to reveal.</p>
					<origam-lazy
							v-bind="state"
							@update:model-value="logEvent('update:modelValue', $event)"
					>
						<div style="padding: 16px; background: var(--origam-color__surface---default); border-radius: 4px; font-weight: bold;">
							Lazy content!
						</div>
					</origam-lazy>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstText v-model="state.height"    title="Height"/>
					<HstText v-model="state.width"     title="Width"/>
					<HstText v-model="state.minHeight" title="Min Height"/>
					<HstText v-model="state.maxHeight" title="Max Height"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.tag"        title="Tag"       :options="TAG_OPTIONS"/>
					<HstCheckbox v-model="state.modelValue" title="Model Value (visible)"/>
					<HstCheckbox v-model="state.disabled"   title="Disabled (transition)"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { ref } from 'vue'
	import { logEvent } from 'histoire/client'

	import { OrigamBtn, OrigamLazy } from '@origam/components'
	import type { ILazyComponentProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import { TAG_OPTIONS } from '@stories/const'

	const lazyControlledVisible = ref(false)
	const lazySlotVisible = ref(false)
</script>

<docs lang="md" src="@docs/components/Lazy/OrigamLazy.md"/>
