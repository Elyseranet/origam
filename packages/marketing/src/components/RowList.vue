<template>
  <dl
    :id="id"
    :style="RowListStyles"
    :class="RowListClasses"
    v-bind="$attrs"
  >
    <slot name="default">
      <div
        v-for="(item, key) in props.items"
        :key="key"
        class="prop-list__item"
        :data-cy="`prop-row-${key}`"
      >
        <slot
          name="item"
          v-bind="item">
          <dt class="prop-list__dt">
            <slot name="title" v-bind="{title: item.name}">
              <origam-row gutters="5">
                <origam-col cols="auto">
                  <slot name="name" v-bind="{name: item[itemName]}">
                    <div class="prop-list__name-btn">
                      <span class="prop-list__name-mono">{{ item[itemName] }}</span>
                      <origam-clipboard
                        size="x-small"
                        elevation="0"
                        :value="item[itemName]"
                        class="prop-list__copy-icon"
                        :aria-label="`Copy ${item[itemName]} attribute`"
                      />
                    </div>
                  </slot>
                </origam-col>
                <origam-col cols="auto">
                  <slot name="required" v-bind="{required: item[itemRequired]}">
                    <origam-chip
                      v-if="item[itemRequired]"
                      size="x-small"
                      color="danger"
                      pill
                      class="prop-list__required-badge"
                    >
                      {{ t('components.detail.props.required', 'required') }}
                    </origam-chip>
                  </slot>
                </origam-col>
                <origam-col>
                  <slot name="type" v-bind="item[itemType]">
                    <nuxt-link
                      v-if="item[itemType].kind !== 'primitive' && item[itemType].slug"
                      :to="`/types/${item[itemType].slug}`"
                      class="prop-list__type-link"
                    >
                      <origam-chip
                        size="x-small"
                        :color="item[itemType].kind === 'enum' ? 'secondary' : 'primary'"
                        class="prop-list__type-chip"
                      >
                        {{ item[itemType].label }}
                      </origam-chip>
                    </nuxt-link>
                    <origam-chip
                      v-else
                      size="x-small"
                      class="prop-list__type-chip prop-list__type-chip--primitive"
                    >
                      {{ item[itemType].label }}
                    </origam-chip>
                  </slot>
                </origam-col>
                <origam-col cols="auto">
                  <slot name="value" v-bind="{value: item[itemValue]}">
                    <span
                      v-if="item[itemValue] && item[itemValue] !== 'undefined'"
                      class="prop-list__default"
                    >{{ item[itemValue] }}</span>
                  </slot>
                </origam-col>
              </origam-row>
            </slot>
          </dt>
          <dd class="prop-list__dd">
            <slot name="description" v-bind="{key: item[itemDsKey], fallback: item[itemDsFallback]}">
              {{ t(item[itemDsKey], item[itemDsFallback]) }}
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
    itemName: 'name',
    itemType: 'type',
    itemValue: 'defaultValue',
    itemRequired: 'required',
    itemDsKey: 'descriptionKey',
    itemDsFallback: 'descriptionFallback',
  })

  defineEmits<IRowListEmits>()

  defineSlots<IRowListSlots>()

  const { t } = useT()

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
      padding: 0;
      gap: var(--origam-space---1, 0.25rem);
      --origam-btn---font-size: var(--origam-font-size---sm, 0.875rem);
      font-weight: 600;
      color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__name-mono {
      font-family: var(--origam-font__family---mono, monospace);
      font-size: var(--origam-font-size---sm, 0.875rem);
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
      font-size: var(--origam-font-size---xs, 0.75rem);
      color: var(--origam-color__text---tertiary, #737373);
      white-space: nowrap;
    }

    &__dd {
      margin: 0;
      font-size: var(--origam-font-size---sm, 0.875rem);
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