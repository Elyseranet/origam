<script setup lang="ts">
    import { computed, ref } from 'vue'

    import { useT } from '~/composables/useT'

    import { WHY_DEMO_THEMES } from '~/consts/why-origam-demo.const'
    import { buildComponentsExtract } from '~/utils/why-origam-demo.util'

    const { t } = useT()

    const selectedTheme = ref<string>('origam')
    const selectedMode = ref<'light' | 'dark'>('light')
    const demoSwitch = ref<boolean>(true)
    const demoField = ref<string>('')

    const activeEntry = computed(() => WHY_DEMO_THEMES.find(entry => entry.key === selectedTheme.value) ?? null)

    const activeBrandTheme = computed(() => {
        const themes = activeEntry.value?.themes ?? []

        return themes.find(theme => theme.mode === selectedMode.value) ?? themes[0] ?? null
    })

    /**
     * ⚠️ MEASURED. Five of the seven brands (glass, apple, cartoon, geek,
     * material) declare `components` on their LIGHT entry only; ecom and
     * editorial declare it on both. Reading the mode-matching entry alone
     * therefore printed an empty `components: { }` for those five in dark
     * mode — on the panel whose whole job is to show the props that did it.
     *
     * The fallback is not cosmetic: at runtime `activeDefaultsFor` merges
     * every installed theme carrying the name, so the light entry's props DO
     * apply in dark. Falling back to the sibling prints what actually ran.
     */
    const activePropsSource = computed(() => {
        const themes = activeEntry.value?.themes ?? []

        return themes.find(theme => theme.mode === selectedMode.value && theme.components)
            ?? themes.find(theme => theme.components)
            ?? null
    })

    const codeExtract = computed(() => buildComponentsExtract(activePropsSource.value))

    const activeLabel = computed(() => activeBrandTheme.value?.label ?? selectedTheme.value)

    /**
     * Built as a variable, never inlined as a template-literal directly inside
     * `t(...)` — `i18n-check.mjs`'s Channel A extractor matches ANY quote char
     * (including a backtick) as the opening delimiter of the first `t(` argument
     * and would otherwise capture the raw `${themeKey}` placeholder as a bogus
     * "referenced but undefined" key. The 8 concrete keys this resolves to are
     * declared in `DYNAMIC_KEY_ALLOWLIST` (Channel C) in that script.
     */
    function identityKey (themeKey: string): string {
        return `why_origam.demo.identity_${themeKey}`
    }

    /**
     * Roving focus for the identity radiogroup. Arrow keys MOVE and SELECT in
     * one step (the WAI-ARIA radio pattern), Home / End jump to the ends, and
     * Tab enters or leaves the whole group in a single stop.
     */
    function moveSelection (event: KeyboardEvent, index: number): void {
        const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End']

        if (!keys.includes(event.key)) {
            return
        }

        event.preventDefault()

        const last = WHY_DEMO_THEMES.length - 1
        let next = index

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            next = index === last ? 0 : index + 1
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            next = index === 0 ? last : index - 1
        } else if (event.key === 'Home') {
            next = 0
        } else {
            next = last
        }

        selectedTheme.value = WHY_DEMO_THEMES[next].key

        const group = event.currentTarget as HTMLElement | null
        const buttons = group?.closest('[role="radiogroup"]')?.querySelectorAll<HTMLElement>('[role="radio"]')

        buttons?.[next]?.focus()
    }
</script>

