<template>
  <dl
    :id="id"
    :style="RowListStyles"
    :class="RowListClasses"
    v-bind="$attrs"
  >
    <slot name="default">
      <div
        v-for="(view, key) in viewItems"
        :key="key"
        class="prop-list__item"
        :data-cy="view.dataCy"
      >
        <slot
          name="item"
          v-bind="{ item: view.item }"
        >
          <dt class="prop-list__dt">
            <slot
              name="title"
              v-bind="{ label: view.item.label, item: view.item }"
            >
              <origam-row gutters="5">
                <origam-col
                  v-if="view.item.label"
                  cols="auto"
                >
                  <div class="prop-list__name-btn">
                    <span class="prop-list__name-mono">{{ view.item.label }}</span>
                    <origam-clipboard
                      size="x-small"
                      elevation="0"
                      :value="view.item.label"
                      class="prop-list__copy-icon"
                      :aria-label="`${t('reference.row_list.copy_label', 'Copy')} ${view.item.label}`"
                    />
                  </div>
                </origam-col>
                <origam-col cols="auto">
                  <slot
                    name="required"
                    v-bind="{ required: !!view.item.required }"
                  >
                    <origam-chip
                      v-if="view.item.required"
                      size="x-small"
                      color="danger"
                      pill
                      class="prop-list__required-badge"
                    >
                      {{ t('reference.row_list.required', 'required') }}
                    </origam-chip>
                  </slot>
                </origam-col>
                <origam-col>
                  <slot
                    name="type"
                    v-bind="{ type: view.item.type }"
                  >
                    <template v-if="view.item.type">
                      <nuxt-link
                        v-if="view.isTypeRef && view.typeKind !== 'primitive' && view.typeSlug"
                        :to="`/types/${view.typeSlug}`"
                        class="prop-list__type-link"
                      >
                        <origam-chip
                          size="x-small"
                          :color="view.typeKind === 'enum' ? 'secondary' : 'primary'"
                          class="prop-list__type-chip"
                        >
                          {{ view.typeLabel }}
                        </origam-chip>
                      </nuxt-link>
                      <origam-chip
                        v-else
                        size="x-small"
                        class="prop-list__type-chip prop-list__type-chip--primitive"
                      >
                        {{ view.typeLabel }}
                      </origam-chip>
                    </template>
                  </slot>
                </origam-col>
                <origam-col cols="auto">
                  <slot
                    name="value"
                    v-bind="{ value: view.item.value }"
                  >
                    <span
                      v-if="view.item.value && view.item.value !== 'undefined'"
                      class="prop-list__default"
                    >{{ view.item.value }}</span>
                  </slot>
                </origam-col>
              </origam-row>
            </slot>
          </dt>
          <dd class="prop-list__dd">
            <slot
              name="description"
              v-bind="{ descriptionKey: view.item.descriptionKey, descriptionFallback: view.item.descriptionFallback }"
            >
              {{ view.item.descriptionKey ? t(view.item.descriptionKey, view.item.descriptionFallback) : view.item.descriptionFallback }}
            </slot>
          </dd>
        </slot>
      </div>
    </slot>
  </dl>
</template>

<script setup lang="ts">
  import type { StyleValue } from "vue";
  import type { IRowListEmits, IRowListProps, IRowListSlots } from "~/interfaces/row-list.interface";

  const props = withDefaults(defineProps<IRowListProps>(), {
    items: () => [],
    rowPrefix: 'prop-row',
  })

  defineEmits<IRowListEmits>()

  defineSlots<IRowListSlots>()

  const { t } = useT()

  // One decomposed view per row, computed once per render — avoids
  // re-narrowing `item.type` (IComponentTypeRef | string | undefined)
  // repeatedly inside the template, which vue-tsc cannot track through a
  // custom type-predicate across `&&` chains in template expressions.
  const viewItems = computed(() => props.items.map((item, index) => {
    const isTypeRef = !!item.type && typeof item.type === 'object'
    const suffix = item.label ? item.label.replace(/[^a-z0-9]/gi, '-') : String(index)
    return {
      item,
      isTypeRef,
      typeLabel: !item.type ? '' : (isTypeRef ? (item.type as { label: string }).label : (item.type as string)),
      typeSlug: isTypeRef ? (item.type as { slug: string }).slug : '',
      typeKind: isTypeRef ? (item.type as { kind: string }).kind : 'primitive',
      dataCy: `${props.rowPrefix}-${suffix}`,
    }
  }))

  const RowListStyles = computed(() => {
    return [
      props.style,
    ] as StyleValue
  })
  const RowListClasses = computed(() => {
    return [
      'prop-list',
      props.class
    ]
  })
</script>

<style scoped lang="scss">
  /* ── PROP-LIST — layout de type "property list" (Radix/VueDocs pattern) */
  .prop-list {
    margin: 0;
    padding: 0;
    border: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
    border-radius: var(--origam-radius---lg, 8px);
    overflow: hidden;

    &__item {
      padding: var(--origam-space---3, 0.75rem) var(--origam-space---4, 1rem);
      border-block-end: 1px solid var(--origam-color__border---subtle, rgba(0, 0, 0, 0.04));
      display: flex;
      flex-direction: column;
      gap: var(--origam-space---1, 0.25rem);
      transition: background 100ms;

      &:last-child {
        border-block-end: none;
      }

      &:hover {
        background: var(--origam-color__action--primary---bgSubtle, rgba(124, 58, 237, 0.03));

        .prop-list__copy-icon {
          opacity: 1;
        }
      }
    }

    &__dt {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--origam-space---2, 0.5rem);
      min-block-size: 1.75rem;
    }

    &__name-btn {
      display: inline-flex;
      align-items: center;
      padding: 0;
      gap: var(--origam-space---1, 0.25rem);
      --origam-btn---font-size: var(--origam-font__size---md, 0.875rem);
      font-weight: 600;
      color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__name-mono {
      font-family: var(--origam-font__family---mono, monospace);
      font-size: var(--origam-font__size---md, 0.875rem);
      font-weight: 600;
      color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__copy-icon {
      margin-inline-start: var(--origam-space---2, 0.5rem);
      opacity: 0;
      transition: opacity 100ms;
      color: var(--origam-color__text---tertiary, #737373);
    }

    &__required-badge {
      flex-shrink: 0;
    }

    &__type-link {
      text-decoration: none;
      color: inherit;
      display: inline-flex;
    }

    &__type-chip {
      font-family: var(--origam-font__family---mono, monospace);
      font-size: 0.65rem;
      white-space: normal;
      height: auto;
      padding-block: 1px;
      line-height: 1.3;

      &--primitive {
        color: var(--origam-color__text---secondary, #525252);
      }
    }

    &__default {
      font-family: var(--origam-font__family---mono, monospace);
      font-size: var(--origam-font__size---sm, 0.75rem);
      color: var(--origam-color__text---tertiary, #737373);
      white-space: nowrap;
    }

    &__dd {
      margin: 0;
      font-size: var(--origam-font__size---md, 0.875rem);
      line-height: 1.6;
      color: var(--origam-color__text---secondary, #525252);
      padding-inline-start: 0;
    }

    &__slot-props-code,
    &__cssvar-name-code,
    &__exposed-type-code {
      display: inline-flex;
      max-inline-size: 100%;
    }
  }
</style>
