# Composants utilitaires & divers

## Introduction

Ce chapitre documente les composants utilitaires et divers du design system Origam. Ils couvrent trois familles de responsabilités :

**Composants de contenu typographique sémantique** — `OrigamBtn` (bouton central du DS), `OrigamBlockquote` (citation typographique), `OrigamCode` (bloc de code avec colorisation syntaxique), `OrigamKbd` (touche clavier), `OrigamTitle` (titre configurable en densité).

**Composants utilitaires fonctionnels** — `OrigamClipboard` (copie dans le presse-papier), `OrigamQrCode` (générateur SVG de QR codes).

**Composants d'infrastructure SSR, rendu et performance** — `OrigamClientOnly` (garde d'hydratation), `OrigamLazy` (rendu différé par IntersectionObserver), `OrigamDefaultsProvider` (injection de props par défaut), `OrigamThemeProvider` (sous-arbre de thème), `OrigamTransition` (wrapper de transitions CSS), `OrigamInfiniteScroll` (chargement infini), `OrigamVirtualScroll` (virtualisation de liste).

Tous ces composants respectent la convention du design system : pas de valeur hardcodée, CSS variables exclusivement, classes utilitaires générées par Style Dictionary, stratégie parallèle classes + styles inline (stratégie A, v2.x).

---

## `OrigamBtn`

### Fichier

`packages/ds/src/components/Btn/OrigamBtn.vue`

Interface : `packages/ds/src/interfaces/Btn/btn.interface.ts`

### Rôle

`OrigamBtn` est le composant d'action central du design system. Il couvre tous les cas d'usage d'un bouton interactif : lien navigable, membre d'un groupe de sélection, déclencheur de formulaire, bouton icône, bouton avec loader. C'est le composant le plus riche du DS en termes de surface de props : il agrège la quasi-totalité des interfaces communes.

### Entrées (props)

`IBtnProps` étend :

- `ICommonsComponentProps` — `class`, `style`, `id`
- `IColorProps` / `IBgColorProps` — couleur de texte et de fond (intents ou raw)
- `IBorderProps` — bordure (tokenisée)
- `IDensityProps` — `density: 'comfortable' | 'default' | 'compact'`
- `IDimensionProps` — `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`
- `IElevationProps` — `elevation` (shadow tokenisé)
- `IRoundedProps` — `rounded` (rayon de bord)
- `ITagProps` — `tag` (défaut `'button'`)
- `ISizeProps` — `size: 'x-small' | 'small' | 'default' | 'large' | 'x-large'`
- `ILinkProps` — `href`, `to`, `replace`, `exact`, `activeClass`…
- `IRippleProps` — `ripple` (défaut `true`)
- `ILoaderProps` — `loading`, `loaderProps` (kind `'circular' | 'line' | 'skeleton'`)
- `IPositionProps` — `position: 'static' | 'absolute' | 'fixed'`
- `ILocationProps` — `location`
- `IGroupItemProps` — appartenance à un groupe `OrigamBtnToggle`
- `IPaddingProps` / `IMarginProps` — espacement
- `IAdjacentProps` — `prependIcon`, `appendIcon`, `prependAvatar`, `appendAvatar`
- `IStatusProps` — `status` (success, error…)
- `IHoverProps` — états hover/active configurables
- `IVariantProps` — `variant: 'flat' | 'elevated' | 'tonal' | 'outlined' | 'text' | 'plain' | 'ghost'`

Props propres :

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `active` | `boolean \| undefined` | `undefined` | Force l'état actif |
| `flat` | `boolean` | — | Équivalent déprécié de `variant="flat"` |
| `icon` | `boolean \| TIcon` | — | Mode icône circulaire ou icône explicite |
| `block` | `boolean` | — | Pleine largeur (`flex: 1 0 auto`) |
| `slim` | `boolean` | — | Padding latéral réduit à 8px |
| `stacked` | `boolean` | — | Layout vertical (icon au-dessus du label) |
| `text` | `string` | — | Contenu texte fallback quand le slot default est vide |

### Sorties

**Emits** (`IBtnEmits extends IAdjacentEmits, IGroupEmits`) :
- `click:prepend` — clic sur le slot prepend
- `click:append` — clic sur le slot append
- Événements de groupe (sélection)

**Slots** :
- `default` — contenu principal (label, icône inline)
- `prepend` — zone à gauche du label (icône, avatar)
- `append` — zone à droite du label (icône, avatar)
- `loader` — loader custom en mode `skeleton` (reçoit les `progressProps`)
- `wrapper` — override complet de la structure interne

**Classes émises** :
`origam-btn`, `origam-btn--active`, `origam-btn--block`, `origam-btn--disabled`, `origam-btn--flat`, `origam-btn--icon`, `origam-btn--loading`, `origam-btn--loader-{kind}`, `origam-btn--slim`, `origam-btn--stacked`, `origam-btn--size-{size}`, `origam-btn--density-{density}`, `origam-btn--variant-{variant}`, classes de couleur/padding/margin/elevation/rounded tokenisées.

**Elements BEM** :
`.origam-btn__overlay`, `.origam-btn__underlay`, `.origam-btn__loader`, `.origam-btn__prepend`, `.origam-btn__content`, `.origam-btn__append`, `.origam-btn__progress`.

### Dépendances

**Composables** :
- `useDefaults` — résolution des props contre le `OrigamDefaultsProvider` parent (pour `OrigamBtnGroup` / `OrigamBtnToggle` qui propagent `color`, `density`, `bgColor` via `provideDefaults`)
- `useGroupItem(props, ORIGAM_BTN_TOGGLE_KEY)` — rattachement au toggle parent
- `useLink(props, attrs)` — résolution `href` / routeur Vue Router
- `useSelectLink(link, group?.select)` — synchronisation lien + sélection
- `useHover` / `useActive` — états hover et active réactifs
- `useStateEffect(props, isHover, isActive, hoverState, activeState, isDisabled, flat)` — couleur / border / rounded / elevation / padding / margin en fonction de l'état (retourne `colorClasses + colorStyles`, `borderClasses + borderStyles`, etc.)
- `useVariant` — classe `origam-btn--variant-{variant}`
- `useDensity` / `useDimension` / `useSize` / `usePosition` / `useLocation` / `useAdjacent` / `useStatus` / `useLoader`
- `useStyle(btnStyles)` — injection CSS dynamique scoped (retourne `id`, `css`, `load`, `unload`, `isLoaded`)
- `useProps` — `filterProps` pour le forwarding vers `OrigamProgress`

**Directive** : `v-ripple` — ondulation au clic, centrée pour les boutons icônes.

**Composants enfants** :
- `OrigamProgress` — affichage du loader circulaire ou linéaire
- `OrigamLoader` — wrapper skeleton
- `OrigamSkeleton` — shimmer en mode skeleton
- `OrigamIcon` / `OrigamAvatar` — icônes et avatars des slots prepend/append

**Consts** : `ORIGAM_BTN_TOGGLE_KEY` (clé `provide/inject` pour le groupe)

**Enums** : `DENSITY`, `PROGRESS_TYPE`, `SIZES`

