<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { MDI_ICONS } from 'origam/enums'
import { useT } from '~/composables/useT'
import { useAdminReference } from '~/composables/useAdminReference'
import type { IAdminPatch } from '~/interfaces/admin.interface'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { t } = useT()
const route = useRoute()
const { updateEntry } = useAdminReference()

const kind = computed<string>(() => route.params.kind as string)
const slug = computed<string>(() => route.params.slug as string)

useSeoMeta({
    title: computed(() => `Edit ${slug.value} · Admin`),
    robots: 'noindex,nofollow',
})

const { data: entry, status } = await useFetch<Record<string, any>>(
    () => `/api/reference/${kind.value}/${slug.value}`,
    { key: () => `admin-doc:${kind.value}:${slug.value}` },
)

const form = ref<IAdminPatch>({
    category: null,
    icon: null,
    descriptionKey: null,
    descriptionFallback: null,
    storyUrl: null,
    docUrl: null,
    noteKey: null,
    noteFallback: null,
})

watch(
    entry,
    (val) => {
        if (!val) return
        form.value = {
            category: val.category ?? null,
            icon: val.icon ?? null,
            descriptionKey: val.descriptionKey ?? null,
            descriptionFallback: val.descriptionFallback ?? null,
            storyUrl: val.storyUrl ?? null,
            docUrl: val.docUrl ?? null,
            noteKey: val.noteKey ?? null,
            noteFallback: val.noteFallback ?? null,
        }
    },
    { immediate: true },
)

const saving = ref(false)
const saveResult = ref<{ ok: boolean; message: string } | null>(null)

async function handleSave () {
    if (saving.value) return
    saving.value = true
    saveResult.value = null

    const result = await updateEntry(kind.value, slug.value, form.value)
    saving.value = false

    saveResult.value = result.ok
        ? { ok: true, message: t('admin.editor.save_success', 'Changes saved.') }
        : {
            ok: false,
            message: t(
                'admin.editor.save_error',
                'Failed to save: {error}',
                { error: result.error ?? 'unknown' },
            ),
        }
}
</script>

