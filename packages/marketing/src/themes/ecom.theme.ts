import type { IOrigamTheme } from 'origam/interfaces'

export const ecomLightTheme: IOrigamTheme = {
    name: 'ecom',
    label: 'Ecom',
    vars: {
        rounded: {
            card: '10px',
            btn: '6px',
            pill: '999px',
            sm: '4px',
            md: '10px',
            lg: '10px'
        },
        color: {
            surface: {
                default: '#fff7f0',
                raised: '#ffffff',
                sunken: '#ffedd5',
                overlay: '#ffedd5',
                disabled: '#fed7aa'
            },
            text: {
                primary: '#1a1a1a',
                secondary: '#404040',
                tertiary: '#404040',
                disabled: '#a3a3a3',
                inverse: '#ffffff',
                onColor: '#ffffff',
                ink: '#1a1a1a'
            },
            action: {
                primary: {
                    bg: '#e11d48',
                    bgHover: '#be123c',
                    bgSubtle: '#ffe4e6',
                    bgDisabled: '#fed7aa',
                    fg: '#ffffff',
                    fgSubtle: '#be123c',
                    fgDisabled: '#a3a3a3'
                },
                secondary: {
                    bg: '#ffffff',
                    bgHover: '#ffedd5',
                    bgDisabled: '#fed7aa',
                    fg: '#1a1a1a',
                    fgDisabled: '#a3a3a3'
                },
                ghost: {
                    bg: 'transparent',
                    bgHover: 'rgba(225, 29, 72, 0.06)',
                    bgDisabled: 'transparent',
                    fg: '#e11d48',
                    fgDisabled: '#a3a3a3'
                }
            },
            border: {
                default: '#fed7aa',
                subtle: '#ffedd5',
                strong: '#fb923c',
                focus: '#e11d48',
                'subtle-alpha': 'rgba(254, 215, 170, 0.60)',
                ghost: 'rgba(254, 215, 170, 0.50)'
            },
            feedback: {
                success: {
                    bg: '#16a34a',
                    bgSubtle: '#f0fdf4',
                    fg: '#000000',
                    fgSubtle: '#15803d',
                    border: '#16a34a'
                },
                warning: {
                    bg: '#b45309',
                    bgSubtle: '#fffbeb',
                    fg: '#ffffff',
                    fgSubtle: '#92400e',
                    border: '#b45309'
                },
                danger: {
                    bg: '#dc2626',
                    bgSubtle: '#fff1f2',
                    fg: '#ffffff',
                    fgSubtle: '#b91c1c',
                    border: '#dc2626'
                },
                info: {
                    bg: '#1677ff',
                    bgSubtle: '#eff6ff',
                    fg: '#000000',
                    fgSubtle: '#1d4ed8',
                    border: '#1677ff'
                }
            },
            'btn-primary-bg': '#e11d48',
            'btn-primary-text': '#ffffff',
            'btn-secondary-bg': 'transparent',
            'btn-secondary-border': '#fed7aa',
            'btn-secondary-text': '#1a1a1a'
        },
        // ⛔ ELEVATION = le tier `shadow` sémantique. Échelle croissante avec teinte
        // rose/rouge de marque (rgba(225,29,72,…)), subtile et propre façon AliExpress /
        // Ant Design. Consommée via la prop `elevation`, jamais de shadow inline.
        shadow: {
            none: 'none',
            xs: '0px 1px 2px 0px rgba(225, 29, 72, 0.06)',
            sm: '0px 2px 4px 0px rgba(225, 29, 72, 0.08), 0px 1px 2px -1px rgba(0, 0, 0, 0.04)',
            md: '0px 4px 12px 0px rgba(225, 29, 72, 0.10), 0px 1px 3px 0px rgba(0, 0, 0, 0.06)',
            lg: '0px 8px 20px 0px rgba(225, 29, 72, 0.12), 0px 2px 6px -1px rgba(0, 0, 0, 0.08)',
            xl: '0px 12px 32px 0px rgba(225, 29, 72, 0.15), 0px 4px 10px -2px rgba(0, 0, 0, 0.10)'
        }
    },
    // ⛔ PROPS D'ABORD (logique DS). Overrides ecom superposés sur la baseline
    // `origam` (deep-merge). Identité e-commerce (AliExpress / Ant Design) :
    // arrondi modéré (sm/md), boutons flat d'action, cartes propres avec ombre légère.
    components: {
        'origam-btn': { variant: 'flat', rounded: 'sm', elevation: 1 },
        'origam-btn-group': { variant: 'flat', rounded: 'sm', elevation: 1 },
        'origam-btn-toggle': { variant: 'flat', rounded: 'sm', elevation: 1 },
        'origam-card': { rounded: 'md', border: true, flat: false, elevation: 1 },
        'origam-chip': { variant: 'outlined', rounded: 'sm', border: true, pill: false },
        'origam-alert': { rounded: 'sm', border: true },
        'origam-field': { variant: 'outlined', rounded: 'sm', border: true },
        'origam-text-field': { variant: 'outlined', rounded: 'sm', border: true },
        'origam-textarea-field': { variant: 'outlined', rounded: 'sm', border: true },
        'origam-number-field': { rounded: 'sm', border: true },
        'origam-password-field': { rounded: 'sm' },
        'origam-select': { variant: 'outlined', rounded: 'sm', border: true },
        'origam-date-picker-field': { rounded: 'sm', border: true },
        'origam-file-field': { rounded: 'sm', border: true },
        'origam-color-picker-field': { rounded: 'sm', border: true },
        'origam-code': { rounded: 'md', border: true, elevation: 1 },
        'origam-menu': { rounded: 'sm', border: true, elevation: 2 },
        'origam-list-item': { rounded: 'sm' },
        'origam-table': { rounded: 'md', border: true },
        // Avatar initiales (Refs #36) — pas de hook dédié aux initiales
        // (audit : OrigamAvatar.vue n'a que `--origam-avatar---color`
        // générique, piloté par la prop `color` standard IColorProps). On
        // référence `action.primary.fgSubtle` (#be123c light / #fb7185 dark,
        // exact match spec) plutôt qu'un hex littéral pour s'auto-adapter aux
        // 2 modes depuis ce bloc mode-agnostic.
        'origam-avatar': { rounded: 'sm', color: 'var(--origam-color__action--primary---fgSubtle)' },
        // Checkbox (Refs #36) — `rounded:'sm'` conforme à la spec.
        // ⛔ `activeBgColor` retiré (purge DS des props d'état à plat,
        // dossier state-color) : empiriquement re-vérifié (mount + thème,
        // pas juste lecture) que le glyph coché n'a AUCUN style inline sous
        // ce thème — la prop était déjà inerte avant son retrait de l'API.
        // Cause : le glyph coché est peint par `OrigamSelectionControl.vue`
        // via `:color="bgColor"` STATIQUE, jamais par un axe actif séparé.
        // Le gap DS reste le même qu'avant (#241) : pas de hook dédié pour
        // distinguer le contour (non coché) du glyph rempli (coché) — non
        // résolu par cette purge, à traiter dans un ticket DS séparé.
        'origam-checkbox': { rounded: 'sm' },
        // Radio (Refs #36) — ⛔ `activeBgColor` retiré (purge DS). Gap DS
        // préexistant et INCHANGÉ par cette purge : `OrigamRadio.vue`
        // n'appelle jamais `useDefaults()` (contrairement à
        // `OrigamCheckbox.vue`), donc `theme.components['origam-radio']`
        // n'injecte aucune prop par défaut, quel que soit son nom — vérifié
        // à nouveau (mount + thème) que le dot coché reste `text.primary`.
        // Pas de remplacement à ce thème : ticket DS requis
        // (`OrigamRadio.vue` : ajouter `useDefaults()`) avant qu'un
        // quelconque hook de couleur puisse fonctionner ici.
        'origam-radio': {},
        // Switch harmony (lot 4) — mirrors `origam-text-field`'s rounded/
        // border so the track reads as the same visual family as the
        // theme's fields (see cartoon.theme.ts for the full rationale).
        // ⛔ `activeBgColor` retiré (purge DS) : re-vérifié empiriquement
        // (mount + thème) que `.origam-switch-track` n'a aucun style inline
        // sous ce thème — la prop était déjà inerte avant son retrait de
        // l'API (`ISwitchProps` étend `IActiveProps`/`IHoverProps`, jamais
        // de prop plate `activeBgColor`). Thumb : le défaut DS n'est PAS
        // blanc pur comme documenté par le composant mais résout à
        // `--origam-color__surface---default` (cream #fff7f0 light, brun
        // #1a0f0a dark, constaté sur le composant réel) — override cssVar
        // dédié posé plus bas (`--origam-switch__thumb---background-color:
        // #ffffff`, constant, même valeur les 2 modes) pour honorer "thumb
        // blanc".
        'origam-switch': { rounded: 'sm', border: true },
        // SliderField (Refs #36) — ⚠️ BLOQUÉ, confirmé EMPIRIQUEMENT
        // (Playwright) : `OrigamSliderField.vue` utilise un simple
        // `withDefaults(defineProps<...>(), {...})` (grep confirmé, PAS de
        // `useDefaults()`) — TROISIÈME composant après Radio et Tabs avec ce
        // même gap DS. Conséquence : NI `rounded:true` NI `color` (ni
        // `bgColor`) ne sont injectés depuis le thème, quel que soit leur nom
        // — testé les deux (`bgColor` puis `color`, cf. historique), le fill
        // reste `rgb(84,84,84)` (défaut SCSS hardcodé) dans les 2 cas. Pour
        // mémoire (si le gap DS est corrigé un jour) : c'est bien `color` qui
        // peindrait le FILL et `bgColor` le RAIL (OrigamSliderFieldTrack.vue:
        // 120-123, le commentaire "`bgColor` paints the rail" à la ligne 842
        // le confirme — l'inverse de l'hypothèse initiale). Le hook cssVar du
        // thumb (`--origam-slider-field-thumb__surface---border-color`, posé
        // plus bas) FONCTIONNE, lui (pas gated par useDefaults, c'est un
        // cssVar consommé directement en SCSS) — vérifié rose dans les 2
        // modes. Prop laissée par intention PROPS-FIRST — ticket DS requis
        // (`OrigamSliderField.vue` : ajouter `useDefaults()`).
        'origam-slider-field': { rounded: true, color: 'linear-gradient(90deg, #fb923c, #e11d48)' },
        // Sheet (Refs #36) — pas encore dans `components`, ajouté ici.
        'origam-sheet': { rounded: 'md', border: true, elevation: 2 },
        // Dialog (Refs #36) — pas encore dans `components`, ajouté ici (scrim
        // géré séparément via `--origam-overlay-scrim---*` en cssVars).
        'origam-dialog': { rounded: 'md', elevation: 4 },
        // Tabs (Refs #36) — ⚠️ BLOQUÉ, confirmé EMPIRIQUEMENT (Playwright,
        // 2 pages réelles testées : une page temporaire de vérif + la doc
        // playground) : `variant:'pills'` est INERTE. Cause racine : `OrigamTabs.vue`
        // (le composant PARENT, seul propriétaire de la prop `variant`) n'appelle
        // JAMAIS `useDefaults()` — seul l'enfant `OrigamTab.vue` l'appelle
        // (ligne 89), mais `variant` n'est PAS une prop de `OrigamTab`, c'est
        // une prop de `OrigamTabs`. Donc le thème ne peut théoriquement pas
        // injecter `variant` sur les Tabs du tout. Constaté : l'item actif
        // rend un style générique (fond `rgba(0,0,0,.04)`, texte `text.primary`)
        // au lieu du fond/texte pills attendu — donc les hooks
        // `--origam-tabs__item--pills--active---*` posés en cssVars plus bas
        // sont ÉGALEMENT inertes (leur sélecteur SCSS ne matche que sous la
        // classe `.origam-tabs--pills`/`.origam-tab--pills`, jamais posée).
        // Prop laissée ici par intention PROPS-FIRST (même limitation
        // pré-existante que cartoon/glass/geek.theme.ts qui posent la même
        // prop) — à signaler en ticket DS (`OrigamTabs.vue` : ajouter
        // `useDefaults()`), PAS un bug propre à ce thème.
        'origam-tabs': { variant: 'pills' },
        // Breadcrumb (Refs #36, mirrors apple.theme.ts #266 / editorial.theme.ts
        // #35's verified pattern) — `color` est la SEULE route thémable (pas
        // de cssVar dédiée sur BreadcrumbItem, vérifié — `--origam-breadcrumb-item
        // ---color-token` existe mais n'est jamais défini nulle part, mort).
        // Valeur light ici (#e11d48 = action.primary.bg) ; ecomDarkTheme
        // surcharge avec fgSubtle (#fb7185, spec explicite — divergence réelle
        // de token, pas juste une valeur adaptée).
        'origam-breadcrumb-item': { color: 'var(--origam-color__action--primary---bg)' },
        'origam-snackbar': { rounded: 'sm', border: true, elevation: 2 }
    },
    cssVars: {
        "--origam-font-family---heading": "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        "--origam-title---font-family": "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        '--origam-appbar---backdrop-filter': 'saturate(140%) blur(16px)',
        '--origam-menu---background': 'var(--origam-color__surface---raised)',
        '--origam-menu---color': 'var(--origam-color__text---primary)',
        '--origam-menu---border-radius': '6px',
        '--origam-menu__content---padding': '4px',
        '--origam-list---background': 'transparent',
        '--origam-list---padding-block-start': '0',
        '--origam-list---padding-block-end': '0',
        '--origam-list-item---padding-inline-start': '12px',
        '--origam-list-item---padding-inline-end': '12px',
        '--origam-btn---border-width-outlined': '1px',
        '--origam-btn---border-width-ghost': '1px',
        '--origam-btn---box-shadow-ghost': 'none',
        '--origam-btn---border-radius': 'var(--origam-radius---btn, 6px)',
        '--origam-card---border-style': 'solid',
        '--origam-card---border-top-width': '1px',
        '--origam-card---border-right-width': '1px',
        '--origam-card---border-bottom-width': '1px',
        '--origam-card---border-left-width': '1px',
        '--origam-card---border-start-start-radius': '10px',
        '--origam-card---border-start-end-radius': '10px',
        '--origam-card---border-end-end-radius': '10px',
        '--origam-card---border-end-start-radius': '10px',
        '--origam-chip---border-radius': '6px',
        '--origam-chip---border-width': '1px',
        '--origam-chip---border-style': 'solid',
        '--origam-code---border-radius': '6px',
        '--origam-code---border-width': '1px',
        '--origam-field---border-radius': '6px',
        '--origam-field---border-color': '#fb923c',
        '--origam-alert---border-radius': '6px',
        '--origam-appbar---bg': 'color-mix(in srgb, #fff7f0 72%, transparent)',
        '--origam-menu---box-shadow': '0 1px 3px rgba(225, 29, 72, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06), 0 0 0 1px var(--origam-color__border---default)',
        '--origam-btn---border-color': '#fed7aa',
        '--origam-btn---box-shadow-elevated': '0 2px 0 rgba(225, 29, 72, 0.20), 0 4px 12px -2px rgba(225, 29, 72, 0.35)',
        '--origam-card---background': '#ffffff',
        '--origam-card---border-color': '#fed7aa',
        '--origam-card---box-shadow': '0 1px 3px rgba(225, 29, 72, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        '--origam-chip---border-color': '#fed7aa',
        '--origam-chip---background-color': 'var(--origam-color__surface---sunken, #ffedd5)',
        '--origam-code---border-color': '#fed7aa',
        '--origam-code---background-color': '#ffedd5',
        // Field border (Refs #36) — spec demande rgba(251,146,60,.55) light
        // (border-color #fb923c déjà posé plus haut × opacity .55).
        // ⚠️ VÉRIFIÉ EMPIRIQUEMENT (Playwright, computed-style sur
        // `.origam-field__outline`, PAS `.origam-field` racine) : le hook
        // `--origam-field---border-opacity` générique posé ici est RÉÉCRIT
        // par la variante outlined elle-même (OrigamField.vue:1029 :
        // `--origam-field---border-opacity: var(--origam-field---border
        // -opacity-outlined, .38)`), donc IGNORE la valeur théorique posée
        // au niveau racine — sans le hook `-outlined` explicite ci-dessous,
        // l'opacity réelle restait .38 (constaté avant fix). Les 2 vars sont
        // posées (générique pour les autres variantes potentielles + la
        // suffixée `-outlined` qui gagne réellement ici, seule variante
        // utilisée par ce thème). Ligne dark (.40) déjà correcte, inchangée.
        '--origam-field---border-opacity': '0.55',
        '--origam-field---border-opacity-outlined': '0.55',

        // ── Field focus (Refs #36) — `--field--focus---box-shadow` (nom
        // demandé par la spec) N'EXISTE PAS : le focus de OrigamField.vue
        // est un `outline` (--origam-field---focus-ring-width/-color/-offset,
        // OrigamField.vue:889-890, défauts 0px/transparent/0px — désactivé
        // tant qu'un thème ne l'active pas), PAS un box-shadow à 2 couches.
        // BLOQUÉ pour la fidélité exacte de la spec (trait plein #e11d48 +
        // glow séparé 0 0 0 3px rgba(...,.18) — 2 couches non superposables
        // avec un seul anneau `outline`) : on retient la couche glow (la plus
        // visible visuellement, hard-edged comme un box-shadow non flouté vu
        // que outline n'a pas de blur — `0 0 0 3px` ≡ un outline 3px sans
        // blur, la ressemblance est donc correcte pour CETTE couche precise).
        // Valeur light ici ; ecomDarkTheme surcharge la couleur (rgba avec la
        // teinte rose dark #f43f5e).
        '--origam-field---focus-ring-width': '3px',
        '--origam-field---focus-ring-color': 'rgba(225, 29, 72, 0.18)',
        '--origam-field---focus-ring-offset': '0px',
        // Erreur : `--origam-field--error---border-color` défaut =
        // var(--origam-color__feedback--danger---border) = #dc2626 (light) /
        // #fca5a5 (dark) — EXACT MATCH avec la spec, aucun override requis.

        // ── Overlay / Dialog scrim (Refs #36, #253 hook) — ⚠️ PIÈGE documenté
        // ET vérifié empiriquement : le scrim applique une `opacity` CSS de
        // 0.32 par défaut EN PLUS du background-color (OrigamOverlayScrim.vue,
        // ligne ~129) — vu que le background-color demandé par la spec porte
        // déjà sa propre alpha (.55), il FAUT remettre `opacity` à 1
        // explicitement, sinon l'alpha effective serait re-multipliée
        // (.55 × .32 ≈ .18, trop clair). Pas de backdrop-filter (spec
        // explicite "SANS blur").
        //
        // ⛔ BLOQUÉ — BUG DS CONFIRMÉ (Playwright, `<origam-dialog>` réel,
        // scrim ABSENT du DOM même dialog ouvert) : `OrigamDialog.vue`
        // n'inclut PAS `scrim: true` dans son propre `withDefaults(...)`
        // (grep confirmé). Or son propre commentaire (ligne ~166-173, à
        // propos de `openOnClick`) documente EXACTEMENT ce piège : "Vue 3's
        // Boolean prop coercion turns `undefined` into `false`, so without an
        // explicit default here Dialog's resolved prop is `false` even though
        // OrigamOverlay's withDefaults declares `true`" — un fix identique a
        // été appliqué à `openOnClick` mais PAS à `scrim`. Résultat constaté :
        // `<origam-overlay-scrim v-if="active">` ne rend RIEN (aucun élément
        // `.origam-scrim` dans le DOM, dialog pourtant actif) — donc CES
        // cssVars sont actuellement sans effet visible sur `<origam-dialog>`,
        // quel que soit le thème. Posés quand même (noms de var confirmés
        // corrects — présents tels quels dans les presets d'autres thèmes) :
        // deviendront effectifs dès que le fix DS (`scrim: true` explicite
        // dans `OrigamDialog.vue`, même pattern que `openOnClick`) sera fait.
        // Ticket DS requis — PAS un bug de ce thème.
        '--origam-overlay-scrim---background-color': 'rgba(26, 15, 10, 0.55)',
        '--origam-overlay-scrim---backdrop-filter': 'none',
        '--origam-overlay-scrim---opacity': '1',

        // ── Tooltip (Refs #36, #253 hook) — chip opaque TOUJOURS sombre
        // (contrairement à editorial qui inverse selon le mode, ici la spec
        // donne littéralement les couleurs de surface dark d'ecom — raised
        // light-mode-chip #2e1b14, sunken dark-mode-chip #3d2518, cf.
        // ecomDarkTheme.vars.color.surface). Pas de caret : confirmé, aucun
        // hook `--origam-tooltip__caret---*`/`__arrow---*` n'est consommé
        // dans le template d'OrigamTooltip.vue (les 2 tokens `__arrow---size`/
        // `---position` existent dans le système de tokens mais sont MORTS,
        // jamais lus par le composant) — non inventé.
        '--origam-tooltip---background-color': '#2e1b14',
        '--origam-tooltip---color': '#fff7f0',
        '--origam-tooltip---backdrop-filter': 'none',

        // ── Tabs pills — fond actif (Refs #36). Hooks vérifiés PAR LECTURE :
        // OrigamTab.vue (--origam-tabs__item--pills--active---background-color/
        // ---color, dédiés au variant pills, distincts de
        // --origam-tabs__indicator qui ne sert qu'à l'underline). ⚠️ INERTES
        // EN PRATIQUE (Playwright) : ces règles ne s'appliquent que sous
        // `.origam-tabs--pills`/`.origam-tab--pills`, jamais posée puisque
        // `variant:'pills'` (components, plus haut) ne peut pas être injecté
        // (OrigamTabs.vue n'appelle pas useDefaults — cf. commentaire dédié).
        // Posés quand même par cohérence PROPS-FIRST — deviendront actifs dès
        // que le gap DS sera corrigé. Ticket DS requis.
        '--origam-tabs__item--pills--active---background-color': '#ffe4e6',
        '--origam-tabs__item--pills--active---color': '#be123c',

        // ── Bottom nav (Refs #36) — BLOQUÉ : aucun hook pour l'item actif.
        // OrigamBottomNav.vue pose bien une classe `origam-bottom-nav__btn
        // --selected` sur l'item sélectionné (ligne 89) mais AUCUNE règle CSS
        // du composant ne la stylise (vérifié, 0 match dans le <style>) — le
        // tint ne peut venir que d'un style passé par le CONSOMMATEUR (page
        // marketing) à chaque `<origam-btn active>`, pas du thème seul. Pas
        // de cssVar inventée ici ; à signaler pour un ticket DS (nouveau hook
        // `--origam-bottom-bar__item--selected---background-color`).

        // ── Pagination (Refs #36) — item "page courante" : fill plein
        // rose + texte contrasté. Référence action.primary.bg/fg (déjà
        // calibrés contraste par mode) plutôt que des hex littéraux. Hooks
        // vérifiés : OrigamPagination.vue:783-795 (__item--is-active---*,
        // s'appliquent QUELLE QUE SOIT la présence du modifier `--colored`).
        // Pas de conflit `!important` (le conflit documenté par editorial
        // n'existe que si `origam-btn` est en `variant:'outlined'` globalement
        // — ecom utilise `variant:'flat'`, donc la règle
        // `.origam-btn--variant-outlined.origam-btn--active` ne matche jamais
        // ici, vérifié par lecture d'OrigamBtn.vue:707-733).
        '--origam-pagination---border-radius': '6px',
        '--origam-pagination__item--is-active---background-color': 'var(--origam-color__action--primary---bg)',
        '--origam-pagination__item--is-active---color': 'var(--origam-color__action--primary---fg)',
        '--origam-pagination__item--is-active---border-color': 'var(--origam-color__action--primary---bg)',

        // ── Table (Refs #36) — header sunken + texte teinté + row-hover.
        // Hooks vérifiés : OrigamTable.vue:223 (header background-color),
        // :224 (header color — EXISTE, contrairement à un audit préliminaire
        // qui l'avait raté), :239 (row-hover background-color, EXISTE aussi).
        // header bg référence surface.sunken (= #ffedd5 light, EXACT MATCH
        // spec) ; header color référence action.primary.fgSubtle (= #be123c
        // light / #fb7185 dark, EXACT MATCH spec sur LES DEUX modes — aucun
        // override dark requis). row-hover = valeur light explicite spec ;
        // ecomDarkTheme surcharge (spec ne donne pas de hex dark, fallback
        // documenté au token bgSubtle plutôt qu'un hex inventé).
        '--origam-table__header-cell---background-color': 'var(--origam-color__surface---sunken)',
        '--origam-table__header-cell---color': 'var(--origam-color__action--primary---fgSubtle)',
        '--origam-table__row---hover-background-color': '#fff1f2',

        // ── List / Menu / Select item actif (Refs #36) — overlay currentColor
        // + opacité graduée (.08 hover / .12 actif / .16 actif+hover — hardcodé
        // en SCSS, PAS de cssVar d'opacité dédiée). Référence action.primary.bg
        // (rose) comme SEULE couleur pilotable — ⚠️ BLOQUÉ pour matcher les
        // hex exacts de la spec (#fff1f2/#ffe4e6 sur Table, #ffe4e6+#be123c
        // sur Menu/Select) : le mécanisme DS n'offre qu'UNE teinte modulée par
        // 2 opacités fixes, pas de couleur de TEXTE actif dédiée (aucun hook
        // `--origam-list-item---color`/`--active` trouvé) ni de coche colorée
        // (le check du Select est un `<origam-checkbox-btn>` qui n'appelle PAS
        // `useDefaults` — aucun theming possible depuis `components`, vérifié).
        // Couvre Menu (hover/active) + Select (item actif) + List (item actif)
        // en un seul hook partagé (OrigamListItem.vue, sous-composant commun).
        '--origam-list-item__overlay---background-color': 'var(--origam-color__action--primary---bg)',

        // ── Sheet (Refs #36) — hairline cohérent avec Card (référence le
        // token `border.subtle-alpha` déjà défini dans ce thème plutôt qu'un
        // hex littéral — auto-adapté aux 2 modes). Hooks vérifiés :
        // OrigamSheet.vue:269 (border-color), :294 (background). box-shadow
        // laissé au défaut (piloté par la prop `elevation:2` du composant,
        // déjà réglée dans `components`).
        '--origam-sheet---border-color': 'var(--origam-color__border---subtle-alpha)',
        '--origam-sheet---background': 'var(--origam-color__surface---raised)',

        // ── NumberField stepper (Refs #36) — fond du bouton +/- teinté rose.
        // Hook vérifié : OrigamNumberField.vue:794 (`.origam-number-field__
        // control .origam-btn { background-color: var(--origam-number-field__
        // control---background-color, transparent) }`). ⚠️ BLOQUÉ pour la
        // couleur d'icône (#be123c/#fb7185 demandée) : aucune prop `color`
        // n'est transmise aux boutons stepper internes (vérifié dans le
        // template d'OrigamNumberField.vue) — l'icône hérite du theming
        // générique `origam-btn` (flat, currentColor), pas d'un hook dédié.
        '--origam-number-field__control---background-color': 'rgba(225, 29, 72, 0.09)',

        // ── SliderField thumb (Refs #36) — anneau approximé via le SEUL hook
        // de couleur disponible sur le thumb : `--origam-slider-field-thumb__
        // surface---border-color` (OrigamSliderField.vue:1484, défaut
        // rgba(0,0,0,.18)). CE HOOK FONCTIONNE (cssVar consommé directement en
        // SCSS, pas gated par useDefaults — vérifié rose dans les 2 modes).
        // ⚠️ BLOQUÉ pour le "anneau 0 0 0 2px" exact demandé par la spec : le
        // `box-shadow` du thumb est hardcodé `none` en JS inline
        // (OrigamSliderField.vue:1488), aucun hook ne le pilote — donc ceci
        // est une bordure colorée, pas un box-shadow ring. Fill "gradient
        // rose" : BLOQUÉ (cf. commentaire `components` plus haut — le prop
        // `color`/`bgColor` du composant est inerte, `OrigamSliderField.vue`
        // n'appelle pas `useDefaults()`), et le fill n'a de toute façon aucun
        // hook cssVar dédié (couleur hardcodée en SCSS) — rien à poser ici
        // pour le fill par cette voie non plus.
        '--origam-slider-field-thumb__surface---border-color': '#e11d48',

        // ── Switch thumb (Refs #36) — ⚠️ VÉRIFIÉ EMPIRIQUEMENT (Playwright,
        // computed-style track "on") : le thumb ne reste PAS blanc par
        // défaut comme supposé initialement — il résout à
        // `--origam-color__surface---default` (#fff7f0 crème en light,
        // #1a0f0a brun foncé en dark, constaté sur le composant réel), pas
        // au blanc pur `rgb(255,255,255)` documenté comme défaut SCSS
        // générique. Override explicite requis pour honorer "thumb blanc"
        // (constant, PAS un token qui varie par mode).
        '--origam-switch__thumb---background-color': '#ffffff'
    }
}

