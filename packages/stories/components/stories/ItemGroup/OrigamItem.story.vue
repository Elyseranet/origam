<template>
	<Story
			group="components"
			title="ItemGroup/OrigamItem"
	>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<IItemGroupItemProps & Pick<IItemGroupProps, 'multiple' | 'mandatory' | 'max' | 'selectedClass'>>({
					tag: 'div',
					value: undefined,
					disabled: false,
					selectedClass: undefined,
					multiple: false,
					mandatory: false,
					max: undefined
				})"
		>
			<template #default="{ state }">
				<div style="padding: 24px;">
					<origam-item-group
							v-model="functionalModel"
							:multiple="state.multiple"
							:mandatory="state.mandatory"
							:max="state.max"
							:selected-class="state.selectedClass || undefined"
							data-cy="item-functional-group"
					>
						<div style="display: flex; gap: 12px; flex-wrap: wrap;">
							<origam-item
									v-for="opt in plans"
									:key="opt.value"
									:value="opt.value"
									:tag="state.tag"
									:disabled="state.disabled"
									:selected-class="state.selectedClass || undefined"
							>
								<template #default="{ isSelected, toggle }">
									<button
											:class="['demo-card', { 'demo-card--active': isSelected }]"
											:aria-pressed="isSelected"
											@click="toggle"
											:data-cy="`item-functional-${opt.value}`"
									>
										<div class="demo-card__title">{{ opt.title }}</div>
										<div class="demo-card__price">{{ opt.price }}</div>
										<div class="demo-card__hint">{{ opt.hint }}</div>
									</button>
								</template>
							</origam-item>
						</div>
					</origam-item-group>
					<p style="margin: 12px 0 0; font-size: 0.75rem; color: var(--origam-color__text---secondary);">
						selected = <strong>{{ JSON.stringify(functionalModel) }}</strong>
					</p>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Item">
					<HstSelect  v-model="state.tag"           title="Tag"            :options="TAG_OPTIONS"/>
					<HstCheckbox v-model="state.disabled"     title="Disabled"/>
					<HstText    v-model="state.selectedClass" title="Selected Class"/>
				</StoryGroup>
				<StoryGroup title="Group">
					<HstCheckbox v-model="state.multiple"  title="Multiple"/>
					<HstCheckbox v-model="state.mandatory" title="Mandatory"/>
					<HstNumber   v-model="state.max"       title="Max selections" :min="1" :max="10" :step="1"/>
					<HstText     v-model="state.selectedClass" title="Selected Class (group)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Events - update:modelValue"
				:init-state="() => useStoryInitState<{ log: string[] }>({ log: [] })"
		>
			<template #default="{ state }">
				<div style="padding: 24px;">
					<origam-item-group
							v-model="emitModel"
							data-cy="item-emit-group"
							@update:model-value="(v: any) => {
								state.log = [`update:modelValue → ${JSON.stringify(v)}`, ...state.log].slice(0, 6)
								logEvent('update:modelValue', v)
							}"
					>
						<div style="display: flex; gap: 12px;">
							<origam-item v-for="opt in plans" :key="opt.value" :value="opt.value">
								<template #default="{ isSelected, toggle }">
									<button
											:class="['demo-card', { 'demo-card--active': isSelected }]"
											:aria-pressed="isSelected"
											@click="toggle"
											:data-cy="`item-emit-${opt.value}`"
									>
										<div class="demo-card__title">{{ opt.title }}</div>
									</button>
								</template>
							</origam-item>
						</div>
					</origam-item-group>
					<ul v-if="state.log.length" style="font-family: monospace; font-size: 0.8rem; margin: 12px 0 0; padding-left: 16px;">
						<li v-for="(l, i) in state.log" :key="i">{{ l }}</li>
					</ul>
					<p v-else style="margin: 8px 0 0; font-size: 0.75rem; color: var(--origam-color__text---secondary);">Click a card to see events.</p>
				</div>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<div style="padding: 24px;">
				<origam-item-group v-model="slotModel" data-cy="item-slot-group">
					<div style="display: flex; gap: 12px; flex-wrap: wrap;">
						<origam-item v-for="opt in plans" :key="opt.value" :value="opt.value">
							<template #default="{ isSelected, toggle, select, value, disabled, selectedClass }">
								<button
										:class="['demo-card', { 'demo-card--active': isSelected }]"
										:aria-pressed="isSelected"
										@click="toggle"
										:data-cy="`item-slot-${opt.value}`"
								>
									<code style="font-size: 0.7rem; display: block; margin-bottom: 4px;">
										{{ JSON.stringify({ value, isSelected, disabled, selectedClass }) }}
									</code>
									<div class="demo-card__title">{{ opt.title }}</div>
								</button>
							</template>
						</origam-item>
					</div>
				</origam-item-group>
				<p style="margin: 12px 0 0; font-size: 0.75rem; color: var(--origam-color__text---secondary);">
					selected = <strong>{{ JSON.stringify(slotModel) }}</strong>
				</p>
			</div>
		</Variant>

		<Variant title="Prop — multiple (checkbox-style tiles)">
			<div style="padding: 24px;">
				<origam-item-group v-model="tilesModel" multiple data-cy="item-tiles">
					<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
						<origam-item v-for="opt in tilePlans" :key="opt.value" :value="opt.value">
							<template #default="{ isSelected, toggle }">
								<button
										:class="['demo-tile', { 'demo-tile--active': isSelected }]"
										:aria-pressed="isSelected"
										@click="toggle"
										:data-cy="`item-tile-${opt.value}`"
								>{{ opt.title }}</button>
							</template>
						</origam-item>
					</div>
				</origam-item-group>
				<p style="margin: 12px 0 0; font-size: 0.75rem; color: var(--origam-color__text---secondary);">
					selected = <strong>{{ JSON.stringify(tilesModel) }}</strong>
				</p>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IItemGroupItemProps & Pick<IItemGroupProps, 'multiple' | 'mandatory'>>({
					tag: 'div',
					value: undefined,
					disabled: false,
					multiple: false,
					mandatory: false
				})"
		>
			<template #default="{ state }">
				<div style="padding: 24px;">
					<origam-item-group
							v-model="playgroundModel"
							:multiple="state.multiple"
							:mandatory="state.mandatory"
							data-cy="item-playground-group"
					>
						<div style="display: flex; gap: 12px; flex-wrap: wrap;">
							<origam-item
									v-for="opt in plans"
									:key="opt.value"
									:value="opt.value"
									:tag="state.tag"
									:disabled="state.disabled"
							>
								<template #default="{ isSelected, toggle }">
									<button
											:class="['demo-card', { 'demo-card--active': isSelected }]"
											:aria-pressed="isSelected"
											@click="toggle"
											:data-cy="`item-playground-${opt.value}`"
									>
										<div class="demo-card__title">{{ opt.title }}</div>
										<div class="demo-card__price">{{ opt.price }}</div>
									</button>
								</template>
							</origam-item>
						</div>
					</origam-item-group>
					<p style="margin: 12px 0 0; font-size: 0.75rem; color: var(--origam-color__text---secondary);">
						selected = <strong>{{ JSON.stringify(playgroundModel) }}</strong>
					</p>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.value" title="Value (item)"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.tag"       title="Tag"       :options="TAG_OPTIONS"/>
					<HstCheckbox v-model="state.disabled"  title="Disabled"/>
					<HstCheckbox v-model="state.multiple"  title="Multiple (group)"/>
					<HstCheckbox v-model="state.mandatory" title="Mandatory (group)"/>
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

	import { OrigamItem, OrigamItemGroup } from '@origam/components'
	import type { IItemGroupItemProps, IItemGroupProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import { TAG_OPTIONS } from '@stories/const'

	const plans = [
		{ value: 'starter', title: 'Starter', price: '$0 /mo',  hint: 'Up to 3 projects' },
		{ value: 'pro',     title: 'Pro',     price: '$24 /mo', hint: 'Unlimited projects' },
		{ value: 'team',    title: 'Team',    price: '$96 /mo', hint: 'Multi-seat + SSO' },
	]

	const tilePlans = [
		{ value: 't-starter', title: 'Starter' },
		{ value: 't-pro',     title: 'Pro' },
		{ value: 't-team',    title: 'Team' },
		{ value: 't-enterprise', title: 'Enterprise' },
	]

	const functionalModel = ref<any>(undefined)
	const emitModel = ref<any>(undefined)
	const slotModel = ref<any>(undefined)
	const playgroundModel = ref<any>('pro')
	const tilesModel = ref<any>([])
</script>

<style scoped>
.demo-tile {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 16px;
	box-sizing: border-box;
	text-align: center;
	background: var(--origam-color__surface---default);
	border: 1px solid var(--origam-color__border---subtle);
	border-radius: 8px;
	cursor: pointer;
	font-weight: 600;
	transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.demo-tile:hover { border-color: var(--origam-color__border---default); }
.demo-tile--active {
	border-color: var(--origam-color__action--primary---bg);
	box-shadow: 0 0 0 1px var(--origam-color__action--primary---bg);
}
.demo-card {
	display: flex;
	flex-direction: column;
	gap: 4px;
	padding: 16px;
	width: 160px;
	box-sizing: border-box;
	text-align: start;
	background: var(--origam-color__surface---default);
	border: 1px solid var(--origam-color__border---subtle);
	border-radius: 12px;
	cursor: pointer;
	transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.demo-card:hover { border-color: var(--origam-color__border---default); }
.demo-card--active {
	border-color: var(--origam-color__action--primary---bg);
	box-shadow: 0 0 0 1px var(--origam-color__action--primary---bg);
}
.demo-card__title { font-weight: 600; font-size: 0.95rem; }
.demo-card__price { font-weight: 700; font-size: 1.15rem; color: var(--origam-color__text---primary); }
.demo-card__hint  { font-size: 0.75rem; color: var(--origam-color__text---secondary); }
</style>

<docs lang="md" src="@docs/components/ItemGroup/OrigamItem.md"/>
