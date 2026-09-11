import type { IOrigamTheme } from 'origam/interfaces'

export const editorialLightTheme: IOrigamTheme = {
    name: 'editorial',
    label: 'Editorial',
    vars: {
        rounded: {
            card: '0px',
            btn: '0px',
            pill: '0px',
            sm: '0px',
            md: '0px',
            lg: '0px'
        },
        color: {
            surface: {
                default: '#fbf7ee',
                raised: '#fffdf7',
                sunken: '#f3ecdd',
                overlay: '#f3ecdd',
                disabled: '#e6dfd1'
            },
            text: {
                primary: '#1a1714',
                secondary: '#4a4036',
                tertiary: '#6b5f50',
                disabled: '#a3a3a3',
                inverse: '#ffffff',
                onColor: '#ffffff',
                ink: '#1a1714'
            },
            action: {
                primary: {
                    bg: '#5b21b6',
                    bgHover: '#4c1d95',
                    bgSubtle: 'rgba(91, 33, 182, 0.10)',
                    bgDisabled: '#e6dfd1',
                    fg: '#ffffff',
                    fgSubtle: '#4c1d95',
                    fgDisabled: '#a3a3a3'
                },
                secondary: {
                    bg: 'transparent',
                    bgHover: 'rgba(91, 33, 182, 0.04)',
                    bgDisabled: 'transparent',
                    fg: '#1a1714',
                    fgDisabled: '#a3a3a3'
                },
                ghost: {
                    bg: 'transparent',
                    bgHover: 'rgba(91, 33, 182, 0.04)',
                    bgDisabled: 'transparent',
                    fg: '#5b21b6',
                    fgDisabled: '#a3a3a3'
                }
            },
            border: {
                default: 'rgba(26, 23, 20, 0.16)',
                subtle: 'rgba(26, 23, 20, 0.08)',
                strong: 'rgba(26, 23, 20, 0.40)',
                focus: '#7c3aed',
                'subtle-alpha': 'rgba(26, 23, 20, 0.10)',
                ghost: 'rgba(26, 23, 20, 0.16)'
            },
            feedback: {
                success: {
                    bg: '#15803d',
                    bgSubtle: 'rgba(21, 128, 61, 0.08)',
                    fg: '#ffffff',
                    fgSubtle: '#166534',
                    border: '#15803d'
                },
                warning: {
                    bg: '#b45309',
                    bgSubtle: 'rgba(180, 83, 9, 0.08)',
                    fg: '#ffffff',
                    fgSubtle: '#92400e',
                    border: '#b45309'
                },
                danger: {
                    bg: '#b91c1c',
                    bgSubtle: 'rgba(185, 28, 28, 0.08)',
                    fg: '#ffffff',
                    fgSubtle: '#991b1b',
                    border: '#b91c1c'
                },
                info: {
                    bg: '#1d4ed8',
                    bgSubtle: 'rgba(29, 78, 216, 0.08)',
                    fg: '#ffffff',
                    fgSubtle: '#1e40af',
                    border: '#1d4ed8'
                }
            },
            'btn-primary-bg': '#5b21b6',
            'btn-primary-text': '#ffffff',
            'btn-secondary-bg': 'transparent',
            'btn-secondary-border': 'rgba(26, 23, 20, 0.40)',
            'btn-secondary-text': '#1a1714'
        },
        // ⛔ ELEVATION = le tier `shadow` sémantique. Editorial = flat (pas d'ombre).
        // Rampe TRÈS discrète sur xs/sm (séparateurs à peine perceptibles) ;
        // md/lg/xl = none pour conserver l'identité magazine plat + carré.
        shadow: {
            none: 'none',
            xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
            sm: '0 1px 4px rgba(0, 0, 0, 0.06)',
            md: 'none',
            lg: 'none',
            xl: 'none'
        }
    },
    // ⛔ PROPS D'ABORD (logique DS). Identité éditoriale = coins carrés (rounded
    // 'none'), surfaces plates (flat + elevation 0), variant outlined pour les champs
    // interactifs. Sobre comme un magazine : structure visible, sans ornementation.
    components: {
        'origam-btn': { variant: 'outlined', rounded: 'none', border: true, elevation: 0 },
        'origam-btn-group': { variant: 'outlined', rounded: 'none', border: true, elevation: 0 },
        'origam-btn-toggle': { variant: 'outlined', rounded: 'none', border: true, elevation: 0 },
        'origam-card': { rounded: 'none', border: true, flat: true },
        'origam-chip': { variant: 'outlined', rounded: 'none', border: true, pill: false },
        'origam-alert': { rounded: 'none', border: true, elevation: 0 },
        'origam-field': { variant: 'outlined', rounded: 'none', border: true },
        'origam-text-field': { variant: 'outlined', rounded: 'none', border: true },
        'origam-textarea-field': { variant: 'outlined', rounded: 'none', border: true },
        'origam-number-field': { variant: 'outlined', rounded: 'none', border: true },
        'origam-password-field': { variant: 'outlined', rounded: 'none', border: true },
        'origam-date-picker-field': { rounded: 'none', border: true },
        'origam-file-field': { rounded: 'none', border: true },
        'origam-color-picker-field': { rounded: 'none', border: true },
        'origam-code': { rounded: 'none', border: true, elevation: 0 },
        'origam-menu': { rounded: 'none', border: true, elevation: 0 },
        'origam-list-item': { rounded: 'none' },
        'origam-table': { rounded: 'none', border: true },
        'origam-avatar': { rounded: 'none', border: true },
        // Checkbox/Radio (Refs #35) — spec asks for `--checkbox---border-color`,
        // `--checkbox--checked---background`, `--checkbox--checked---color`
        // (a drawn box with a distinct checked fill). BLOQUÉ: Checkbox/Radio
        // render their glyph via an MDI icon-font (checkbox-blank-outline /
        // checkbox-marked-outline), not a drawn CSS box — tracked DS-side as
        // #241 (see commit a0fe52cd's message: "#241 caveat: Checkbox/Radio
        // render their box shape via an icon-font glyph, not a drawn CSS box —
        // border/rounded/elevation props are no-ops on that glyph because
        // there's no CSS box to apply them to"). None of the 3 spec'd vars are
        // consumed anywhere in Checkbox/CheckboxBtn/SelectionControl — not
        // invented here. Radio's circular shape is already the native a11y
        // shape the spec asks for, no override needed.
        'origam-checkbox': { rounded: 'none' },
        // Switch harmony (lot 4) — mirrors `origam-text-field`'s rounded/
        // border so the track reads as the same visual family as the
        // theme's fields (see cartoon.theme.ts for the full rationale).
        // ⛔ `activeBgColor` retiré (purge DS des props d'état à plat).
        // Cette entrée s'appuyait sur un mécanisme de `OrigamSelectionControl.vue`
        // (`model ? (activeBgColor || bgColor) : bgColor`) qui n'existe plus
        // du tout dans la source actuelle — re-vérifié empiriquement (mount +
        // thème) que `.origam-switch-track` n'a aucun style inline sous ce
        // thème : la prop était déjà inerte avant son retrait de l'API. Pas
        // d'équivalent `bgColor`-toujours-actif à poser à la place — ce
        // serait un changement visuel différent (rail coloré en permanence,
        // pas seulement à l'état coché), hors du périmètre d'une purge.
        'origam-switch': { rounded: 'none', border: true },
        // Slider (Refs #35) — `rounded:'none'` set per spec intent, but flagged
        // BLOQUÉ visually: OrigamSliderField/OrigamSliderFieldTrack never call
        // `useRounded` (grep confirmed 0 hits across both files) — thumb
        // (border-radius:50%) and track (999px) shapes are hardcoded in SCSS,
        // no `--origam-slider-field*---border-radius` hook consumes a var
        // either. The track's unfilled rail background is ALSO hardcoded
        // (`rgb(148, 148, 148)`, OrigamSliderFieldTrack.vue `&__background`,
        // no override hook) — the spec's "#e4dccb piste" is unreachable from
        // the theme layer as-is. See PR table.
        'origam-slider-field': { rounded: 'none' },
        'origam-select': {
            variant: 'outlined',
            rounded: 'none',
            border: true,
            // menuProps forwards straight through to the underlying OrigamMenu
            // instance (OrigamSelect.vue:79 spreads `menuProps` onto the menu,
            // :533 composes it) — confirmed via source read, not guessed.
            menuProps: { rounded: 'none', border: true, elevation: 0 }
        },
        'origam-sheet': { rounded: 'none', border: true },
        // Breadcrumb (Refs #35, mirrors apple.theme.ts #266's verified pattern)
        // — `color` is a foreground-only prop; the bare `'primary'` intent
        // resolves to `action.primary.fgSubtle`, not the pure accent, so the
        // raw `action.primary.bg` var reference is passed directly to hit the
        // spec's exact #5b21b6 (light — dark theme below targets fgSubtle
        // instead, per the spec's explicit #c4b5fd).
        'origam-breadcrumb-item': { color: 'var(--origam-color__action--primary---bg)' },
        'origam-snackbar': { rounded: 'none', border: true, elevation: 0 }
    },
    cssVars: {
        "--origam-font-family---heading": "'Fraunces', 'Playfair Display', Georgia, serif",
        "--origam-title---font-family": "'Fraunces', 'Playfair Display', Georgia, serif",
        '--origam-font-weight---extrabold': '400',
        '--origam-letter-spacing---hero': '-0.04em',
        '--origam-line-height---hero': '0.9',
        '--origam-letter-spacing---tight': '-0.03em',
        '--origam-appbar---backdrop-filter': 'saturate(140%) blur(16px)',
        '--origam-menu---background': 'var(--origam-color__surface---default)',
        '--origam-menu---color': 'var(--origam-color__text---primary)',
        '--origam-menu---border-radius': '0px',
        '--origam-menu__content---padding': '4px',
        '--origam-list---background': 'transparent',
        '--origam-list---padding-block-start': '0',
        '--origam-list---padding-block-end': '0',
        '--origam-list-item---padding-inline-start': '12px',
        '--origam-list-item---padding-inline-end': '12px',
        '--origam-btn---border-width-outlined': '1px',
        '--origam-btn---border-width-ghost': '1px',
        '--origam-btn---box-shadow-elevated': 'none',
        '--origam-btn---box-shadow-ghost': 'none',
        '--origam-btn---border-radius': '0px',
        // Editorial keeps buttons unfilled at rest (btn-secondary-bg above
        // is 'transparent', by design — a print/minimalist surface). But
        // OrigamBtn's outlined active-state rule paints its fill FROM that
        // same base background token, so an active/selected button (e.g.
        // the Light|Dark toggle's current mode) inherited the SAME
        // transparent value and became indistinguishable from a resting
        // one — no selection affordance at all. This dedicated token lets
        // the active state use its own fill, independent of the resting
        // background; every other theme leaves it unset and keeps its
        // existing behaviour untouched (see OrigamBtn.vue's fallback chain).
        '--origam-btn---background-color-active': 'var(--origam-color__action--primary---bgSubtle)',
        '--origam-card---background': 'var(--origam-color__surface---raised)',
        '--origam-card---border-color': 'var(--origam-color__border---default)',
        '--origam-card---border-style': 'solid',
        '--origam-card---border-top-width': '1px',
        '--origam-card---border-right-width': '1px',
        '--origam-card---border-bottom-width': '1px',
        '--origam-card---border-left-width': '1px',
        '--origam-card---box-shadow': 'none',
        '--origam-chip---border-radius': '0px',
        '--origam-chip---background-color': 'var(--origam-color__surface---raised)',
        '--origam-chip---border-color': 'var(--origam-color__border---default)',
        '--origam-chip---border-width': '1px',
        '--origam-chip---border-style': 'solid',
        '--origam-code---border-radius': '0px',
        '--origam-code---border-color': 'var(--origam-color__border---default)',
        '--origam-code---border-width': '1px',
        '--origam-field---border-radius': '0px',
        '--origam-field---border-opacity': '1',
        '--origam-alert---border-radius': '0px',
        '--origam-appbar---bg': 'color-mix(in srgb, #fbf7ee 72%, transparent)',
        '--origam-menu---box-shadow': '0 4px 16px -4px rgba(0, 0, 0, 0.12), 0 0 0 1px var(--origam-color__border---default)',
        '--origam-btn---border-color': 'rgba(26, 23, 20, 0.40)',
        '--origam-code---background-color': 'var(--origam-color__surface---sunken, #f3ecdd)',
        '--origam-field---border-color': 'rgba(26, 23, 20, 0.40)',

        // ── Field focus (Refs #35) — trait carré prune, JAMAIS de halo. Référence
        // le token déjà défini plus haut (vars.color.border.focus = #7c3aed
        // light / #a78bfa dark) au lieu d'un hex littéral — auto-adapté aux 2
        // modes en une seule déclaration. Hooks vérifiés : OrigamField.vue:
        // 889-890 (focus-ring-width/-color/-offset, défauts 0px/transparent/
        // 0px — DÉSACTIVÉ tant qu'un thème ne l'active pas explicitement).
        '--origam-field---focus-ring-width': '2px',
        '--origam-field---focus-ring-color': 'var(--origam-color__border---focus)',
        '--origam-field---focus-ring-offset': '0px',

        // ── Overlay / Dialog scrim (Refs #35, #253 hook) — lavis opaque, PAS
        // de flou. Le scrim applique `opacity` EN PLUS du background
        // (OrigamOverlayScrim.vue, défaut 0.32) — sans le remettre à 1 notre
        // alpha .62 serait re-multiplié (.62 × .32 ≈ .20, bien trop clair).
        // Valeur light ici ; editorialDarkTheme surcharge le background-color
        // (rgba(0,0,0,.72), valeur DIFFÉRENTE — pas juste le même token adapté).
        // Hooks vérifiés : OrigamOverlayScrim.vue (background-color/
        // backdrop-filter/opacity, commit 18e38cfd #253).
        '--origam-overlay-scrim---background-color': 'rgba(10, 10, 10, 0.62)',
        '--origam-overlay-scrim---backdrop-filter': 'none',
        '--origam-overlay-scrim---opacity': '1',

        // ── Tooltip (Refs #35, #253 hook) — opaque, SANS caret. OrigamTooltip.vue
        // n'a ni ::before/::after ni élément flèche — aucun hook
        // `--origam-tooltip__caret---*` n'existe, on ne l'invente pas ici.
        // "#1a1714/#fff" (spec) = chip TOUJOURS inversé par rapport au mode
        // (encre en light, clair en dark) — valeur light ici, editorialDarkTheme
        // surcharge avec les valeurs inverses. Hooks vérifiés : OrigamTooltip.vue
        // (background-color/color/backdrop-filter, commit 30f35315 #253).
        '--origam-tooltip---background-color': '#1a1714',
        '--origam-tooltip---color': '#fffdf7',
        '--origam-tooltip---backdrop-filter': 'none',

        // ── Tabs underline (Refs #35) — référence action.primary.bg (déjà
        // #5b21b6 light / #a78bfa dark) au lieu d'un hex littéral — auto-adapté.
        // Hook vérifié OrigamTab.vue:279-280 (--origam-tabs__indicator---height/
        // ---color, défauts 2px/currentColor).
        '--origam-tabs__indicator---color': 'var(--origam-color__action--primary---bg)',
        '--origam-tabs__indicator---height': '2px',

        // ── Bottom nav (Refs #35) — filet HAUT uniquement (pas de prop `border`
        // globale : elle poserait 1px sur les 4 côtés). Hooks vérifiés :
        // OrigamBottomNav.vue:297-299. Item actif : AUCUN hook dédié trouvé —
        // les items sont des <origam-btn> bruts fournis par le consommateur
        // (`items` prop), pas un sous-composant BottomNavItem thémable.
        // BLOQUÉ pour le thème seul : nécessite soit un nouveau hook DS
        // (`--origam-bottom-bar__item--selected---border-block-start-*`),
        // soit un réglage `active` par item côté page marketing.
        '--origam-bottom-bar---border-top-width': '1px',
        '--origam-bottom-bar---border-style': 'solid',
        '--origam-bottom-bar---border-color': 'var(--origam-color__border---default)',

        // ── Pagination (Refs #35) — le composant force SA PROPRE border-radius
        // sur .origam-btn indépendamment du rounded global du thème (hook
        // vérifié OrigamPagination.vue:818-819) → override dédié nécessaire
        // pour des items carrés. Items non-actifs déjà bordés via le défaut
        // global origam-btn (variant outlined + border:true, réglé plus haut).
        // Actif : aplat prune + texte contrasté. Référence action.primary.bg/fg
        // (déjà #5b21b6+#fff light / #a78bfa+#0a0a0a dark — la paire fg est
        // DÉJÀ calibrée pour le contraste dans chaque mode, un blanc littéral
        // échouerait le contraste sur #a78bfa en dark) au lieu de hex littéraux.
        // Hooks vérifiés : OrigamPagination.vue:783-795.
        // ⚠️ CONFLIT VÉRIFIÉ (Playwright, computed-style) : le radius et la
        // couleur de texte actifs sont corrects, mais le BACKGROUND actif
        // est intercepté par une règle GLOBALE `!important` sur
        // `.origam-btn--variant-outlined.origam-btn--active` (OrigamBtn.vue:729,
        // `background-color: var(--origam-btn---background-color-active, …)
        // !important`) — la même règle qui sert le fond du toggle Light|Dark
        // (cf. commentaire `--origam-btn---background-color-active` plus haut).
        // Comme editorial définit ce token = bgSubtle (tint léger), l'item
        // actif de la pagination hérite du MÊME tint léger au lieu de l'aplat
        // plein #5b21b6 demandé par la spec — ce n'est pas invisible/cassé
        // (toujours prune, toujours distinct), mais ce n'est pas un aplat
        // plein. Pas de fix théorisable côté thème seul sans casser l'usage
        // d'origine du token (#toggle) ; à signaler au frontend-lead / designer
        // pour arbitrage (nouveau hook DS scoping pagination séparément, ou
        // accepter le tint).
        '--origam-pagination---border-radius': '0px',
        '--origam-pagination__item--is-active---background-color': 'var(--origam-color__action--primary---bg)',
        '--origam-pagination__item--is-active---color': 'var(--origam-color__action--primary---fg)',
        '--origam-pagination__item--is-active---border-color': 'var(--origam-color__action--primary---bg)',

        // ── Table (Refs #35, mirrors apple.theme.ts #266's verified pattern) —
        // header sunken + filets. Hooks vérifiés : OrigamTable.vue:228 (header
        // border-bottom), :235 (cell border). ⚠️ La spec ne donne qu'UNE teinte
        // de filet (#e4dccb, light uniquement) — pas d'équivalent dark
        // explicite ; valeur light ici, editorialDarkTheme revient explicitement
        // au token sémantique border-subtle (pas de hex inventé pour le dark).
        '--origam-table__header-cell---background-color': 'var(--origam-color__surface---sunken)',
        '--origam-table__cell---border-color': '#e4dccb',
        '--origam-table__header-cell---border-bottom-color': '#e4dccb',

        // ── Code line-highlight (Refs #35) — le filet latéral inset 3px EXISTE
        // déjà nativement (hook vérifié OrigamCode.vue:581-582 — box-shadow
        // inset 3px piloté par --origam-code__line-highlight---accent-color).
        // Références action.primary.bg/bgSubtle (déjà thémés par mode) plutôt
        // que des hex/alpha littéraux inventés.
        '--origam-code__line-highlight---background-color': 'var(--origam-color__action--primary---bgSubtle)',
        '--origam-code__line-highlight---accent-color': 'var(--origam-color__action--primary---bg)',

        // ── Avatar ring / group liseré (Refs #35, mirrors apple.theme.ts #266's
        // verified pattern) — appliqué directement sur CHAQUE avatar (pas de
        // dépendance au forward `border`/`borderColor` de origam-avatar-group,
        // #263, pas encore mergé sur develop à ce point). S'adapte
        // automatiquement à la surface courante (crème en light, quasi-noir en
        // dark) via la référence au token, pas une valeur figée. Hook vérifié :
        // OrigamAvatar.vue:235 (--origam-avatar---box-shadow, pas de défaut).
        // "Initiales en sérif" : BLOQUÉ — aucun hook font-family sur
        // OrigamAvatar (seuls font-size/font-weight existent, lignes 216-217).
        '--origam-avatar---box-shadow': '0 0 0 2px var(--origam-color__surface---default)',

        // ── List item actif (Refs #35) — tint via l'overlay existant
        // (OrigamListItem.vue __overlay, background-color par défaut
        // currentColor). ⚠️ L'opacité de l'overlay actif est HARDCODÉE en SCSS
        // (0.12 actif / 0.16 actif+hover, PAS de cssVar) — impossible d'obtenir
        // exactement rgba(...,.10)/rgba(...,.16) demandé par la spec ; on se
        // cale sur le mécanisme du DS (résultat ≈ 0.12 au repos actif, exact
        // 0.16 sur actif+hover). Couleur de texte active (#4c1d95 demandé) et
        // filet latéral 3px actif : BLOQUÉS, aucun hook (pas de
        // --origam-list-item---color du tout, pas de border per-side, pas de
        // sélecteur actif dédié à un accent latéral — vérifié par lecture
        // complète du composant). Référence action.primary.bg (auto-adapté).
        '--origam-list-item__overlay---background-color': 'var(--origam-color__action--primary---bg)',

        // ── Divider (Refs #35) — filet PLEIN (défaut = opacité 0.12, hook
        // vérifié OrigamDivider.vue:137). Variante "accent" = prop `color`
        // existante (déjà consommée via useBothColor → currentColor sur le
        // border ; pas de cssVar `--origam-divider--accent---*`, elle
        // n'existe pas et n'est pas inventée ici) — usage
        // `<origam-divider color="primary">` côté page.
        '--origam-divider---opacity': '1',

        // ── Blockquote (Refs #35) — hooks vérifiés OrigamBlockquote.vue:277
        // (accent-color, résout déjà sur action.primary.bg par défaut → prune
        // automatique, pas d'override nécessaire) et :274/:347 (font-style /
        // accent width, défauts normal/4px).
        '--origam-blockquote---font-style': 'italic',
        '--origam-blockquote__accent---width': '3px',

        // ── Password field strength (Refs #35) — segments carrés, gap 5px.
        // Hooks vérifiés : OrigamPasswordField.vue:777,784 (défauts 4px/9999px).
        '--origam-password-field__strength---gap': '5px',
        '--origam-password-field__strength---border-radius': '0px',

        // ── Sheet (Refs #35) — bordure hairline, pas d'ombre, pas de flou.
        // Hooks vérifiés : OrigamSheet.vue:269-298.
        '--origam-sheet---border-color': 'rgba(26, 23, 20, 0.40)',
        '--origam-sheet---background': 'var(--origam-color__surface---raised)',
        '--origam-sheet---box-shadow': 'none',
        '--origam-sheet---backdrop-filter': 'none'
    }
}

