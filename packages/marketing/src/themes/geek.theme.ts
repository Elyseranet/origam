import type { IOrigamTheme } from 'origam/interfaces'

export const geekLightTheme: IOrigamTheme = {
    name: 'geek',
    label: 'Geek',
    vars: {
        rounded: {
            card: '4px',
            btn: '4px',
            pill: '4px',
            sm: '2px',
            md: '4px',
            lg: '4px'
        },
        color: {
            surface: {
                default: '#f6f0ff',
                raised: '#ffffff',
                sunken: '#fbf5ff',
                overlay: '#fbf5ff',
                disabled: '#e9e1f5'
            },
            text: {
                primary: '#1a0f2e',
                secondary: '#5b3e8c',
                tertiary: '#7e5fb0',
                disabled: '#b5a0d8',
                inverse: '#ffffff',
                onColor: '#ffffff',
                ink: '#1a0f2e'
            },
            action: {
                primary: {
                    bg: '#7c3aed',
                    bgHover: '#6d28d9',
                    bgSubtle: 'rgba(124, 58, 237, 0.10)',
                    bgDisabled: '#e9e1f5',
                    fg: '#ffffff',
                    fgSubtle: '#6d28d9',
                    fgDisabled: '#b5a0d8'
                },
                secondary: {
                    bg: '#fbf5ff',
                    bgHover: '#f3e8ff',
                    bgDisabled: '#f6f0ff',
                    fg: '#1a0f2e',
                    fgDisabled: '#b5a0d8'
                },
                ghost: {
                    bg: 'rgba(0, 0, 0, 0)',
                    bgHover: 'rgba(124, 58, 237, 0.08)',
                    bgDisabled: 'rgba(0, 0, 0, 0)',
                    fg: '#7c3aed',
                    fgDisabled: '#b5a0d8'
                }
            },
            border: {
                default: 'rgba(168, 85, 247, 0.28)',
                subtle: 'rgba(168, 85, 247, 0.14)',
                strong: 'rgba(217, 70, 239, 0.55)',
                focus: '#7c3aed',
                'subtle-alpha': 'rgba(168, 85, 247, 0.12)',
                ghost: 'rgba(168, 85, 247, 0.16)'
            },
            feedback: {
                success: {
                    bg: '#16a34a',
                    bgSubtle: 'rgba(22, 163, 74, 0.1)',
                    fg: '#000000',
                    // Fix source #1 (SYNTHESE geek §5.1): #15803d measured
                    // 4.4:1 on the lavender surface (< AA). green-800 clears
                    // AA at ~6:1 (same fix already applied on glass theme).
                    fgSubtle: '#166534',
                    border: '#16a34a'
                },
                warning: {
                    bg: '#d97706',
                    bgSubtle: 'rgba(217, 119, 6, 0.1)',
                    fg: '#000000',
                    // Fix source #1 (SYNTHESE geek §5.1): #b45309 measured
                    // 4.4:1 on the lavender surface (< AA). amber-800 clears
                    // AA at ~6.2:1.
                    fgSubtle: '#92400e',
                    border: '#d97706'
                },
                danger: {
                    bg: '#dc2626',
                    bgSubtle: 'rgba(220, 38, 38, 0.1)',
                    fg: '#ffffff',
                    fgSubtle: '#b91c1c',
                    border: '#dc2626'
                },
                info: {
                    bg: '#2563eb',
                    bgSubtle: 'rgba(37, 99, 235, 0.1)',
                    fg: '#ffffff',
                    fgSubtle: '#1d4ed8',
                    border: '#2563eb'
                }
            },
            'btn-primary-text': '#ffffff',
            'btn-secondary-bg': 'transparent',
            'btn-secondary-border': 'rgba(217, 70, 239, 0.55)',
            'btn-secondary-text': '#a21caf'
        },
        // ⛔ ELEVATION = le tier `shadow` sémantique. Rampe de glows néon croissants
        // (violet #7c3aed / cyan #0891b2). Les composants consomment via la prop
        // `elevation` (ci-dessous), jamais de shadow inline.
        shadow: {
            none: 'none',
            xs: '0 1px 3px rgba(124, 58, 237, 0.06), 0 8px 24px -16px rgba(124, 58, 237, 0.20)',
            sm: 'rgba(217, 70, 239, 0.35) 0px 0px 10px -4px',
            md: '0 4px 12px -4px rgba(124, 58, 237, 0.30), 0 0 16px -4px rgba(8, 145, 178, 0.20)',
            lg: 'inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 8px 24px -8px rgba(124, 58, 237, 0.55), 0 0 32px -8px rgba(8, 145, 178, 0.30)',
            xl: 'rgba(217, 70, 239, 0.50) 0px 0px 18px -4px, rgba(8, 145, 178, 0.40) 0px 0px 30px -8px, rgba(255, 255, 255, 0.40) 0px 1px 0px 0px inset'
        }
    },
    // ⛔ PROPS D'ABORD (logique DS). Overrides geek superposés sur la baseline
    // `origam` (deep-merge). Identité terminal/dev/néon : coins peu arrondis
    // (rounded sm), monospace, glow néon via la prop `elevation`. Seules la
    // couleur de bordure violette et la teinte de glow (non exprimables en props)
    // restent dans `vars`/`cssVars`.
    //
    // Source unique : SYNTHESE-geek-theme.md §3 (bloc validé, 6/6 familles).
    // Chaque prop a été vérifiée contre l'interface DS réelle (grep sur
    // `packages/ds/src/interfaces/**`) avant écriture — divergences trouvées
    // vs. la synthèse littérale, corrigées ici et documentées inline :
    //   • `origam-chip` : `variant` retiré — IChipProps N'A PAS de `variant`
    //     (seule ITabsProps/IBtnProps en ont un) ; c'était déjà un no-op
    //     silencieux dans l'ancien fichier (même bug que glass §3 fix #3).
    //   • `origam-tabs` : `border` retiré — ITabsProps n'étend PAS
    //     IBorderProps (confirmé : extends ICommonsComponentProps, ITagProps,
    //     IDirectionProps, IDensityProps, IRoundedProps, IColorProps,
    //     IBgColorProps, IGroupProps — aucune IBorderProps).
    //   • `origam-pagination` : `rounded` retiré — IPaginationProps n'étend
    //     PAS IRoundedProps (extends IBorderProps + IElevationProps oui,
    //     IRoundedProps non) ; le radius passe par cssVar
    //     `--origam-pagination---border-radius` (seul hook réel).
    //   • `origam-tooltip` : absent d'ici — ITooltipProps n'a NI IRoundedProps
    //     NI IBorderProps (extends IOverlayProps, IColorProps, IBgColorProps,
    //     IDimensionProps, IActivatorProps, ILocationStrategyProps,
    //     IScrollStrategyProps, ILazyProps, ITransitionComponentProps,
    //     IScrimProps, ITypographyProps — confirmé). Le radius "coins nets"
    //     passe par le seul hook réel du composant,
    //     `--origam-tooltip---border-radius` (cssVars ci-dessous) ; aucun
    //     hook border n'existe (ni cssVar ni prop) — DS GAP, non applicable.
    //   • `origam-dialog` : `rounded`/`border`/`elevation` SONT valides —
    //     OrigamDialog.vue enveloppe un `<origam-card v-bind="cardProps">`
    //     interne (`cardProps = origamCardRef.value?.filterProps(props)`),
    //     donc ces props sont forwardées et rendues par le VRAI OrigamCard
    //     (même glow néon que `origam-card` partout ailleurs) — pas un no-op.
    //     Vérifié runtime (Playwright, /theming, dark+light) : la card
    //     interne rend bien rounded/border/elevation geek, ET le halo
    //     `--origam-dialog---box-shadow` (cssVars) s'ajoute par-dessus.
    //   • `origam-radio` : ajouté en miroir de `origam-checkbox` — types
    //     valides (IRadioProps extends IRoundedProps confirmé) mais NON
    //     rendus par OrigamRadioBtn.vue (glyphe mdi, aucun useRounded dans
    //     le rendu — issue #241, même blocage que checkbox, distincte de
    //     #242/#249 qui sont mergées). Posé quand même (prêt à s'activer le
    //     jour où #241 est corrigé) — pending #241, voir la PR.
    components: {
        'origam-btn': { variant: 'outlined', rounded: 'sm', border: true, elevation: 2 },
        'origam-btn-group': { variant: 'outlined', rounded: 'sm', border: true, elevation: 2 },
        'origam-btn-toggle': { variant: 'outlined', rounded: 'sm', border: true, elevation: 2 },

        // ── Overlay & Surface (SYNTHESE §3) ──────────────────────────────
        'origam-card': { rounded: 'sm', border: true, flat: false, elevation: 2 },
        'origam-sheet': { rounded: 'sm', border: true, elevation: 3 },
        'origam-menu': { rounded: 'sm', border: true, elevation: 3, nav: true },
        'origam-dialog': { rounded: 'sm', border: true, elevation: 3 },
        // Aucune entrée `origam-tooltip` — voir note ci-dessus (DS GAP).

        // ── Feedback & Status (SYNTHESE §3) ──────────────────────────────
        'origam-chip': { rounded: 'sm', border: true, pill: false },
        'origam-alert': { rounded: 'sm', border: true, elevation: 1 },
        'origam-snackbar': { rounded: 'sm', border: true, elevation: 3 },
        'origam-badge': { rounded: 'sm', border: false },
        'origam-progress-linear': { rounded: 'sm', color: 'primary' },

        // ── Form & Input (SYNTHESE §3) ────────────────────────────────────
        'origam-field': { variant: 'outlined', rounded: 'sm', border: true },
        'origam-text-field': { variant: 'outlined', rounded: 'sm', border: true },
        'origam-textarea-field': { variant: 'outlined', rounded: 'sm', border: true },
        'origam-number-field': { variant: 'outlined', rounded: 'sm', border: true },
        'origam-password-field': { variant: 'outlined', rounded: 'sm', border: true },
        'origam-select': {
            variant: 'outlined', rounded: 'sm', border: true,
            menuProps: { rounded: 'sm', nav: true }
        },
        'origam-date-picker-field': { rounded: 'sm', border: true },
        'origam-file-field': { rounded: 'sm', border: true },
        'origam-color-picker-field': { rounded: 'sm', border: true },
        'origam-checkbox': { rounded: 'xs' }, // pending #241 (glyph render)
        'origam-radio': { rounded: 'xs' }, // pending #241 (glyph render)
        // Switch harmony (lot 4) — mirrors `origam-text-field`'s rounded/
        // border so the track reads as the same visual family as the
        // theme's fields (see cartoon.theme.ts for the full rationale).
        'origam-switch': { rounded: 'sm', border: true },
        'origam-slider-field': { rounded: 'sm', color: 'primary' },

        // ── Navigation (SYNTHESE §3) ──────────────────────────────────────
        'origam-tabs': { variant: 'pills', rounded: 'sm' },
        'origam-bottom-nav': { rounded: 'sm', border: true, elevation: 2 },
        'origam-breadcrumb': { rounded: 'sm', border: true },
        'origam-pagination': { border: true, elevation: 1 },
        'origam-list': { rounded: 'sm', nav: true },
        'origam-list-item': { rounded: 'sm' },

        // ── Data Display (SYNTHESE §3) ────────────────────────────────────
        'origam-table': { rounded: 'sm', border: true, hover: true },
        'origam-code': { rounded: 'sm', border: true, elevation: 2, copyable: true },
        'origam-avatar': { rounded: 'sm', border: true },
        'origam-blockquote': {
            variant: 'default', rounded: 'sm', border: true,
            accentColor: 'primary'
        }
    },
    // ⛔ Overrides bruts geek non exprimables en props (états actifs/focus/erreur,
    // respiration des items, néons). Migrés depuis les asks SYNTHESE §4 —
    // APPLIQUÉS seulement quand un hook CSS réel existe dans le composant DS
    // (grep sur le `<style>` réel de chaque `packages/ds/src/components/**`).
    // Les asks §4 SANS hook réel sont listés en commentaire "DS GAP — bloquée
    // #253" (non appliqués) plutôt que simulés avec un nom de var inventé —
    // voir la PR pour le détail (tableau var → vérifiée / bloquée).
    //
    // Vars mode-agnostiques (une seule valeur donnée par la spec, pas de
    // split light/dark) : scrim, table (bg/border/hover), code highlight,
    // list gap/radius. Vars mode-spécifiques (couleurs différentes)
    // dupliquées dans geekDarkTheme.cssVars ci-dessous.
    cssVars: {
        "--origam-font-family---heading": "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
        "--origam-title---font-family": "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
        '--origam-appbar---bg': 'rgba(251, 245, 255, 0.80)',
        '--origam-menu---background': 'var(--origam-color__surface---default)',
        '--origam-menu---color': 'var(--origam-color__text---primary)',
        '--origam-menu---border-radius': '4px',
        '--origam-menu---box-shadow': '0 4px 16px -4px rgba(124, 58, 237, 0.14), 0 1px 4px -1px rgba(124, 58, 237, 0.08), 0 0 0 1px var(--origam-color__border---default)',
        '--origam-menu__content---padding': '4px',
        '--origam-list---background': 'transparent',
        '--origam-list---padding-block-start': '0',
        '--origam-list---padding-block-end': '0',
        '--origam-list-item---padding-inline-start': '12px',
        '--origam-list-item---padding-inline-end': '12px',
        '--origam-btn---border-color': 'rgba(217, 70, 239, 0.55)',
        '--origam-btn---border-width-outlined': '1px',
        '--origam-btn---border-width-ghost': '1px',
        '--origam-btn---box-shadow-elevated': '0 4px 14px -4px rgba(124, 58, 237, 0.30), 0 1px 3px -1px rgba(124, 58, 237, 0.15)',
        '--origam-btn---box-shadow-ghost': 'rgba(217, 70, 239, 0.35) 0px 0px 10px -4px',
        '--origam-card---box-shadow': '0 1px 3px rgba(124, 58, 237, 0.06), 0 8px 24px -16px rgba(124, 58, 237, 0.20)',
        '--origam-code---border-color': 'rgba(168, 85, 247, 0.28)',
        '--origam-code---border-width': '1px',

        // ── Tooltip (SYNTHESE §3, DS GAP note ci-dessus) — seul hook réel
        // exposé par OrigamTooltip.vue. Coins nets, en cohérence avec
        // l'identité geek (rounded sm). Pas de border-color/box-shadow hook.
        '--origam-tooltip---border-radius': '2px',

        // ── Pagination (SYNTHESE §4) — couple actif = fill accent + on-color.
        // `rounded` n'est pas une prop valide (voir note `components`) ; le
        // radius passe ici, en vraie cssVar.
        '--origam-pagination---border-radius': '2px',
        '--origam-pagination__item--is-active---background-color': '#7c3aed',
        '--origam-pagination__item--is-active---color': '#ffffff',

        // ── List item (SYNTHESE §4) — tint hover/actif : l'item peint un
        // overlay `currentColor` dont seule l'opacité varie par état
        // (.08 hover / .12 actif / .16 actif+hover, géré par le composant) ;
        // on route sa COULEUR sur l'accent pour un tint violet au lieu d'un
        // tint "texte" par défaut. DS GAP (bloquée #253) : aucun hook dédié
        // pour forcer border-color/color/box-shadow sur l'item actif — seule
        // la couleur du tint est réellement pilotable (confirmé identique à
        // glass.theme.ts §4, même composant OrigamListItem.vue). Vérifié
        // runtime (Playwright) : le hook fonctionne sur tout `<origam-list-
        // item>` générique ; le dropdown appbar (locale/nav/theme switcher)
        // a sa PROPRE règle pré-existante et partagée entre thèmes
        // (`packages/marketing/src/layouts/default.vue:651`,
        // `.appbar-menu .origam-list-item--active`) qui route ce même hook
        // sur `--origam-color__action--primary---bg` — hors périmètre de ce
        // ticket (fichier layout partagé, PAS touché ici, signalé au lead).
        '--origam-list-item__overlay---background-color': '#7c3aed',
        // Respiration des items (SYNTHESE §2/§4) — gap ~5px. Le hook réel
        // n'est PAS `--origam-list---gap` (n'existe pas) mais la marge posée
        // par le modificateur `--nav` (`nav:true` en props ci-dessus),
        // surchargeable en cssVar car c'est une vraie custom property CSS.
        '--origam-list-item---margin-block-end': '5px',
        '--origam-list-item---border-radius': '3px',

        // ── Field — erreur (SYNTHESE §4). `--origam-field--error---border-color`
        // est un hook réel (OrigamField.vue, variant outlined ET filled).
        // DS GAP (bloquée #253) : aucun box-shadow d'erreur, ni aucun hook
        // focus (border-color/box-shadow) sur le variant outlined — confirmé
        // en lisant le `<style>` complet, `&--focused` n'y touche QUE le
        // notch de l'outline (pas de couleur/glow).
        '--origam-field--error---border-color': '#dc2626',

        // ── Table (SYNTHESE §4) — tous hooks réels, valeur unique donnée par
        // la spec (pas de split light/dark pour bg/border/hover).
        '--origam-table__header-cell---background-color': 'rgba(124, 58, 237, 0.08)',
        '--origam-table__header-cell---color': '#6d28d9',
        '--origam-table__cell---border-color': 'rgba(0, 240, 255, 0.14)',
        '--origam-table__row---hover-background-color': 'rgba(0, 240, 255, 0.05)',

        // ── Code (SYNTHESE §4) — surlignage de ligne, hook réel. Nom corrigé :
        // `--origam-code__line-highlight---background-color` (le composant
        // n'expose PAS `--origam-code__highlight---background`).
        '--origam-code__line-highlight---background-color': 'rgba(0, 240, 255, 0.07)',

        // ── Scrim (SYNTHESE §4) — sombre uni net, SANS backdrop-filter
        // (aucune var `--origam-*---backdrop-filter` posée, contrairement à
        // glass). Hook réel : `--origam-overlay-scrim---background-color`.
        '--origam-overlay-scrim---background-color': 'rgba(10, 6, 18, 0.82)',

        // ── Avatar (SYNTHESE §4) — anneau néon + glow. Hooks réels
        // (`--origam-avatar---border-color`/`---box-shadow`). Vérifiés
        // runtime (Playwright, box-shadow confirmé exact sur l'avatar-group
        // homepage) ; border-color EST posé et réel, mais shadowed sur les
        // instances qui passent en plus `bgColor` par item (currentColor
        // gagne alors localement) — comportement DS générique, pas un bug
        // de ce hook. DS GAP (bloquée #253) : le "gradient #7c3aed→#00f0ff"
        // demandé pour l'image n'est pas atteignable — le seul hook de fond
        // est `--origam-avatar---background-color`, qui n'accepte pas de
        // gradient (piège gradient confirmé, même trouvaille que le badge
        // sur glass.theme.ts §4 : `background-color` rejette silencieusement
        // une valeur `linear-gradient(...)`).
        '--origam-avatar---border-color': 'rgba(168, 85, 247, 0.4)',
        '--origam-avatar---box-shadow': '0 0 12px -4px rgba(124, 58, 237, 0.4)'

        // ── DS GAPs non appliqués (bloquée #253, voir tableau PR) ─────────
        // • checkbox/radio "couple actif" (bg + box-shadow) : le rendu est un
        //   glyphe MDI (issue #241) — pas de box modelable, background/
        //   box-shadow sans hook CSS.
        // • switch-track "on" (bg + box-shadow) : `trackBgColor` ne lit QUE
        //   `props.bgColor` (pas de variante par état `--dirty`), aucun hook
        //   `--origam-switch-track--dirty---*`. Poser `color:'primary'` en
        //   props ne peindrait que le thumb — et en violet, pas cyan côté
        //   dark (l'accent "actif" doit virer cyan en dark, ce que
        //   `color:'primary'` ne peut pas produire ici) — écarté pour ne
        //   pas livrer un résultat visuellement faux sous couvert de "posé".
        // • tab "active" box-shadow : le hook `--origam-tabs__item--pills--
        //   active---background-color` existe (posé, voir dark), mais aucun
        //   box-shadow dédié n'est exposé par OrigamTab.vue pour l'état actif.
        // • bottom-nav item "active" (border/tint/color/box-shadow) : l'item
        //   est un OrigamBtn standard avec `active:true` — seul un hook
        //   générique `--origam-btn---overlay-opacity-active` existe (opacité,
        //   pas couleur/glow) ; pas de hook bg/border dédié comme sur
        //   Pagination.
        // • field "focus" (border-color + box-shadow) : confirmé aucun hook,
        //   ni en variant outlined ni en variant filled.
        // • divider (background + box-shadow "ligne laser") : OrigamDivider.vue
        //   n'expose NI `background`/`background-color` NI `border-color`
        //   (seuls `border-*-width`/`opacity`/`max-width`/`max-height`) —
        //   confirmé identique à la trouvaille glass.theme.ts §4.
        // • badge box-shadow néon : `--origam-badge__badge---box-shadow` est
        //   un hook réel mais GLOBAL (pas par statut) — le poser en rouge
        //   danger peindrait aussi le glow des badges success/info/warning,
        //   un résultat sémantiquement faux. Chaque statut a déjà sa couleur
        //   correcte via `vars.color.feedback` (néons dark déjà en place :
        //   succès #39ff14, danger #ff3864, info #00f0ff, warn #ffd166).
        // • code — couleurs de syntaxe (kw/str/fn/cmt) : viennent de Shiki
        //   (`--shiki-light`/`--shiki-dark`), aucun token `--origam-code---*`
        //   par catégorie n'existe (même trouvaille que glass.theme.ts §4).
    }
}

