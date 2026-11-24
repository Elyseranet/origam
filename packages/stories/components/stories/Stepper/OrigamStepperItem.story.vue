<template>
	<Story
			group="components"
			title="Stepper/OrigamStepperItem"
	>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<IStepperItemProps>({
					index: 0,
					title: 'Step',
					subtitle: 'Subtitle',
					icon: undefined,
					status: undefined,
					clickable: false,
				})"
		>
			<template #default="{ state }">
				<origam-stepper>
					<origam-stepper-item
							:index="state.index"
							:title="state.title"
							:subtitle="state.subtitle"
							:icon="state.icon || undefined"
							:status="state.status"
							:clickable="state.clickable"
					/>
				</origam-stepper>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText   v-model="state.title"    title="Title"/>
					<HstText   v-model="state.subtitle" title="Subtitle"/>
					<HstNumber v-model="state.index"    title="Index" :min="0"/>
				</StoryGroup>
				<StoryGroup title="Status">
					<HstSelect v-model="state.status" title="Status" :options="STEPPER_ITEM_STATUS_OPTIONS"/>
					<HstSelect v-model="state.icon"   title="Icon"   :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Behaviour">
					<HstCheckbox v-model="state.clickable" title="Clickable"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - click">
			<origam-stepper>
				<origam-stepper-item
						:index="0"
						title="Clickable Step"
						subtitle="Click me"
						:clickable="true"
						@click="logEvent('click', $event)"
				/>
			</origam-stepper>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-stepper>
				<origam-stepper-item :index="0" title="Step" subtitle="Subtitle">
					<template #prepend="{ index, status }">
						<span data-cy="story-prepend">{{ index }} · {{ status }}</span>
					</template>
				</origam-stepper-item>
			</origam-stepper>
		</Variant>

		<Variant title="Slots - Append">
			<origam-stepper>
				<origam-stepper-item :index="0" title="Step" subtitle="Subtitle">
					<template #append="{ index, status }">
						<span data-cy="story-append">{{ index }} · {{ status }}</span>
					</template>
				</origam-stepper-item>
			</origam-stepper>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IStepperItemProps>({
					index: 0,
					title: 'Step',
					subtitle: 'Subtitle',
					icon: undefined,
					status: undefined,
					clickable: false,
				})"
		>
			<template #default="{ state }">
				<origam-stepper>
					<origam-stepper-item v-bind="state" @click="logEvent('click', $event)"/>
				</origam-stepper>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText   v-model="state.title"    title="Title"/>
					<HstText   v-model="state.subtitle" title="Subtitle"/>
					<HstNumber v-model="state.index"    title="Index" :min="0"/>
					<HstSelect v-model="state.icon"     title="Icon"  :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.status"    title="Status"    :options="STEPPER_ITEM_STATUS_OPTIONS"/>
					<HstCheckbox v-model="state.clickable" title="Clickable"/>
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

	import { OrigamStepper, OrigamStepperItem } from '@origam/components'
	import type { IStepperItemProps } from '@origam/interfaces'
	import type { TStepperItemStatus } from '@origam/types'
	import type { IOptions } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import { ICON_OPTIONS } from '@stories/const'

	const STEPPER_ITEM_STATUS_OPTIONS: Array<IOptions<TStepperItemStatus | undefined>> = [
		{ label: '(none)',   value: undefined  },
		{ label: 'Pending',  value: 'pending'  },
		{ label: 'Active',   value: 'active'   },
		{ label: 'Done',     value: 'done'     },
		{ label: 'Error',    value: 'error'    },
	]
</script>

<docs lang="md" src="@docs/components/Stepper/OrigamStepperItem.md"/>