export const editorialDarkTheme: IOrigamTheme = {
    name: 'editorial',
    mode: 'dark',
    vars: {
        rounded: {
            card: '0px',
            btn: '0px',
            pill: '0px',
            sm: '0px',
            md: '0px',
            lg: '0px'
        },
        color: {
            surface: {
                default: '#0a0a0a',
                raised: '#0e0e0e',
                sunken: '#131313',
                overlay: '#131313',
                disabled: '#262626'
            },
            text: {
                primary: '#ffffff',
                secondary: '#d4d4d4',
                tertiary: '#d4d4d4',
                disabled: '#525252',
                inverse: '#0a0a0a',
                onColor: '#0a0a0a',
                ink: '#ffffff'
            },
            action: {
                primary: {
                    bg: '#a78bfa',
                    bgHover: '#8b5cf6',
                    bgSubtle: 'rgba(167, 139, 250, 0.14)',
                    bgDisabled: '#262626',
                    fg: '#0a0a0a',
                    fgSubtle: '#c4b5fd',
                    fgDisabled: '#525252'
                },
                secondary: {
                    bg: 'transparent',
                    bgHover: 'rgba(167, 139, 250, 0.08)',
                    bgDisabled: 'transparent',
                    fg: '#ffffff',
                    fgDisabled: '#525252'
                },
                ghost: {
                    bg: 'transparent',
                    bgHover: 'rgba(167, 139, 250, 0.08)',
                    bgDisabled: 'transparent',
                    fg: '#a78bfa',
                    fgDisabled: '#525252'
                }
            },
            border: {
                default: 'rgba(255, 255, 255, 0.10)',
                subtle: 'rgba(255, 255, 255, 0.05)',
                strong: 'rgba(255, 255, 255, 0.20)',
                focus: '#a78bfa',
                'subtle-alpha': 'rgba(255, 255, 255, 0.08)',
                ghost: 'rgba(255, 255, 255, 0.10)'
            },
            feedback: {
                success: {
                    bg: '#4ade80',
                    bgSubtle: 'rgba(74, 222, 128, 0.12)',
                    fg: '#0a0a0a',
                    fgSubtle: '#4ade80',
                    border: '#4ade80'
                },
                warning: {
                    bg: '#fbbf24',
                    bgSubtle: 'rgba(251, 191, 36, 0.12)',
                    fg: '#0a0a0a',
                    fgSubtle: '#fbbf24',
                    border: '#fbbf24'
                },
                danger: {
                    bg: '#f87171',
                    bgSubtle: 'rgba(248, 113, 113, 0.12)',
                    fg: '#0a0a0a',
                    fgSubtle: '#f87171',
                    border: '#f87171'
                },
                info: {
                    bg: '#60a5fa',
                    bgSubtle: 'rgba(96, 165, 250, 0.12)',
                    fg: '#0a0a0a',
                    fgSubtle: '#60a5fa',
                    border: '#60a5fa'
                }
            },
            'btn-primary-bg': '#a78bfa',
            'btn-primary-text': '#0a0a0a',
            'btn-secondary-bg': 'transparent',
            'btn-secondary-border': 'rgba(255, 255, 255, 0.30)',
            'btn-secondary-text': '#ffffff'
        },
        // ELEVATION (dark) : editorial = plat, pas d'ombre. Toute l'échelle à none
        // — sur fond sombre une ombre serait de toute façon imperceptible.
        shadow: {
            none: 'none',
            xs: 'none',
            sm: 'none',
            md: 'none',
            lg: 'none',
            xl: 'none'
        }
    },
    // ⛔ PROPS D'ABORD — overrides dark-only. Le reste des `components`
    // (checkbox/switch/select/sheet/…) vit dans editorialLightTheme, qui est
    // en réalité MODE-AGNOSTIC (pas de `mode` déclaré) et s'applique donc aux
    // deux modes ; seul ce qui diverge réellement par mode est redéfini ici.
    components: {
        // Breadcrumb (Refs #35) — la spec demande #c4b5fd en dark, qui
        // correspond à action.primary.fgSubtle (PAS action.primary.bg =
        // #a78bfa, une teinte différente) : divergence réelle de token, pas
        // juste une valeur adaptée — override dédié nécessaire.
        'origam-breadcrumb-item': { color: 'var(--origam-color__action--primary---fgSubtle)' }
    },
    cssVars: {
        "--origam-font-family---heading": "'Fraunces', 'Playfair Display', Georgia, serif",
        "--origam-title---font-family": "'Fraunces', 'Playfair Display', Georgia, serif",
        '--origam-font-weight---extrabold': '400',
        '--origam-letter-spacing---hero': '-0.04em',
        '--origam-line-height---hero': '0.9',
        '--origam-letter-spacing---tight': '-0.03em',
        '--origam-appbar---backdrop-filter': 'saturate(140%) blur(16px)',
        '--origam-menu---background': 'var(--origam-color__surface---default)',
        '--origam-menu---color': 'var(--origam-color__text---primary)',
        '--origam-menu---border-radius': '0px',
        '--origam-menu__content---padding': '4px',
        '--origam-list---background': 'transparent',
        '--origam-list---padding-block-start': '0',
        '--origam-list---padding-block-end': '0',
        '--origam-list-item---padding-inline-start': '12px',
        '--origam-list-item---padding-inline-end': '12px',
        '--origam-btn---border-width-outlined': '1px',
        '--origam-btn---border-width-ghost': '1px',
        '--origam-btn---box-shadow-elevated': 'none',
        '--origam-btn---box-shadow-ghost': 'none',
        '--origam-btn---border-radius': '0px',
        // See the matching comment in editorialLightTheme — same rationale,
        // dark-mode accent tint.
        '--origam-btn---background-color-active': 'var(--origam-color__action--primary---bgSubtle)',
        '--origam-card---background': 'var(--origam-color__surface---raised)',
        '--origam-card---border-color': 'var(--origam-color__border---default)',
        '--origam-card---border-style': 'solid',
        '--origam-card---border-top-width': '1px',
        '--origam-card---border-right-width': '1px',
        '--origam-card---border-bottom-width': '1px',
        '--origam-card---border-left-width': '1px',
        '--origam-card---box-shadow': 'none',
        '--origam-chip---border-radius': '0px',
        '--origam-chip---background-color': 'var(--origam-color__surface---raised)',
        '--origam-chip---border-color': 'var(--origam-color__border---default)',
        '--origam-chip---border-width': '1px',
        '--origam-chip---border-style': 'solid',
        '--origam-code---border-radius': '0px',
        '--origam-code---border-color': 'var(--origam-color__border---default)',
        '--origam-code---border-width': '1px',
        '--origam-field---border-radius': '0px',
        '--origam-field---border-opacity': '1',
        '--origam-alert---border-radius': '0px',
        '--origam-appbar---bg': 'color-mix(in srgb, #0a0a0a 72%, transparent)',
        '--origam-menu---box-shadow': '0 4px 24px -4px rgba(0, 0, 0, 0.50), 0 0 0 1px var(--origam-color__border---default)',
        '--origam-btn---border-color': 'rgba(255, 255, 255, 0.20)',
        '--origam-code---background-color': 'var(--origam-color__surface---sunken, #131313)',
        '--origam-field---border-color': 'rgba(255, 255, 255, 0.30)',

        // ── Overlay / Dialog scrim (Refs #35) — valeur DIFFÉRENTE du light
        // (rgba(0,0,0,.72) vs rgba(10,10,10,.62)), pas juste le même token
        // adapté — override littéral nécessaire. opacity/backdrop-filter déjà
        // corrects via le bloc mode-agnostic (editorialLightTheme).
        '--origam-overlay-scrim---background-color': 'rgba(0, 0, 0, 0.72)',

        // ── Tooltip (Refs #35) — chip inversé : clair sur fond sombre (spec
        // "#1a1714/#fff" → dark bg devient clair, texte devient encre).
        '--origam-tooltip---background-color': '#ffffff',
        '--origam-tooltip---color': '#1a1714',

        // ── Table filets (Refs #35) — la spec ne donne pas de hex dark pour
        // les filets (#e4dccb est light-only) ; on revient explicitement au
        // token sémantique border-subtle (déjà thémé dark) plutôt que de
        // laisser fuiter le hex clair du bloc mode-agnostic ou d'inventer une
        // valeur non spécifiée. À confirmer avec le designer si un filet plus
        // marqué est souhaité en dark.
        '--origam-table__cell---border-color': 'var(--origam-color__border---subtle)',
        '--origam-table__header-cell---border-bottom-color': 'var(--origam-color__border---subtle)',

        // ── Sheet (Refs #35) — bordure dark explicite (spec :
        // rgba(255,255,255,.30), distincte de la valeur light).
        '--origam-sheet---border-color': 'rgba(255, 255, 255, 0.30)'
    }
}

export const editorialThemes: IOrigamTheme[] = [editorialLightTheme, editorialDarkTheme]