export const ecomDarkTheme: IOrigamTheme = {
    name: 'ecom',
    mode: 'dark',
    vars: {
        rounded: {
            card: '10px',
            btn: '6px',
            pill: '999px',
            sm: '4px',
            md: '10px',
            lg: '10px'
        },
        color: {
            surface: {
                default: '#1a0f0a',
                raised: '#2e1b14',
                sunken: '#231510',
                overlay: '#2e1b14',
                disabled: '#3d2518'
            },
            text: {
                primary: '#fff7f0',
                secondary: '#fed7aa',
                tertiary: '#fed7aa',
                disabled: '#a3786a',
                inverse: '#1a0f0a',
                onColor: '#ffffff',
                ink: '#fff7f0'
            },
            action: {
                primary: {
                    bg: '#f43f5e',
                    bgHover: '#fb7185',
                    bgSubtle: 'rgba(244, 63, 94, 0.14)',
                    bgDisabled: '#3d2518',
                    fg: '#ffffff',
                    fgSubtle: '#fb7185',
                    fgDisabled: '#a3786a'
                },
                secondary: {
                    bg: '#2e1b14',
                    bgHover: '#3d2518',
                    bgDisabled: '#3d2518',
                    fg: '#fff7f0',
                    fgDisabled: '#a3786a'
                },
                ghost: {
                    bg: 'transparent',
                    bgHover: 'rgba(244, 63, 94, 0.08)',
                    bgDisabled: 'transparent',
                    fg: '#fb7185',
                    fgDisabled: '#a3786a'
                }
            },
            border: {
                default: 'rgba(251, 146, 60, 0.20)',
                subtle: 'rgba(251, 146, 60, 0.10)',
                strong: '#fb923c',
                focus: '#f43f5e',
                'subtle-alpha': 'rgba(251, 146, 60, 0.16)',
                ghost: 'rgba(251, 146, 60, 0.20)'
            },
            feedback: {
                success: {
                    bg: '#86efac',
                    bgSubtle: 'rgba(134, 239, 172, 0.12)',
                    fg: '#1a0f0a',
                    fgSubtle: '#86efac',
                    border: '#86efac'
                },
                warning: {
                    bg: '#fcd34d',
                    bgSubtle: 'rgba(252, 211, 77, 0.12)',
                    fg: '#1a0f0a',
                    fgSubtle: '#fcd34d',
                    border: '#fcd34d'
                },
                danger: {
                    bg: '#fca5a5',
                    bgSubtle: 'rgba(252, 165, 165, 0.12)',
                    fg: '#1a0f0a',
                    fgSubtle: '#fca5a5',
                    border: '#fca5a5'
                },
                info: {
                    bg: '#38bdf8',
                    bgSubtle: 'rgba(56, 189, 248, 0.12)',
                    fg: '#1a0f0a',
                    fgSubtle: '#38bdf8',
                    border: '#38bdf8'
                }
            },
            'btn-primary-bg': '#f43f5e',
            'btn-primary-text': '#ffffff',
            'btn-secondary-bg': 'transparent',
            'btn-secondary-border': 'rgba(251, 146, 60, 0.30)',
            'btn-secondary-text': '#fff7f0'
        },
        // ELEVATION (dark) : même rampe, opacité renforcée pour rester lisible
        // sur fond sombre. Teinte rose de marque `rgba(225,29,72,…)` conservée.
        shadow: {
            none: 'none',
            xs: '0px 1px 2px 0px rgba(225, 29, 72, 0.10)',
            sm: '0px 2px 4px 0px rgba(225, 29, 72, 0.14), 0px 1px 2px -1px rgba(0, 0, 0, 0.20)',
            md: '0px 4px 12px 0px rgba(225, 29, 72, 0.16), 0px 1px 3px 0px rgba(0, 0, 0, 0.30)',
            lg: '0px 8px 20px 0px rgba(225, 29, 72, 0.18), 0px 2px 6px -1px rgba(0, 0, 0, 0.40)',
            xl: '0px 12px 32px 0px rgba(225, 29, 72, 0.22), 0px 4px 10px -2px rgba(0, 0, 0, 0.50)'
        }
    },
    // ⛔ PROPS D'ABORD — overrides dark-only. Le reste des `components`
    // (checkbox/radio/switch/slider-field/sheet/dialog/tabs/avatar/…) vit
    // dans ecomLightTheme, qui est en réalité MODE-AGNOSTIC (pas de `mode`
    // déclaré) et s'applique donc aux deux modes ; seul ce qui diverge
    // réellement par TOKEN (pas juste une valeur adaptée) est redéfini ici.
    components: {
        // Breadcrumb (Refs #36) — la spec demande #fb7185 en dark, qui
        // correspond à action.primary.fgSubtle (PAS action.primary.bg =
        // #f43f5e, une teinte différente) : divergence réelle de token,
        // override dédié nécessaire (même pattern qu'editorial.theme.ts #35).
        'origam-breadcrumb-item': { color: 'var(--origam-color__action--primary---fgSubtle)' }
    },
    cssVars: {
        "--origam-font-family---heading": "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        "--origam-title---font-family": "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        '--origam-appbar---backdrop-filter': 'saturate(140%) blur(16px)',
        '--origam-menu---background': 'var(--origam-color__surface---raised)',
        '--origam-menu---color': 'var(--origam-color__text---primary)',
        '--origam-menu---border-radius': '6px',
        '--origam-menu__content---padding': '4px',
        '--origam-list---background': 'transparent',
        '--origam-list---padding-block-start': '0',
        '--origam-list---padding-block-end': '0',
        '--origam-list-item---padding-inline-start': '12px',
        '--origam-list-item---padding-inline-end': '12px',
        '--origam-btn---border-width-outlined': '1px',
        '--origam-btn---border-width-ghost': '1px',
        '--origam-btn---box-shadow-ghost': 'none',
        '--origam-btn---border-radius': 'var(--origam-radius---btn, 6px)',
        '--origam-card---border-style': 'solid',
        '--origam-card---border-top-width': '1px',
        '--origam-card---border-right-width': '1px',
        '--origam-card---border-bottom-width': '1px',
        '--origam-card---border-left-width': '1px',
        '--origam-card---border-start-start-radius': '10px',
        '--origam-card---border-start-end-radius': '10px',
        '--origam-card---border-end-end-radius': '10px',
        '--origam-card---border-end-start-radius': '10px',
        '--origam-chip---border-radius': '6px',
        '--origam-chip---border-width': '1px',
        '--origam-chip---border-style': 'solid',
        '--origam-code---border-radius': '6px',
        '--origam-code---border-width': '1px',
        '--origam-field---border-radius': '6px',
        '--origam-field---border-color': '#fb923c',
        '--origam-alert---border-radius': '6px',
        '--origam-appbar---bg': 'color-mix(in srgb, #1a0f0a 72%, transparent)',
        '--origam-menu---box-shadow': '0 4px 24px -4px rgba(0, 0, 0, 0.60), 0 0 0 1px var(--origam-color__border---default)',
        '--origam-btn---border-color': 'rgba(251, 146, 60, 0.30)',
        '--origam-btn---box-shadow-elevated': '0 2px 0 rgba(244, 63, 94, 0.25), 0 4px 12px -2px rgba(244, 63, 94, 0.40)',
        '--origam-card---background': '#2e1b14',
        '--origam-card---border-color': 'rgba(251, 146, 60, 0.20)',
        '--origam-card---box-shadow': '0 1px 3px rgba(225, 29, 72, 0.12), 0 1px 2px rgba(0, 0, 0, 0.30)',
        '--origam-chip---border-color': 'rgba(251, 146, 60, 0.30)',
        '--origam-chip---background-color': 'var(--origam-color__surface---sunken, #231510)',
        '--origam-code---border-color': 'rgba(251, 146, 60, 0.20)',
        '--origam-code---background-color': '#231510',
        // Refs #36 — cf. commentaire ecomLightTheme : le hook réellement
        // consommé par la variante outlined est le suffixe `-outlined`
        // (vérifié Playwright), posé en plus du générique.
        '--origam-field---border-opacity': '0.40',
        '--origam-field---border-opacity-outlined': '0.40',

        // ── Field focus (Refs #36) — teinte rose dark (#f43f5e), même
        // mécanisme/limitation qu'en light (cf. commentaire ecomLightTheme).
        '--origam-field---focus-ring-color': 'rgba(244, 63, 94, 0.18)',

        // ── Overlay scrim (Refs #36) — valeur DIFFÉRENTE du light
        // (rgba(0,0,0,.62) vs rgba(26,15,10,.55), spec explicite), pas juste
        // le même token adapté. opacity/backdrop-filter déjà corrects via le
        // bloc mode-agnostic (ecomLightTheme).
        '--origam-overlay-scrim---background-color': 'rgba(0, 0, 0, 0.62)',

        // ── Tooltip (Refs #36) — chip toujours sombre, teinte dark-sunken
        // d'ecom (spec explicite #3d2518). Texte identique aux deux modes
        // (#fff7f0, déjà posé dans le bloc mode-agnostic).
        '--origam-tooltip---background-color': '#3d2518',

        // ── Tabs pills — fond actif dark (Refs #36, valeurs spec explicites).
        '--origam-tabs__item--pills--active---background-color': 'rgba(244, 63, 94, 0.16)',
        '--origam-tabs__item--pills--active---color': '#fb7185',

        // ── Table row-hover (Refs #36) — la spec ne donne pas de hex dark
        // (seul #fff1f2 light est spécifié) ; fallback documenté au token
        // sémantique bgSubtle (déjà thémé dark = rgba(244,63,94,.14)) plutôt
        // que d'inventer une valeur non spécifiée. Header bg/color héritent
        // déjà correctement du bloc mode-agnostic (var() auto-adapté).
        '--origam-table__row---hover-background-color': 'var(--origam-color__action--primary---bgSubtle)',

        // ── NumberField stepper bg (Refs #36) — valeur DIFFÉRENTE du light
        // (spec explicite rgba(244,63,94,.16) vs rgba(225,29,72,.09)).
        '--origam-number-field__control---background-color': 'rgba(244, 63, 94, 0.16)',

        // ── SliderField thumb border (Refs #36) — teinte rose dark.
        '--origam-slider-field-thumb__surface---border-color': '#f43f5e',

        // ── Switch thumb (Refs #36) — même override que light : "thumb
        // blanc" constant, ne doit PAS suivre surface.default (qui serait
        // brun foncé #1a0f0a en dark sans cet override, vérifié).
        '--origam-switch__thumb---background-color': '#ffffff'
    }
}

export const ecomThemes: IOrigamTheme[] = [ecomLightTheme, ecomDarkTheme]