<template>
    <section
        class="why-demo"
        aria-labelledby="why-demo-title"
        data-cy="why-demo"
    >
        <origam-container>
            <header class="why-demo__header why-section">
                <p class="why-section__eyebrow">
                    {{ t('why_origam.demo.eyebrow', 'SEE IT RUN') }}
                </p>

                <origam-title
                    id="why-demo-title"
                    tag="h2"
                    class="why-section__title"
                >
                    <span class="why-section__title-line">{{ t('why_origam.demo.title_line1', 'One object.') }}</span>
                    <span class="why-section__title-line why-section__title-line--muted">{{ t('why_origam.demo.title_line2', 'Every identity.') }}</span>
                </origam-title>

                <p class="why-section__subtitle">
                    {{ t('why_origam.demo.subtitle', 'The panel on the right is the theme that painted the panel on the left — read from the theme object itself, not retyped. Switch identities and watch both sides move together.') }}
                </p>
            </header>

            <origam-sheet
                tag="div"
                rounded="lg"
                border
                elevation="md"
                class="why-demo__instrument"
                data-cy="why-demo-instrument"
            >
                <div class="why-demo__toolbar">
                    <p
                        id="why-demo-axis-brand"
                        class="why-demo__axis"
                    >
                        {{ t('why_origam.demo.axis_brand', 'Brand') }}
                    </p>

                    <div
                        role="radiogroup"
                        class="why-demo__identities"
                        aria-labelledby="why-demo-axis-brand"
                    >
                        <origam-btn
                            v-for="(entry, index) in WHY_DEMO_THEMES"
                            :key="entry.key"
                            role="radio"
                            variant="outlined"
                            size="small"
                            rounded="pill"
                            class="why-demo__identity"
                            :active="entry.key === selectedTheme"
                            :aria-checked="entry.key === selectedTheme"
                            :tabindex="entry.key === selectedTheme ? 0 : -1"
                            :data-cy="`why-demo-identity-${entry.key}`"
                            @click="selectedTheme = entry.key"
                            @keydown="moveSelection($event, index)"
                        >
                            <origam-theme-provider
                                tag="span"
                                :theme="entry.key"
                                :mode="selectedMode"
                                class="why-demo__swatch-wrap"
                            >
                                <span
                                    class="why-demo__swatch"
                                    aria-hidden="true"
                                />
                            </origam-theme-provider>

                            {{ t(identityKey(entry.key), entry.themes[0]?.label ?? entry.key) }}
                        </origam-btn>
                    </div>

                    <p
                        id="why-demo-axis-mode"
                        class="why-demo__axis"
                    >
                        {{ t('why_origam.demo.axis_mode', 'Mode') }}
                    </p>

                    <div
                        role="radiogroup"
                        class="why-demo__modes"
                        aria-labelledby="why-demo-axis-mode"
                    >
                        <origam-btn
                            role="radio"
                            variant="outlined"
                            size="small"
                            rounded="pill"
                            prepend-icon="mdi-white-balance-sunny"
                            class="why-demo__mode"
                            :active="selectedMode === 'light'"
                            :aria-checked="selectedMode === 'light'"
                            :tabindex="selectedMode === 'light' ? 0 : -1"
                            data-cy="why-demo-mode-light"
                            @click="selectedMode = 'light'"
                        >
                            {{ t('why_origam.demo.mode_light', 'Light') }}
                        </origam-btn>

                        <origam-btn
                            role="radio"
                            variant="outlined"
                            size="small"
                            rounded="pill"
                            prepend-icon="mdi-weather-night"
                            class="why-demo__mode"
                            :active="selectedMode === 'dark'"
                            :aria-checked="selectedMode === 'dark'"
                            :tabindex="selectedMode === 'dark' ? 0 : -1"
                            data-cy="why-demo-mode-dark"
                            @click="selectedMode = 'dark'"
                        >
                            {{ t('why_origam.demo.mode_dark', 'Dark') }}
                        </origam-btn>
                    </div>
                </div>

                <origam-divider />

                <p
                    class="why-demo__live"
                    aria-live="polite"
                >
                    {{ t('why_origam.demo.announcement', 'Identity: {name}', { name: activeLabel }) }}
                </p>

                <origam-grid
                    tag="div"
                    columns="repeat(auto-fit, minmax(19rem, 1fr))"
                    gap="none"
                    class="why-demo__split"
                >
                    <origam-grid-item
                        tag="div"
                        class="why-demo__pane why-demo__pane--stage"
                    >
                        <p class="why-demo__pane-label">
                            {{ t('why_origam.demo.pane_render', 'Rendered now') }}
                        </p>

                        <origam-theme-provider
                            tag="div"
                            :theme="selectedTheme"
                            :mode="selectedMode"
                            data-cy="why-demo-stage"
                        >
                            <!--
                              The backdrop is a REAL element inside the provider,
                              not the provider itself: OrigamThemeProvider renders
                              `display: contents` on purpose ("a provider is not a
                              surface", OrigamThemeProvider.vue:98), so it draws no
                              box and any background / border / radius put on it is
                              silently dropped. Being inside the provider is what
                              lets it read the selected identity's tokens.
                            -->
                            <div class="why-demo__stage">
                                <origam-sheet
                                    tag="div"
                                    class="why-demo__stage-surface"
                                >
                                <origam-card
                                    class="why-demo__card"
                                    :title="t('why_origam.demo.card_title', 'Release 2.18')"
                                    :subtitle="t('why_origam.demo.card_subtitle', 'Shipping today')"
                                    :text="t('why_origam.demo.card_text', 'Not one line of this card is styled by this page. Every radius, border, shadow and tone comes from the identity you picked.')"
                                >
                                    <template #header.prepend>
                                        <origam-avatar
                                            icon="mdi-shape-outline"
                                            color="primary"
                                            class="why-demo__avatar"
                                            :aria-label="t('why_origam.demo.avatar_label', 'origam')"
                                        />
                                    </template>

                                    <template #footer>
                                        <div class="why-demo__controls">
                                            <origam-btn
                                                color="primary"
                                                append-icon="mdi-arrow-right"
                                                data-cy="why-demo-card-primary"
                                            >
                                                {{ t('why_origam.demo.card_cta', 'Deploy') }}
                                            </origam-btn>

                                            <origam-btn data-cy="why-demo-card-secondary">
                                                {{ t('why_origam.demo.card_cta_secondary', 'Changelog') }}
                                            </origam-btn>

                                            <origam-chip data-cy="why-demo-card-chip">
                                                {{ t('why_origam.demo.card_chip', 'Stable') }}
                                            </origam-chip>

                                            <!--
                                              `aria-label`, not the visible
                                              `label` prop: under identities
                                              that set `origam-switch:
                                              { border: true }` (editorial,
                                              glass, cartoon) the border box
                                              wraps the track only and the
                                              label text spills outside it.
                                              Reported — until it is fixed, a
                                              visible label here would be a
                                              rendering defect on 3 of the 8
                                              identities.
                                            -->
                                            <origam-switch
                                                v-model="demoSwitch"
                                                color="primary"
                                                :aria-label="t('why_origam.demo.card_switch', 'Auto-update')"
                                                data-cy="why-demo-card-switch"
                                            />
                                        </div>

                                        <origam-text-field
                                            v-model="demoField"
                                            class="why-demo__field"
                                            :label="t('why_origam.demo.card_field_label', 'Release tag')"
                                            :placeholder="t('why_origam.demo.card_field_placeholder', 'v2.18.4')"
                                            data-cy="why-demo-card-field"
                                        />
                                    </template>
                                </origam-card>
                                </origam-sheet>
                            </div>
                        </origam-theme-provider>

                        <p class="why-demo__disclaimer">
                            {{ t('why_origam.demo.disclaimer', 'Live components from the published origam package. Not a screenshot.') }}
                        </p>
                    </origam-grid-item>

                    <origam-grid-item
                        tag="div"
                        class="why-demo__pane why-demo__pane--code"
                    >
                        <p class="why-demo__pane-label">
                            {{ t('why_origam.demo.pane_code', 'The props that did it') }}
                        </p>

                        <origam-code
                            :key="`${selectedTheme}-${selectedMode}`"
                            lang="ts"
                            :code="codeExtract"
                            :wrap="true"
                            class="why-demo__code"
                            data-cy="why-demo-code"
                        />

                        <p class="why-demo__disclaimer">
                            {{ t('why_origam.demo.code_note', 'What this identity declares — the rest is inherited from the baseline. Props, not a stylesheet.') }}
                        </p>
                    </origam-grid-item>
                </origam-grid>
            </origam-sheet>

            <p class="why-demo__outro">
                <origam-btn
                    variant="text"
                    append-icon="mdi-arrow-right"
                    href="/theming"
                    data-cy="why-demo-builder"
                >
                    {{ t('why_origam.demo.cta_builder', 'Build your own identity') }}
                </origam-btn>
            </p>
        </origam-container>
    </section>
</template>

<style scoped lang="scss">
    @use '../assets/scss/why-section' as why;

    .why-section {
        @include why.why-section-header;
    }

    .why-demo {
        padding-block: var(--origam-space---24, 6rem);
        background: var(--origam-color__surface---sunken);
        border-block: 1px solid var(--origam-color__border---subtle);

        &__header {
            margin-block-end: var(--origam-space---10, 2.5rem);
        }

        /*
         * The instrument is the one object on this page allowed to look like a
         * device: it frames the only thing the visitor came to check.
         */
        &__instrument {
            overflow: hidden;
            /* CSS-first responsive: the toolbar reacts to the INSTRUMENT's
               width, not the viewport's, so it stays correct if the demo is
               ever dropped into a narrower column. */
            container-type: inline-size;
            container-name: why-demo;
        }

        /*
         * The two axes are orthogonal (brand × mode) and this page is where
         * that is explained, so the toolbar names them instead of running ten
         * equal-looking options together on one line. Two label/group rows,
         * aligned on a shared column.
         */
        &__toolbar {
            display: grid;
            grid-template-columns: auto minmax(0, 1fr);
            align-items: start;
            gap: var(--origam-space---3, 0.75rem) var(--origam-space---4, 1rem);
            padding: var(--origam-space---4, 1rem);
        }

        &__axis {
            margin: 0;
            padding-block-start: 0.7rem;
            font-size: var(--origam-font-size---xs, 0.75rem);
            font-weight: var(--origam-font__weight---semibold, 600);
            letter-spacing: var(--origam-letter-spacing---wide, 0.08em);
            text-transform: uppercase;
            color: var(--origam-color__text---tertiary);
        }

        &__identities,
        &__modes {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--origam-space---2, 0.5rem);
        }

        &__identity,
        &__mode {
            --origam-btn---min-height: 44px;
        }

        /*
         * ⚠️ MEASURED DS GAP, not a preference. The DS already ships a selected
         * state for outlined buttons (`&--variant-outlined &--active`), but it
         * fills with `var(--origam-btn---background-color-active,
         * var(--origam-btn---background-color))`, and only `editorial` and
         * `material` declare the `-active` half. On `geek` the fallback resolves
         * to #fbf5ff — a near-white SURFACE tone — and the rule also repaints
         * the border to match, so the selected pill measured
         * `background rgb(251,245,255)` / `border rgb(251,245,255)` against a
         * light-violet section while its unselected siblings kept a magenta
         * `rgba(217,70,239,0.55)` outline: the chosen option read as the
         * DISABLED one. Six of the eight identities are in that case.
         *
         * So the selected state is pinned to the semantic action pair, which
         * every identity declares and which the DS guarantees legible against
         * itself. Reported upstream — the real fix is for the token to have a
         * non-surface default.
         */
        &__identity[aria-checked='true'],
        &__mode[aria-checked='true'] {
            --origam-btn---background-color: var(--origam-color__action--primary---bg);
            --origam-btn---border-color: var(--origam-color__action--primary---bg);
            --origam-btn---color: var(--origam-color__action--primary---fg);
        }

        &__swatch-wrap {
            display: inline-flex;
            margin-inline-end: var(--origam-space---2, 0.5rem);
        }

        /* Painted by the identity it advertises — no hardcoded brand colour. */
        &__swatch {
            inline-size: 0.75rem;
            block-size: 0.75rem;
            border-radius: var(--origam-radius---pill, 9999px);
            background: var(--origam-color__action--primary---bg);
            box-shadow: 0 0 0 1px var(--origam-color__border---default);
        }

        &__live {
            position: absolute;
            inline-size: 1px;
            block-size: 1px;
            margin: -1px;
            padding: 0;
            overflow: hidden;
            clip-path: inset(50%);
            white-space: nowrap;
        }

        &__split {
            border-block-start: 1px solid var(--origam-color__border---subtle);
        }

        &__pane {
            display: flex;
            flex-direction: column;
            gap: var(--origam-space---3, 0.75rem);
            padding: var(--origam-space---5, 1.25rem);
            min-inline-size: 0;

            &--code {
                border-inline-start: 1px solid var(--origam-color__border---subtle);
            }
        }

        &__pane-label {
            margin: 0;
            font-size: var(--origam-font-size---xs, 0.75rem);
            font-weight: var(--origam-font__weight---semibold, 600);
            letter-spacing: var(--origam-letter-spacing---wide, 0.08em);
            text-transform: uppercase;
            color: var(--origam-color__text---tertiary);
        }

        /*
         * The stage carries the SELECTED identity. It deliberately keeps its own
         * frame so the boundary between "page theme" and "previewed theme" is
         * readable — that boundary is the whole demonstration.
         */
        /*
         * ⚠️ MEASURED. The stage must reproduce the previewed identity's PAGE,
         * not just drop its surfaces onto whatever the host page is painted in.
         *
         * `glass` makes the difference visible: its surfaces are deliberately
         * translucent — card `rgba(255,255,255,.05)` over sheet
         * `rgba(255,255,255,.05)` — and are meant to sit on the four radial
         * gradients the theme puts on `body`. On the first build the stage had
         * no backdrop of its own, so in glass/dark the whole translucent stack
         * composited onto the host page's LIGHT violet section and the primary
         * button measured **1.09:1** (#ddd6fe text on an effectively light
         * ground) — invisible. Every other identity/mode pair was ≥ 5.49.
         *
         * So the stage paints the page: an opaque base plus the identity's own
         * `--origam-page---background-image`. There is no DS-wide token for the
         * opaque half — only `glass.css` declares one, under its own brand
         * name — hence the three-step fallback. Reported: a generic
         * `--origam-page---background-color`, declared by every theme, would
         * let the middle step (and base.css's own body hack) be deleted.
         */
        &__stage {
            border: 1px solid var(--origam-color__border---subtle);
            border-radius: var(--origam-radius---card, 10px);
            overflow: hidden;
            flex: 1;
            background-color: var(
                --origam-page---background-color,
                var(--origam-glass---page-bg-color, var(--origam-color__surface---default))
            );
            background-image: var(--origam-page---background-image, none);
            /*
             * `fixed` on purpose, and it is what the site's own `body` does
             * (assets/css/base.css). `glass`'s backdrop is four radial
             * gradients sized to the PAGE; sized to this ~420px box instead,
             * all four overlap and saturate it to a flat pale lavender, which
             * is how a stage measuring 16.39:1 rendered white-on-white. Sizing
             * them against the viewport shows the stage as a window onto the
             * same backdrop the real page paints.
             */
            background-attachment: fixed;
        }

        &__stage-surface {
            padding: var(--origam-space---5, 1.25rem);
            block-size: 100%;
        }

        /*
         * Under identities that give the avatar a ring or a hard shadow
         * (cartoon, glass) the card header title butts straight against it —
         * OrigamAvatar exposes `margin` / `marginInline` but no logical
         * per-edge prop, so the inline-end gap cannot be set props-first.
         */
        &__avatar {
            margin-inline-end: var(--origam-space---4, 1rem);
        }

        &__controls {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--origam-space---3, 0.75rem);
        }

        &__field {
            margin-block-start: var(--origam-space---4, 1rem);
        }

        &__code {
            flex: 1;
        }

        &__disclaimer {
            margin: 0;
            font-size: var(--origam-font-size---xs, 0.75rem);
            color: var(--origam-color__text---tertiary);
        }

        &__outro {
            margin-block-start: var(--origam-space---6, 1.5rem);
        }
    }

    /*
     * Under ~30rem the axis-label column costs a third of the row and the eight
     * identities drop to two per line over four lines. The labels move above
     * their group instead — the axis names stay, the options get the width.
     * Keyed on the INSTRUMENT's width, not the viewport's, so the demo stays
     * correct if it is ever dropped into a narrower column.
     */
    @container why-demo (max-width: 30rem) {
        .why-demo__toolbar {
            grid-template-columns: minmax(0, 1fr);
            gap: var(--origam-space---2, 0.5rem);
        }

        .why-demo__axis {
            padding-block-start: 0;
        }
    }

</style>
