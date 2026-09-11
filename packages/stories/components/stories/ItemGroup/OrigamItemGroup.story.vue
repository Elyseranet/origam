<template>
	<Story
			group="components"
			title="ItemGroup/OrigamItemGroup"
	>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IItemGroupProps>>({ multiple: false, mandatory: false, max: undefined, selectedClass: undefined })"
		>
			<template #default="{ state }">
				<div class="ig-row">
					<origam-item-group
							v-model="functionalModel"
							:multiple="state.multiple"
							:mandatory="state.mandatory"
							:disabled="state.disabled"
							:max="state.max"
							:selected-class="state.selectedClass || undefined"
							:tag="state.tag"
					>
						<origam-item v-for="opt in plans" :key="opt.value" :value="opt.value">
							<template #default="{ isSelected, toggle, disabled: itemDisabled }">
								<origam-card
										border
										rounded="default"
										:class="['ig-card', { 'ig-card--active': isSelected, 'ig-card--disabled': itemDisabled }]"
										@click="!itemDisabled && toggle()"
								>
									<div class="ig-card__icon">{{ opt.icon }}</div>
									<div class="ig-card__title">{{ opt.label }}</div>
									<div class="ig-card__desc">{{ opt.desc }}</div>
								</origam-card>
							</template>
						</origam-item>
					</origam-item-group>
					<div class="ig-status">selected = <strong>{{ JSON.stringify(functionalModel) }}</strong></div>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Selection">
					<HstCheckbox v-model="state.multiple"  title="Multiple"/>
					<HstCheckbox v-model="state.mandatory" title="Mandatory"/>
					<HstNumber   v-model="state.max"       title="Max" :min="0" :step="1"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
				<StoryGroup title="Custom Class">
					<HstText v-model="state.selectedClass" title="Selected Class"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<div class="ig-row">
				<origam-item-group
						v-model="emitModel"
						@update:model-value="logEvent('update:modelValue', $event)"
				>
					<origam-item v-for="opt in plans" :key="opt.value" :value="opt.value">
						<template #default="{ isSelected, toggle }">
							<origam-card
									border
									rounded="default"
									:class="['ig-card', { 'ig-card--active': isSelected }]"
									@click="toggle"
							>
								<div class="ig-card__title">{{ opt.label }}</div>
							</origam-card>
						</template>
					</origam-item>
				</origam-item-group>
				<div class="ig-status">selected = <strong>{{ JSON.stringify(emitModel) }}</strong></div>
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<div class="ig-row">
				<origam-item-group v-model="slotModel">
					<origam-item v-for="opt in formats" :key="opt.value" :value="opt.value">
						<template #default="{ isSelected, toggle }">
							<origam-card
									border
									rounded="default"
									:class="['ig-card ig-card--small', { 'ig-card--active': isSelected }]"
									@click="toggle"
							>
								<div class="ig-card__title">{{ opt.label }}</div>
							</origam-card>
						</template>
					</origam-item>
				</origam-item-group>
				<div class="ig-status">selected = <strong>{{ slotModel }}</strong></div>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IItemGroupProps>>({ multiple: false, mandatory: false })"
		>
			<template #default="{ state }">
				<div class="ig-row">
					<origam-item-group
							v-model="playgroundModel"
							v-bind="state"
					>
						<origam-item v-for="opt in plans" :key="opt.value" :value="opt.value">
							<template #default="{ isSelected, toggle, disabled: itemDisabled }">
								<origam-card
										border
										rounded="default"
										:class="['ig-card', { 'ig-card--active': isSelected, 'ig-card--disabled': itemDisabled }]"
										@click="!itemDisabled && toggle()"
								>
									<div class="ig-card__icon">{{ opt.icon }}</div>
									<div class="ig-card__title">{{ opt.label }}</div>
									<div class="ig-card__desc">{{ opt.desc }}</div>
								</origam-card>
							</template>
						</origam-item>
					</origam-item-group>
					<div class="ig-status">selected = <strong>{{ JSON.stringify(playgroundModel) }}</strong></div>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Selection">
					<HstCheckbox v-model="state.multiple"  title="Multiple"/>
					<HstCheckbox v-model="state.mandatory" title="Mandatory"/>
					<HstNumber   v-model="state.max"       title="Max" :min="0" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstText     v-model="state.selectedClass" title="Selected Class"/>
					<HstSelect   v-model="state.tag"      title="Tag" :options="TAG_OPTIONS"/>
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

	import { OrigamCard, OrigamItem, OrigamItemGroup } from '@origam/components'
	import type { IItemGroupProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import { TAG_OPTIONS } from '@stories/const'

	const plans = [
		{ value: 's', label: 'Small',  icon: '◔', desc: '~ 20 GB · 1 vCPU'  },
		{ value: 'm', label: 'Medium', icon: '◑', desc: '~ 80 GB · 2 vCPU'  },
		{ value: 'l', label: 'Large',  icon: '●', desc: '~ 320 GB · 4 vCPU' },
	]

	const formats = [
		{ value: 'bold',      label: 'Bold' },
		{ value: 'italic',    label: 'Italic' },
		{ value: 'underline', label: 'Underline' },
	]

	const functionalModel  = ref<any>('m')
	const emitModel        = ref<any>(undefined)
	const slotModel        = ref<string | undefined>('bold')
	const playgroundModel  = ref<any>('m')
</script>

<style scoped>
	.ig-row {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		padding: 16px;
		align-items: stretch;
	}
	.ig-card {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 16px 20px;
		min-width: 180px;
		flex: 1 1 180px;
		max-width: 240px;
		cursor: pointer;
		transition: border-color 0.15s ease, border-width 0.15s ease, box-shadow 0.15s ease;
	}
	.ig-card--small {
		min-width: 120px;
		flex: 0 0 120px;
		min-height: auto;
	}
	.ig-card__icon  { font-size: 1.75rem; line-height: 1; opacity: 0.6; }
	.ig-card__title { font-weight: 600; font-size: 0.95rem; }
	.ig-card__desc  { font-size: 0.8125rem; opacity: 0.66; }
	.ig-card--active {
		border-color: var(--origam-color__action--primary---bg, rgb(124, 58, 237));
		border-width: 2px;
		box-shadow: 0 0 0 4px var(--origam-color__action--primary---bg-subtle, rgba(124, 58, 237, 0.1));
	}
	.ig-card--disabled { opacity: 0.45; cursor: not-allowed; }
	.ig-status {
		flex-basis: 100%;
		font: 0.875rem/1.4 system-ui, sans-serif;
		color: var(--origam-color__text---secondary, rgba(0, 0, 0, 0.66));
	}
</style>