### Comportement notable

**Trois modes de loader** distincts gérés par `useLoader` :
1. `circular` — spinner positionné `absolute inset:0 margin:auto`, le label reste dans le DOM mais son opacity passe à 0 (préserve la largeur naturelle du bouton).
2. `line` — barre de progression linéaire en `position:absolute` sur le bord inférieur, le label reste visible.
3. `skeleton` — `OrigamSkeleton` rectangular remplace entièrement le contenu via `OrigamLoader#loader` ; un `min-width / min-height` CSS empêche le bouton de s'effondrer.

**Stratégie ripple** : `v-ripple` reçoit un tableau `[!disabled && ripple, null, icon ? ['center'] : null]`. Le modificateur `center` centre l'onde pour les boutons icônes circulaires.

**Résolution de l'état actif** : la computed `isActive` suit une cascade — prop `active` explicite > lien routeur (`link.isActive`) > appartenance au groupe (`group.isSelected`).

**Gestion du clic** : si le bouton est dans un contexte de navigation avec modificateurs clavier (`metaKey`, `ctrlKey`, `shiftKey`, `target="_blank"`, clic non-primaire), la navigation n'est pas déclenchée côté SPA mais le comportement natif du navigateur s'applique. Vue 3.5 fusionne automatiquement les écouteurs `onClick` parent + template — on n'appelle surtout pas `attrs.onClick` manuellement sous peine de double déclenchement.

**Variant `ghost`** : utilise `color-mix(in srgb, currentColor 12%, transparent)` et `backdrop-filter: blur(8px)`. Le `@supports` garantit un fallback plus opaque quand le blur n'est pas supporté.

**Accessibilité** :
- Le tag racine est `<button type="button">` par défaut, donc navigable au clavier nativement et activable à la touche Entrée/Espace.
- En mode lien (`tag="a"`), `aria-disabled="true"` est posé et `href` est supprimé quand `disabled`.
- Focus visible : `outline: 2px solid var(--origam-color__border---focus)` avec `outline-offset: 2px`.
- `@media (prefers-reduced-motion: reduce)` supprime toutes les transitions CSS.

**CSS tokens** : `--origam-btn---height`, `--origam-btn---font-size`, `--origam-btn---min-width`, `--origam-btn---density`, `--origam-btn---border-radius`, `--origam-btn---opacity`, `--origam-btn---background-color`, `--origam-btn---color`, etc.

**Expose** : `group`, `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`.

### Exemple d'usage

```vue
<OrigamBtn
  color="primary"
  variant="elevated"
  size="large"
  :loading="isLoading"
  loader-props="{ kind: 'circular' }"
  prepend-icon="mdi:mdi-plus"
  @click="handleCreate"
>
  Créer
</OrigamBtn>
```

---

## `OrigamBlockquote`

### Fichier

`packages/ds/src/components/Blockquote/OrigamBlockquote.vue`

Interface : `packages/ds/src/interfaces/Blockquote/blockquote.interface.ts`

### Rôle

Composant de citation typographique basé sur l'élément HTML sémantique `<blockquote>`. Il propose cinq variants visuels, une gestion de l'attribution (auteur + source), des guillemets décoratifs sensibles à la locale, et une palette d'intents colorés pour la barre d'accent.

### Entrées (props)

`IBlockquoteProps extends ICommonsComponentProps, ITagProps`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `tag` | `string` | `'blockquote'` | Tag HTML racine |
| `variant` | `TBlockquoteVariant` | `'default'` | Variant visuel |
| `author` | `string` | — | Auteur de la citation |
| `source` | `string` | — | Source/titre de l'œuvre |
| `cite` | `string` | — | URL de référence (attribut HTML `cite`) |
| `lang` | `TBlockquoteLang` | `'auto'` | Locale pour les guillemets décoratifs |
| `align` | `TBlockquoteAlign` | auto (`'center'` si `pull`, sinon `'left'`) | Alignement du texte |
| `color` | `TIntent` | — | Couleur d'accent (barre, guillemets, auteur) |

`TBlockquoteVariant` : `'default' | 'elegant' | 'quoted' | 'minimal' | 'pull'`

`TBlockquoteLang` : `'fr' | 'en' | 'es' | 'de' | 'auto'`

`TBlockquoteAlign` : union (`'left' | 'center' | 'right'`)

### Sorties

**Slots** :
- `default` — corps de la citation
- `author` — override du rendu auteur (prioritaire sur la prop `author`)
- `source` — override du rendu source (prioritaire sur la prop `source`)

**Classes émises** :
`origam-blockquote`, `origam-blockquote--variant-{variant}`, `origam-blockquote--align-{align}`, `origam-blockquote--color-{intent}`, `origam-blockquote--has-attribution`.

**Elements BEM** :
`.origam-blockquote__body`, `.origam-blockquote__attribution`, `.origam-blockquote__mark`, `.origam-blockquote__mark--bg`, `.origam-blockquote__author`, `.origam-blockquote__separator`, `.origam-blockquote__source`.

### Dépendances

- `QUOTE_MARKS_BY_LANG` (const) — map `{ fr, en, es, de }` → `{ open, close }` pour les guillemets décoratifs
- `IBlockquoteProps`, `IBlockquoteSlots`
- `TBlockquoteLang`, `TBlockquoteAlign`, `TBlockquoteVariant`, `TIntent`

### Comportement notable

**Résolution locale (SSR-safe)** : avec `lang="auto"`, la langue est lue depuis `document.documentElement.lang` dans `onMounted`. Le serveur émet les guillemets anglais par défaut ; le client corrige après hydratation si nécessaire. L'échange de glyphe est visuellement non perceptible.

**Attribution conditionnelle** : le `<footer>` ne s'affiche que si `hasAuthor || hasSource` est vrai. Un slot `#author` sans prop `author` suffit à faire apparaître le footer.

**Sémantique HTML** : le `cite` HTML natif sur `<blockquote>` est propagé directement, respectant le standard W3C (l'attribut `cite` expose l'URL aux outils d'AT et aux inspecteurs mais n'est pas rendu visuellement). Le séparateur `"— "` et la virgule entre auteur/source portent `aria-hidden="true"`.

**Variant `pull`** : la computed `effectiveAlign` force `'center'` sauf si le prop `align` est explicitement défini.

**Variant `quoted`** : le signe ouvrant (`openMark`) est rendu dans un `<span aria-hidden="true">` avec `position: absolute` à très grand `font-size` et faible opacité. Le contenu et l'attribution sont en `position: relative; z-index: 1` pour passer au-dessus.

**Tokens CSS** : `--origam-blockquote---padding-block`, `--origam-blockquote---padding-inline`, `--origam-blockquote---font-family`, `--origam-blockquote---font-size`, `--origam-blockquote__accent---color`, `--origam-blockquote--quoted---glyph-size`, `--origam-blockquote--quoted---glyph-opacity`, etc.

**Expose** : `effectiveLang`, `effectiveAlign`, `openMark`, `closeMark`, `showQuoteMark`, `hasAttribution`.

### Exemple d'usage

