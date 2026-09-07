<template>
	<Story
			group="components"
			title="ClientOnly/OrigamClientOnly"
	>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<IClientOnlyProps>({
					placeholderTag: 'div',
					placeholderClass: 'demo-placeholder'
				})"
		>
			<template #default="{ state }">
				<div style="padding: 24px;">
					<origam-client-only
							:key="`functional-${remountKey}`"
							:placeholder-tag="state.placeholderTag || undefined"
							:placeholder-class="state.placeholderClass || undefined"
							data-cy="client-only-functional"
					>
						<div class="demo-client">
							Client-only content — rendered after <code>onMounted</code>.
						</div>
					</origam-client-only>

					<button
							class="demo-remount"
							data-cy="client-only-remount"
							@click="remountKey++"
					>Remount</button>

					<p class="demo-note">
						The placeholder branch is what SSR emits, and on the client it
						lives for a single frame before <code>onMounted</code> swaps in
						the default slot — so pressing Remount will not hold it on
						screen. Inspect the SSR output, or a Vue devtools frame, to see
						it. With <code>placeholderTag</code> cleared, that branch renders
						nothing at all.
					</p>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Placeholder">
					<HstText v-model="state.placeholderTag"   title="Placeholder Tag"/>
					<HstText v-model="state.placeholderClass" title="Placeholder Class"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<div style="padding: 24px;">
				<origam-client-only data-cy="client-only-slot-default">
					<article class="demo-client">
						<strong>Default slot</strong> — only reachable once mounted, so it
						is the right place for anything reading
						<code>window</code> / <code>matchMedia</code> /
						<code>IntersectionObserver</code>.
					</article>
				</origam-client-only>
			</div>
		</Variant>

		<Variant title="Slots - Fallback">
			<div style="padding: 24px;">
				<origam-client-only :key="`fallback-${remountKey}`" data-cy="client-only-slot-fallback">
					<div class="demo-client">Mounted content.</div>

					<template #fallback>
						<div class="demo-placeholder" aria-hidden="true">
							Fallback branch (SSR + pre-mount).
						</div>
					</template>
				</origam-client-only>

				<button
						class="demo-remount"
						data-cy="client-only-slot-remount"
						@click="remountKey++"
				>Remount</button>

				<p class="demo-note">
					A <code>#fallback</code> slot takes precedence over
					<code>placeholderTag</code>. Same caveat as above: on the client this
					branch is one frame long.
				</p>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IClientOnlyProps & { content: string }>({
					placeholderTag: 'div',
					placeholderClass: 'demo-placeholder',
					content: 'Hydrated content'
				})"
		>
			<template #default="{ state }">
				<div style="padding: 24px;">
					<origam-client-only
							:key="`playground-${remountKey}`"
							:placeholder-tag="state.placeholderTag || undefined"
							:placeholder-class="state.placeholderClass || undefined"
							data-cy="client-only-playground"
					>
						<div class="demo-client">{{ state.content }}</div>
					</origam-client-only>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.content" title="Content"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstText v-model="state.placeholderTag"   title="Placeholder Tag"/>
					<HstText v-model="state.placeholderClass" title="Placeholder Class"/>
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

	import { OrigamClientOnly } from '@origam/components'
	import type { IClientOnlyProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'

	const remountKey = ref(0)
</script>

<style scoped>
.demo-client {
	padding: 16px;
	border: 1px solid var(--origam-color__border---subtle);
	border-radius: var(--origam-radius---md);
	background: var(--origam-color__surface---default);
	color: var(--origam-color__text---primary);
}

.demo-placeholder {
	min-height: 56px;
	padding: 16px;
	border: 1px dashed var(--origam-color__border---subtle);
	border-radius: var(--origam-radius---md);
	color: var(--origam-color__text---secondary);
}

.demo-remount {
	margin-top: 12px;
	padding: 6px 12px;
	border: 1px solid var(--origam-color__border---subtle);
	border-radius: var(--origam-radius---sm);
	background: var(--origam-color__surface---default);
	color: var(--origam-color__text---primary);
	cursor: pointer;
}

.demo-note {
	margin: 12px 0 0;
	font-size: 0.75rem;
	color: var(--origam-color__text---secondary);
}
</style>

<docs lang="md" src="@docs/components/ClientOnly/OrigamClientOnly.md"/>
