import type { IOrigamTheme } from 'origam/interfaces'

export const materialLightTheme: IOrigamTheme = {
    name: 'material',
    label: 'Material',
    vars: {
        rounded: {
            card: '28px',
            btn: '999px',
            pill: '999px',
            sm: '12px',
            md: '16px',
            lg: '28px'
        },
        color: {
            surface: {
                default: '#fef7ff',
                raised: '#ffffff',
                sunken: '#f7f2fa',
                overlay: '#f7f2fa',
                disabled: '#e8def8'
            },
            text: {
                primary: '#1c1b1f',
                secondary: '#49454f',
                tertiary: '#49454f',
                disabled: '#79747e',
                inverse: '#ffffff',
                onColor: '#ffffff',
                ink: '#1c1b1f'
            },
            action: {
                primary: {
                    bg: '#6750a4',
                    bgHover: '#21005d',
                    bgSubtle: '#eaddff',
                    bgDisabled: '#e8def8',
                    fg: '#ffffff',
                    fgSubtle: '#21005d',
                    fgDisabled: '#79747e'
                },
                secondary: {
                    bg: '#eaddff',
                    bgHover: '#d0bcff',
                    bgDisabled: '#e8def8',
                    fg: '#21005d',
                    fgDisabled: '#79747e'
                },
                ghost: {
                    bg: 'transparent',
                    bgHover: 'rgba(103, 80, 164, 0.08)',
                    bgDisabled: 'transparent',
                    fg: '#6750a4',
                    fgDisabled: '#79747e'
                }
            },
            border: {
                default: 'rgba(28, 27, 31, 0.12)',
                subtle: 'rgba(28, 27, 31, 0.06)',
                strong: 'rgba(28, 27, 31, 0.30)',
                focus: '#6750a4',
                'subtle-alpha': 'rgba(28, 27, 31, 0.08)',
                ghost: 'rgba(28, 27, 31, 0.06)'
            },
            feedback: {
                success: {
                    bg: '#388e3c',
                    bgSubtle: '#e8f5e9',
                    fg: '#000000',
                    fgSubtle: '#1b5e20',
                    border: '#388e3c'
                },
                warning: {
                    bg: '#f57c00',
                    bgSubtle: '#fff3e0',
                    fg: '#000000',
                    fgSubtle: '#9a3412',
                    border: '#f57c00'
                },
                danger: {
                    bg: '#b3261e',
                    bgSubtle: '#f9dedc',
                    fg: '#ffffff',
                    fgSubtle: '#601410',
                    border: '#b3261e'
                },
                info: {
                    bg: '#0288d1',
                    bgSubtle: '#e1f5fe',
                    fg: '#000000',
                    fgSubtle: '#01579b',
                    border: '#0288d1'
                }
            },
            'btn-primary-bg': 'transparent',
            'btn-primary-text': '#1c1b1f',
            'btn-secondary-bg': 'transparent',
            'btn-secondary-border': 'transparent',
            'btn-secondary-text': '#21005d'
        },
        // ⛔ ELEVATION = tier `shadow` sémantique. Rampe M3 (dp1..dp5) :
        // key layer (opacity 0.3) + ambient layer (opacity 0.15). Les composants
        // consomment via la prop `elevation` (bloc `components` ci-dessous).
        shadow: {
            none: 'none',
            xs: '0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)',
            sm: '0 1px 2px rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15)',
            md: '0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3)',
            lg: '0 6px 10px 4px rgba(0,0,0,0.15), 0 2px 3px rgba(0,0,0,0.3)',
            xl: '0 8px 12px 6px rgba(0,0,0,0.15), 0 4px 4px rgba(0,0,0,0.3)'
        }
    },
    // ⛔ PROPS D'ABORD (logique DS). Overrides Material superposés sur la baseline
    // `origam` (deep-merge). Identité M3 = très arrondi (rounded lg → 28px via
    // vars.rounded.lg ci-dessus), elevation TONALE, variantes elevated/tonal,
    // CHAMPS OUTLINED (correction utilisateur — pas filled). Seule la rampe shadow
    // (non exprimable en props) reste dans `vars`.
    //
    // Déclaré UNE SEULE FOIS (sur l'entrée mode-agnostic `materialLightTheme`, sans
    // `mode`) car `components` s'applique aux deux modes indifféremment (cf.
    // ~/.claude/origam-ds-reference.md). Les couleurs qui DIFFÈRENT entre light/dark
    // passent soit par un intent (`'primary'`, résolu par mode), soit par une
    // référence `var(--origam-…)` vers un token sémantique déjà dupliqué par mode
    // (`vars.color.action.primary.*`) ou vers un token d'aide `--origam-material---*`
    // déclaré dans les blocs `cssVars` light/dark plus bas.
    components: {
        'origam-btn': { variant: 'elevated', rounded: 'lg', elevation: 1 },
        'origam-btn-group': { variant: 'elevated', rounded: 'lg', elevation: 1 },
        'origam-btn-toggle': { variant: 'tonal', rounded: 'lg', elevation: 1 },
        'origam-card': { rounded: 'lg', flat: false, border: false, elevation: 1 },
        'origam-chip': { variant: 'tonal', rounded: 'lg', pill: true, border: false },
        'origam-alert': { rounded: 'lg', elevation: 1 },
        // CHAMPS OUTLINED (correction utilisateur) — vérifié IFieldProps / ITextFieldProps
        // etc. acceptent `variant: 'outlined'` (TFieldVariant). `origam-select` était déjà
        // outlined dans le thème précédent — les autres champs étaient encore `filled`,
        // corrigé ici pour l'uniformité M3.
        'origam-field': { variant: 'outlined', rounded: 'lg' },
        'origam-text-field': { variant: 'outlined', rounded: 'lg' },
        'origam-textarea-field': { variant: 'outlined', rounded: 'lg' },
        'origam-number-field': { variant: 'outlined', rounded: 'lg' },
        'origam-password-field': { variant: 'outlined', rounded: 'lg' },
        'origam-select': { variant: 'outlined', rounded: 'lg' },
        'origam-date-picker-field': { rounded: 'lg' },
        'origam-file-field': { rounded: 'lg' },
        'origam-color-picker-field': { rounded: 'lg' },
        'origam-code': { rounded: 'lg', elevation: 1 },
        'origam-menu': { rounded: 'lg', elevation: 2 },
        'origam-table': { rounded: 'lg', border: false, elevation: 1 },
        // Avatar tonal container — vérifié IAvatarProps extends IColorProps,
        // IBgColorProps. bgSubtle/fgSubtle du token action.primary égalent déjà
        // #eaddff/#21005d (light) et #4a4458/#eaddff (dark) — pas de nouveau hex.
        'origam-avatar': {
            rounded: 'lg',
            bgColor: 'var(--origam-color__action--primary---bgSubtle)',
            color: 'var(--origam-color__action--primary---fgSubtle)'
        },
        // Checkbox — vérifié ICheckboxProps extends IColorProps. La coche DS est une
        // icône outline (mdi checkbox-marked-outline), PAS un carré plein — `color:
        // 'primary'` colore la coche cochée en #6750a4/#d0bcff. Aucune var
        // `--origam-checkbox--checked---color` n'est consommée par le composant (grep
        // vérifié OrigamCheckboxBtn.vue / OrigamSelectionControl.vue) : le "#fff/#381e72"
        // du brief supposait un carré plein M3, non applicable à cette implémentation
        // DS. Documenté, pas bloqué — le résultat correct (coche teintée primary) est
        // atteint via la prop existante.
        'origam-checkbox': { rounded: 'md', color: 'primary' },
        // Radio — NEW. IRadioProps extends IColorProps → dot #6750a4/#d0bcff.
        'origam-radio': { color: 'primary' },
        // Switch — track off/on M3. `activeBgColor` est le SEUL hook effectivement
        // câblé à `model.value` dans OrigamSelectionControl.vue (`bgColor = model.value
        // ? (activeBgColor||bgColor) : bgColor`) — le prop moderne `active:{bgColor}`
        // n'est PAS lu par ce calcul. `activeBgColor` est @deprecated mais reste le seul
        // chemin fonctionnel, utilisé en connaissance de cause.
        // Thumb 16→24px à l'ON (signature M3) : BLOQUÉ — `--origam-switch__thumb---size`
        // est un var UNIQUE (pas de state `:checked` dédié, grep vérifié OrigamSwitch.vue)
        // → impossible de faire varier la taille par état sans toucher le composant DS.
        // Ticket DS à ouvrir : `--origam-switch__thumb--checked---size`.
        'origam-switch': {
            rounded: 'lg',
            bgColor: 'var(--origam-material---switch-track-off)',
            activeBgColor: 'primary'
        },
        'origam-snackbar': { rounded: 'lg', elevation: 3 },
        // Slider — ISliderFieldProps extends IColorProps + trackProps (color/bgColor/
        // rounded transmis au sous-composant track). bgSubtle égale déjà #eaddff/#4a4458.
        'origam-slider-field': {
            rounded: true,
            color: 'primary',
            trackProps: { bgColor: 'var(--origam-color__action--primary---bgSubtle)', rounded: true }
        },
        // Progress linear — même logique tonale que le slider (IProgressTypeProps
        // extends IColorProps, IBgColorProps ; IRoundedProps direct).
        'origam-progress-linear': {
            rounded: true,
            color: 'primary',
            bgColor: 'var(--origam-color__action--primary---bgSubtle)'
        },
        // Sheet — ISheetProps extends IRoundedProps. Grabber themé via cssVar dédiée
        // plus bas (--origam-sheet__handle---color).
        'origam-sheet': { rounded: 'lg' },
        // Dialog — IDialogProps extends ICardProps (donc IBgColorProps/IRoundedProps/
        // IElevationProps). Surface dialog #f3edf7 (light) diffère de card raised
        // #ffffff → nouveau token d'aide `--origam-material---dialog-surface` (dark =
        // #2b2930, identique à surface.raised dark, donc juste une référence).
        'origam-dialog': {
            rounded: 'lg',
            elevation: 3,
            bgColor: 'var(--origam-material---dialog-surface)'
        },
        // Tooltip — ITooltipProps extends IColorProps, IBgColorProps directement.
        // Surface inverse M3 : nouveaux tokens d'aide (pas de slot `overlay`/`inverse`
        // dans IThemeVars.color). "Pas de caret" : déjà natif — OrigamTooltip.vue n'a
        // aucun mécanisme de flèche/caret (grep vérifié), rien à désactiver.
        'origam-tooltip': {
            bgColor: 'var(--origam-material---tooltip-surface)',
            color: 'var(--origam-material---tooltip-on-surface)'
        },
        // Tabs — ITabsProps extends IRoundedProps, IColorProps, IBgColorProps,
        // `variant` accepte 'underline' (TAB_VARIANT). Couleur/épaisseur 3px de
        // l'indicateur réglées en cssVars (--origam-tabs__indicator---color/height,
        // hooks réels).
        'origam-tabs': { variant: 'underline' },
        // Bottom nav — IBottomNavProps extends IRoundedProps, IElevationProps.
        // Pastille active PAR ITEM : BLOQUÉ — les items sont des <origam-btn> bruts
        // fournis par le consommateur (prop `items`), sans sous-composant dédié
        // thémable indépendamment de la pagination (même conflit documenté dans
        // editorial.theme.ts : le seul hook est `--origam-btn---background-color-active`
        // GLOBAL, qui écraserait aussi les vars dédiées
        // `--origam-pagination__item--is-active---*` de la pagination — vérifié : la
        // règle `.origam-btn--active` lit `-active` en PRIORITÉ sur le
        // `--origam-btn---background-color` local que Pagination redéclare dans son
        // propre scope). Choix assumé : NE PAS toucher ce var global pour ne pas casser
        // la pagination (qui a un hook propre et correct) — la pastille active du
        // bottom-nav reste non-thémable sans ticket DS
        // (`--origam-bottom-bar__item--active---background-color`).
        'origam-bottom-nav': { rounded: 'lg', elevation: 2 },
        // Breadcrumb — liens uniquement (pas le séparateur/chevron) : ciblé sur
        // `origam-breadcrumb-item`, PAS le container `origam-breadcrumb` (qui
        // recolorerait aussi `origam-breadcrumb-divider`).
        'origam-breadcrumb-item': { color: 'primary' },
        // Pagination — IPaginationProps N'EXTENDS PAS IRoundedProps (vérifié — aucune
        // prop `rounded`) : `rounded:'pill'` du brief est INAPPLICABLE tel quel, la
        // forme est pilotée par la cssVar dédiée `--origam-pagination---border-radius`
        // (voir cssVars plus bas), légitime escape-hatch puisqu'aucune prop ne couvre ce
        // besoin. Couleurs actives via les vars dédiées
        // `--origam-pagination__item--is-active---*` (hooks propres, indépendants du
        // `--origam-btn---background-color-active` global — voir note bottom-nav).
        'origam-list': { nav: true, rounded: 'lg' },
        'origam-list-item': { rounded: 'lg' },
        // Title — ITitleProps extends ITypographyProps. `fontWeight:'regular'` (400,
        // valeur réelle de TFontWeight). `fontFamily` NON réglé ici : le thème fixe déjà
        // `--origam-title---font-family` / `--origam-font-family---heading` à Roboto via
        // cssVars ; ajouter la prop `fontFamily` émettrait un style inline pointant vers
        // le token primitif `--origam-font__family---sans` (différent), écrasant le
        // override Roboto déjà correct — évité.
        'origam-title': { fontWeight: 'regular' },
        // Divider — IDividerProps extends IColorProps. outline-variant M3 = nouveau
        // token d'aide (pas de slot existant dans IThemeVars.color pour cette teinte).
        'origam-divider': { color: 'var(--origam-material---outline-variant)' },
        // Blockquote — IBlockquoteProps extends IBgColorProps + IAccentColorProps
        // directement. Conteneur tonal = bgSubtle (égale déjà #eaddff/#4a4458), accent =
        // intent 'primary' (déjà la valeur par défaut du composant, réglé explicitement
        // pour la lisibilité du thème).
        'origam-blockquote': {
            bgColor: 'var(--origam-color__action--primary---bgSubtle)',
            accentColor: 'primary',
            rounded: 'lg'
        }
    },
    cssVars: {
        "--origam-font-family---heading": "'Roboto', 'Inter', -apple-system, sans-serif",
        "--origam-title---font-family": "'Roboto', 'Inter', -apple-system, sans-serif",
        '--origam-font-weight---extrabold': '600',
        '--origam-letter-spacing---hero': '-0.025em',
        '--origam-appbar---backdrop-filter': 'saturate(140%) blur(16px)',
        '--origam-menu---background': 'var(--origam-color__surface---raised)',
        '--origam-menu---color': 'var(--origam-color__text---primary)',
        '--origam-menu---border-radius': '16px',
        '--origam-menu__content---padding': '6px',
        '--origam-list---background': 'transparent',
        '--origam-list---padding-block-start': '0',
        '--origam-list---padding-block-end': '0',
        '--origam-list-item---padding-inline-start': '12px',
        '--origam-list-item---padding-inline-end': '12px',
        '--origam-card---background': 'var(--origam-color__surface---raised)',
        '--origam-card---border-radius': '28px',
        '--origam-card---border-width': '1px',
        '--origam-card---border-color': 'var(--origam-color__border---default)',
        '--origam-chip---border-radius': '999px',
        '--origam-chip---background': 'var(--origam-color__surface---raised)',
        '--origam-chip---background-color': 'var(--origam-color__surface---raised)',
        '--origam-chip---border-color': 'var(--origam-color__border---default)',
        '--origam-btn---border-radius': '999px',
        '--origam-btn---border-radius-rounded': '999px',
        '--origam-btn---border-color': 'var(--origam-color__border---default)',
        '--origam-btn---border-width-outlined': '1px',
        '--origam-btn---border-width-ghost': '1px',
        '--origam-btn---box-shadow-elevated': '0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)',
        '--origam-btn---box-shadow-ghost': 'none',
        '--origam-code---border-radius': '12px',
        '--origam-code---border-width': '0',
        '--origam-alert---border-radius': 'var(--origam-radius---lg, 12px)',
        '--origam-alert---box-shadow-elevated': '0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)',
        '--origam-table---border-radius': '28px',
        '--origam-appbar---bg': 'color-mix(in srgb, #fef7ff 72%, transparent)',
        '--origam-menu---box-shadow': '0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(208, 188, 255, 0.15), 0 0 0 1px var(--origam-color__border---default)',

        // ── Tokens d'aide `--origam-material---*` (LIGHT) ───────────────────────
        // Valeurs M3 sans slot existant dans IThemeVars.color — référencées depuis
        // le bloc `components` ci-dessus (mode-agnostic) via `var(--origam-material---…)`.
        '--origam-material---switch-track-off': '#e6e0e9',
        '--origam-material---tooltip-surface': '#322f35',
        '--origam-material---tooltip-on-surface': '#ffffff',
        '--origam-material---dialog-surface': '#f3edf7',
        '--origam-material---outline-variant': '#cac4d0',
        '--origam-material---field-border': '#79747e',
        '--origam-material---table-header-tint': '#f2e9fb',

        // ── Champs OUTLINED (Refs #37) — hooks vérifiés OrigamField.vue (grep
        // `var(--origam-field`) : `---background-color` (fond, défaut transparent déjà),
        // `---border-color` (couleur unique consommée aussi bien au repos qu'en erreur
        // via `--origam-field--error---border-color`, laissé à son défaut = déjà
        // #b3261e/feedback.danger.border), `---border-width-outlined` /
        // `---border-opacity-outlined` (le variant `-outlined` applique une OPACITY sur
        // toute la bordure, défaut .38 → wash-out, mis à 1 pour un trait plein M3),
        // `---focus-ring-*` (anneau de focus, PAS un changement de border-width — mis à
        // 2px + offset -1px pour se superposer exactement au 1px de bordure et lire
        // comme "bordure 2px" au focus, sans halo qui déborderait).
        '--origam-field---background-color': 'transparent',
        '--origam-field---border-color': 'var(--origam-material---field-border)',
        '--origam-field---border-width-outlined': '1px',
        '--origam-field---border-opacity-outlined': '1',
        '--origam-field---focus-ring-width': '2px',
        '--origam-field---focus-ring-color': 'var(--origam-color__action--primary---bg)',
        '--origam-field---focus-ring-offset': '-1px',

        // ── Scrim dialog (Refs #37) — ⚠️ PIÈGE vérifié OrigamOverlay.vue:437-441 :
        // `opacity: var(--origam-overlay__scrim---opacity, 0.32)` est un MULTIPLICATEUR
        // appliqué EN PLUS de `background-color`. Poser une rgba(…,0.32) sans neutraliser
        // ce multiplicateur donnerait 0.32×0.32≈10% au lieu de 32%. Fix : couleur pleine
        // + `---opacity: 1` pour annuler le multiplicateur. Dialog consomme le préfixe
        // BEM `__scrim` (composant `OrigamOverlay`, pas le composant standalone
        // `OrigamOverlayScrim` — vérifié, aucun composant du DS n'instancie ce dernier) ;
        // les deux familles sont réglées par prudence. Pas de backdrop-filter par défaut
        // sur `__scrim` (aucune déclaration dans le SCSS, donc déjà "sans blur" nativement).
        '--origam-overlay__scrim---background-color': 'rgba(0, 0, 0, 0.32)',
        '--origam-overlay__scrim---opacity': '1',
        '--origam-overlay-scrim---background-color': 'rgba(0, 0, 0, 0.32)',
        '--origam-overlay-scrim---opacity': '1',
        '--origam-overlay-scrim---backdrop-filter': 'none',

        // ── Sheet grabber (Refs #37) — hook vérifié OrigamSheet.vue:407
        // (--origam-sheet__handle---color, défaut border.subtle).
        '--origam-sheet__handle---color': 'var(--origam-material---outline-variant)',

        // ── Tabs underline 3px (Refs #37) — hooks vérifiés OrigamTabs (grep) :
        // --origam-tabs__indicator---height/---color, défauts 2px/currentColor.
        '--origam-tabs__indicator---color': 'var(--origam-color__action--primary---bg)',
        '--origam-tabs__indicator---height': '3px',

        // ── Divider (Refs #37) — pas de hook direct dédié pour la couleur de trait ;
        // le composant peint via `color`/`bgColor` (useBothColor), réglé côté prop dans
        // `components` ci-dessus. Rien à ajouter ici.

        // ── Pagination (Refs #37) — IPaginationProps n'a PAS de prop `rounded` (vérifié) :
        // forme pilotée par cssVar directe. Hooks vérifiés OrigamPagination.vue:766-801 :
        // items actifs déjà scopés indépendamment du `--origam-btn---background-color-active`
        // global (voir commentaire bottom-nav dans `components`). Cible tactile ~44px via
        // padding-block/inline (défauts 0/0 pour le container ; la taille réelle des items
        // vient de `origam-btn` — density/size non touchés ici pour rester props-first,
        // seul le rounded-pill et les couleurs actives sont des escape-hatches légitimes).
        '--origam-pagination---border-radius': '9999px',
        '--origam-pagination---border-radius-rounded': '9999px',
        '--origam-pagination---background-color-hover': 'rgba(103, 80, 164, 0.08)',
        '--origam-pagination__item--is-active---background-color': 'var(--origam-color__action--primary---bg)',
        '--origam-pagination__item--is-active---color': 'var(--origam-color__action--primary---fg)',

        // ── List / Menu state layer (Refs #37) — hook vérifié OrigamListItem.vue:497-522 :
        // `__overlay---background-color` défaut `currentColor`, opacités 0.08 (hover) /
        // 0.12 (active) / 0.16 (active+hover) déjà câblées en dur dans le composant (pas
        // de var pour ces %, seul le TEINT est réglable). Menu réutilise EXACTEMENT ce
        // même hook (items = <origam-list-item> internes, vérifié OrigamMenu.vue:32-65)
        // → un seul override sert les deux (menu hover ≈ rgba(103,80,164,.08) demandé).
        '--origam-list-item__overlay---background-color': 'var(--origam-color__action--primary---bg)',

        // ── Table header tint (Refs #37) — hook vérifié OrigamTable.vue:223
        // (--origam-table__header-cell---background-color, défaut surface.overlay).
        '--origam-table__header-cell---background-color': 'var(--origam-material---table-header-tint)',

        // ── Code (Refs #37) — highlight de ligne. Hook vérifié OrigamCode.vue (grep
        // --origam-code__line-highlight---*). ⚠️ Coloration SYNTAXIQUE (kw/str/fn) NON
        // themable via IOrigamTheme : Shiki pré-calcule ses propres couleurs light/dark
        // par token (`--shiki-light`/`--shiki-dark` inline sur chaque span, cf.
        // OrigamCode.vue:611-648) — aucune cssVar `--origam-*` n'intercepte cette
        // coloration. BLOQUÉ pour le thème seul : nécessiterait un thème Shiki dédié
        // (hors périmètre `material.theme.ts`).
        '--origam-code__line-highlight---background-color': 'rgba(103, 80, 164, 0.09)',
        '--origam-code__line-highlight---accent-color': 'var(--origam-color__action--primary---bg)'
    }
}