```vue
<OrigamBlockquote
  variant="pull"
  color="primary"
  author="Edsger W. Dijkstra"
  source="EWD498"
>
  Simplicity is a prerequisite for reliability.
</OrigamBlockquote>
```

---

## `OrigamCode`

### Fichier

`packages/ds/src/components/Code/OrigamCode.vue`

Interface : `packages/ds/src/interfaces/Code/code.interface.ts`

### Rôle

Bloc de code avec colorisation syntaxique (shiki), numérotation de lignes, mise en évidence de lignes, bouton copie et pleine conscience du thème clair/sombre. La structure sémantique respecte le W3C : l'élément racine est `<figure>`, le header utilise `<figcaption>`, le contenu est `<pre><code>`.

### Entrées (props)

`ICodeProps extends ICommonsComponentProps, ITagProps, IBorderProps, IRoundedProps, IElevationProps, IPaddingProps, IMarginProps, IDimensionProps, IColorProps, IBgColorProps`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `tag` | `string` | `'figure'` | Tag racine (W3C : `figure` + `figcaption`) |
| `code` | `string` | `undefined` | Code à afficher (prioritaire sur le slot) |
| `lang` | `TCodeLang` | `CODE_LANG.PLAINTEXT` | Grammaire shiki |
| `lineNumbers` | `boolean` | `false` | Affichage du numéro de ligne (CSS counter) |
| `highlightLines` | `number[] \| string \| null` | `null` | Lignes à surligner (ex. `'2,5-7'` ou `[2,5,6,7]`) |
| `copyable` | `boolean` | `true` | Affichage du bouton de copie |
| `format` | `boolean` | `false` | Formatage du code (stub v2.x, avertit en dev) |
| `wrap` | `boolean` | `false` | Retour à la ligne long |
| `filename` | `string` | `undefined` | Nom de fichier dans le header |
| `maxHeight` | `string \| number` | — | Hauteur max du scroller |

### Sorties

**Emits** :
- `copy(code: string)` — déclenché après une copie réussie

**Slots** :
- `header` — override complet du header (reçoit `{ filename, langName, copy, copied }`)
- `footer` — contenu affiché sous le bloc de code
- `default` — source code en fallback quand `code` n'est pas passé en prop

**Classes émises** :
`origam-code`, `origam-code--lang-{lang}`, `origam-code--line-numbers`, `origam-code--wrap`, `origam-code--has-header`, `origam-code--copyable`, `origam-code--max-height`, classes de couleur/border/rounded/elevation/padding/margin.

**Elements BEM** :
`.origam-code__header`, `.origam-code__filename`, `.origam-code__lang-badge`, `.origam-code__copy`, `.origam-code__copy--header`, `.origam-code__copy--floating`, `.origam-code__scroller`, `.origam-code__pre`, `.origam-code__code`, `.origam-code__row`, `.origam-code__row--highlighted`, `.origam-code__footer`.

### Dépendances

**Composables** :
- `useCode()` — singleton shiki : chargement lazy du module (import dynamique au premier appel), LRU cache `(code, lang) → html`, émission dual-theme CSS vars
- `useClipboard({ feedbackDuration })` — pipeline copie avec auto-reset de `copied`
- `useBorder`, `useRounded`, `useElevation`, `usePadding`, `useMargin`, `useDimension`, `useBothColor`

**Utils** :
- `parseHighlightLines(prop)` — parse une string `'2,5-7'` ou un tableau `[2,5,6]` en `number[]`

**Enum** : `CODE_LANG`

**Consts** : `CODE_DEFAULTS` (dont `copyFeedbackDurationMs`), `CODE_CACHE_MAX_ENTRIES`, `CODE_LIGHT_THEME`, `CODE_DARK_THEME`, `SUPPORTED_LANGS`

### Comportement notable

**Pipeline shiki** : `highlight(code, lang)` est une promesse. Un token de rendu `_renderToken` prévient les résultats périmés lors d'un changement rapide de langue. L'injection du HTML se fait via `codeRef.value.innerHTML = rows` (pas `v-html`) pour post-traiter les spans de lignes shiki.

**Post-traitement des lignes** : shiki émet des `<span class="line">…</span>` ; le composant les enveloppe dans `.origam-code__row[data-line="N"]` pour le CSS counter et pour la mise en évidence. Les changements de `highlightLines` sont un simple toggle de classe sans re-render shiki.

**Dual-theme CSS** : shiki émet `style="--shiki-light:#xxx;--shiki-dark:#yyy"` sur chaque span. Le bloc `<style lang="scss">` non scopé mappe `.origam-code__code span { color: var(--shiki-light) }` et bascule vers `--shiki-dark` sous `html[data-theme="dark"]` et `@media (prefers-color-scheme: dark)` sans JS.

**W3C** : quand `tag !== 'figure'`, le header utilise `<div>` au lieu de `<figcaption>` pour rester W3C-correct (rule : `figcaption` enfant direct de `figure` uniquement).

**Sémantique copie** : le bouton `<button type="button">` porte `aria-label` et `aria-live="polite"` — le changement de label "Copy" → "Copied!" est annoncé aux lecteurs d'écran.

**Numérotation CSS** : utilise `counter-reset: line` sur `<pre>` et `counter-increment: line` + `content: counter(line)` dans `::before` sur `.origam-code__row`. Aucun DOM supplémentaire.

**Expose** : `rebuild`, `copied`, `codeRef`.

### Exemple d'usage

```vue
<OrigamCode
  lang="typescript"
  filename="useAuth.ts"
  :line-numbers="true"
  highlight-lines="3,7-9"
  :copyable="true"
  :code="sourceCode"
/>
```

---

## `OrigamKbd`

### Fichier

`packages/ds/src/components/Kbd/OrigamKbd.vue`

Interface : `packages/ds/src/interfaces/Kbd/kbd.interface.ts`

### Rôle

Représentation visuelle d'une touche clavier ou d'une combinaison de touches. Repose sur l'élément HTML sémantique natif `<kbd>` et imbrique des `<kbd>` enfants pour les combinaisons. Trois variants visuels.

### Entrées (props)

`IKbdProps extends ICommonsComponentProps, IColorProps, IBgColorProps, ISizeProps, IBorderProps, IRoundedProps`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `text` | `string` | — | Label d'une touche simple |
| `combination` | `string[]` | — | Tableau de touches (rendu en `<kbd>` imbriqués) |
| `separator` | `string` | `'+'` | Séparateur entre les touches |
| `variant` | `TKbdVariant` | `'outlined'` | Variant visuel |

`TKbdVariant` : `'filled' | 'outlined' | 'tonal'`

### Sorties

**Slots** :
- `default` — override complet du contenu (prioritaire sur `text` et `combination`)

**Classes émises** :
`origam-kbd`, `origam-kbd--variant-{variant}`, `origam-kbd--combination`, classes de taille/rounded/border/couleur.

**Elements BEM** :
`.origam-kbd__key` (pour chaque touche dans une combination), `.origam-kbd__separator`.

### Dépendances

- `useBorder`, `useRounded`, `useSize`, `useBothColor`, `useStyle`, `useProps`

### Comportement notable