<template>
    <article
        class="admin-editor"
        :data-cy="`admin-editor-${kind}-${slug}`"
    >
        <header class="admin-editor__header">
            <origam-btn
                variant="text"
                :prepend-icon="MDI_ICONS.ARROW_LEFT"
                :to="`/admin/${kind}`"
                size="small"
                class="admin-editor__back"
                data-cy="admin-editor-back"
            >
                {{ t('admin.editor.back', 'Back to list') }}
            </origam-btn>

            <div class="admin-editor__title-row">
                <origam-title
                    tag="h1"
                    class="admin-editor__title"
                >
                    {{ entry ? t('admin.editor.title', 'Edit {name}', { name: entry.name }) : slug }}
                </origam-title>

                <origam-chip
                    size="small"
                    variant="outlined"
                    class="admin-editor__kind-chip"
                >
                    {{ kind }}
                </origam-chip>

                <origam-chip
                    v-if="entry?.editedByUser"
                    size="small"
                    color="primary"
                    pill
                >
                    {{ t('admin.editor.edited_by_user_badge', 'Edited') }}
                </origam-chip>
            </div>

            <p class="admin-editor__subtitle">
                {{ t('admin.editor.subtitle', '{kind} · {slug}', { kind, slug }) }}
            </p>
        </header>

        <div
            v-if="status === 'pending'"
            class="admin-editor__loading"
            role="status"
        >
            <origam-progress-linear
                indeterminate
                color="primary"
            />
        </div>

        <div
            v-else-if="!entry"
            class="admin-editor__error"
            role="alert"
        >
            <origam-icon
                :icon="MDI_ICONS.ALERT_CIRCLE"
                class="admin-editor__error-icon"
                aria-hidden="true"
            />
            <p>{{ t('admin.editor.not_found', 'Entry not found.') }}</p>
        </div>

        <div
            v-else
            class="admin-editor__body"
        >
            <origam-card
                rounded="lg"
                class="admin-editor__section"
            >
                <template #default>
                    <div class="admin-editor__section-inner">
                        <origam-title
                            tag="h2"
                            class="admin-editor__section-title"
                        >
                            {{ t('admin.editor.section_editable', 'Editable fields') }}
                        </origam-title>

                        <origam-form
                            class="admin-editor__form"
                            @submit.prevent="handleSave"
                        >
                            <origam-text-field
                                v-model="form.category"
                                :label="t('admin.editor.field_category', 'Category')"
                                variant="outlined"
                                density="compact"
                                clearable
                                data-cy="admin-editor-category"
                            />

                            <div class="admin-editor__icon-row">
                                <origam-text-field
                                    v-model="form.icon"
                                    :label="t('admin.editor.field_icon', 'Icon')"
                                    variant="outlined"
                                    density="compact"
                                    clearable
                                    class="admin-editor__icon-field"
                                    data-cy="admin-editor-icon"
                                />

                                <origam-icon
                                    v-if="form.icon"
                                    :icon="form.icon"
                                    size="24"
                                    class="admin-editor__icon-preview"
                                    aria-hidden="true"
                                />
                            </div>

                            <origam-text-field
                                v-model="form.descriptionKey"
                                :label="t('admin.editor.field_description_key', 'Description key (i18n)')"
                                variant="outlined"
                                density="compact"
                                clearable
                                data-cy="admin-editor-desc-key"
                            />

                            <origam-textarea-field
                                v-model="form.descriptionFallback"
                                :label="t('admin.editor.field_description_fallback', 'Description (fallback)')"
                                variant="outlined"
                                density="compact"
                                rows="3"
                                data-cy="admin-editor-desc-fallback"
                            />

                            <origam-text-field
                                v-model="form.storyUrl"
                                :label="t('admin.editor.field_story_url', 'Story URL')"
                                variant="outlined"
                                density="compact"
                                clearable
                                data-cy="admin-editor-story-url"
                            />

                            <origam-text-field
                                v-model="form.docUrl"
                                :label="t('admin.editor.field_doc_url', 'Doc URL')"
                                variant="outlined"
                                density="compact"
                                clearable
                                data-cy="admin-editor-doc-url"
                            />

                            <origam-text-field
                                v-model="form.noteKey"
                                :label="t('admin.editor.field_note_key', 'Note key (i18n)')"
                                variant="outlined"
                                density="compact"
                                clearable
                                data-cy="admin-editor-note-key"
                            />

                            <origam-textarea-field
                                v-model="form.noteFallback"
                                :label="t('admin.editor.field_note_fallback', 'Note (fallback)')"
                                variant="outlined"
                                density="compact"
                                rows="2"
                                data-cy="admin-editor-note-fallback"
                            />

                            <div
                                v-if="saveResult"
                                class="admin-editor__save-feedback"
                                :class="{ 'admin-editor__save-feedback--ok': saveResult.ok, 'admin-editor__save-feedback--error': !saveResult.ok }"
                                role="status"
                                aria-live="polite"
                            >
                                <origam-icon
                                    :icon="saveResult.ok ? MDI_ICONS.CHECK_CIRCLE : MDI_ICONS.ALERT_CIRCLE"
                                    size="16"
                                    aria-hidden="true"
                                />
                                <span>{{ saveResult.message }}</span>
                            </div>

                            <div class="admin-editor__form-actions">
                                <origam-btn
                                    type="submit"
                                    color="primary"
                                    variant="elevated"
                                    :loading="saving"
                                    :prepend-icon="MDI_ICONS.CHECK"
                                    data-cy="admin-editor-save"
                                >
                                    {{ saving ? t('admin.editor.saving', 'Saving…') : t('admin.editor.save', 'Save changes') }}
                                </origam-btn>
                            </div>
                        </origam-form>
                    </div>
                </template>
            </origam-card>

            <origam-card
                rounded="lg"
                class="admin-editor__section admin-editor__section--readonly"
            >
                <template #default>
                    <div class="admin-editor__section-inner">
                        <div class="admin-editor__section-heading">
                            <origam-title
                                tag="h2"
                                class="admin-editor__section-title"
                            >
                                {{ t('admin.editor.section_readonly', 'Source fields') }}
                            </origam-title>

                            <origam-chip
                                size="x-small"
                                class="admin-editor__auto-badge"
                            >
                                {{ t('admin.editor.auto_badge', 'auto · re-sync') }}
                            </origam-chip>
                        </div>

                        <p class="admin-editor__section-hint">
                            {{ t('admin.editor.section_readonly_hint', 'These fields are populated automatically by the sync pipeline.') }}
                        </p>

                        <dl class="admin-editor__readonly-list">
                            <div class="admin-editor__readonly-row">
                                <dt class="admin-editor__readonly-label">
                                    {{ t('admin.editor.field_slug', 'Slug') }}
                                </dt>
                                <dd class="admin-editor__readonly-value admin-editor__readonly-value--mono">
                                    {{ entry.slug }}
                                </dd>
                            </div>

                            <div class="admin-editor__readonly-row">
                                <dt class="admin-editor__readonly-label">
                                    {{ t('admin.editor.field_name', 'Name') }}
                                </dt>
                                <dd class="admin-editor__readonly-value admin-editor__readonly-value--mono">
                                    {{ entry.name }}
                                </dd>
                            </div>

                            <div
                                v-if="entry.tag"
                                class="admin-editor__readonly-row"
                            >
                                <dt class="admin-editor__readonly-label">
                                    {{ t('admin.editor.field_tag', 'Tag') }}
                                </dt>
                                <dd class="admin-editor__readonly-value admin-editor__readonly-value--mono">
                                    {{ entry.tag }}
                                </dd>
                            </div>

                            <div
                                v-if="entry.sourceFile"
                                class="admin-editor__readonly-row"
                            >
                                <dt class="admin-editor__readonly-label">
                                    {{ t('admin.editor.field_source_file', 'Source file') }}
                                </dt>
                                <dd class="admin-editor__readonly-value admin-editor__readonly-value--mono">
                                    {{ entry.sourceFile }}
                                </dd>
                            </div>

                            <div
                                v-if="entry.definition"
                                class="admin-editor__readonly-row"
                            >
                                <dt class="admin-editor__readonly-label">
                                    {{ t('admin.editor.field_definition', 'Definition') }}
                                </dt>
                                <dd class="admin-editor__readonly-value admin-editor__readonly-value--code">
                                    <pre class="admin-editor__code">{{ entry.definition }}</pre>
                                </dd>
                            </div>

                            <div
                                v-if="entry.signature"
                                class="admin-editor__readonly-row"
                            >
                                <dt class="admin-editor__readonly-label">
                                    {{ t('admin.editor.field_signature', 'Signature') }}
                                </dt>
                                <dd class="admin-editor__readonly-value admin-editor__readonly-value--code">
                                    <pre class="admin-editor__code">{{ entry.signature }}</pre>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </template>
            </origam-card>
        </div>
    </article>
