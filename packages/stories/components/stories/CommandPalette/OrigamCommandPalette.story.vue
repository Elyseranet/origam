<template>
	<Story
			group="components"
			title="CommandPalette/OrigamCommandPalette"
	>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<ICommandPaletteProps>({
					modelValue: false,
					placeholder: 'Type a command…',
					emptyText: 'No results',
					maxHeight: 480,
					width: 640,
					loading: false,
					closeOnSelect: true,
					closeOnEscape: true,
					closeOnBackdrop: true,
					attach: undefined,
					fontSize: undefined
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-btn
							text="Open palette"
							@click="state.modelValue = true"
					/>
					<div class="story-status">
						Palette is: <strong>{{ state.modelValue ? 'open' : 'closed' }}</strong>
					</div>
					<origam-command-palette
							v-model="state.modelValue"
							:commands="PLAYGROUND_COMMANDS"
							:placeholder="state.placeholder"
							:empty-text="state.emptyText"
							:max-height="state.maxHeight"
							:width="state.width"
							:loading="state.loading"
							:close-on-select="state.closeOnSelect"
							:close-on-escape="state.closeOnEscape"
							:close-on-backdrop="state.closeOnBackdrop"
							:attach="state.attach"
							:font-size="state.fontSize"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.placeholder" title="Placeholder"/>
					<HstText v-model="state.emptyText"   title="Empty Text"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstNumber v-model="state.maxHeight" title="Max Height (px)"/>
					<HstNumber v-model="state.width"     title="Width (px)"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.loading" title="Loading"/>
				</StoryGroup>
				<StoryGroup title="Behaviour">
					<HstCheckbox v-model="state.closeOnSelect"  title="Close on Select"/>
					<HstCheckbox v-model="state.closeOnEscape"  title="Close on Escape"/>
					<HstCheckbox v-model="state.closeOnBackdrop" title="Close on Backdrop"/>
					<HstText v-model="state.attach" title="Attach (CSS selector)"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize" title="Font Size" :options="FONT_SIZE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - select">
			<div class="story-shell">
				<origam-btn
						text="Open palette"
						@click="openEmitSelect = true"
				/>
				<div class="story-status">
					select fired: <strong>{{ selectCount }}</strong> times • last:
					<strong>{{ lastSelectedLabel || '—' }}</strong>
				</div>
				<origam-command-palette
						v-model="openEmitSelect"
						:commands="GROUPS_FIXTURE"
						@select="onEmitSelect"
				/>
			</div>
		</Variant>

		<Variant title="Events - query">
			<div class="story-shell">
				<origam-btn
						text="Open palette"
						@click="openEmitQuery = true"
				/>
				<div class="story-status">
					query events: <strong>{{ queryCount }}</strong> • last: <strong>{{ lastQuery || '—' }}</strong>
				</div>
				<origam-command-palette
						v-model="openEmitQuery"
						:commands="GROUPS_FIXTURE"
						@query="onEmitQuery"
				/>
			</div>
		</Variant>

		<Variant title="Events - update:modelValue">
			<div class="story-shell">
				<origam-btn
						text="Open palette"
						@click="openEmitModelValue = true"
				/>
				<div class="story-status">
					update:modelValue fired: <strong>{{ modelValueCount }}</strong> times • current:
					<strong>{{ openEmitModelValue ? 'true' : 'false' }}</strong>
				</div>
				<origam-command-palette
						v-model="openEmitModelValue"
						:commands="GROUPS_FIXTURE"
						@update:model-value="onEmitModelValue"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Item">
			<div class="story-shell">
				<origam-btn
						text="Open with custom rows"
						@click="openSlotItem = true"
				/>
				<origam-command-palette
						v-model="openSlotItem"
						:commands="USER_FIXTURE"
						placeholder="Look up a teammate…"
				>
					<template #item="{ command, isActive }">
						<span class="slot-avatar">
							{{ command.label.charAt(0).toUpperCase() }}
						</span>
						<span class="slot-text">
							<strong>{{ command.label }}</strong>
							<span v-if="command.description" class="slot-description">
								{{ command.description }}
							</span>
						</span>
						<small v-if="isActive" class="slot-enter-hint">↵</small>
					</template>
				</origam-command-palette>
			</div>
		</Variant>

		<Variant title="Slots - Empty">
			<div class="story-shell">
				<origam-btn
						text="Open and type 'zzzz'"
						@click="openSlotEmpty = true"
				/>
				<origam-command-palette
						v-model="openSlotEmpty"
						:commands="GROUPS_FIXTURE"
				>
					<template #empty>
						<p><strong>Want to add this?</strong></p>
						<small>Create a new shortcut — it's just one keystroke away.</small>
					</template>
				</origam-command-palette>
			</div>
		</Variant>

		<Variant title="Slots - Footer">
			<div class="story-shell">
				<origam-btn
						text="Open with custom footer"
						@click="openSlotFooter = true"
				/>
				<origam-command-palette
						v-model="openSlotFooter"
						:commands="GROUPS_FIXTURE"
				>
					<template #footer>
						<span class="slot-footer-text">Powered by origam · v2.3</span>
					</template>
				</origam-command-palette>
			</div>
		</Variant>

		<Variant title="Prop - attach">
			<div class="story-shell">
				<origam-btn
						text="Open (attach to local target)"
						@click="openAttachTarget = true"
				/>
				<div
						id="command-palette-attach-target"
						class="story-attach-target"
						data-cy="command-palette-attach-target"
				>
					local teleport target (#command-palette-attach-target)
				</div>
				<origam-command-palette
						v-if="attachTargetMounted"
						v-model="openAttachTarget"
						:commands="GROUPS_FIXTURE"
						attach="#command-palette-attach-target"
						data-cy="command-palette-attached"
				/>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ICommandPaletteProps>({
					modelValue: false,
					placeholder: 'Type a command…',
					emptyText: 'No results',
					maxHeight: 480,
					width: 640,
					loading: false,
					closeOnSelect: true,
					closeOnEscape: true,
					closeOnBackdrop: true,
					attach: undefined,
					fontSize: undefined
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-btn
							text="Open palette"
							@click="state.modelValue = true"
					/>
					<div class="story-status">
						Last selected: <strong>{{ lastSelectedLabel || '—' }}</strong> • Query events:
						<strong>{{ queryCount }}</strong>
					</div>
					<origam-command-palette
							v-bind="state"
							:commands="PLAYGROUND_COMMANDS"
							@select="onPlaygroundSelect"
							@query="onPlaygroundQuery"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.placeholder" title="Placeholder"/>
					<HstText v-model="state.emptyText"   title="Empty Text"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstNumber v-model="state.maxHeight" title="Max Height (px)"/>
					<HstNumber v-model="state.width"     title="Width (px)"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.loading"          title="Loading"/>
					<HstCheckbox v-model="state.closeOnSelect"    title="Close on Select"/>
					<HstCheckbox v-model="state.closeOnEscape"    title="Close on Escape"/>
					<HstCheckbox v-model="state.closeOnBackdrop"  title="Close on Backdrop"/>
					<HstText v-model="state.attach" title="Attach (CSS selector)"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize" title="Font Size" :options="FONT_SIZE_OPTIONS"/>
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
	import { onMounted, ref } from 'vue'

	import { OrigamBtn, OrigamCommandPalette } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type { ICommand, ICommandPaletteProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import { FONT_SIZE_OPTIONS } from '@stories/const'

	const lastSelectedLabel = ref<string>('')
	const selectCount = ref<number>(0)
	const queryCount = ref<number>(0)
	const lastQuery = ref<string>('')
	const modelValueCount = ref<number>(0)

	const openEmitSelect = ref<boolean>(false)
	const openEmitQuery = ref<boolean>(false)
	const openEmitModelValue = ref<boolean>(false)
	const openSlotItem = ref<boolean>(false)
	const openSlotEmpty = ref<boolean>(false)
	const openSlotFooter = ref<boolean>(false)
	const openAttachTarget = ref<boolean>(false)

	/*********************************************************
	 * attachTargetMounted — #attach-harmonisation
	 *
	 * @description
	 * `useTeleport()` resolves `attach` on the component's FIRST render,
	 * before `isActive`/`openAttachTarget` even matters — not on open. In
	 * this Variant the local target div and `<origam-command-palette>` are
	 * SIBLINGS created in the SAME render pass, under Histoire's own
	 * `<Suspense>` (`OrigamApp`/`OrigamLayout`): the whole subtree,
	 * siblings included, is only committed to the real DOM once Suspense
	 * resolves, so `document.querySelector('#command-palette-attach-
	 * target')` can race and fail on that very first evaluation —
	 * `useTeleport`'s own doc comment documents this as a REAL case it
	 * does not retry in a 100%-client app (Histoire has no SSR to protect,
	 * so its `useHydration()` gate never delays anything here). A
	 * freshly-mounted sibling target never happens in real usage (a
	 * consumer points `attach` at something that already exists), so the
	 * fix belongs HERE, not in the shared composable: defer mounting the
	 * palette itself until this Variant's own `onMounted` — i.e. until
	 * Suspense has already resolved and the target div is genuinely
	 * connected to `document`.
	 ********************************************************/
	const attachTargetMounted = ref<boolean>(false)
	onMounted(() => {
		attachTargetMounted.value = true
	})

	const PLAYGROUND_COMMANDS: ReadonlyArray<ICommand> = [
		{ id: 'new', label: 'New document', icon: MDI_ICONS.FILE_PLUS, kbd: ['meta', 'n'], group: 'Actions', perform: () => logEvent('cmd', 'new') },
		{ id: 'open', label: 'Open file', icon: MDI_ICONS.FOLDER_OPEN, kbd: ['meta', 'o'], group: 'Actions', perform: () => logEvent('cmd', 'open') },
		{ id: 'save', label: 'Save', icon: MDI_ICONS.CONTENT_SAVE, kbd: ['meta', 's'], group: 'Actions', perform: () => logEvent('cmd', 'save') },
		{ id: 'settings', label: 'Settings', description: 'App preferences', icon: MDI_ICONS.COG, kbd: ['meta', ','], group: 'Navigation', keywords: ['preferences', 'config'], perform: () => logEvent('cmd', 'settings') },
		{ id: 'profile', label: 'Profile', icon: MDI_ICONS.ACCOUNT, group: 'Navigation', perform: () => logEvent('cmd', 'profile') },
		{ id: 'theme', label: 'Toggle theme', description: 'Switch between light and dark', icon: MDI_ICONS.WEATHER_NIGHT, kbd: ['meta', 'shift', 't'], group: 'Settings', keywords: ['dark', 'light'], perform: () => logEvent('cmd', 'theme') }
	]

	const GROUPS_FIXTURE: ReadonlyArray<ICommand> = [
		{ id: 'nav-home', label: 'Home', group: 'Navigation', perform: () => undefined },
		{ id: 'nav-inbox', label: 'Inbox', group: 'Navigation', perform: () => undefined },
		{ id: 'nav-projects', label: 'Projects', group: 'Navigation', perform: () => undefined },
		{ id: 'settings-theme', label: 'Set theme', group: 'Settings', perform: () => undefined },
		{ id: 'settings-language', label: 'Set language', group: 'Settings', perform: () => undefined },
		{ id: 'action-create', label: 'Create item', group: 'Actions', perform: () => undefined },
		{ id: 'action-delete', label: 'Delete item', group: 'Actions', perform: () => undefined }
	]

	const USER_FIXTURE: ReadonlyArray<ICommand> = [
		{ id: 'user-alice', label: 'Alice Liddell', description: 'alice@example.com', perform: () => undefined },
		{ id: 'user-bob', label: 'Bob Stone', description: 'bob@example.com', perform: () => undefined },
		{ id: 'user-carol', label: 'Carol Danvers', description: 'carol@example.com', perform: () => undefined },
		{ id: 'user-dave', label: 'Dave Patel', description: 'dave@example.com', perform: () => undefined }
	]

	const onPlaygroundSelect = (cmd: ICommand) => {
		lastSelectedLabel.value = cmd.label
		logEvent('select', cmd.id)
	}

	const onPlaygroundQuery = (q: string) => {
		queryCount.value += 1
		lastQuery.value = q
		logEvent('query', q)
	}

	const onEmitSelect = (cmd: ICommand) => {
		selectCount.value += 1
		lastSelectedLabel.value = cmd.label
		logEvent('select', cmd.id)
	}

	const onEmitQuery = (q: string) => {
		queryCount.value += 1
		lastQuery.value = q
		logEvent('query', q)
	}

	const onEmitModelValue = (value: boolean) => {
		modelValueCount.value += 1
		logEvent('update:modelValue', value)
	}
</script>

<style scoped>
	.story-shell {
		display: flex;
		flex-direction: column;
		gap: 16px;
		align-items: stretch;
		padding: 16px;
	}

	.story-status {
		font: 0.875rem/1.4 system-ui, sans-serif;
		color: var(--origam-color__text---secondary, rgba(0, 0, 0, 0.66));
	}

	.story-attach-target {
		position: relative;
		min-height: 80px;
		padding: 12px;
		border: 1px dashed var(--origam-color__border---subtle, rgba(0, 0, 0, 0.2));
		border-radius: 8px;
		font: 0.8125rem/1.4 system-ui, sans-serif;
		color: var(--origam-color__text---secondary, rgba(0, 0, 0, 0.55));
	}

	.slot-avatar {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background-color: var(--origam-color__action--primary---bgSubtle, rgba(0, 0, 0, 0.06));
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.75rem;
		color: var(--origam-color__action--primary---fg, #1976d2);
		flex: 0 0 auto;
	}

	.slot-text {
		flex: 1 1 auto;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.slot-description {
		display: block;
		font-size: 0.75rem;
		opacity: 0.7;
	}

	.slot-enter-hint {
		font-size: 0.625rem;
		opacity: 0.6;
	}

	.slot-footer-text {
		font-size: 0.75rem;
		opacity: 0.7;
	}
</style>

<docs lang="md" src="@docs/components/CommandPalette/OrigamCommandPalette.md"/>