**Sémantique HTML** : la racine est toujours `<kbd>`. En mode `combination`, chaque touche est rendue dans un `<kbd class="origam-kbd__key">` imbriqué — conforme à la spec HTML qui autorise `<kbd>` dans `<kbd>`. Le séparateur est un `<span aria-hidden="true">`.

**Mode combination** : quand `combination` est fourni, la racine `<kbd>` supprime son propre border/background/shadow (le conteneur devient transparent) ; seuls les `<kbd>__key` portent le style visuel.

**Mixin SCSS** : `@mixin key-surface` est appliqué à la fois sur `.origam-kbd` et sur `.origam-kbd__key` pour garantir un rendu cohérent dans les deux modes.

**Tokens CSS** : `--origam-kbd---font-family`, `--origam-kbd---border-radius`, `--origam-kbd---border-color`, `--origam-kbd---background-color`, `--origam-kbd---box-shadow`, `--origam-kbd__separator---color`, `--origam-kbd---font-size-{xs|sm|md|lg|xl}`.

**Expose** : `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`.

### Exemple d'usage

```vue
<OrigamKbd :combination="['Ctrl', 'Shift', 'Z']" variant="filled" />
<OrigamKbd text="⌘" size="large" />
```

---

## `OrigamClipboard`

### Fichier

`packages/ds/src/components/Clipboard/OrigamClipboard.vue`

Interface : `packages/ds/src/interfaces/Clipboard/clipboard.interface.ts`

### Rôle

Wrapper sans chrome propre autour de `useClipboard`. Il expose un déclencheur bouton par défaut (icône `mdi:content-copy` + label contextuel), remplaçable intégralement par le slot `#default`. La logique de copie, le fallback `execCommand`, et l'auto-reset du flag `copied` sont entièrement encapsulés dans le composable.

### Entrées (props)

`IClipboardProps extends ICommonsComponentProps, ITagProps, IColorProps, IBgColorProps, IBorderProps, IRoundedProps, IMarginProps, IPaddingProps`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `value` | `string` | **requis** | Texte à copier |
| `feedbackDuration` | `number` | `2000` | Durée (ms) du flag `copied` |
| `feedbackText` | `string` | `'Copied!'` | Label affiché quand `copied` est true |
| `successText` | `string` | — | Alias de `feedbackText` (prioritaire) |
| `disabled` | `boolean` | `false` | Désactive la copie |

### Sorties

**Emits** (`IClipboardEmits`) :
- `copy(value: string)` — copie réussie
- `error(err: Error)` — échec de copie

**Slots** (`IClipboardSlots`) :
- `default` — scoped slot `{ copy, copied, error }` : override complet du déclencheur
- `feedback` — slot scoped `{ copied }` pour un feedback custom (toast, pill…)

**Classes émises** :
`origam-clipboard`, `origam-clipboard--copied`, `origam-clipboard--disabled`, classes de couleur/border/rounded/margin/padding.

**Elements BEM** :
`.origam-clipboard__default-trigger`, `.origam-clipboard__default-trigger--copied`, `.origam-clipboard__default-icon`, `.origam-clipboard__default-label`.

### Dépendances

**Composable** : `useClipboard({ feedbackDuration })` — retourne `{ copy, copied, error, isSupported }`.

Le composable `useClipboard` :
1. Tente `navigator.clipboard.writeText` (Clipboard API moderne, HTTPS requis).
2. Fallback textarea + `document.execCommand('copy')` pour Safari pre-permissions, WebViews, contextes non-HTTPS.
3. Auto-reset de `copied` après `feedbackDuration` ms via `setTimeout`.
4. `onScopeDispose` nettoie le timer si le composant est détruit avant l'expiration.

**Composant enfant** : `OrigamIcon` pour l'icône par défaut.

**Enum** : `MDI_ICONS.CONTENT_COPY`

### Comportement notable

**Déclencheur natif** : le bouton par défaut est `<button type="button">` avec `aria-label` dynamique ("Copy to clipboard" / "Value copied to clipboard") et `disabled` propagé. Pleinement accessible clavier.

**Slot scoped** : consommateurs qui veulent une surface custom (toast, bouton personnalisé, etc.) utilisent `#default="{ copy, copied, error }"` et appellent `copy()` sur leur propre trigger.

**`handleCopy`** expose la méthode via `defineExpose` pour que les parents puissent déclencher la copie programmatiquement.

**Expose** : `copy`, `copied`, `error`.

### Exemple d'usage

```vue
<OrigamClipboard :value="codeSnippet" :feedback-duration="3000">
  <template #default="{ copy, copied }">
    <button @click="copy">
      {{ copied ? 'Copié !' : 'Copier le code' }}
    </button>
  </template>
</OrigamClipboard>
```

---

## `OrigamQrCode`

### Fichier

`packages/ds/src/components/QrCode/OrigamQrCode.vue`

Interfaces : `packages/ds/src/interfaces/QrCode/qr-code.interface.ts`

### Rôle

Générateur de QR code SVG pur, sans canvas ni DOM API. SSR-safe. Deux plans de style coexistent : le wrapper (DS transversal) et la matrice SVG (overrides internes via `qrCodeProps`). Un logo/icône centré est supporté.

### Entrées (props)

`IQrCodeProps extends ICommonsComponentProps, ITagProps, IColorProps, IBgColorProps, IRoundedProps, IBorderProps, IElevationProps, ISizeProps, IPaddingProps, IMarginProps`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `value` | `string` | **requis** | Contenu encodé |
| `size` | `number` | `240` | Taille en px du SVG |
| `errorCorrectionLevel` | `TQrCodeErrorCorrectionLevel` | `'M'` | Niveau ECC Reed-Solomon |
| `quietZone` | `number` | `4` | Marge en modules autour de la matrice |
| `title` | `string` | — | Titre affiché au-dessus de la matrice |
| `qrCodeProps` | `IQrCodeOptions` | — | Overrides internes SVG (color/bgColor/rounded) |
| `icon` | `TIcon` | — | Icône overlay centré |
| `image` | `string \| ISrcObject` | — | Image overlay centrée |
| `ariaLabel` | `string` | — | Label AT (fallback : `"QR code for {value}"`) |

`TQrCodeErrorCorrectionLevel` : `'L' | 'M' | 'Q' | 'H'`

`IQrCodeOptions` : `IRoundedProps & IBgColorProps & IColorProps` (props de niveau matrice)

### Sorties

**Slots** (`IQrCodeSlots`) :
- `center` — scoped `{ size: number }` : override de l'overlay centré (logo custom, icon custom)

**Classes émises** :
`origam-qr-code`, `origam-qr-code--ecc-{l|m|q|h}`, classes texte/fond/rounded/border/padding/margin/elevation.

**Elements BEM** :
`.origam-qr-code__title`, `.origam-qr-code__svg-host`, `.origam-qr-code__center`, `.origam-qr-code__center-avatar`, `.origam-qr-code__center-icon`.

**Expose** : `svg` (la string SVG générée, utile pour téléchargement `.svg`).

### Dépendances