export const geekDarkTheme: IOrigamTheme = {
    name: 'geek',
    mode: 'dark',
    vars: {
        rounded: {
            card: '8px',
            btn: '8px',
            pill: '4px',
            sm: '4px',
            md: '8px',
            lg: '12px'
        },
        color: {
            surface: {
                default: '#0a0612',
                raised: '#140c24',
                sunken: '#1c1138',
                overlay: '#0a0612',
                disabled: '#2a1d4a'
            },
            text: {
                primary: '#ece6ff',
                secondary: '#b4a4e8',
                tertiary: '#7e6bb8',
                disabled: '#4a3d6e',
                inverse: '#0a0612',
                onColor: '#0a0612',
                ink: '#ece6ff'
            },
            action: {
                primary: {
                    bg: '#c77dff',
                    bgHover: '#a855f7',
                    bgSubtle: 'rgba(199, 125, 255, 0.14)',
                    bgDisabled: '#2a1d4a',
                    fg: '#0a0612',
                    fgSubtle: '#00f0ff',
                    fgDisabled: '#4a3d6e'
                },
                secondary: {
                    bg: '#1c1138',
                    bgHover: '#2a1d4a',
                    bgDisabled: '#140c24',
                    fg: '#ece6ff',
                    fgDisabled: '#4a3d6e'
                },
                ghost: {
                    bg: 'rgba(0, 0, 0, 0)',
                    bgHover: 'rgba(199, 125, 255, 0.10)',
                    bgDisabled: 'rgba(0, 0, 0, 0)',
                    fg: '#00f0ff',
                    fgDisabled: '#4a3d6e'
                }
            },
            border: {
                default: 'rgba(124, 77, 255, 0.28)',
                subtle: 'rgba(124, 77, 255, 0.14)',
                strong: 'rgba(0, 240, 255, 0.50)',
                focus: '#00f0ff',
                'subtle-alpha': 'rgba(124, 77, 255, 0.16)',
                ghost: 'rgba(0, 240, 255, 0.12)'
            },
            feedback: {
                success: {
                    bg: '#39ff14',
                    bgSubtle: 'rgba(57, 255, 20, 0.10)',
                    fg: '#0a0612',
                    fgSubtle: '#39ff14',
                    border: '#39ff14'
                },
                warning: {
                    bg: '#ffd166',
                    bgSubtle: 'rgba(255, 209, 102, 0.10)',
                    fg: '#0a0612',
                    fgSubtle: '#ffd166',
                    border: '#ffd166'
                },
                danger: {
                    bg: '#ff3864',
                    bgSubtle: 'rgba(255, 56, 100, 0.10)',
                    // Fix source #2 (SYNTHESE geek §5.2): white text on the
                    // neon danger bg #ff3864 measures 3.5:1 (fails AA).
                    // Ink #0a0612 (same as every other dark on-neon
                    // glyph in this theme) clears AA at 5.73:1.
                    fg: '#0a0612',
                    fgSubtle: '#ff3864',
                    border: '#ff3864'
                },
                info: {
                    bg: '#00f0ff',
                    bgSubtle: 'rgba(0, 240, 255, 0.10)',
                    fg: '#0a0612',
                    fgSubtle: '#00f0ff',
                    border: '#00f0ff'
                }
            },
            'btn-primary-text': '#0a0612',
            'btn-secondary-bg': 'transparent',
            'btn-secondary-border': 'rgba(0, 240, 255, 0.40)',
            'btn-secondary-text': '#00f0ff'
        },
        // ELEVATION (dark) : même rampe de glows néon, intensité amplifiée sur fond
        // sombre pour l'effet terminal. Violet #c77dff / cyan #00f0ff. Consommée
        // via la prop `elevation`.
        shadow: {
            none: 'none',
            xs: 'inset 0 1px 0 rgba(199, 125, 255, 0.08), 0 8px 28px -12px rgba(0, 0, 0, 0.80), 0 0 0 1px rgba(0, 240, 255, 0.04)',
            sm: 'rgba(0, 240, 255, 0.25) 0px 0px 12px -4px',
            md: '0 4px 12px -4px rgba(124, 77, 255, 0.40), 0 0 20px -6px rgba(0, 240, 255, 0.25)',
            lg: 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 8px 24px -8px rgba(0, 240, 255, 0.50), 0 0 32px -8px rgba(199, 125, 255, 0.35)',
            xl: 'rgba(0, 240, 255, 0.50) 0px 0px 18px -2px, rgba(199, 125, 255, 0.45) 0px 0px 32px -6px, rgba(255, 255, 255, 0.40) 0px 1px 0px 0px inset'
        }
    },
    // ⛔ Overrides dark — l'accent VIRE CYAN sur tous les états "actif"
    // (SYNTHESE §2 : "l'accent dark vire au CYAN #00f0ff"), alors que
    // `vars.color.action.primary.bg` dark reste violet (#c77dff) pour les
    // surfaces non-actives. C'est pourquoi chaque couple actif ci-dessous
    // fixe explicitement `#00f0ff` plutôt que de laisser retomber sur le
    // token `action.primary.bg` par défaut (qui donnerait du violet, pas
    // du cyan). Dark = héros de ce thème : vérifié en premier au runtime
    // (Playwright, cookies `origam-theme=geek`/`origam-mode=dark`, pages
    // `/`, `/installation`, `/theming` — voir la PR pour le détail).
    cssVars: {
        "--origam-font-family---heading": "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
        "--origam-title---font-family": "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
        '--origam-appbar---bg': 'rgba(10, 6, 18, 0.85)',
        '--origam-menu---background': 'var(--origam-color__surface---default)',
        '--origam-menu---color': 'var(--origam-color__text---primary)',
        '--origam-menu---border-radius': '8px',
        '--origam-menu---box-shadow': '0 4px 24px -4px rgba(0, 0, 0, 0.70), 0 1px 4px -1px rgba(0, 0, 0, 0.40), 0 0 0 1px var(--origam-color__border---default), 0 0 20px -8px rgba(0, 240, 255, 0.20)',
        '--origam-menu__content---padding': '4px',
        '--origam-list---background': 'transparent',
        '--origam-list---padding-block-start': '0',
        '--origam-list---padding-block-end': '0',
        '--origam-list-item---padding-inline-start': '12px',
        '--origam-list-item---padding-inline-end': '12px',
        '--origam-btn---border-color': 'rgba(0, 240, 255, 0.40)',
        '--origam-btn---border-width-outlined': '1px',
        '--origam-btn---border-width-ghost': '1px',
        '--origam-btn---box-shadow-elevated': '0 8px 24px -8px rgba(0, 240, 255, 0.50), 0 0 32px -8px rgba(199, 125, 255, 0.35)',
        '--origam-btn---box-shadow-ghost': 'rgba(0, 240, 255, 0.25) 0px 0px 12px -4px',
        '--origam-card---box-shadow': 'inset 0 1px 0 rgba(199, 125, 255, 0.08), 0 8px 28px -12px rgba(0, 0, 0, 0.80), 0 0 0 1px rgba(0, 240, 255, 0.04)',
        '--origam-code---border-color': 'rgba(124, 77, 255, 0.28)',
        '--origam-code---border-width': '1px',

        '--origam-tooltip---border-radius': '4px',

        // ── Pagination — couple actif dark : fill cyan + encre (on-color).
        '--origam-pagination---border-radius': '4px',
        '--origam-pagination__item--is-active---background-color': '#00f0ff',
        '--origam-pagination__item--is-active---color': '#0a0612',

        // ── Tabs (SYNTHESE §4) — le SEUL hook réel de l'état actif pills
        // (`--origam-tabs__item--pills--active---background-color`). Non posé
        // en light (le fallback `--origam-color__action--primary---bg`
        // #7c3aed y est déjà correct) ; en dark le fallback donnerait
        // #c77dff (violet), on force #00f0ff (cyan) pour la règle §2.
        '--origam-tabs__item--pills--active---background-color': '#00f0ff',

        // ── List item — tint cyan (accent dark). Voir la note "runtime"
        // côté geekLightTheme.cssVars pour la mise en garde sur le dropdown
        // appbar (layout partagé, hors périmètre).
        '--origam-list-item__overlay---background-color': '#00f0ff',
        '--origam-list-item---margin-block-end': '5px',
        '--origam-list-item---border-radius': '3px',

        '--origam-field--error---border-color': '#ff3864',

        '--origam-table__header-cell---background-color': 'rgba(124, 58, 237, 0.08)',
        '--origam-table__header-cell---color': '#00f0ff',
        '--origam-table__cell---border-color': 'rgba(0, 240, 255, 0.14)',
        '--origam-table__row---hover-background-color': 'rgba(0, 240, 255, 0.05)',

        '--origam-code__line-highlight---background-color': 'rgba(0, 240, 255, 0.07)',

        '--origam-overlay-scrim---background-color': 'rgba(10, 6, 18, 0.82)',

        // ── Dialog (SYNTHESE §4) — halo flottant dark uniquement (la spec ne
        // donne pas de valeur light ; l'elevation de la card interne suffit
        // en light). Hook réel confirmé runtime (Playwright, /theming) :
        // `--origam-dialog---box-shadow` peint `.origam-overlay__content`
        // (le wrapper positionné), EN PLUS du glow déjà rendu par la
        // `<origam-card>` interne que OrigamDialog enveloppe (props
        // rounded/border/elevation forwardées via `cardProps`) — les deux
        // box-shadow sont mesurés séparément et cumulés visuellement.
        '--origam-dialog---box-shadow': '0 0 40px -8px rgba(0, 240, 255, 0.4)',

        '--origam-avatar---border-color': 'rgba(0, 240, 255, 0.4)',
        '--origam-avatar---box-shadow': '0 0 14px -4px rgba(0, 240, 255, 0.4)'

        // DS GAPs — voir la liste commentée exhaustive dans geekLightTheme.cssVars
        // (identique côté dark : checkbox/radio glyphe #241, switch-track "on",
        // tab box-shadow, bottom-nav item, field focus, divider, badge glow
        // par-statut, code syntax highlighting via Shiki).
    }
}

export const geekThemes: IOrigamTheme[] = [geekLightTheme, geekDarkTheme]
