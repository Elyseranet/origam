<template>
	<div
			:class="toolbarClasses"
			role="toolbar"
			:aria-label="toolbarLabel"
			:aria-disabled="disabled || undefined"
			data-cy="origam-rich-toolbar"
	>
		<template
				v-for="item in items"
				:key="item"
		>
			<origam-btn
					v-if="!isLink(item)"
					variant="text"
					:icon="true"
					class="origam-rich-toolbar__btn"
					:class="btnClassFor(item)"
					:disabled="disabled || undefined"
					:active="isActive(item)"
					:aria-label="labelFor(item)"
					:aria-pressed="isActive(item) ? 'true' : 'false'"
					:data-command="item"
					:data-cy="`origam-rich-toolbar-${item}`"
					@mousedown.prevent
					@click="emit('format', item)"
			>
				<origam-icon :name="iconFor(item)"/>
			</origam-btn>
			<div
					v-else
					class="origam-rich-toolbar__link-host"
			>
				<origam-btn
						variant="text"
						:icon="true"
						class="origam-rich-toolbar__btn"
						:class="btnClassFor(item)"
						:disabled="disabled || undefined"
						:active="isActive(item)"
						:aria-label="labelFor(item)"
						:aria-pressed="isActive(item) ? 'true' : 'false'"
						:aria-expanded="linkPopoverOpen ? 'true' : 'false'"
						:data-command="item"
						data-cy="origam-rich-toolbar-link"
						@mousedown.prevent
						@click="openLinkPopover"
				>
					<origam-icon :name="iconFor(item)"/>
				</origam-btn>
				<div
						v-if="linkPopoverOpen"
						class="origam-rich-toolbar__link-popover"
						data-cy="origam-rich-toolbar-link-popover"
				>
					<input
							ref="linkInputRef"
							v-model="linkInput"
							type="url"
							class="origam-rich-toolbar__link-input"
							:placeholder="linkPlaceholder"
							:aria-label="linkPlaceholder"
							data-cy="origam-rich-toolbar-link-input"
							@keydown.enter.prevent="applyLink"
							@keydown.escape.prevent="closeLinkPopover"
					>
					<origam-btn
							variant="text"
							class="origam-rich-toolbar__btn origam-rich-toolbar__link-apply"
							:aria-label="linkApplyLabel"
							data-cy="origam-rich-toolbar-link-apply"
							@mousedown.prevent
							@click="applyLink"
					>
						{{ linkApplyLabel }}
					</origam-btn>
				</div>
			</div>
		</template>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import { computed, nextTick, ref } from 'vue'

	import { OrigamBtn, OrigamIcon } from '../../components'

	import { useLocale } from '../../composables'

	import { MDI_ICONS, TEXTAREA_TOOLBAR_COMMAND, TEXTAREA_TOOLBAR_POSITION } from '../../enums'

	import type {
		IRichToolbarProps} from '../../interfaces'

	import type { IRichToolbarEmits } from '../../interfaces/Textarea/textarea-toolbar.interface'

	import type { TTextareaToolbarCommand } from '../../types'

	const props = withDefaults(defineProps<IRichToolbarProps>(), {
		position: TEXTAREA_TOOLBAR_POSITION.TOP,
		disabled: false
	})

	const emit = defineEmits<IRichToolbarEmits>()

	const {t} = useLocale()

	const linkPopoverOpen = ref(false)
	const linkInput = ref('')
	const linkInputRef = ref<HTMLInputElement>()

	const toolbarLabel = computed(() => t('origam.textarea.rich.toolbar.aria_label', 'Text formatting'))
	const linkPlaceholder = computed(() => t('origam.textarea.rich.link.placeholder', 'https://example.com'))
	const linkApplyLabel = computed(() => t('origam.textarea.rich.link.apply', 'Apply'))

	const ICON_MAP: Record<TTextareaToolbarCommand, string> = {
		[TEXTAREA_TOOLBAR_COMMAND.BOLD]: MDI_ICONS.FORMAT_BOLD,
		[TEXTAREA_TOOLBAR_COMMAND.ITALIC]: MDI_ICONS.FORMAT_ITALIC,
		[TEXTAREA_TOOLBAR_COMMAND.UNDERLINE]: MDI_ICONS.FORMAT_UNDERLINE,
		[TEXTAREA_TOOLBAR_COMMAND.LINK]: MDI_ICONS.LINK_VARIANT,
		[TEXTAREA_TOOLBAR_COMMAND.LIST_BULLET]: MDI_ICONS.FORMAT_LIST_BULLETED,
		[TEXTAREA_TOOLBAR_COMMAND.LIST_ORDERED]: MDI_ICONS.FORMAT_LIST_NUMBERED,
		[TEXTAREA_TOOLBAR_COMMAND.HEADING]: MDI_ICONS.FORMAT_HEADER_1,
		[TEXTAREA_TOOLBAR_COMMAND.HEADING_1]: MDI_ICONS.FORMAT_HEADER_1,
		[TEXTAREA_TOOLBAR_COMMAND.HEADING_2]: MDI_ICONS.FORMAT_HEADER_2,
		[TEXTAREA_TOOLBAR_COMMAND.HEADING_3]: MDI_ICONS.FORMAT_HEADER_3,
		[TEXTAREA_TOOLBAR_COMMAND.CODE_INLINE]: MDI_ICONS.CODE_TAGS,
		[TEXTAREA_TOOLBAR_COMMAND.CLEAR_FORMAT]: MDI_ICONS.FORMAT_CLEAR
	}

	const LABEL_KEY: Record<TTextareaToolbarCommand, [string, string]> = {
		[TEXTAREA_TOOLBAR_COMMAND.BOLD]: ['origam.textarea.rich.command.bold', 'Bold'],
		[TEXTAREA_TOOLBAR_COMMAND.ITALIC]: ['origam.textarea.rich.command.italic', 'Italic'],
		[TEXTAREA_TOOLBAR_COMMAND.UNDERLINE]: ['origam.textarea.rich.command.underline', 'Underline'],
		[TEXTAREA_TOOLBAR_COMMAND.LINK]: ['origam.textarea.rich.command.link', 'Insert link'],
		[TEXTAREA_TOOLBAR_COMMAND.LIST_BULLET]: ['origam.textarea.rich.command.list_bullet', 'Bullet list'],
		[TEXTAREA_TOOLBAR_COMMAND.LIST_ORDERED]: ['origam.textarea.rich.command.list_ordered', 'Numbered list'],
		[TEXTAREA_TOOLBAR_COMMAND.HEADING]: ['origam.textarea.rich.command.heading', 'Heading'],
		[TEXTAREA_TOOLBAR_COMMAND.HEADING_1]: ['origam.textarea.rich.command.heading_1', 'Heading 1'],
		[TEXTAREA_TOOLBAR_COMMAND.HEADING_2]: ['origam.textarea.rich.command.heading_2', 'Heading 2'],
		[TEXTAREA_TOOLBAR_COMMAND.HEADING_3]: ['origam.textarea.rich.command.heading_3', 'Heading 3'],
		[TEXTAREA_TOOLBAR_COMMAND.CODE_INLINE]: ['origam.textarea.rich.command.code_inline', 'Inline code'],
		[TEXTAREA_TOOLBAR_COMMAND.CLEAR_FORMAT]: ['origam.textarea.rich.command.clear_format', 'Clear formatting']
	}

	const toolbarClasses = computed(() => [
		'origam-rich-toolbar',
		`origam-rich-toolbar--${props.position}`
	])

	const isLink = (item: TTextareaToolbarCommand) => item === TEXTAREA_TOOLBAR_COMMAND.LINK

	const isActive = (item: TTextareaToolbarCommand): boolean => {
		switch (item) {
			case TEXTAREA_TOOLBAR_COMMAND.BOLD: return props.active.bold
			case TEXTAREA_TOOLBAR_COMMAND.ITALIC: return props.active.italic
			case TEXTAREA_TOOLBAR_COMMAND.UNDERLINE: return props.active.underline
			case TEXTAREA_TOOLBAR_COMMAND.CODE_INLINE: return props.active.code
			case TEXTAREA_TOOLBAR_COMMAND.LINK: return props.active.link
			case TEXTAREA_TOOLBAR_COMMAND.LIST_BULLET: return props.active.listBullet
			case TEXTAREA_TOOLBAR_COMMAND.LIST_ORDERED: return props.active.listOrdered
			case TEXTAREA_TOOLBAR_COMMAND.HEADING:
			case TEXTAREA_TOOLBAR_COMMAND.HEADING_1: return props.active.heading === 1
			case TEXTAREA_TOOLBAR_COMMAND.HEADING_2: return props.active.heading === 2
			case TEXTAREA_TOOLBAR_COMMAND.HEADING_3: return props.active.heading === 3
			default: return false
		}
	}

	const btnClassFor = (item: TTextareaToolbarCommand) => ({
		'origam-rich-toolbar__btn--active': isActive(item)
	})

	const iconFor = (item: TTextareaToolbarCommand) => ICON_MAP[item] ?? MDI_ICONS.FORMAT_BOLD

	const labelFor = (item: TTextareaToolbarCommand) => {
		const entry = LABEL_KEY[item]
		if (!entry) return item
		return t(entry[0], entry[1])
	}

	const openLinkPopover = async (): Promise<void> => {
		linkPopoverOpen.value = !linkPopoverOpen.value
		if (!linkPopoverOpen.value) return
		linkInput.value = ''
		await nextTick()
		linkInputRef.value?.focus()
	}

	const closeLinkPopover = (): void => {
		linkPopoverOpen.value = false
		linkInput.value = ''
	}

	const applyLink = (): void => {
		const url = linkInput.value.trim()
		if (url === '') {
			closeLinkPopover()
			return
		}
		emit('format', TEXTAREA_TOOLBAR_COMMAND.LINK, url)
		closeLinkPopover()
	}

	defineExpose({
		openLinkPopover,
		closeLinkPopover
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-rich-toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: var(--origam-textarea-field__rich-toolbar---gap);
		padding: var(--origam-textarea-field__rich-toolbar---padding);
		background-color: var(--origam-textarea-field__rich-toolbar---bg-color);
		border: 1px solid var(--origam-textarea-field__rich-toolbar---border-color);
		border-radius: var(--origam-textarea-field__rich-toolbar---border-radius);

		&--floating {
			position: sticky;
			top: 0;
			z-index: 1;
		}

		&__btn {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			padding: var(--origam-textarea-field__rich-toolbar-btn---padding);
			height: var(--origam-textarea-field__rich-toolbar-btn---size);
			min-width: var(--origam-textarea-field__rich-toolbar-btn---size);
			background-color: var(--origam-textarea-field__rich-toolbar-btn---bg-color);
			color: var(--origam-textarea-field__rich-toolbar-btn---color);
			border: 1px solid transparent;
			border-radius: var(--origam-textarea-field__rich-toolbar-btn---border-radius);
			cursor: pointer;
			transition: background-color 0.15s ease, color 0.15s ease;

			&:hover:not(:disabled) {
				background-color: var(--origam-textarea-field__rich-toolbar-btn-hover---bg-color);
				color: var(--origam-textarea-field__rich-toolbar-btn-hover---color);
			}

			&:focus-visible {
				outline: 2px solid var(--origam-textarea-field__rich-toolbar-btn-focus---outline-color);
				outline-offset: 2px;
			}

			&:disabled {
				opacity: 0.4;
				cursor: not-allowed;
			}

			&--active {
				background-color: var(--origam-textarea-field__rich-toolbar-btn-active---bg-color);
				color: var(--origam-textarea-field__rich-toolbar-btn-active---color);
			}
		}

		&__link-host {
			position: relative;
			display: inline-flex;
		}

		&__link-popover {
			position: absolute;
			top: calc(100% + 4px);
			left: 0;
			display: flex;
			gap: 4px;
			padding: 6px;
			background-color: var(--origam-textarea-field__rich-toolbar---bg-color);
			border: 1px solid var(--origam-textarea-field__rich-toolbar---border-color);
			border-radius: var(--origam-textarea-field__rich-toolbar---border-radius);
			z-index: 2;
		}

		&__link-input {
			padding: 4px 8px;
			border: 1px solid var(--origam-textarea-field__rich-toolbar---border-color);
			border-radius: var(--origam-textarea-field__rich-toolbar-btn---border-radius);
			background-color: transparent;
			color: inherit;
			min-width: 200px;
			font: inherit;

			&:focus-visible {
				outline: 2px solid var(--origam-textarea-field__rich-toolbar-btn-focus---outline-color);
				outline-offset: 1px;
			}
		}

		&__link-apply {
			width: auto;
			min-width: 0;
			padding-inline: 10px;
			font-size: 0.85em;
		}
	}
</style>