**Composable** : `useQrCode(valueGetter, resolvedOptions)` — utilise `qrcode-generator`, LRU cache matriciel niveau module, retourne `{ svg, size }`. Le SVG généré échappe les caractères XML dans la valeur utilisateur.

**Utils** :
- `resolveQrColor(value, plane, fallback)` — traduit un intent DS / hex / `currentColor` en couleur SVG valide
- `resolveQrCornerRadius(rounded)` — traduit un rung de rayon DS en valeur `[0, 0.5]` en unités module

**Composants enfants** : `OrigamAvatar` (overlay image), `OrigamIcon` (overlay icône).

**Accessibilité** : `role="img"` + `aria-label` résolu sur le wrapper racine. Le center overlay porte `aria-hidden="true"`.

### Comportement notable

**Injection SVG** : `watchEffect` pose `svgHost.innerHTML = svg.value`. Le rendu shiki et le rendu QrCode partagent cette même approche `innerHTML` contrôlée (les caractères XML dangereux dans `value` sont échappés dans `useQrCode`).

**Deux plans de taille** : `useSize` s'applique sur le `<span class="origam-qr-code__svg-host">` (pas sur le wrapper) pour que le SVG reste carré. Le wrapper s'auto-dimensionne au contenu (titre + svg).

**Logo avec ECC** : pour un logo centré couvrant ~25% de la surface, il faut `errorCorrectionLevel="H"` (30% de redondance). Avec `"M"` (15%), une couverture de ~15% maximum.

**SSR-safe** : `useQrCode` n'utilise ni `window`, ni `document`, ni `canvas`. Le SVG est produit de façon synchrone à partir de `qrcode-generator`.

### Exemple d'usage

```vue
<OrigamQrCode
  value="https://origam.design"
  :size="200"
  error-correction-level="H"
  :rounded="true"
  elevation="md"
>
  <template #center="{ size }">
    <OrigamIcon icon="mdi:origam" :style="{ fontSize: size + 'px' }" />
  </template>
</OrigamQrCode>
```

---

## `OrigamLazy`

### Fichier

`packages/ds/src/components/Lazy/OrigamLazy.vue`

Interface : `packages/ds/src/interfaces/Commons/lazy.interface.ts`

### Rôle

Rendu différé par IntersectionObserver. Le slot `default` n'est rendu qu'une fois le composant entré dans le viewport (ou via `v-model` forcé). Enveloppe le contenu dans `OrigamTransition` pour une entrée animée.

### Entrées (props)

`ILazyComponentProps extends ICommonsComponentProps, IDimensionProps, ITagProps, ITransitionComponentProps`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `tag` | `string` | `'div'` | Tag racine |
| `modelValue` | `boolean` | `false` | v-model : force l'activation |
| `options` | `IntersectionObserverInit` | `{}` | Options de l'IntersectionObserver |
| `transition` | `TTransitionProps \| string \| boolean` | `{ component: OrigamFade }` | Transition d'entrée |

### Sorties

**Emits** (`ILazyEmits extends ICommonsComponentEmits`) :
- `update:modelValue` — mis à jour par l'IntersectionObserver

**Slots** :
- `default` — contenu rendu une fois l'observer déclenché

**Attributs ARIA** : `aria-busy={!isActive || undefined}` — indique que le contenu est en cours de chargement tant qu'il n'est pas visible.

### Dépendances

- **Directive** : `v-intersect` — configure `[{ handler, options }, null, isActive ? [] : ['once']]`. L'option `'once'` débranche l'observer après la première intersection.
- `useDimension` — dimensions du placeholder
- `useVModel` — binding bidirectionnel `modelValue`
- `useStyle`, `useProps`
- **Composant** : `OrigamTransition` + `OrigamFade` (transition par défaut)

### Comportement notable

**Once** : `v-intersect` avec modificateur `once` (troisième élément du tableau) débranche automatiquement l'observer une fois `isActive` passé à `true`. Aucun risque de fuite mémoire.

**SSR** : `isActive` vaut initialement `false`, le slot n'est donc pas rendu côté serveur. `aria-busy="true"` sur le placeholder informe l'AT.

**Transition** : `OrigamTransition` wrap le slot avec `appear` (animation au premier rendu).

**Expose** : `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`.

### Exemple d'usage

```vue
<OrigamLazy :options="{ threshold: 0.5 }">
  <HeavyChart :data="chartData" />
</OrigamLazy>
```

---

## `OrigamClientOnly`

### Fichier

`packages/ds/src/components/ClientOnly/OrigamClientOnly.vue`

### Rôle

Garde d'hydratation SSR. Le slot `default` n'est rendu qu'après `onMounted` (côté client uniquement). Prévient les mismatches d'hydratation pour les composants qui dépendent de `window`, `localStorage`, la géolocalisation, etc.

### Entrées (props)

| Prop | Type | Description |
|------|------|-------------|
| `placeholderTag` | `string \| undefined` | Tag du placeholder SSR (défaut : aucun rendu) |
| `placeholderClass` | `string \| undefined` | Classe du placeholder pour réserver les dimensions |

### Sorties

**Slots** :
- `default` — contenu client uniquement (rendu après `onMounted`)
- `fallback` — placeholder affiché côté serveur (override de `placeholderTag`)

### Dépendances

- `onMounted`, `ref` (Vue core) — aucun composable DS

### Comportement notable

**Mécanisme** : un ref `isMounted = ref(false)` est posé à `false` pendant SSR. `onMounted` le passe à `true`. Vue évalue `v-if="isMounted"` à `false` côté serveur — le slot default n'est pas dans le HTML initial.

**Placeholder** : sans `placeholderTag`, le HTML serveur est vide entre les balises du composant. Avec `placeholderTag="div"` + `placeholderClass="h-[300px]"`, une zone réservée évite un cumulative layout shift à l'hydratation.

**Slot `fallback`** : override le rendu automatique du `placeholderTag`. Utile pour un skeleton custom ou un spinner SSR.

**Note** : le `placeholderTag` porte `aria-hidden="true"` pour ne pas polluer l'arbre AT avec un placeholder vide.

### Exemple d'usage

```vue
<OrigamClientOnly placeholder-tag="div" placeholder-class="h-[200px] animate-pulse bg-surface">
  <InteractiveEditor />
  <template #fallback>
    <OrigamSkeleton variant="rectangular" height="200" />
  </template>
</OrigamClientOnly>
```

---

## `OrigamDefaultsProvider`

### Fichier

`packages/ds/src/components/DefaultsProvider/OrigamDefaultsProvider.vue`

Interface : `packages/ds/src/interfaces/DefaultProvider/default-provider.interface.ts`

### Rôle

Provider de configuration par défaut des props. Il injecte dans le sous-arbre Vue (via `provide/inject`) une map de valeurs par défaut pour les composants Origam descendants. Les composants qui appellent `useDefaults(props)` lisent ces valeurs avant le fallback `withDefaults()`. C'est le mécanisme central permettant à `OrigamBtnGroup` de propager `color`, `density`, etc. à tous ses `OrigamBtn` enfants.

### Entrées (props)

`IDefaultProviderProps extends ICommonsComponentProps`