export const materialDarkTheme: IOrigamTheme = {
    name: 'material',
    mode: 'dark',
    vars: {
        rounded: {
            card: '28px',
            btn: '999px',
            pill: '999px',
            sm: '12px',
            md: '16px',
            lg: '28px'
        },
        color: {
            surface: {
                default: '#1c1b1f',
                raised: '#2b2930',
                sunken: '#36343b',
                overlay: '#36343b',
                disabled: '#49454f'
            },
            text: {
                primary: '#e6e1e5',
                secondary: '#cac4d0',
                tertiary: '#cac4d0',
                disabled: '#79747e',
                inverse: '#1c1b1f',
                onColor: '#381e72',
                ink: '#e6e1e5'
            },
            action: {
                primary: {
                    bg: '#d0bcff',
                    bgHover: '#eaddff',
                    bgSubtle: '#4a4458',
                    bgDisabled: '#49454f',
                    fg: '#381e72',
                    fgSubtle: '#eaddff',
                    fgDisabled: '#79747e'
                },
                secondary: {
                    bg: '#4a4458',
                    bgHover: '#625b71',
                    bgDisabled: '#49454f',
                    fg: '#eaddff',
                    fgDisabled: '#79747e'
                },
                ghost: {
                    bg: 'transparent',
                    bgHover: 'rgba(208, 188, 255, 0.08)',
                    bgDisabled: 'transparent',
                    fg: '#d0bcff',
                    fgDisabled: '#79747e'
                }
            },
            border: {
                default: 'rgba(202, 196, 208, 0.12)',
                subtle: 'rgba(202, 196, 208, 0.06)',
                strong: 'rgba(202, 196, 208, 0.30)',
                focus: '#d0bcff',
                'subtle-alpha': 'rgba(202, 196, 208, 0.08)',
                ghost: 'rgba(202, 196, 208, 0.06)'
            },
            feedback: {
                success: {
                    bg: '#81c784',
                    bgSubtle: 'rgba(110, 231, 183, 0.14)',
                    fg: '#1b5e20',
                    fgSubtle: '#c5e1a5',
                    border: '#c5e1a5'
                },
                warning: {
                    bg: '#ffb300',
                    bgSubtle: 'rgba(255, 224, 130, 0.12)',
                    fg: '#3e2723',
                    fgSubtle: '#ffe082',
                    border: '#ffe082'
                },
                danger: {
                    bg: '#e57373',
                    bgSubtle: 'rgba(249, 222, 220, 0.12)',
                    fg: '#3e0012',
                    fgSubtle: '#f9dedc',
                    border: '#f9dedc'
                },
                info: {
                    bg: '#d0bcff',
                    bgSubtle: 'rgba(208, 188, 255, 0.12)',
                    fg: '#381e72',
                    fgSubtle: '#eaddff',
                    border: '#d0bcff'
                }
            },
            'btn-primary-bg': 'transparent',
            'btn-primary-text': '#e6e1e5',
            'btn-secondary-bg': 'transparent',
            'btn-secondary-border': 'transparent',
            'btn-secondary-text': '#eaddff'
        },
        // ELEVATION (dark) : M3 dark mode → même rampe key+ambient, alphas renforcés
        // car les surfaces sombres offrent moins de contraste pour l'elevation tonale.
        shadow: {
            none: 'none',
            xs: '0 1px 2px rgba(0,0,0,0.5), 0 1px 3px 1px rgba(0,0,0,0.3)',
            sm: '0 1px 2px rgba(0,0,0,0.5), 0 2px 6px 2px rgba(0,0,0,0.3)',
            md: '0 4px 8px 3px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.5)',
            lg: '0 6px 10px 4px rgba(0,0,0,0.3), 0 2px 3px rgba(0,0,0,0.5)',
            xl: '0 8px 12px 6px rgba(0,0,0,0.3), 0 4px 4px rgba(0,0,0,0.5)'
        }
    },
    cssVars: {
        "--origam-font-family---heading": "'Roboto', 'Inter', -apple-system, sans-serif",
        "--origam-title---font-family": "'Roboto', 'Inter', -apple-system, sans-serif",
        '--origam-font-weight---extrabold': '600',
        '--origam-letter-spacing---hero': '-0.025em',
        '--origam-appbar---backdrop-filter': 'saturate(140%) blur(16px)',
        '--origam-menu---background': 'var(--origam-color__surface---raised)',
        '--origam-menu---color': 'var(--origam-color__text---primary)',
        '--origam-menu---border-radius': '16px',
        '--origam-menu__content---padding': '6px',
        '--origam-list---background': 'transparent',
        '--origam-list---padding-block-start': '0',
        '--origam-list---padding-block-end': '0',
        '--origam-list-item---padding-inline-start': '12px',
        '--origam-list-item---padding-inline-end': '12px',
        '--origam-card---background': 'var(--origam-color__surface---raised)',
        '--origam-card---border-radius': '28px',
        '--origam-card---border-width': '1px',
        '--origam-card---border-color': 'var(--origam-color__border---default)',
        '--origam-chip---border-radius': '999px',
        '--origam-chip---background': 'var(--origam-color__surface---raised)',
        '--origam-chip---background-color': 'var(--origam-color__surface---raised)',
        '--origam-chip---border-color': 'var(--origam-color__border---default)',
        '--origam-btn---border-radius': '999px',
        '--origam-btn---border-radius-rounded': '999px',
        '--origam-btn---border-color': 'var(--origam-color__border---default)',
        '--origam-btn---border-width-outlined': '1px',
        '--origam-btn---border-width-ghost': '1px',
        '--origam-btn---box-shadow-elevated': '0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)',
        '--origam-btn---box-shadow-ghost': 'none',
        '--origam-code---border-radius': '12px',
        '--origam-code---border-width': '0',
        '--origam-alert---border-radius': 'var(--origam-radius---lg, 12px)',
        '--origam-alert---box-shadow-elevated': '0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)',
        '--origam-table---border-radius': '28px',
        '--origam-appbar---bg': 'color-mix(in srgb, #1c1b1f 72%, transparent)',
        '--origam-menu---box-shadow': '0 4px 24px -4px rgba(0, 0, 0, 0.50), 0 1px 2px rgba(0, 0, 0, 0.30), 0 0 0 1px var(--origam-color__border---default)',

        // ── Tokens d'aide `--origam-material---*` (DARK) — miroir du bloc light,
        // voir commentaires détaillés dans materialLightTheme.cssVars.
        '--origam-material---switch-track-off': '#36343b',
        '--origam-material---tooltip-surface': '#e6e1e5',
        '--origam-material---tooltip-on-surface': '#322f35',
        '--origam-material---dialog-surface': '#2b2930',
        '--origam-material---outline-variant': '#49454f',
        '--origam-material---field-border': '#938f99',
        '--origam-material---table-header-tint': '#3a3546',

        // ── Champs OUTLINED (dark) — mêmes hooks que light, voir commentaires détaillés
        // dans materialLightTheme.cssVars.
        '--origam-field---background-color': 'transparent',
        '--origam-field---border-color': 'var(--origam-material---field-border)',
        '--origam-field---border-width-outlined': '1px',
        '--origam-field---border-opacity-outlined': '1',
        '--origam-field---focus-ring-width': '2px',
        '--origam-field---focus-ring-color': 'var(--origam-color__action--primary---bg)',
        '--origam-field---focus-ring-offset': '-1px',

        // ── Scrim dialog (dark) — même piège opacity que light (cf. commentaire
        // materialLightTheme.cssVars).
        '--origam-overlay__scrim---background-color': 'rgba(0, 0, 0, 0.32)',
        '--origam-overlay__scrim---opacity': '1',
        '--origam-overlay-scrim---background-color': 'rgba(0, 0, 0, 0.32)',
        '--origam-overlay-scrim---opacity': '1',
        '--origam-overlay-scrim---backdrop-filter': 'none',

        '--origam-sheet__handle---color': 'var(--origam-material---outline-variant)',

        '--origam-tabs__indicator---color': 'var(--origam-color__action--primary---bg)',
        '--origam-tabs__indicator---height': '3px',

        '--origam-pagination---border-radius': '9999px',
        '--origam-pagination---border-radius-rounded': '9999px',
        '--origam-pagination---background-color-hover': 'rgba(208, 188, 255, 0.08)',
        '--origam-pagination__item--is-active---background-color': 'var(--origam-color__action--primary---bg)',
        '--origam-pagination__item--is-active---color': 'var(--origam-color__action--primary---fg)',

        '--origam-list-item__overlay---background-color': 'var(--origam-color__action--primary---bg)',

        '--origam-table__header-cell---background-color': 'var(--origam-material---table-header-tint)',

        '--origam-code__line-highlight---background-color': 'rgba(208, 188, 255, 0.09)',
        '--origam-code__line-highlight---accent-color': 'var(--origam-color__action--primary---bg)'
    }
}

export const materialThemes: IOrigamTheme[] = [materialLightTheme, materialDarkTheme]