</template>

<style scoped lang="scss">
.admin-editor {
    display: flex;
    flex-direction: column;
    gap: var(--origam-space---4, 1rem);
    max-inline-size: 720px;

    &__header {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---2, 0.5rem);
    }

    &__back {
        align-self: flex-start;
    }

    &__title-row {
        display: flex;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
        flex-wrap: wrap;
    }

    &__title {
        --origam-title---font-size: var(--origam-font-size---xl, 1.5rem);
        --origam-title---font-weight: 700;
        margin: 0;
    }

    &__kind-chip {
        --origam-chip---background-color: transparent;
        font-family: var(--origam-font-family---mono, monospace);
        font-size: var(--origam-font-size---xs, 0.75rem);
    }

    &__subtitle {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        color: var(--origam-color__text---secondary, #525252);
        font-family: var(--origam-font-family---mono, monospace);
    }

    &__loading {
        padding-block: var(--origam-space---4, 1rem);
    }

    &__error {
        display: flex;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
        padding: var(--origam-space---4, 1rem);
        color: var(--origam-color__status--danger---fg, #dc2626);

        &-icon {
            flex-shrink: 0;
        }
    }

    &__body {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---4, 1rem);
    }

    &__section {
        &-inner {
            padding: var(--origam-space---5, 1.25rem);
            display: flex;
            flex-direction: column;
            gap: var(--origam-space---4, 1rem);
        }

        &-heading {
            display: flex;
            align-items: center;
            gap: var(--origam-space---2, 0.5rem);
        }

        &-title {
            --origam-title---font-size: var(--origam-font-size---base, 1rem);
            --origam-title---font-weight: 600;
            margin: 0;
        }

        &-hint {
            margin: 0;
            font-size: var(--origam-font-size---xs, 0.75rem);
            color: var(--origam-color__text---tertiary, #737373);
        }

        &--readonly {
            opacity: 0.85;
        }
    }

    &__auto-badge {
        --origam-chip---background-color: var(--origam-color__surface---sunken, #f5f5f5);
        font-size: var(--origam-font-size---xs, 0.75rem);
    }

    &__form {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---3, 0.75rem);
    }

    &__icon-row {
        display: flex;
        align-items: center;
        gap: var(--origam-space---3, 0.75rem);
    }

    &__icon-field {
        flex: 1;
    }

    &__icon-preview {
        color: var(--origam-color__text---secondary, #525252);
        flex-shrink: 0;
    }

    &__save-feedback {
        display: flex;
        align-items: center;
        gap: var(--origam-space---2, 0.5rem);
        font-size: var(--origam-font-size---sm, 0.875rem);
        padding: var(--origam-space---2, 0.5rem) var(--origam-space---3, 0.75rem);
        border-radius: var(--origam-radius---md, 8px);

        &--ok {
            background-color: var(--origam-color__status--success---bgSubtle, #f0fdf4);
            color: var(--origam-color__status--success---fg, #15803d);
        }

        &--error {
            background-color: var(--origam-color__status--danger---bgSubtle, #fef2f2);
            color: var(--origam-color__status--danger---fg, #dc2626);
        }
    }

    &__form-actions {
        display: flex;
        justify-content: flex-end;
    }

    &__readonly-list {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---3, 0.75rem);
    }

    &__readonly-row {
        display: grid;
        grid-template-columns: 140px 1fr;
        gap: var(--origam-space---3, 0.75rem);
        align-items: start;
    }

    &__readonly-label {
        font-size: var(--origam-font-size---xs, 0.75rem);
        font-weight: 600;
        color: var(--origam-color__text---tertiary, #737373);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding-block-start: var(--origam-space---1, 0.25rem);
    }

    &__readonly-value {
        font-size: var(--origam-font-size---sm, 0.875rem);
        color: var(--origam-color__text---secondary, #525252);
        margin: 0;

        &--mono {
            font-family: var(--origam-font-family---mono, monospace);
        }

        &--code {
            overflow-x: auto;
        }
    }

    &__code {
        margin: 0;
        padding: var(--origam-space---2, 0.5rem) var(--origam-space---3, 0.75rem);
        background-color: var(--origam-color__surface---sunken, #f5f5f5);
        border-radius: var(--origam-radius---sm, 4px);
        font-size: var(--origam-font-size---xs, 0.75rem);
        font-family: var(--origam-font-family---mono, monospace);
        white-space: pre-wrap;
        word-break: break-all;
    }
}
</style>