| Prop | Type | Description |
|------|------|-------------|
| `defaults` | `IDefault` | Map `{ global: {...}, 'origam-btn': {...}, ... }` |
| `disabled` | `boolean` | Passe les defaults parent sans modification |
| `reset` | `string \| number` | N'hérite pas des defaults parents (reset avec discriminateur) |
| `root` | `string \| number` | Identique à `reset` mais exprime "sommet de l'arbre" |
| `scoped` | `boolean` | N'hérite pas des defaults parents (forme déclarative) |

`IDefault` :
```ts
interface IDefault {
  global?: Record<string, unknown>
  [key: string]: Record<string, unknown> | undefined
}
```

### Sorties

**Slots** :
- `default` — sous-arbre qui recevra les defaults injectés (rendu transparent, aucun DOM supplémentaire)

### Dépendances

**Composable** : `provideDefaults(computed(() => props.defaults ?? {}), { scoped, reset, root, disabled })`

**Composable** : `useDefaults` (côté consommateur, dans chaque composant Origam)

**Const** : `ORIGAM_DEFAULTS_KEY` (clé Symbol `provide/inject`)

### Comportement notable

**Résolution `useDefaults`** — ordre de priorité pour chaque prop d'un composant :
1. Valeur passée explicitement par le parent dans le template.
2. Default composant-spécifique du provider le plus proche : `defaults['origam-btn'].color`.
3. Default global du provider le plus proche : `defaults.global.density`.
4. Valeur `withDefaults()` du composant (priorité la plus basse).

**Proxy props** : `useDefaults` retourne un proxy Vue qui intercepte chaque lecture de prop. Il compare si la prop était dans les vnode props de l'instance (`vm.vnode.props`) pour savoir si elle a été passée explicitement — les props explicites ignorent les defaults.

**Isolation** : `scoped` / `reset` / `root` empêchent l'héritage des defaults d'un provider parent. Utile pour composer des sections de page avec des densités différentes.

**Structurellement transparent** : ne rend que `<slot name="default"/>`, aucun élément DOM.

**Expose** : `filterProps`.

### Exemple d'usage

```vue
<OrigamDefaultsProvider :defaults="{
  global:         { density: 'compact' },
  'origam-btn':   { color: 'primary', variant: 'outlined' },
  'origam-chip':  { variant: 'tonal' }
}">
  <Toolbar />
</OrigamDefaultsProvider>
```

---

## `OrigamThemeProvider`

### Fichier

`packages/ds/src/components/ThemeProvider/OrigamThemeProvider.vue`

### Rôle

Wrapper de sous-arbre de thème. Il pose `data-theme` et/ou `data-mode` sur son élément racine, permettant à l'ensemble des CSS variables tokenisées de basculer pour tous les descendants. Les deux axes (brand et mode clair/sombre) sont orthogonaux et indépendants.

### Entrées (props)

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `theme` | `TTheme \| 'auto'` | `'auto'` | Thème brand (ex. `'dark'`, `'brand-x'`). `'auto'` : aucun attribut |
| `mode` | `TMode \| 'auto'` | `'auto'` | Mode `'light' \| 'dark'`. `'auto'` : aucun attribut |
| `tag` | `string` | `'div'` | Tag HTML du wrapper |

`TMode` : `'light' | 'dark'` (via enum `MODE`)

### Sorties

**Slots** :
- `default` — sous-arbre thémé

**Attributs DOM émis** :
- `data-theme="{theme}"` si `theme !== 'auto'`
- `data-mode="{mode}"` si `mode !== 'auto'`

**Classe** : `origam-theme-provider`

### Dépendances

- `TTheme`, `TMode` (types)
- `defineOptions({ inheritAttrs: false })` — les attrs du parent (classe, id…) sont fusionnés manuellement dans `themeProviderClasses`

### Comportement notable

**CSS-first** : le composant ne fait que poser des attributs `data-*`. C'est le mécanisme CSS des tokens tokenisés qui fait le travail réel — Style Dictionary émet `[data-theme="brand-x"] { --origam-color__action--primary---bg: ... }`.

**`display: contents`** : le wrapper SCSS utilise `display: contents` pour que l'élément ne participe pas au flux visuel — le provider est structurellement invisible.

**Mode `'auto'`** : pour `theme='auto'` ou `mode='auto'`, l'attribut correspondant n'est pas rendu sur le DOM (la computed retourne `undefined`). Les tokens sont alors hérités du provider parent ou de `<html>`.

**Orthogonalité** : on peut forcer `mode="dark"` sur une `<Card>` dans une page à thème `brand-x` en mode `light` — les deux attributs sont indépendants.

**`inheritAttrs: false`** : `attrs.class` est fusionné dans `themeProviderClasses` manuellement pour éviter la duplication classe + attribut.

### Exemple d'usage

```vue
<OrigamThemeProvider theme="dark" tag="section">
  <DarkSidebar />
</OrigamThemeProvider>

<OrigamThemeProvider theme="brand-premium" mode="light">
  <PremiumBanner />
</OrigamThemeProvider>
```

---

## `OrigamTransition`

### Fichier

`packages/ds/src/components/Transition/OrigamTransition.vue`

Interface : `packages/ds/src/interfaces/Transition/transition.interface.ts`

### Rôle

Wrapper unifié pour les transitions CSS Vue. Résout dynamiquement le composant de transition (string `Transition` nommée, composant custom comme `OrigamFade`, ou désactivé) et forward tous les props + attrs sur le composant sous-jacent.

### Entrées (props)

`ITransitionComponentProps`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `transition` | `boolean \| string \| TTransitionProps` | `{ component: OrigamFade }` | Transition à appliquer |
| `disabled` | `boolean` | — | Désactive la transition (name → `''`) |

`TTransitionProps` : objet `{ component?, name?, mode?, group?, hideOnLeave?, leaveAbsolute?, origin? }` + props `ITransitionProps`.

### Sorties

**Slots** :
- `default` — contenu transitionné

### Dépendances

**Composable** : `useTransition(props)` — retourne `{ isDisabled }` (computed sur `props.disabled`)

**Vue** : `Transition`, `mergeProps`, `useAttrs`

**Utils** : `omit` — pour exclure `component` des props forwards vers le composant de transition

**Composants** : `OrigamFade` (transition par défaut)

### Comportement notable

**Résolution dynamique** :
- Si `transition` est un objet avec `component` — le composant custom est utilisé (ex. `OrigamFade`, `OrigamSlideX`, `OrigamExpandY`…)
- Si `transition` est une string — `<Transition :name="...">` natif Vue
- Si `disabled` est true — `name` passe à `''` (aucune transition CSS)

**Merge props** : `transitionProps` fusionne les props du composant, les attrs du parent et `{ disabled }` via `mergeProps`.

**Catalogue de transitions disponibles** dans le répertoire (tous basés sur `useCssTransition`) :
`OrigamFade`, `OrigamExpandX`, `OrigamExpandY`, `OrigamSlideX`, `OrigamSlideY`, `OrigamScaleRotate`, `OrigamTranslateBottom`, `OrigamTranslatePicker`, `OrigamTranslateScale`, `OrigamSnack`, `OrigamWindowXTranslate`, `OrigamWindowYTranslate`, `OrigamWindowXReverseTranslate`, `OrigamWindowYReverseTranslate`, `OrigamReverseTranslatePicker`.

