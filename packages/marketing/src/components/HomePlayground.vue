<template>
  <section
    id="playground"
    class="home-playground"
    aria-labelledby="playground-heading"
  >
    <header class="home-playground__intro">
      <p class="home-playground__eyebrow">
        {{ t('home.playground.eyebrow', 'CODE EXAMPLE') }}
      </p>

      <origam-title
        id="playground-heading"
        tag="h2"
        class="home-playground__title"
      >
        {{ t('home.playground.title', 'A few lines, real components.') }}
      </origam-title>
    </header>

    <figure class="home-playground__window">
      <origam-sheet
        tag="div"
        :rounded="PLAYGROUND_FRAME_RADIUS"
        :style="PLAYGROUND_FRAME_VARS"
        border
        border-color="var(--origam-color__border---default)"
        class="home-playground__frame"
      >
        <div
          class="home-playground__toolbar"
          role="toolbar"
          :aria-label="t('a11y.playground_toolbar', 'Editor toolbar')"
        >
                    <span
                      class="home-playground__traffic"
                      aria-hidden="true"
                    >
                        <span class="home-playground__dot home-playground__dot--red" />
                        <span class="home-playground__dot home-playground__dot--yellow" />
                        <span class="home-playground__dot home-playground__dot--green" />
                    </span>

          <span class="home-playground__tab">
                        {{ t('home.playground.file', 'App.vue') }}
                    </span>
        </div>

        <div class="home-playground__panes">
          <origam-code
            :code="PLAYGROUND_SNIPPET"
            lang="vue"
            line-numbers
            copyable
            rounded="none"
            class="home-playground__code"
            data-cy="playground-code"
          />

          <div class="home-playground__preview">
            <origam-card
              tag="div"
              rounded="lg"
              border
              inert
              lang="en"
              class="home-playground__preview-card"
              data-cy="playground-preview"
            >
              <origam-title tag="h3">
                {{ PLAYGROUND_SAMPLE.title }}
              </origam-title>
              <p class="home-playground__preview-text">
                {{ PLAYGROUND_SAMPLE.text }}
              </p>
              <origam-btn
                color="primary"
                append-icon="mdi-arrow-right"
                class="home-playground__preview-btn"
              >
                {{ PLAYGROUND_SAMPLE.cta }}
              </origam-btn>
            </origam-card>
          </div>
        </div>
      </origam-sheet>

      <figcaption class="home-playground__caption">
        {{ t('home.playground.caption', 'The preview renders the code shown on the left.') }}
      </figcaption>
    </figure>
  </section>
</template>

<script setup lang="ts">
import { useT } from '~/composables/useT'
import {
    PLAYGROUND_FRAME_RADIUS,
    PLAYGROUND_FRAME_VARS,
    PLAYGROUND_SAMPLE,
    PLAYGROUND_SNIPPET
} from '~/consts/playground.const'

const { t } = useT()
</script>

<style scoped lang="scss">
.home-playground {
    padding-block: var(--origam-space---24, 6rem);
    padding-inline: var(--origam-space---6, 1.5rem);
    max-width: 72rem;
    margin-inline: auto;
    width: 100%;
    box-sizing: border-box;

    &__intro {
        text-align: center;
        margin-block-end: var(--origam-space---12, 3rem);
    }

    &__eyebrow {
        margin: 0 0 var(--origam-space---3, 0.75rem);
        font-size: var(--origam-font-size---xs, 0.75rem);
        font-weight: var(--origam-font__weight---semibold, 600);
        color: var(--origam-color__action--primary---fgSubtle, #6d28d9);
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    &__title {
        margin: 0;
        font-size: var(--origam-font-size---section, 3rem);
        font-weight: var(--origam-font__weight---bold, 700);
        line-height: 1;
        letter-spacing: var(--origam-letter-spacing---tight, -0.03em);
        color: var(--origam-color__text---primary, #0a0a0a);
    }

    &__window {
        margin: 0;
    }

    &__frame {
        overflow: hidden;
    }

    &__toolbar {
        display: flex;
        align-items: center;
        gap: var(--origam-space---3, 0.75rem);
        padding: var(--origam-space---2, 0.5rem) var(--origam-space---4, 1rem);
        background-color: var(--origam-color__surface---overlay, #f5f5f5);
        border-block-end: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
    }

    &__traffic {
        display: flex;
        align-items: center;
        gap: var(--origam-space---1, 0.25rem);
        flex-shrink: 0;
    }

    &__dot {
        display: block;
        width: 12px;
        height: 12px;
        border-radius: 50%;

        &--red    { background-color: #FF5F57; }
        &--yellow { background-color: #FFBC2E; }
        &--green  { background-color: #28C840; }
    }

    &__tab {
        flex: 1;
        font-size: var(--origam-font-size---sm, 0.875rem);
        font-weight: var(--origam-font__weight---medium, 500);
        color: var(--origam-color__text---secondary, #525252);
        font-family: var(--origam-font__family---mono, ui-monospace, monospace);
    }

    &__panes {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        min-block-size: 320px;
    }

    &__code {
        --origam-code---border-width: 0;
        border-inline-end: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
        overflow: hidden;
        font-size: var(--origam-font-size---sm, 0.875rem);
    }

    &__preview {
        display: grid;
        place-items: center;
        padding: var(--origam-space---8, 2.5rem);
        background-color: var(--origam-color__surface---raised, #fafafa);
        background-image: radial-gradient(var(--origam-color__border---default, rgba(0, 0, 0, 0.08)) 1.5px, transparent 1.5px);
        background-size: 18px 18px;
    }

    &__preview-card {
        display: flex;
        flex-direction: column;
        gap: var(--origam-space---3, 0.75rem);
        align-items: flex-start;
        max-inline-size: 22rem;
        padding: var(--origam-space---6, 1.5rem);
    }

    &__preview-text {
        margin: 0;
        font-size: var(--origam-font-size---sm, 0.875rem);
        line-height: 1.5;
        color: var(--origam-color__text---secondary, #525252);
    }

    &__preview-btn {
        margin-block-start: var(--origam-space---2, 0.5rem);
    }

    &__caption {
        display: block;
        margin-block-start: var(--origam-space---4, 1rem);
        font-size: var(--origam-font-size---sm, 0.875rem);
        color: var(--origam-color__text---secondary, #525252);
        text-align: center;
    }
}

@media (max-width: 800px) {
    .home-playground {
        &__panes {
            grid-template-columns: 1fr;
        }

        &__code {
            border-inline-end: 0;
            border-block-end: 1px solid var(--origam-color__border---default, rgba(0, 0, 0, 0.08));
        }
    }
}
</style>
