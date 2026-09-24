import type { IChangelogVersion } from '~/interfaces/changelog.interface'

/**
 * CHANGELOG_VERSIONS — every release documented in the repository's CHANGELOG.md.
 *
 * GÉNÉRÉ depuis /CHANGELOG.md par packages/marketing/scripts/generate-changelog.mjs.
 * NE PAS ÉDITER À LA MAIN — toute modification est écrasée. Régénérer via:
 *   pnpm -F @origam/marketing changelog:generate
 * La dérive est gardée par:
 *   pnpm -F @origam/marketing changelog:generate:check   (exit 1 si périmé)
 *
 * Chaque chaîne est une PAIRE clé/repli (convention maison "*Key" / "*Fallback",
 * cf. scripts/i18n-check.mjs). `useT().t(key, fallback)` rend la traduction
 * quand la clé existe dans la locale active, sinon le repli anglais extrait ici.
 * Traduire une version = AJOUTER sa clé dans en.json / fr.json. Rien à
 * régénérer, et les traductions à la main ne sont jamais écrasées.
 */
export const CHANGELOG_VERSIONS: IChangelogVersion[] = [
    {
        // extracted from CHANGELOG.md
        version: '2.18.8',
        date: '2026-09-23',
        type: 'patch',
        summaryKey: 'changelog.versions.v2188.summary',
        summaryFallback: '3 fixes. See the full changelog for detail.',
        highlights: [
            { type: 'fixed', textKey: 'changelog.versions.v2188.h1', textFallback: '#901 OrigamBtn — calc(auto + 0px) ramenait min-width à 0 sur tous les boutons' },
            { type: 'fixed', textKey: 'changelog.versions.v2188.h2', textFallback: '#411 : OrigamChartMap faisait disparaître contours et pays sous un thème de marque' },
            { type: 'fixed', textKey: 'changelog.versions.v2188.h3', textFallback: '#535 : le contraste syntaxique de OrigamCode était sous AA, deux fois plus bas que le ticket ne le disait' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.18.7',
        date: '2026-09-23',
        type: 'patch',
        summaryKey: 'changelog.versions.v2187.summary',
        summaryFallback: '2 fixes. See the full changelog for detail.',
        highlights: [
            { type: 'fixed', textKey: 'changelog.versions.v2187.h1', textFallback: '#607 / #569 : 19 canaux de thème confisqués par le bloc du composant' },
            { type: 'fixed', textKey: 'changelog.versions.v2187.h2', textFallback: '#829 : geek ET glass déclaraient surface.sunken PLUS CLAIR que surface.default (mode clair)' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.18.6',
        date: '2026-09-23',
        type: 'patch',
        summaryKey: 'changelog.versions.v2186.summary',
        summaryFallback: '2 fixes. See the full changelog for detail.',
        highlights: [
            { type: 'fixed', textKey: 'changelog.versions.v2186.h1', textFallback: '#818 baseline shrink : les 8 color-contrast du DS (8 → 0)' },
            { type: 'fixed', textKey: 'changelog.versions.v2186.h2', textFallback: '#818 baseline shrink : structure ARIA — aria-required-parent/aria-required-children/listitem/aria-prohibited-attr (4 entrées)' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.18.5',
        date: '2026-09-23',
        type: 'patch',
        summaryKey: 'changelog.versions.v2185.summary',
        summaryFallback: '1 fix. See the full changelog for detail.',
        highlights: [
            { type: 'fixed', textKey: 'changelog.versions.v2185.h1', textFallback: 'button-name et scrollable-region-focusable (6 des 18 violations laissées de côté par le lot précédent)' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.18.4',
        date: '2026-09-23',
        type: 'patch',
        summaryKey: 'changelog.versions.v2184.summary',
        summaryFallback: '6 fixes. See the full changelog for detail.',
        highlights: [
            { type: 'fixed', textKey: 'changelog.versions.v2184.h1', textFallback: '#818 baseline shrink : aria-allowed-attr/aria-prohibited-attr/aria-valid-attr-value (12 des 25 entrées)' },
            { type: 'fixed', textKey: 'changelog.versions.v2184.h2', textFallback: '#871 (clôture) — les 7 dernières violations AA étaient UN défaut de palette répété, pas sept défauts de composant' },
            { type: 'fixed', textKey: 'changelog.versions.v2184.h3', textFallback: '#871 — une 8ᵉ violation, que la sonde ne pouvait pas voir' },
            { type: 'fixed', textKey: 'changelog.versions.v2184.h4', textFallback: '#871 — l\'audit lui-même ne démarrait plus' },
            { type: 'fixed', textKey: 'changelog.versions.v2184.h5', textFallback: '#871 — l\'état SURVOL était en défaut plus grave encore, et le correctif d\'encre l\'a réglé sans qu\'on y touche' },
            { type: 'fixed', textKey: 'changelog.versions.v2184.h6', textFallback: '#871 — non-régression : packages/tests/TU/marketing/brand-palette-contrast.spec.ts' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.18.3',
        date: '2026-09-23',
        type: 'patch',
        summaryKey: 'changelog.versions.v2183.summary',
        summaryFallback: 'La directive v-contrast, câblée sur 30 composants, n\'émettait jamais rien — ni classe, ni color: !important, ni console.warn — dès que fond et texte étaient tous deux OPAQUES, c\'est-à-dire…',
        highlights: [

        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.18.2',
        date: '2026-09-23',
        type: 'patch',
        summaryKey: 'changelog.versions.v2182.summary',
        summaryFallback: '1 addition and 3 fixes. See the full changelog for detail.',
        highlights: [
            { type: 'fixed', textKey: 'changelog.versions.v2182.h1', textFallback: '#871 — le harnais de contraste ne savait pas lire color(srgb …), et FABRIQUAIT donc des violations' },
            { type: 'added', textKey: 'changelog.versions.v2182.h2', textFallback: 'mobileBreakpoint a désormais un contrôle de story sur <OrigamDataTable>' },
            { type: 'fixed', textKey: 'changelog.versions.v2182.h3', textFallback: '#371 (point 3) — le sélecteur « Items per page » du footer DataTable n\'avait aucun nom accessible' },
            { type: 'fixed', textKey: 'changelog.versions.v2182.h4', textFallback: '<OrigamDataTableRow> ne fuit plus index / mobile en attributs DOM' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.18.1',
        date: '2026-09-22',
        type: 'patch',
        summaryKey: 'changelog.versions.v2181.summary',
        summaryFallback: 'Récolte de deux dépréciations posées "pour la prochaine majeure" avant que le CLAUDE.md n\'acte que 3.0.0 est réservé à la séparation en modules et que les ruptures, elles, ne le sont pas…',
        highlights: [
            { type: 'deprecated', textKey: 'changelog.versions.v2181.h1', textFallback: 'click:prepend / click:append retirés d\'IBtnEmits (#443, #577)' },
            { type: 'deprecated', textKey: 'changelog.versions.v2181.h2', textFallback: 'createOrigam() nu n\'installe plus le thème par défaut (#360)' },
            { type: 'fixed', textKey: 'changelog.versions.v2181.h3', textFallback: '#871 — le mode sombre ne peignait qu\'à moitié dans un sous-arbre thémé' },
            { type: 'changed', textKey: 'changelog.versions.v2181.h4', textFallback: '⛔ RUPTURE (documentée, assumée)' },
            { type: 'fixed', textKey: 'changelog.versions.v2181.h5', textFallback: '#871 — system-bar et tooltip illisibles en sombre' },
            { type: 'fixed', textKey: 'changelog.versions.v2181.h6', textFallback: '#871 — bottom-nav peignait une dalle claire dans une UI sombre' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.18.0',
        date: '2026-09-19',
        type: 'minor',
        summaryKey: 'changelog.versions.v2180.summary',
        summaryFallback: '80 commits depuis v2.17.1. L\'essentiel est du correctif : des tokens qui ne peignaient rien, des props déclarées et inertes, et une famille de défauts d\'accessibilité où le clavier…',
        highlights: [
            { type: 'deprecated', textKey: 'changelog.versions.v2180.h1', textFallback: 'BG_FG_ROLE.DISABLED removed (#823)' },
            { type: 'deprecated', textKey: 'changelog.versions.v2180.h2', textFallback: 'le sous-chemin origam/services est retiré de la map exports' },
            { type: 'added', textKey: 'changelog.versions.v2180.h3', textFallback: 'Cinq symboles publics redeviennent importables' },
            { type: 'fixed', textKey: 'changelog.versions.v2180.h4', textFallback: 'Le bundle publié n\'avait aucun mode sombre automatique' },
            { type: 'changed', textKey: 'changelog.versions.v2180.h5', textFallback: 'Un repère ARIA anonyme n\'est plus annoncé comme un repère' },
            { type: 'fixed', textKey: 'changelog.versions.v2180.h6', textFallback: 'Les 19 avis de pnpm audit sont corrigés par montée de version, sans aucun waiver' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.17.1',
        date: '2026-09-14',
        type: 'patch',
        summaryKey: 'changelog.versions.v2171.summary',
        summaryFallback: 'Hotfix. Quatre correctifs, aucune rupture d\'API. Trois des quatre ont invalidé le diagnostic du ticket qui les demandait — les causes réelles sont consignées ci-dessous, parce qu\'elles sont…',
        highlights: [
            { type: 'fixed', textKey: 'changelog.versions.v2171.h1', textFallback: 'border / outlined sur les champs ne coupe plus le label flottant' },
            { type: 'fixed', textKey: 'changelog.versions.v2171.h2', textFallback: 'Le track de OrigamSwitch a de nouveau une bordure par défaut' },
            { type: 'fixed', textKey: 'changelog.versions.v2171.h3', textFallback: 'OrigamMasonry patche ses enfants au lieu de les reconstruire' },
            { type: 'fixed', textKey: 'changelog.versions.v2171.h4', textFallback: 'OrigamVirtualScroll rend de nouveau' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.17.0',
        date: '2026-09-14',
        type: 'minor',
        summaryKey: 'changelog.versions.v2170.summary',
        summaryFallback: '8 breaking changes. See the full changelog for detail.',
        highlights: [
            { type: 'deprecated', textKey: 'changelog.versions.v2170.h1', textFallback: 'aspect ratio now uses CSS aspect-ratio; an explicit height also constrains the width' },
            { type: 'deprecated', textKey: 'changelog.versions.v2170.h2', textFallback: 'inline removed from IResponsiveProps (so from <OrigamResponsive>, <OrigamImg>, <OrigamCarouselItem>)' },
            { type: 'deprecated', textKey: 'changelog.versions.v2170.h3', textFallback: 'label removed from IValidationProps (so from <OrigamInput>)' },
            { type: 'deprecated', textKey: 'changelog.versions.v2170.h4', textFallback: '<OrigamContainer> breakpoint max-width scale realigned to the design tokens' },
            { type: 'deprecated', textKey: 'changelog.versions.v2170.h5', textFallback: '88 dead typography (component, prop) pairs removed across 40 components' },
            { type: 'deprecated', textKey: 'changelog.versions.v2170.h6', textFallback: 'activeBgColor / hoverBgColor / activeColor / hoverBgColor removed' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.16.0',
        date: '2026-08-19',
        type: 'minor',
        summaryKey: 'changelog.versions.v2160.summary',
        summaryFallback: 'A release about things that were declared but did nothing. Seven components emitted events they never declared; one prop had been inert since it shipped; another prop had no reason to exist…',
        highlights: [
            { type: 'fixed', textKey: 'changelog.versions.v2160.h1', textFallback: 'Seven components emitted update:* without declaring it' },
            { type: 'deprecated', textKey: 'changelog.versions.v2160.h2', textFallback: 'disabled is gone from the whole Icon family' },
            { type: 'fixed', textKey: 'changelog.versions.v2160.h3', textFallback: 'density did nothing on OrigamCounter' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.15.0',
        date: '2026-08-14',
        type: 'minor',
        summaryKey: 'changelog.versions.v2150.summary',
        summaryFallback: 'A structural release. Most of it is invisible at runtime — public typing surface that was missing, and internal files moved to where you would expect to find them.',
        highlights: [
            { type: 'added', textKey: 'changelog.versions.v2150.h1', textFallback: 'Every component now exposes its instance type' },
            { type: 'fixed', textKey: 'changelog.versions.v2150.h2', textFallback: 'borderBlock and borderInline did nothing' },
            { type: 'changed', textKey: 'changelog.versions.v2150.h3', textFallback: 'internal file layout' },
            { type: 'added', textKey: 'changelog.versions.v2150.h4', textFallback: 'Emit and slot interfaces' },
            { type: 'fixed', textKey: 'changelog.versions.v2150.h5', textFallback: 'OrigamBadge dropped its prepend and append content' },
            { type: 'added', textKey: 'changelog.versions.v2150.h6', textFallback: 'INTENT enum (enums/Commons/intent.enum.ts).' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.14.1',
        date: '2026-08-13',
        type: 'patch',
        summaryKey: 'changelog.versions.v2141.summary',
        summaryFallback: 'Two fixes, both found while converting variants to props presets on the v3 line.',
        highlights: [
            { type: 'fixed', textKey: 'changelog.versions.v2141.h1', textFallback: 'A theme default could be silently ignored' },
            { type: 'fixed', textKey: 'changelog.versions.v2141.h2', textFallback: 'color-mix() was not recognised as a CSS colour' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.14.0',
        date: '2026-08-07',
        type: 'minor',
        summaryKey: 'changelog.versions.v2140.summary',
        summaryFallback: 'Reported from a real integration, not from a code review. Each item was reproduced before being fixed, and the fix verified against the running component.',
        highlights: [
            { type: 'deprecated', textKey: 'changelog.versions.v2140.h1', textFallback: '<origam-avatar> is now a circle by default' },
            { type: 'fixed', textKey: 'changelog.versions.v2140.h2', textFallback: 'dead aria-describedby on input fields (accessibility)' },
            { type: 'fixed', textKey: 'changelog.versions.v2140.h3', textFallback: '<origam-avatar size> ignored outside a flex container' },
            { type: 'fixed', textKey: 'changelog.versions.v2140.h4', textFallback: 'rounded rejected the token scale, hiding the circular variant' },
            { type: 'fixed', textKey: 'changelog.versions.v2140.h5', textFallback: 'the published package shipped no changelog' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.13.0',
        date: '2026-08-05',
        type: 'minor',
        summaryKey: 'changelog.versions.v2130.summary',
        summaryFallback: '1 addition, 1 change, 6 fixes and 4 breaking changes. See the full changelog for detail.',
        highlights: [
            { type: 'deprecated', textKey: 'changelog.versions.v2130.h1', textFallback: '<origam-select> dropdown rows now follow the control' },
            { type: 'deprecated', textKey: 'changelog.versions.v2130.h2', textFallback: 'useStyle() no longer overwrites a consumer id' },
            { type: 'fixed', textKey: 'changelog.versions.v2130.h3', textFallback: 'The generated stylesheet was being discarded entirely' },
            { type: 'deprecated', textKey: 'changelog.versions.v2130.h4', textFallback: 'i18n locale keys migrated to snake_case' },
            { type: 'deprecated', textKey: 'changelog.versions.v2130.h5', textFallback: '<origam-title> now defaults to h2, not h1' },
            { type: 'fixed', textKey: 'changelog.versions.v2130.h6', textFallback: 'useStyle() no longer overwrites a consumer-supplied id' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.12.1',
        date: '2026-07-31',
        type: 'patch',
        summaryKey: 'changelog.versions.v2121.summary',
        summaryFallback: 'Hotfix — vue-router 5 is now accepted. A consuming project could not upgrade to Nuxt 4.5.1: Nuxt pulls vue-router 5, while origam declared an optional peer of vue-router: "^4.5.0".',
        highlights: [

        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.12.0',
        date: '2026-07-29',
        type: 'minor',
        summaryKey: 'changelog.versions.v2120.summary',
        summaryFallback: 'Hotfix — vue-i18n is optional again. A consuming project reported that origam could not be enabled at all: createOrigam() reached createLocale(), which imported vue-i18n at module level…',
        highlights: [
            { type: 'fixed', textKey: 'changelog.versions.v2120.h1', textFallback: 'createLocale() no longer imports vue-i18n' },
            { type: 'added', textKey: 'changelog.versions.v2120.h2', textFallback: 'createBuiltinAdapter(), exported from origam/utils.' },
            { type: 'changed', textKey: 'changelog.versions.v2120.h3', textFallback: 'read this if you use vue-i18n' },
            { type: 'fixed', textKey: 'changelog.versions.v2120.h4', textFallback: 'The vue-i18n type imports in locale.interface.ts / locale.util.ts are replaced by locally-declared structural types.' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.11.0',
        date: '2026-07-28',
        type: 'minor',
        summaryKey: 'changelog.versions.v2110.summary',
        summaryFallback: 'Theming-resolution release. Every fix here has the same root cause: a component declared theme-able props but never consumed them, so an IOrigamTheme.components block was a silent no-op.',
        highlights: [
            { type: 'added', textKey: 'changelog.versions.v2110.h1', textFallback: 'ISelectionControlProps now extends IBorderProps / IRoundedProps / IElevationProps' },
            { type: 'fixed', textKey: 'changelog.versions.v2110.h2', textFallback: 'OrigamBtnGroup forwarded density/color/bgColor/size/hover/ active to its children unconditionally, overwriting theme defaults with undefined.' },
            { type: 'fixed', textKey: 'changelog.versions.v2110.h3', textFallback: ':is="tag" bypassed theme resolution' },
            { type: 'fixed', textKey: 'changelog.versions.v2110.h4', textFallback: 'OrigamSelectionControl declared grid-area: control unconditionally' },
            { type: 'fixed', textKey: 'changelog.versions.v2110.h5', textFallback: 'The Checkbox/Radio hover halo hardcoded border-radius: 100%' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.10.0',
        date: '2026-07-27',
        type: 'minor',
        summaryKey: 'changelog.versions.v2100.summary',
        summaryFallback: 'Field-rendering release. No new API — no component, prop, emit or slot was added, and no source file was created.',
        highlights: [
            { type: 'changed', textKey: 'changelog.versions.v2100.h1', textFallback: '--origam-field__input---padding-start / -end now resolve to 0' },
            { type: 'fixed', textKey: 'changelog.versions.v2100.h2', textFallback: 'Tokens — field.input.padding-start/end was 0 in the generated sheets but {space.4} in the token source, so every tokens:build silently reverted the…' },
            { type: 'fixed', textKey: 'changelog.versions.v2100.h3', textFallback: 'OrigamSliderField — the rounded prop was inert: radii were hardcoded instead of going through useRounded().' },
            { type: 'fixed', textKey: 'changelog.versions.v2100.h4', textFallback: 'OrigamApp — did not call useDefaults(), so theme.components[\'origam-app\'] (bgColor, fullHeight) was ignored.' },
            { type: 'fixed', textKey: 'changelog.versions.v2100.h5', textFallback: 'OrigamField — inline padding is floored at the corner radius so content clears the rounded outline, and the outline\'s start leg is widened to match…' },
            { type: 'fixed', textKey: 'changelog.versions.v2100.h6', textFallback: 'OrigamField — the outlined floating label was pinned to the notch corner by a hard margin: 0 4px while the input text and the resting label both sit…' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.9.0',
        date: '2026-07-22',
        type: 'minor',
        summaryKey: 'changelog.versions.v290.summary',
        summaryFallback: 'Theming-enablement release. This ships the design-token hooks and the useDefaults wiring that let a consumer configure a component\'s appearance entirely from an IOrigamTheme object…',
        highlights: [
            { type: 'added', textKey: 'changelog.versions.v290.h1', textFallback: 'useDefaults() now resolves per-component theme defaults on 11 more components' },
            { type: 'fixed', textKey: 'changelog.versions.v290.h2', textFallback: 'Live theme switching now updates component default props, not just CSS variables' },
            { type: 'added', textKey: 'changelog.versions.v290.h3', textFallback: 'Translucency & focus hooks on 7 components' },
            { type: 'fixed', textKey: 'changelog.versions.v290.h4', textFallback: 'OrigamRadio, OrigamTabs and OrigamSliderField now call useDefaults()' },
            { type: 'added', textKey: 'changelog.versions.v290.h5', textFallback: 'OrigamAvatarGroup separation ring' },
            { type: 'fixed', textKey: 'changelog.versions.v290.h6', textFallback: 'OrigamDialog scrim now renders' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.8.1',
        date: '2026-07-15',
        type: 'patch',
        summaryKey: 'changelog.versions.v281.summary',
        summaryFallback: '1 fix. See the full changelog for detail.',
        highlights: [
            { type: 'fixed', textKey: 'changelog.versions.v281.h1', textFallback: 'The npm tarball now ships README.md and LICENSE' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.8.0',
        date: '2026-07-15',
        type: 'minor',
        summaryKey: 'changelog.versions.v280.summary',
        summaryFallback: '2 additions, 1 change and 1 fix. See the full changelog for detail.',
        highlights: [
            { type: 'added', textKey: 'changelog.versions.v280.h1', textFallback: 'Border per-side props are now wired' },
            { type: 'changed', textKey: 'changelog.versions.v280.h2', textFallback: 'OrigamBlockquote: bgColor renamed to accentColor (non-breaking)' },
            { type: 'fixed', textKey: 'changelog.versions.v280.h3', textFallback: 'useMargin: 2-value strings work again' },
            { type: 'added', textKey: 'changelog.versions.v280.h4', textFallback: 'useElevation accepts a free-form custom box-shadow value' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.7.3',
        date: '2026-07-10',
        type: 'patch',
        summaryKey: 'changelog.versions.v273.summary',
        summaryFallback: '1 fix. See the full changelog for detail.',
        highlights: [
            { type: 'fixed', textKey: 'changelog.versions.v273.h1', textFallback: 'OrigamField: the rounded prop now drives the whole field chrome' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.7.2',
        date: '2026-07-09',
        type: 'patch',
        summaryKey: 'changelog.versions.v272.summary',
        summaryFallback: '1 fix. See the full changelog for detail.',
        highlights: [
            { type: 'fixed', textKey: 'changelog.versions.v272.h1', textFallback: 'Default text (and every currentColor icon) rendered browser-black in dark mode' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.7.1',
        date: '2026-07-09',
        type: 'patch',
        summaryKey: 'changelog.versions.v271.summary',
        summaryFallback: '1 fix. See the full changelog for detail.',
        highlights: [
            { type: 'fixed', textKey: 'changelog.versions.v271.h1', textFallback: 'origam/styles CSS entry shipped empty' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.7.0',
        date: '2026-07-08',
        type: 'minor',
        summaryKey: 'changelog.versions.v270.summary',
        summaryFallback: '2 additions, 1 change and 2 fixes. See the full changelog for detail.',
        highlights: [
            { type: 'added', textKey: 'changelog.versions.v270.h1', textFallback: 'OrigamThemeProvider now applies the active theme\'s component default props to its sub-tree (props-first theming cascades into sub-trees via…' },
            { type: 'changed', textKey: 'changelog.versions.v270.h2', textFallback: 'shiki is now an OPTIONAL peer dependency' },
            { type: 'fixed', textKey: 'changelog.versions.v270.h3', textFallback: 'OrigamPagination colored mode (color / bgColor) now fills the page buttons.' },
            { type: 'added', textKey: 'changelog.versions.v270.h4', textFallback: 'Glass theme: OrigamAlert glassmorphism (transparency + blur).' },
            { type: 'fixed', textKey: 'changelog.versions.v270.h5', textFallback: 'Cartoon dark /theming: fields adopt the theme and the primary btn contrast is corrected.' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.6.3',
        date: '2026-07-03',
        type: 'patch',
        summaryKey: 'changelog.versions.v263.summary',
        summaryFallback: '2 changes. See the full changelog for detail.',
        highlights: [
            { type: 'changed', textKey: 'changelog.versions.v263.h1', textFallback: 'Internal code-quality cleanup to green the SonarQube quality gate (new_violations): removed redundant type assertions, merged duplicate imports…' },
            { type: 'changed', textKey: 'changelog.versions.v263.h2', textFallback: 'Marketing site (private, not part of the published origam package): @nuxtjs/i18n 9 → 10 and @nuxtjs/seo 2 → 5 (locales moved to i18n/locales/; v10…' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.6.2',
        date: '2026-07-03',
        type: 'patch',
        summaryKey: 'changelog.versions.v262.summary',
        summaryFallback: '1 change and 2 fixes. See the full changelog for detail.',
        highlights: [
            { type: 'changed', textKey: 'changelog.versions.v262.h1', textFallback: 'Dependency maintenance (Dependabot): TypeScript 5.8 → 6.0, ESLint 9 → 10 (+ typescript-eslint, eslint-plugin-vue), Style Dictionary 4 → 5 (+…' },
            { type: 'fixed', textKey: 'changelog.versions.v262.h2', textFallback: 'CI publish (release.yml): the npm publish step failed with E404 because pnpm publish did not expand the ${NODE_AUTH_TOKEN} placeholder from…' },
            { type: 'fixed', textKey: 'changelog.versions.v262.h3', textFallback: 'Test robustness: transition.composable.spec.ts used an invalid CSS sentinel (transformOrigin: \'original\') that jsdom 29 now rejects; switched to a…' }
        ]
    },
    {
        // extracted from CHANGELOG.md
        version: '2.6.1',
        date: '2026-07-02',
        type: 'patch',
        summaryKey: 'changelog.versions.v261.summary',
        summaryFallback: '2 additions, 1 change and 5 fixes. See the full changelog for detail.',
        highlights: [
            { type: 'added', textKey: 'changelog.versions.v261.h1', textFallback: 'OrigamCode — compact and prompt display modes (commit 5ebc6702).' },
            { type: 'changed', textKey: 'changelog.versions.v261.h2', textFallback: 'Brand themes removed from the DS (ADR-004) — the origam package now ships only the light and dark base token sets.' },
            { type: 'fixed', textKey: 'changelog.versions.v261.h3', textFallback: 'OrigamImg — markBooted requestAnimationFrame callback was called during SSR, crashing server-render (fix(ds): guard OrigamImg markBooted rAF behind…' },
            { type: 'added', textKey: 'changelog.versions.v261.h4', textFallback: 'backdrop-filter glassmorphism tokens on Card / Sheet / Toolbar / Menu — new token group component.{card,sheet,toolbar,menu}.backdrop-filter emitted…' },
            { type: 'fixed', textKey: 'changelog.versions.v261.h5', textFallback: 'Six SSR/theming gaps surfaced by the marketing site refactor: theme cookie injection race, data-mode missing on first SSR render, component-level…' },
            { type: 'fixed', textKey: 'changelog.versions.v261.h6', textFallback: 'OrigamSelect — the chevron icon opened then instantly re-closed the menu on the very first click (field not yet focused): the opening mousedown…' }
        ]
    },
    {
        // curated — from changelog-curated.const.ts
        version: '2.6.0',
        date: '2026-06-11',
        type: 'minor',
        summaryKey: 'changelog.versions.v260.summary',
        summaryFallback: 'The bracket + a11y + theming release. v-contrast directive, OrigamBracket double-elimination, two-axis theming engine, monorepo migration. 170 commits.',
        highlights: [
            { type: 'added', textKey: 'changelog.versions.v260.h1', textFallback: 'v-contrast directive — runtime WCAG 2.1 AA text-legibility guard applied to every colour-bearing component' },
            { type: 'added', textKey: 'changelog.versions.v260.h2', textFallback: 'OrigamBracket — full double-elimination layout, Grand Final, cross-cutting prop surface, status indicators' },
            { type: 'added', textKey: 'changelog.versions.v260.h3', textFallback: 'OrigamBlockquote — two-axis colour model (color + bgColor) on all 5 variants' },
            { type: 'added', textKey: 'changelog.versions.v260.h4', textFallback: 'Two-axis theming engine — data-theme (brand identity) × data-mode (light/dark) + semantic JSON authoring' },
            { type: 'changed', textKey: 'changelog.versions.v260.h5', textFallback: 'useStateEffect repaired — runtime prop changes for color/bgColor were silently ignored after initial mount' },
            { type: 'fixed', textKey: 'changelog.versions.v260.h6', textFallback: 'Monorepo migration — packages/ds, marketing, stories, docs, tests, figma-plugin as pnpm workspace packages' }
        ]
    },
    {
        // curated — from changelog-curated.const.ts
        version: '2.5.1',
        date: '2026-05-27',
        type: 'patch',
        summaryKey: 'changelog.versions.v251.summary',
        summaryFallback: 'Patch. Two housekeeping commits with no public API impact.',
        highlights: [
            { type: 'changed', textKey: 'changelog.versions.v251.h1', textFallback: 'Repository structure cleaned up — unit specs moved to tests/TU/, dev playground dropped' },
            { type: 'changed', textKey: 'changelog.versions.v251.h2', textFallback: '.gitignore updated to exclude test artefacts' }
        ]
    },
    {
        // curated — from changelog-curated.const.ts
        version: '2.5.0',
        date: '2026-05-24',
        type: 'minor',
        summaryKey: 'changelog.versions.v250.summary',
        summaryFallback: 'The accessibility release. WCAG 2.1 AA pass across the entire component catalogue. 35 targeted fixes across 36 components.',
        highlights: [
            { type: 'fixed', textKey: 'changelog.versions.v250.h1', textFallback: 'WCAG 2.1 AA pass — 35 fixes: missing aria-label, incorrect role, focus gaps, colour-contrast warnings, keyboard-navigation holes' },
            { type: 'fixed', textKey: 'changelog.versions.v250.h2', textFallback: 'OrigamSelect — full combobox ARIA pattern (role=combobox + aria-expanded + aria-activedescendant)' },
            { type: 'fixed', textKey: 'changelog.versions.v250.h3', textFallback: 'OrigamDataTable — caption element added; OrigamColorPicker — keyboard navigation restored' },
            { type: 'changed', textKey: 'changelog.versions.v250.h4', textFallback: 'VitePress docs sidebar reorganised by UI taxonomy (layout / navigation / data-display / forms / feedback / utility)' }
        ]
    },
    {
        // curated — from changelog-curated.const.ts
        version: '2.4.0',
        date: '2026-05-23',
        type: 'minor',
        summaryKey: 'changelog.versions.v240.summary',
        summaryFallback: 'The chart engine + media kit + Wave 4 release. 27 chart primitives, atomic media kit (OrigamAudio + OrigamVideo), 6 utility components, OrigamCalendar, gradient support. 149 commits.',
        highlights: [
            { type: 'added', textKey: 'changelog.versions.v240.h1', textFallback: 'OrigamChart + useChart — in-house chart engine. 8 base types, pure SVG, 19 chart families total, zero external dep' },
            { type: 'added', textKey: 'changelog.versions.v240.h2', textFallback: 'OrigamAudio + OrigamVideo — custom players with Media Session API, waveform, stem-tracks, WebVTT captions, zero external dep' },
            { type: 'added', textKey: 'changelog.versions.v240.h3', textFallback: 'OrigamGrid, OrigamMasonry, OrigamEmptyState, OrigamClipboard, OrigamInlineEdit, OrigamNumberFormat — Wave 4 utilities' },
            { type: 'added', textKey: 'changelog.versions.v240.h4', textFallback: 'OrigamCalendar — 4 views, RRULE recurring events, drag-to-create, keyboard navigation; OrigamTextMask + gradient color props' },
            { type: 'changed', textKey: 'changelog.versions.v240.h5', textFallback: 'DS-wide reuse-interfaces audit — every component now extends IDimensionProps / IMarginProps / etc.' },
            { type: 'fixed', textKey: 'changelog.versions.v240.h6', textFallback: 'withDefaults() inline literal rule enforced — Grid, Masonry, Blockquote undefined prop crashes fixed' }
        ]
    },
    {
        // curated — from changelog-curated.const.ts
        version: '2.3.0',
        date: '2026-05-15',
        type: 'minor',
        summaryKey: 'changelog.versions.v230.summary',
        summaryFallback: 'The features release. Four new components, official Nuxt module, SSR safety audit. 378 unit tests. 0 lint errors.',
        highlights: [
            { type: 'added', textKey: 'changelog.versions.v230.h1', textFallback: 'origam/nuxt — official Nuxt 3 / Nuxt 4 module with SSR-safe theme resolution, auto-imports, FOUC-free' },
            { type: 'changed', textKey: 'changelog.versions.v230.h2', textFallback: 'OrigamTextField mask prop — built-in patterns (phone, IBAN, credit card, date…) + custom syntax, zero external dep' },
            { type: 'changed', textKey: 'changelog.versions.v230.h3', textFallback: 'OrigamTextareaField mode=rich — lightweight HTML/Markdown editor, 9 toolbar commands, zero external dep' },
            { type: 'fixed', textKey: 'changelog.versions.v230.h4', textFallback: 'SSR safety audit — every composable and component confirmed SSR-safe or patched; new ssr-smoke.spec.ts' }
        ]
    },
    {
        // curated — from changelog-curated.const.ts
        version: '2.2.1',
        date: '2026-05-14',
        type: 'patch',
        summaryKey: 'changelog.versions.v221.summary',
        summaryFallback: 'Patch. First version published to npm (2.2.0 was tagged but never published). One package.json exports fix.',
        highlights: [
            { type: 'fixed', textKey: 'changelog.versions.v221.h1', textFallback: 'Expose ./package.json explicitly in the exports map — consumer pattern reading the version was broken' },
            { type: 'fixed', textKey: 'changelog.versions.v221.h2', textFallback: '2.2.0 was tagged but never published to npm — 2.2.1 is the first version on the registry' }
        ]
    },
    {
        // curated — from changelog-curated.const.ts
        version: '2.2.0',
        date: '2026-05-14',
        type: 'minor',
        summaryKey: 'changelog.versions.v220.summary',
        summaryFallback: 'The ready-for-npm release. Package metadata, peer dependencies, tree-shaking signals, README. Tarball shrunk from 5.6 MB to 867.9 kB. No API change vs 2.1.0.',
        highlights: [
            { type: 'added', textKey: 'changelog.versions.v220.h1', textFallback: '525+ missing Slot / Emit Variants across 113 stories; OrigamSwitchTrack extracted as a standalone primitive' },
            { type: 'changed', textKey: 'changelog.versions.v220.h2', textFallback: 'peerDependencies (vue ^3.5, vue-i18n ^11, vue-router ^4.5) — no longer auto-installed as dependencies' },
            { type: 'fixed', textKey: 'changelog.versions.v220.h3', textFallback: 'Carousel progress prop wired to real cycle timer; Histoire sash resizes in both directions' }
        ]
    },
    {
        // curated — from changelog-curated.const.ts
        version: '2.1.0',
        date: '2026-05-07',
        type: 'minor',
        summaryKey: 'changelog.versions.v210.summary',
        summaryFallback: 'The classes-first release. 13 transversal composables now emit utility classes for tokenised values. The inline-style stack on a typical button drops from ~12 to ~6 declarations.',
        highlights: [
            { type: 'added', textKey: 'changelog.versions.v210.h1', textFallback: '66 utility classes generated by Style Dictionary — origam--bg-[intent], origam--shadow-[rung], origam--rounded-[size]…' },
            { type: 'added', textKey: 'changelog.versions.v210.h2', textFallback: 'New *Classes return keys on all 10 transversal composables — colorClasses, elevationClasses, roundedClasses…' },
            { type: 'changed', textKey: 'changelog.versions.v210.h3', textFallback: '~54 components migrated to consume *Classes in parallel with *Styles (transition strategy A)' },
            { type: 'fixed', textKey: 'changelog.versions.v210.h4', textFallback: 'OrigamSwitch thumb tinting restored — regression from OrigamSwitchTrack extraction fixed via classes-first' }
        ]
    },
    {
        // curated — from changelog-curated.const.ts
        version: '2.0.0',
        date: '2026-04-26',
        type: 'major',
        summaryKey: 'changelog.versions.v200.summary',
        summaryFallback: 'The design tokens release. Every component now resolves colors, spacing, typography and motion through a centralised, theme-aware token pipeline. 50+ components migrated.',
        highlights: [
            { type: 'added', textKey: 'changelog.versions.v200.h1', textFallback: 'Multi-tier design tokens — Primitive / Semantic / Component tiers; Style Dictionary v4 + Tokens Studio pipeline' },
            { type: 'added', textKey: 'changelog.versions.v200.h2', textFallback: 'Multi-theme runtime — useTheme() composable, OrigamThemeProvider, prefers-color-scheme fallback' },
            { type: 'changed', textKey: 'changelog.versions.v200.h3', textFallback: 'CSS-first / JS-fallback principle — useCssSupport() composable wrapping CSS.supports() with 20 feature flags' },
            { type: 'fixed', textKey: 'changelog.versions.v200.h4', textFallback: 'Multiple critical bug fixes — OrigamMessages id binding, OrigamNumberField reactive loop, OrigamOtpInputField crash' }
        ]
    }
]