**`OrigamFade`** : transition CSS `opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)`, avec possibilité de surcharger les durations via tokens CSS.

**Expose** : `filterProps`.

### Exemple d'usage

```vue
<OrigamTransition transition="origam-transition--fade">
  <div v-if="isVisible">Contenu</div>
</OrigamTransition>

<OrigamTransition :transition="{ component: OrigamExpandY }">
  <details>...</details>
</OrigamTransition>
```

---

## `OrigamInfiniteScroll`

### Fichier

`packages/ds/src/components/InfiniteScroll/OrigamInfiniteScroll.vue`

Interface : `packages/ds/src/interfaces/InfiniteScroll/infinite-scroll.interface.ts`

### Rôle

Chargement infini de contenu avec sentinelles IntersectionObserver. Supporte les directions verticale et horizontale, les modes automatique et manuel, les côtés `start`, `end` et `both`, et les états `loading`, `empty`, `error`.

### Entrées (props)

`IInfiniteScrollProps extends ICommonsComponentProps, IColorProps, IBgColorProps, IDimensionProps, ITagProps, IDirectionProps`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `tag` | `string` | `'div'` | Tag racine |
| `direction` | `DIRECTION` | `'vertical'` | Axe de scroll |
| `side` | `TInfiniteScrollSide` | `'end'` | Côté(s) de déclenchement |
| `mode` | `TInfiniteScrollMode` | `'intersect'` | Mode auto ou manuel |
| `loadMoreText` | `string` | `'origam.infiniteScroll.loadMore'` | Clé i18n bouton manuel |
| `emptyText` | `string` | `'origam.infiniteScroll.empty'` | Clé i18n état vide |
| `margin` | `string` | — | Marge de la sentinelle IntersectionObserver |

`TInfiniteScrollSide` : `'start' | 'end' | 'both'`

`TInfiniteScrollMode` : `'intersect' | 'manual'`

### Sorties

**Emits** (`IInfiniteScrollEmits`) :
- `load({ side, done })` — déclenché à chaque intersection. `done` est un callback `(status: 'ok' | 'empty' | 'error') => void` que le consommateur appelle une fois les données chargées.

**Slots** :
- `default` — liste des éléments
- `loading` — scoped `{ side, props }` : spinner custom
- `loadMore` — scoped `{ side, props }` : bouton "Charger plus" (mode manuel)
- `empty` — scoped `{ side, props }` : message "Plus de données"
- `error` — scoped `{ side, props }` : message d'erreur

**Classes émises** :
`origam-infinite-scroll`, `origam-infinite-scroll--{direction}`, `origam-infinite-scroll--start`, `origam-infinite-scroll--end`, classes de couleur.

**Elements BEM** :
`.origam-infinite-scroll__side`.

### Dépendances

**Composant** : `OrigamInfiniteScrollIntersect` — sentinelle interne qui pose un IntersectionObserver sur un `<div>` fantôme et émet `intersect(side, isIntersecting)`.

**Composants** : `OrigamProgress` (loader circulaire par défaut), `OrigamBtn` (bouton "Load more" par défaut)

**Composables** : `useBothColor`, `useDimension`, `useLocale` (traduction des textes), `useStyle`, `useProps`

**Enums** : `DIRECTION`, `INFINITE_SCROLL_MODE`, `INFINITE_SCROLL_SIDE`, `INFINITE_SCROLL_STATUS`, `PROGRESS_TYPE`

### Comportement notable

**Callback `done`** : le consommateur appelle `done('ok')` pour signaler qu'il y a encore des données, `done('empty')` pour arrêter le scroll, `done('error')` pour afficher le slot `error`. L'état est stocké par côté (`startStatus` / `endStatus`).

**Mode `start`** : à `onMounted`, `scrollTop` est forcé à `scrollHeight` pour positionner le scroll en bas de page (cas d'un chat ou d'une timeline remontante). Après chaque `done('ok')`, la position de scroll est corrigée pour compenser le contenu ajouté en haut.

**Mode `intersect`** : `OrigamInfiniteScrollIntersect` pose une sentinelle via `IntersectionObserver`. Quand elle entre dans le viewport et que le statut est `OK`, `load` est émis.

**Mode `manual`** : la sentinelle n'est pas utilisée. Un bouton "Load more" est rendu ; le consommateur déclenche le chargement manuellement.

**`aria-live="polite"`** sur `.origam-infinite-scroll__side` — les messages "No more" et "Load more" sont annoncés aux lecteurs d'écran lors de mises à jour.

**Expose** : `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`.

### Exemple d'usage

```vue
<OrigamInfiniteScroll
  side="end"
  mode="intersect"
  @load="({ side, done }) => fetchNextPage(side, done)"
>
  <ArticleCard v-for="a in articles" :key="a.id" :article="a" />
</OrigamInfiniteScroll>
```

---

## `OrigamVirtualScroll`

### Fichier

`packages/ds/src/components/VirtualScroll/OrigamVirtualScroll.vue`

Interface : `packages/ds/src/interfaces/VirtualScroll/virtual-scroll.interface.ts`

### Rôle

Virtualisation de liste : seuls les éléments visibles (plus une marge de pré-rendu) sont dans le DOM. Les éléments hors vue sont représentés par des spacers CSS (`padding-top` / `padding-bottom`). Supporte un mode `renderless` où le scroll parent est un ancêtre existant.

### Entrées (props)

`IVirtualScrollProps extends ICommonsComponentProps, IDimensionProps, IVirtualProps`

| Prop | Type | Description |
|------|------|-------------|
| `items` | `any[]` | Liste complète des données |
| `renderless` | `boolean` | Utilise l'ancêtre scrollable au lieu d'un conteneur propre |
| (via `IDimensionProps`) | `width`, `height`… | Dimensions du conteneur scrollable |
| (via `IVirtualProps`) | `itemHeight`, `overscan`… | Configuration de la fenêtre virtuelle |

### Sorties

**Slots** (mode non-renderless) :
- `item` — scoped `{ item, index }` : rendu d'un élément
- `item.{N}` — scoped `{ item }` : rendu indexé (override par item N)

**Slots** (mode renderless) :
- `item.renderless` — scoped `{ item, index, itemRef }` : rendu sans conteneur
- `item.renderless.{N}` — scoped `{ item, itemRef }` : rendu indexé renderless

**Méthode exposée** : `scrollToIndex(index)` — scroll programmatique vers l'item N.

### Dépendances

**Composable** : `useVirtual(props, items)` — gère la fenêtre visible, les spacers haut/bas, le callback de resize par item.

**Composant** : `OrigamVirtualScrollItem` — wrapper individuel qui mesure la hauteur réelle de chaque item via `ResizeObserver` et émet `update:height`.

**Utils** : `convertToUnit`, `getCurrentInstance`, `getScrollParent`

