<template>
	<Story
			group="components"
			title="Breadcrumb/OrigamBreadcrumbItem"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IBreadcrumbItemProps>>({ title: 'Breadcrumb item', color: 'primary' })"
		>
			<template #default="{ state }">
				<origam-breadcrumb>
					<ol class="origam-breadcrumb__items">
						<li class="origam-breadcrumb__item">
							<origam-breadcrumb-item
									:color="state.color"
									:padding="state.padding"
									:margin="state.margin"
									:bg-color="state.bgColor"
									:density="state.density"
									:rounded="state.rounded"
									:border="state.border"
									:border-color="state.borderColor"
									:border-style="state.borderStyle"
									:prepend-icon="state.prependIcon || undefined"
									:append-icon="state.appendIcon || undefined"
									:prepend-avatar="state.prependAvatar || undefined"
									:append-avatar="state.appendAvatar || undefined"
									:title="state.title || 'Breadcrumb item'"
									href="/"
							/>
						</li>
					</ol>
				</origam-breadcrumb>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded" title="Rounded" :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.prependIcon"   title="Prepend Icon"   :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"    title="Append Icon"    :options="ICON_OPTIONS"/>
					<HstText   v-model="state.prependAvatar" title="Prepend Avatar (URL)"/>
					<HstText   v-model="state.appendAvatar"  title="Append Avatar (URL)"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<IHoverProps & IActiveProps & IBgColorProps>({ bgColor: 'primary' })"
		>
			<template #default="{ state }">
				<origam-breadcrumb>
					<ol class="origam-breadcrumb__items">
						<li class="origam-breadcrumb__item">
							<origam-breadcrumb-item
									:bg-color="state.bgColor"
									:hover="resolveHoverState(state.hover)"
									:active="resolveActiveState(state.active)"
									title="Breadcrumb item"
									href="/"
							/>
						</li>
					</ol>
				</origam-breadcrumb>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Surface">
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
				:init-state="() => useStoryInitState<Partial<IBreadcrumbItemProps>>({ title: 'Breadcrumb item', tag: 'span' })"
		>
			<template #default="{ state }">
				<origam-breadcrumb>
					<ol class="origam-breadcrumb__items">
						<li class="origam-breadcrumb__item">
							<origam-breadcrumb-item
									:title="state.title || 'Breadcrumb item'"
									:disabled="state.disabled"
									:tag="state.tag"
									:href="state.href"
									:to="state.to"
									:replace="state.replace"
									:exact="state.exact"
							/>
						</li>
					</ol>
				</origam-breadcrumb>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.title" title="Title"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
				<StoryGroup title="Link">
					<HstSelect   v-model="state.tag"     title="Tag"     :options="TAG_OPTIONS"/>
					<HstText     v-model="state.href"    title="Href"/>
					<HstText     v-model="state.to"      title="To (router-link)"/>
					<HstCheckbox v-model="state.replace" title="Replace"/>
					<HstCheckbox v-model="state.exact"   title="Exact"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - click:prepend">
			<origam-breadcrumb>
				<ol class="origam-breadcrumb__items">
					<li class="origam-breadcrumb__item">
						<origam-breadcrumb-item
								title="Click the prepend icon"
								:prepend-icon="homeIcon"
								prepend-aria-label="Open details"
								@click:prepend="logEvent('click:prepend', $event)"
						/>
					</li>
				</ol>
			</origam-breadcrumb>
		</Variant>

		<Variant title="Events - click:append">
			<origam-breadcrumb>
				<ol class="origam-breadcrumb__items">
					<li class="origam-breadcrumb__item">
						<origam-breadcrumb-item
								title="Click the append icon"
								:append-icon="openInNewIcon"
								append-aria-label="Show options"
								@click:append="logEvent('click:append', $event)"
						/>
					</li>
				</ol>
			</origam-breadcrumb>
		</Variant>

		<Variant title="Slots - Default">
			<origam-breadcrumb>
				<ol class="origam-breadcrumb__items">
					<li class="origam-breadcrumb__item">
						<origam-breadcrumb-item title="Ignored when slot used">
							<template #default>
								<strong>Custom</strong> content
							</template>
						</origam-breadcrumb-item>
					</li>
				</ol>
			</origam-breadcrumb>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-breadcrumb>
				<ol class="origam-breadcrumb__items">
					<li class="origam-breadcrumb__item">
						<origam-breadcrumb-item title="With custom prepend" href="/">
							<template #prepend>
								<origam-icon :icon="homeIcon"/>
							</template>
						</origam-breadcrumb-item>
					</li>
				</ol>
			</origam-breadcrumb>
		</Variant>

		<Variant title="Slots - Append">
			<origam-breadcrumb>
				<ol class="origam-breadcrumb__items">
					<li class="origam-breadcrumb__item">
						<origam-breadcrumb-item title="With custom append" href="/">
							<template #append>
								<origam-icon :icon="openInNewIcon"/>
							</template>
						</origam-breadcrumb-item>
					</li>
				</ol>
			</origam-breadcrumb>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IBreadcrumbItemProps>({ title: 'Breadcrumb item', tag: 'span' })"
		>
			<template #default="{ state }">
				<origam-breadcrumb>
					<ol class="origam-breadcrumb__items">
						<li class="origam-breadcrumb__item">
							<origam-breadcrumb-item
									v-bind="state"
									prepend-aria-label="Open details"
									@click:prepend="logEvent('click:prepend', $event)"
									append-aria-label="Show options"
									@click:append="logEvent('click:append', $event)"
							/>
						</li>
					</ol>
				</origam-breadcrumb>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText   v-model="state.title"       title="Title"/>
					<HstSelect v-model="state.prependIcon" title="Prepend Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"  title="Append Icon"  :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.density" title="Density"  :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded" title="Rounded"  :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.border"  title="Border"   :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstText     v-model="state.href"     title="Href"/>
					<HstSelect   v-model="state.tag"      title="Tag"     :options="TAG_OPTIONS"/>
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

	import {
		OrigamBreadcrumb,
		OrigamBreadcrumbItem,
		OrigamIcon
	} from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type {
		IActiveProps,
		IBgColorProps,
		IBreadcrumbItemProps,
		IHoverProps
	} from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		ACTIVE_OPTIONS,
		resolveActiveState,
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		HOVER_OPTIONS,
		resolveHoverState,
		ICON_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const homeIcon = MDI_ICONS.HOME
	const openInNewIcon = MDI_ICONS.OPEN_IN_NEW
</script>
