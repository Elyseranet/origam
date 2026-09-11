<template>
	<Story
			group="components"
			title="ThemeProvider/OrigamThemeProvider"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<{ theme?: string; mode?: string }>({ theme: 'light', mode: 'auto' })"
		>
			<template #default="{ state }">
				<origam-theme-provider :theme="state.theme" :mode="state.mode">
					<origam-btn color="primary" text="Themed button"/>
					<origam-btn variant="outlined" text="Outlined"/>
				</origam-theme-provider>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Theme">
					<HstSelect v-model="state.theme" title="Theme" :options="THEME_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Mode">
					<HstSelect v-model="state.mode" title="Mode" :options="MODE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<{ tag?: string }>({ tag: 'div' })"
		>
			<template #default="{ state }">
				<origam-theme-provider :tag="state.tag" theme="light">
					<origam-btn color="primary" text="Button"/>
				</origam-theme-provider>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Prop — theme (light)">
			<origam-theme-provider theme="light">
				<origam-btn text="Light theme button" color="primary"/>
			</origam-theme-provider>
		</Variant>

		<Variant title="Prop — theme (dark)">
			<origam-theme-provider theme="dark">
				<origam-btn text="Dark theme button" color="primary"/>
			</origam-theme-provider>
		</Variant>

		<Variant title="Prop — mode (light)">
			<origam-theme-provider mode="light">
				<origam-btn text="Light mode button" color="primary"/>
			</origam-theme-provider>
		</Variant>

		<Variant title="Prop — mode (dark)">
			<origam-theme-provider mode="dark">
				<origam-btn text="Dark mode button" color="primary"/>
			</origam-theme-provider>
		</Variant>

		<Variant title="Prop — theme + mode">
			<origam-theme-provider theme="brand-a" mode="dark">
				<origam-btn text="Brand-a dark button" color="primary"/>
			</origam-theme-provider>
		</Variant>

		<Variant title="Prop — theme (auto)">
			<origam-theme-provider theme="auto">
				<origam-btn text="Auto theme button" color="primary"/>
			</origam-theme-provider>
		</Variant>

		<Variant title="Prop — nested providers">
			<div style="display: flex; gap: 16px;">
				<origam-theme-provider theme="light">
					<origam-btn text="Light inner" color="primary"/>
				</origam-theme-provider>
				<origam-theme-provider theme="dark">
					<origam-btn text="Dark inner" color="primary"/>
				</origam-theme-provider>
			</div>
		</Variant>

		<Variant title="Prop — tag">
			<origam-theme-provider theme="light" tag="section">
				<origam-btn text="Section tag button" color="primary"/>
			</origam-theme-provider>
		</Variant>

		<Variant title="Slot — default">
			<origam-theme-provider theme="dark">
				<template #default>
					<origam-btn text="From slot content" color="primary"/>
				</template>
			</origam-theme-provider>
		</Variant>

		<Variant title="Slots - Default">
			<origam-theme-provider theme="dark">
				<template #default>
					<origam-btn text="From default slot" color="primary"/>
				</template>
			</origam-theme-provider>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<{ theme?: string; mode?: string; tag?: string }>({ theme: 'light', mode: 'auto', tag: 'div' })"
		>
			<template #default="{ state }">
				<origam-theme-provider :theme="state.theme" :mode="state.mode" :tag="state.tag">
					<origam-btn color="primary" text="Themed button"/>
					<origam-btn variant="outlined" text="Outlined"/>
				</origam-theme-provider>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.theme" title="Theme" :options="THEME_OPTIONS"/>
					<HstSelect v-model="state.mode"  title="Mode"  :options="MODE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamBtn, OrigamThemeProvider } from '@origam/components'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import { TAG_OPTIONS } from '@stories/const'

	const THEME_OPTIONS = [
		{ label: 'auto',    value: 'auto' },
		{ label: 'light',   value: 'light' },
		{ label: 'dark',    value: 'dark' },
		{ label: 'brand-a', value: 'brand-a' },
	]

	const MODE_OPTIONS = [
		{ label: 'auto',  value: 'auto' },
		{ label: 'light', value: 'light' },
		{ label: 'dark',  value: 'dark' },
	]
</script>

<docs lang="md" src="@docs/components/ThemeProvider/OrigamThemeProvider.md"/>