**Composable** : `useToggleScope(() => props.renderless, fn)` — attache/détache les listeners de scroll conditionnellement

### Comportement notable

**Mode renderless** : dans ce mode, `containerRef` est résolu par `getScrollParent(vm.vnode.el)` — l'ancêtre scrollable est utilisé. Les listeners `scroll` (passive) et `scrollend` sont attachés à cet ancêtre via `onMounted` / `onScopeDispose`.

**Spacers** : le `<div class="origam-virtual-scroll__container">` porte `padding-top` et `padding-bottom` calculés par `useVirtual`. Aucun DOM fantôme n'est créé par item hors-vue.

**Item resize** : `OrigamVirtualScrollItem` utilise `ResizeObserver` pour mesurer la hauteur de chaque item et informer `useVirtual` via `handleItemResize(index, height)`. Cela permet de supporter des items de hauteurs variables.

**Transitions** : les items ont `transition-duration: 100ms` CSS pour les réajustements de position lors d'un scroll.

**Expose** : `scrollToIndex`, `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`.

### Exemple d'usage

```vue
<OrigamVirtualScroll
  :items="bigList"
  height="500"
  :item-height="56"
>
  <template #item="{ item, index }">
    <UserRow :key="item.id" :user="item" />
  </template>
</OrigamVirtualScroll>
```

---

## `OrigamTitle`

### Fichier

`packages/ds/src/components/Title/OrigamTitle.vue`

Interface : `packages/ds/src/interfaces/Title/title.interface.ts`

### Rôle

Composant de titre typographique configurable. Il rend un élément de heading (par défaut `<h1>`) avec un contrôle de taille via `density` et les contrats transversaux de couleur, espacement et bordure. Le tag est overridable pour s'adapter au niveau hiérarchique du document.

### Entrées (props)

`ITitleProps extends ITagProps, ICommonsComponentProps, IColorProps, IBgColorProps, IDensityProps, IPaddingProps, IMarginProps, IBorderProps`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `tag` | `string` | `'h1'` | Tag HTML sémantique |
| `text` | `string` | — | Texte fallback (quand le slot default est absent) |
| `density` | `TDensity` | `'default'` | Taille via density (`compact` → xs, `default` → md, `comfortable` → xl) |

### Sorties

**Slots** :
- `default` — contenu du titre (prioritaire sur `text`)

**Classes émises** :
`origam-title`, `origam-title--density-{density}`, classes de couleur/border/padding/margin.

### Dépendances

- `useBothColor`, `useDensity`, `useBorder`, `usePadding`, `useMargin`, `useStyle`, `useProps`

### Comportement notable

**Density comme levier typographique** :
- `compact` → `font-size: var(--origam-title---font-size-xs)` (token le plus petit)
- `default` → `font-size: var(--origam-title---font-size-md)`
- `comfortable` → `font-size: var(--origam-title---font-size-xl)` (token le plus grand)

**Contenu conditionnel** : `hasContent = slots.default || props.text`. Si ni slot ni text, rien n'est rendu (le tag reste vide). Intention : ne pas émettre de headings vides dans le DOM.

**Tag override** : passer `tag="h2"` ou `tag="h3"` préserve la hiérarchie des headings quand le composant est utilisé dans une section imbriquée.

**Tokens CSS** : `--origam-title---color`, `--origam-title---font-family`, `--origam-title---font-weight`, `--origam-title---letter-spacing`, `--origam-title---line-height`, `--origam-title---margin-block-start`, `--origam-title---margin-block-end`, `--origam-title---font-size-xs`, `--origam-title---font-size-md`, `--origam-title---font-size-xl`.

**Expose** : `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`.

### Exemple d'usage

```vue
<OrigamTitle tag="h2" density="comfortable" color="primary">
  Bienvenue sur Origam
</OrigamTitle>
```

---

## Tableau récapitulatif

| Composant | Tag sémantique | Composables clés | Directive | Sous-composants | SSR | Expose |
|---|---|---|---|---|---|---|
| `OrigamBtn` | `<button>` / `<a>` | `useDefaults`, `useLink`, `useStateEffect`, `useVariant`, `useLoader`, `useGroupItem`, `useHover`, `useActive` | `v-ripple` | `OrigamProgress`, `OrigamLoader`, `OrigamSkeleton`, `OrigamIcon`, `OrigamAvatar` | Oui | `group`, `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded` |
| `OrigamBlockquote` | `<blockquote>` | — (pur computed) | — | — | Oui (locale résolue côté client) | `effectiveLang`, `effectiveAlign`, `openMark`, `closeMark`, `showQuoteMark`, `hasAttribution` |
| `OrigamCode` | `<figure>` | `useCode`, `useClipboard`, `useBorder`, `useRounded`, `usePadding`, `useMargin`, `useDimension`, `useBothColor`, `useElevation` | — | — | Oui | `rebuild`, `copied`, `codeRef` |
| `OrigamKbd` | `<kbd>` | `useBorder`, `useRounded`, `useSize`, `useBothColor`, `useStyle`, `useProps` | — | — | Oui | `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded` |
| `OrigamClipboard` | `<span>` (overridable) | `useClipboard`, `useBorder`, `useRounded`, `usePadding`, `useMargin`, `useBothColor` | — | `OrigamIcon` | Non (Clipboard API) | `copy`, `copied`, `error` |
| `OrigamQrCode` | `<div>` (overridable) | `useQrCode`, `useTextColor`, `useBackgroundColor`, `useRounded`, `useBorder`, `useSize`, `usePadding`, `useMargin`, `useElevation` | — | `OrigamAvatar`, `OrigamIcon` | Oui | `svg` |
| `OrigamLazy` | `<div>` (overridable) | `useDimension`, `useVModel`, `useStyle`, `useProps` | `v-intersect` | `OrigamTransition`, `OrigamFade` | Oui (slot non rendu SSR) | `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded` |
| `OrigamClientOnly` | — (template) | — | — | — | Oui (guard hydratation) | — |
| `OrigamDefaultsProvider` | — (slot passthrough) | `provideDefaults`, `useProps` | — | — | Oui | `filterProps` |
| `OrigamThemeProvider` | `<div>` (overridable) | — | — | — | Oui | — |
| `OrigamTransition` | `<Transition>` / composant | `useTransition`, `useProps` | — | `OrigamFade` (défaut) | Oui | `filterProps` |
| `OrigamInfiniteScroll` | `<div>` (overridable) | `useBothColor`, `useDimension`, `useLocale`, `useStyle`, `useProps` | — | `OrigamInfiniteScrollIntersect`, `OrigamProgress`, `OrigamBtn` | Oui | `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded` |
| `OrigamVirtualScroll` | `<div>` (overridable) / renderless | `useDimension`, `useVirtual`, `useToggleScope`, `useStyle`, `useProps` | — | `OrigamVirtualScrollItem` | Oui | `scrollToIndex`, `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded` |
| `OrigamTitle` | `<h1>` (overridable) | `useBothColor`, `useDensity`, `useBorder`, `usePadding`, `useMargin`, `useStyle`, `useProps` | — | — | Oui | `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded` |
