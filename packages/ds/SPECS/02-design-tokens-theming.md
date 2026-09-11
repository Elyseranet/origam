# 02 — Design Tokens & Multi-thème

> Spec technique ultra-détaillée du système de tokens et de la couche de thématisation d'origam.
> Tout ce document est basé sur le code réel — aucune valeur inventée.

---

## 1. Les trois tiers de tokens

### Définition et rôle

Le système repose sur une hiérarchie stricte à trois niveaux. Chaque niveau ne peut référencer que le niveau inférieur ou le même niveau ; jamais le niveau supérieur.

```
primitive.json  →  semantic/{theme}.json  →  component/{name}.json
```

**Tier 1 — Primitif** (`packages/ds/tokens/primitive.json`)

Valeurs brutes, sans intention sémantique. Ce fichier est le seul endroit où des valeurs hexadécimales et des mesures en dur sont autorisées. Il couvre :

- Rampes de couleurs nommées par teinte + niveau : `color.neutral.{0…950}`, `color.primary.{50…900}`, `color.green.{50…900}`, `color.amber`, `color.red`, `color.blue`, `color.black`, `color.white`
- Espacement : `space.{0,1,2,3,4,5,6,8,10,12,14,16,20}` → `0px` à `80px` (pas de 4 px)
- Typographie : `font.family.{sans,mono,serif}`, `font.size.{xs…5xl}` (rem), `font.weight.{regular,medium,semibold,bold}`, `font.lineHeight`, `font.letterSpacing`
- Rayons : `radius.{none,xs,sm,md,lg,xl,2xl,full}`
- Ombres : `shadow.{none,xs,sm,md,lg,xl}` — valeurs composites DTCG (tableau de calques)
- Motion : `motion.duration.{instant,fast,normal,medium,slow,xslow}`, `motion.easing.{standard,decelerate,accelerate,sharp,linear}` en `cubicBezier`
- Z-index : `zIndex.{base,raised,dropdown,sticky,fixed,overlay,modal,toast,tooltip}`
- Opacité : `opacity.{0,12,26,32,50,70,100}`
- Largeurs de bordure : `border.width.{0,thin,2,4}`

**Frontière à respecter :** le tier primitif ne contient aucune référence à `{color.action.*}` ni à aucun token sémantique. C'est un dictionnaire de valeurs atomiques, partagé par tous les thèmes.

**Tier 2 — Sémantique** (`packages/ds/tokens/semantic/{theme}.json`)

Donne une intention à chaque valeur : surface, texte, bordure, action, feedback, overlay. Ces tokens référencent exclusivement des tokens du tier 1 via la syntaxe d'alias DTCG `{color.neutral.0}`. Exemple réel tiré de `semantic/light.json` :

```json
{
  "color": {
    "surface": {
      "default":  { "$type": "color", "$value": "{color.neutral.0}" },
      "raised":   { "$type": "color", "$value": "{color.neutral.0}" },
      "overlay":  { "$type": "color", "$value": "{color.neutral.100}" },
      "sunken":   { "$type": "color", "$value": "{color.neutral.50}" },
      "disabled": { "$type": "color", "$value": "{color.neutral.200}" }
    },
    "action": {
      "primary": {
        "bg":         { "$type": "color", "$value": "{color.primary.600}" },
        "bgHover":    { "$type": "color", "$value": "{color.primary.700}" },
        "bgSubtle":   { "$type": "color", "$value": "{color.primary.50}" },
        "bgDisabled": { "$type": "color", "$value": "{color.neutral.200}" },
        "fg":         { "$type": "color", "$value": "{color.neutral.0}" },
        "fgSubtle":   { "$type": "color", "$value": "{color.primary.700}" },
        "fgDisabled": { "$type": "color", "$value": "{color.neutral.400}" }
      }
    }
  }
}
```

Les fichiers sémantiques existants sont : `light.json`, `dark.json`, et les surcharges de brand : `sobre-{light,dark}.json`, `glass-{light,dark}.json`, `geek-{light,dark}.json`, `cartoon-{light,dark}.json`, `editorial-{light,dark}.json`, `material-{light,dark}.json`, `apple-{light,dark}.json`, `ecom-{light,dark}.json`, plus deux fichiers de gradients (`gradient-light.json`, `gradient-dark.json`).

**Frontière à respecter :** un fichier sémantique ne définit jamais de valeur hexadécimale directe (sauf le cas limite `sobre-light.json` qui hardcode quelques couleurs spécifiques). Il ne référence jamais un token d'un autre fichier sémantique.

**Tier 3 — Composant** (`packages/ds/tokens/component/{name}.json`)

Tokens propres à un composant. Référencent des tokens du tier 2 (`{color.action.primary.bg}`) pour la couleur et des tokens du tier 1 (`{space.4}`, `{radius.sm}`) pour les dimensions. Exemple réel tiré de `component/btn.json` :

```json
{
  "btn": {
    "background-color":       { "$type": "color",     "$value": "{color.action.secondary.bg}" },
    "color":                  { "$type": "color",     "$value": "{color.action.secondary.fg}" },
    "border-radius":          { "$type": "dimension", "$value": "{radius.sm}" },
    "height":                 { "$type": "dimension", "$value": "36px" },
    "font-weight":            { "$type": "fontWeight","$value": "{font.weight.medium}" },
    "primary": {
      "background-color":     { "$type": "color",     "$value": "{color.action.primary.bg}" },
      "color":                { "$type": "color",     "$value": "{color.action.primary.fg}" },
      "background-color-hover":{ "$type": "color",    "$value": "{color.action.primary.bgHover}" }
    }
  }
}
```

**Frontière à respecter :** un token de composant ne doit jamais hardcoder de couleur hexadécimale ; il doit passer par une référence sémantique. Les dimensions non référencées (comme `"36px"` pour la hauteur par défaut) sont autorisées quand aucun token primitif ne correspond exactement.

---

## 2. Convention de nommage Style Dictionary → variables CSS

### Module de référence

La grammaire de nommage est centralisée dans `packages/ds/scripts/token-name.mjs`. C'est la source de vérité unique, consommée à la fois par le build Style Dictionary (`origam/name/css` transform dans `build-tokens.mjs`) et par le runtime (`src/utils/Theme/token-name.util.ts`). Un test de parité (`token-name.util.spec.ts`) garantit que les deux restent identiques.

### Grammaire complète

Les séparateurs sont sémantiques et non interchangeables :

| Séparateur | Rôle | Exemple |
|---|---|---|
| `-` (tiret simple) | Séparateur de mots dans un segment | `background-color`, `border-radius` |
| `---` (triple-tiret) | Sépare le bloc (composant/groupe) de la propriété | `origam-btn---background-color` |
| `--` (double-tiret) | Sépare un état/variante/modificateur | `origam-btn--primary---background-color` |
| `__` (double-underscore) | Sépare un BEM child (enfant nommé) | `origam-card__overlay---background-color` |

### Tokens primitifs et sémantiques

La règle dépend de la longueur du path :

- **Longueur 2** `[color, black]` → `origam-color---black`
- **Longueur 3** `[color, neutral, 500]` → `origam-color__neutral---500`
- **Longueur 4** `[color, action, primary, bg]` → `origam-color__action--primary---bg`

Vérification dans le CSS généré (`src/assets/css/tokens/light.css`) :

```css
:root,
[data-theme="light"] {
  --origam-color__surface---default: #ffffff;
  --origam-color__text---primary: #171717;
  --origam-color__action--primary---bg: #7c3aed;
  --origam-color__action--primary---bgHover: #6d28d9;
  --origam-color__feedback--success---bg: #4caf50;
}
```

### Tokens de composant

La détection composant vs primitif/sémantique se fait sur `token.filePath` (présence de `/component/` dans le chemin). L'algorithme dans `token-name.mjs` :

1. **Bloc seul** `[btn]` → `origam-btn`
2. **Bloc + modificateur intent/state + propriété** — quand `rest[0]` est dans l'ensemble `INTENT_STATES` (`primary | secondary | ghost | success | warning | danger | info | error | selected | outlined | elevated | filter | hover | active | disabled | focus`) → `origam-{bloc}--{state}---{propriété}`
3. **Bloc + BEM child + propriété** — quand `rest[0]` est un mot lettres uniquement sans tiret (test `/^[a-zA-Z]+$/`) → `origam-{bloc}__{child}---{propriété}`
4. **Bloc + BEM child + state + propriété** → `origam-{bloc}__{child}--{state}---{propriété}`
5. **Bloc + propriété** (cas général) → `origam-{bloc}---{propriété}`

Exemples réels tirés du code et du CSS généré :

```
[btn, background-color]                → --origam-btn---background-color
[btn, primary, background-color]       → --origam-btn--primary---background-color
[btn, primary, background-color-hover] → --origam-btn--primary---background-color-hover
[card, overlay, background-color]      → --origam-card__overlay---background-color
[card, overlay, hover, opacity]        → --origam-card__overlay--hover---opacity
```

### Primitifs dans le CSS

Le fichier `src/assets/css/tokens/primitive.css` est émis sous `:root` (unique, indépendant du thème) :

```css
:root {
  --origam-color__neutral---0: #ffffff;
  --origam-color__neutral---500: #737373;
  --origam-color__primary---600: #7c3aed;
  --origam-radius---sm: 4px;
  --origam-space---4: 16px;
  --origam-shadow---md: 0px 6px 24px 0px rgba(0,0,0,0.05), ...;
}
```

---

## 3. Pipeline tokens:build / watch / lint

### Scripts disponibles

Définis dans `packages/ds/package.json`, exécutés via `pnpm -F origam` :

| Commande | Effet |
|---|---|
| `tokens:build` | Build one-shot de tous les themes + utilities + types |
| `tokens:watch` | Rebuild sur changement dans `tokens/**/*.json` (debounce 100 ms) |
| `tokens:lint` | `--dry-run` : parse + validation, aucune écriture |

### Entrées

- `tokens/$themes.json` : registre de tous les thèmes (20 thèmes définis). Chaque thème déclare ses token sets actifs en `"enabled"` ou `"disabled"`. La fonction `permutateThemes` de `@tokens-studio/sd-transforms` résout cela en une liste de fichiers sources.
- `tokens/primitive.json` : tier 1 (unique)
- `tokens/semantic/*.json` : tier 2 (20 fichiers)
- `tokens/component/*.json` : tier 3 (environ 100 fichiers)

Format DTCG : toutes les valeurs utilisent `$type` et `$value`. Les alias utilisent `{path.to.token}`. Les ombres complexes utilisent le type `shadow` avec des tableaux de calques.

### Transforms appliquées

La pipeline Style Dictionary v4 applique deux transforms dans cet ordre :

1. `name/kebab` (fourni par `@tokens-studio/sd-transforms`) — normalise le path en kebab-case
2. `origam/name/css` — transform personnalisé qui applique la grammaire triple/double-tiret définie dans `token-name.mjs`

Le groupe de transforms `tokens-studio` (enregistré par `register(StyleDictionary)`) gère la résolution des alias DTCG, la conversion des types (`cubicBezier` → `cubic-bezier(…)`, tableaux de shadows → syntaxe multi-calques CSS).

### Sorties

Pour chaque thème, le build produit en parallèle :

- **CSS** → `src/assets/css/tokens/{theme}.css` — block de variables CSS scopé (voir section 5 pour les sélecteurs)
- **SCSS** → `src/assets/scss/tokens/_{theme}.scss` — même contenu, importable en SCSS

En fin de build :

- **Utility classes** → `src/assets/css/tokens/origam-utilities.css` et `src/assets/scss/tokens/_origam-utilities.scss` — génération unique, indépendante du thème
- **TS types** → `src/types/tokens.type.ts` — union `TTokenName` (tous les noms `--origam-*` connus), `TIntent`, `TTheme`
- **`themes-all.css`** → agrégation de tous les combos brand (`sobre-light`, `sobre-dark`, etc.) dans un seul fichier pour les consommateurs marketing

### Filtre d'émission

Le filtre `filterFn` dans `buildOneTheme()` exclut les tokens primitifs des builds sémantiques/composants (et inversement). Cela évite que les valeurs brutes soient ré-émises dans chaque fichier de thème — les primitifs sont dans `:root` une seule fois via `primitive.css`.

---

## 4. Utility classes — production et consommation

### Origine : le format `origam/css/utilities`

Les classes utilitaires sont générées par le format Style Dictionary personnalisé `origam/css/utilities` dans `build-tokens.mjs`. Ce n'est pas un fichier statique : la liste des classes est dérivée du manifeste `UTILITY_GROUPS`, mais leur émission est conditionnée à l'existence du token référencé dans le dictionnaire. Si le token est absent, la classe est omise et un warning est émis.

Le manifeste couvre neuf groupes :

| Préfixe de classe | Propriété CSS | Valeurs |
|---|---|---|
| `origam--color-{intent}` | `color` | primary, secondary, success, warning, danger, info, neutral |
| `origam--bg-{intent}` | `background-color` | primary, secondary, success, warning, danger, info, neutral |
| `origam--shadow-{rung}` | `box-shadow` | none, xs, sm, md, lg, xl |
| `origam--rounded-{rung}` | `border-radius` | none, xs, sm, md, lg, xl, full |
| `origam--border-{width}` | `border-width` + `border-style: solid` | none, thin, thick |
| `origam--p-{step}` | `padding` | 0, 1, 2, 3, 4, 5, 6, 8, 10, 12 |
| `origam--m-{step}` | `margin` | 0, 1, 2, 3, 4, 5, 6, 8, 10, 12 |
| `origam--gap-{step}` | `gap` | 0, 1, 2, 3, 4, 5, 6, 8, 10, 12 |
| `origam--text-{size}` | `font-size` | xs, sm, md, lg, xl, 2xl |

Exemple de sortie réelle (`origam-utilities.css`) :

```css
.origam--color-primary { color: var(--origam-color__action--primary---fg); }
.origam--bg-primary    { background-color: var(--origam-color__action--primary---bg); }
.origam--shadow-md     { box-shadow: var(--origam-shadow---md); }
.origam--rounded-sm    { border-radius: var(--origam-radius---sm); }
.origam--border-thin   { border-width: var(--origam-border__width---thin); border-style: solid; }
.origam--p-4           { padding: var(--origam-space---4); }
```

### Principe fondamental

Les classes ne contiennent aucune valeur brute — uniquement des `var(--origam-…)`. Le changement de thème (swap des variables sous `[data-theme="…"]`) est donc automatiquement répercuté sans regénérer ce fichier.

### Ordre de chargement obligatoire

Le commentaire dans `origam-utilities.css` l'explique : ce fichier doit être importé **avant** les SCSS de composants. La raison est la spécificité : `origam-btn--variant-flat` (0,1,0) et `.origam--bg-primary` (0,1,0) ont la même spécificité ; le dernier déclaré gagne. Si le composant arrive après la utility class, il peut l'écraser. L'ordre inverse casse la surcharge.

### Lien avec le pattern classes-first

Dans les composables (`useColor`, `useBackgroundColor`, `useTextColor`, `useColorEffect`) :

- Si la valeur passée par le consommateur est un **intent tokenisé** (`'primary'`, `'success'`, etc., testé par `isUtilityIntent()`), le composable émet la **classe utilitaire** (`origam--bg-primary`) et aucun style inline.
- Si la valeur est une **couleur CSS brute** (hex, rgb, hsl), le composable émet un **style inline** (`background-color: #ff00aa`) et aucune classe.
- Les deux canaux sont toujours retournés (`colorClasses` et `colorStyles`) — le canal vide est inoffensif.

Exception importante : `useColorEffect` retourne `colorClasses = []` quand le composant est en état `hover`, `active` ou `disabled`. Les utility classes sont statiques ; les états interactifs utilisent les tokens `bgHover`/`bgActive` via les styles inline.

---

## 5. Multi-thème : sélecteurs, `prefers-color-scheme` et brand themes

### Architecture à deux axes

Depuis la refonte post-v0.4, le système de thème est à deux axes orthogonaux :

- **Brand** (`data-theme`) : identité visuelle — `light`, `dark`, `sobre`, `glass`, `geek`, `cartoon`, `editorial`, `material`, `apple`, `ecom`
- **Mode** (`data-mode`) : luminosité — `light` ou `dark`

### Sélecteurs CSS émis par le build

Le format `origam/css/themed` dans `build-tokens.mjs` gère trois cas :

**Primitifs** (theme-independent) :
```css
:root {
  --origam-color__neutral---0: #ffffff;
  /* … */
}
```

**Thème `light`** (par défaut, s'applique aussi en l'absence d'attribut) :
```css
:root,
[data-theme="light"] {
  --origam-color__surface---default: #ffffff;
  /* … */
}
```

**Thème `dark`** (double sélecteur : explicite + media query) :
```css
[data-theme="dark"] {
  --origam-color__surface---default: #0a0a0a;
  /* … */
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --origam-color__surface---default: #0a0a0a;
    /* … */
  }
}
```

Ce double sélecteur garantit que si l'utilisateur n'a pas de préférence explicite (`data-theme` absent), le mode système est honoré.

**Themes brand-{mode}** (combos `sobre-light`, `sobre-dark`, etc.) :
```css
[data-theme="sobre"][data-mode="light"] {
  /* surcharges sémantiques sobre-light */
}
```

Les thèmes brand utilisent un sélecteur composé `[data-theme="sobre"][data-mode="light"]` — les deux attributs doivent être présents simultanément.

### `$themes.json` — registre des thèmes

`packages/ds/tokens/$themes.json` est un tableau où chaque entrée est un objet :

```json
{
  "id": "sobre-light",
  "name": "sobre-light",
  "selectedTokenSets": {
    "primitive": "enabled",
    "semantic/light": "enabled",
    "semantic/dark": "disabled",
    "semantic/sobre-light": "enabled",
    "component/btn": "enabled",
    "...": "enabled"
  }
}
```

La règle de superposition des sets pour un thème brand : `primitive` (enabled) + `semantic/light` ou `semantic/dark` (base) + `semantic/{brand}-{mode}` (surcharge). La surcharge brand n'écrit que les tokens qui diffèrent de la base. `permutateThemes` de `@tokens-studio/sd-transforms` résout cette liste en chemins de fichiers concrets, dans l'ordre déclaré.

### Ajouter un nouveau thème brand — étapes réelles

1. **Créer `tokens/semantic/brand-{name}-light.json`** : surcharger uniquement les tokens sémantiques qui diffèrent de `semantic/light.json`. Même format DTCG, références vers des tokens primitifs ou des valeurs fixes.

2. **Optionnellement créer `tokens/semantic/brand-{name}-dark.json`** pour le pendant sombre.

3. **Enregistrer dans `tokens/$themes.json`** : ajouter deux entrées (light + dark) en s'inspirant du pattern `sobre-light` / `sobre-dark` existant. Activer `primitive`, `semantic/light` (ou `dark`), et `semantic/brand-{name}-{mode}`.

4. **Rebuild** : `pnpm -F origam tokens:build`. Le build produit automatiquement :
   - `src/assets/css/tokens/brand-{name}-light.css` et `brand-{name}-dark.css`
   - Les partials SCSS correspondants
   - L'entrée dans `themes-all.css`

5. **Activer dans l'app** : `<html data-theme="brand-{name}" data-mode="light">` ou via `setTheme('brand-{name}')` + `setMode('light')` depuis `useTheme()`.

---

## 6. Helpers runtime

### `useTheme()` — composable singleton

**Fichier** : `packages/ds/src/composables/Theme/theme.composable.ts`

Le composable est un **singleton module** : les refs `_theme` et `_mode` sont déclarées au niveau module et partagées entre tous les appels à `useTheme()`. Tout composant qui appelle `useTheme()` voit et modifie le même état. Il n'y a pas de `provide/inject` — le partage est au niveau module JavaScript.

**Signature complète** (valeurs retournées) :

```ts
const {
  // Axe brand
  theme,        // ReadonlyRef<TTheme>          — 'auto' | 'light' | 'dark' | string
  resolved,     // ReadonlyRef<TThemeResolved>  — 'light' | 'dark' (jamais 'auto')
  setTheme,     // (t: TTheme) => void
  toggle,       // () => void                  — flip light ↔ dark (rétro-compat)

  // Axe mode
  mode,         // ReadonlyRef<TMode>           — 'auto' | 'light' | 'dark'
  resolvedMode, // ReadonlyRef<TModeResolved>   — 'light' | 'dark' (jamais 'auto')
  setMode,      // (m: TMode) => void
  toggleMode    // () => void                  — flip light ↔ dark
} = useTheme()
```

**Types** (dans `src/types/Theme/theme.type.ts`) :

```ts
type TTheme         = 'auto' | 'light' | 'dark' | (string & {})
type TThemeResolved = Exclude<TTheme, 'auto'>    // = 'light' | 'dark' | string
type TMode          = 'auto' | 'light' | 'dark'
type TModeResolved  = Exclude<TMode, 'auto'>     // = 'light' | 'dark'
```

**Persistance** : `localStorage` via les clés :
- `'origam-theme'` (constante `ORIGAM_THEME_STORAGE_KEY`)
- `'origam-mode'` (constante `ORIGAM_MODE_STORAGE_KEY`)

Au premier appel, les refs sont initialisées depuis `localStorage` (`readPersisted()` / `readPersistedModeValue()`). En mode SSR (`typeof window === 'undefined'`), les fonctions de lecture retournent `'auto'` sans planter.

**Application au DOM** :
- `setTheme('sobre')` → pose `data-theme="sobre"` sur `<html>`
- `setTheme('auto')` → supprime l'attribut `data-theme` de `<html>`
- `setMode('dark')` → pose `data-mode="dark"` sur `<html>`
- `data-mode` est **toujours** présent et concret (jamais retiré) car la matrice de tokens brand n'a pas de fallback sans mode.

**`prefers-color-scheme`** : le watcher media est initialisé via `ensureSystemPreference()` — un singleton supplémentaire protégé par `_mediaInitDone`. L'init est lifecycle-independent (pas besoin d'`onMounted`), ce qui permet d'appeler `useTheme()` depuis un plugin Nuxt. `_systemPrefersDark` (ref booléenne) se met à jour automatiquement via `addEventListener('change', …)`.

**Helpers SSR** (non réactifs, pour les plugins no-flash) :
```ts
applyThemeSync(theme: TTheme)       // pose data-theme synchroniquement
applyModeSync(mode: TMode)          // pose data-mode synchroniquement (résout 'auto')
readPersistedTheme(): TTheme        // lit localStorage sans instancier le composable
readPersistedMode(): TMode          // idem pour le mode
```

**Réinitialisation pour les tests** :
```ts
_resetThemeForTesting()             // remet _theme, _mode, _systemPrefersDark à null
```

### `useInstalledThemes()` — liste des themes installés

**Fichier** : `packages/ds/src/composables/Theme/installed-themes.composable.ts`

Retourne la liste statique des thèmes brand installés via `createOrigam({ themes })`. Utilise `inject(ORIGAM_THEMES_KEY, [])` — retourne un tableau vide si aucun thème n'est installé ou si appelé hors contexte d'application.

```ts
const themes: TInstalledThemes = useInstalledThemes()
// Ex: [{ name: 'sobre', modes: ['light', 'dark'] }, ...]
```

La clé d'injection est `ORIGAM_THEMES_KEY = Symbol.for('origam:themes')`.

### `<OrigamThemeProvider>` — surcharge locale de thème/mode

**Fichier** : `packages/ds/src/components/ThemeProvider/OrigamThemeProvider.vue`

Ce composant crée une sous-arborescence avec un `data-theme` et/ou `data-mode` différent du document. Il n'utilise **pas** `provide/inject` : les attributs HTML suffisent — les sélecteurs CSS `[data-theme="…"]` sont héréditaires via la cascade.

**Props** :

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `theme` | `TTheme` | `'auto'` | Brand à appliquer au sous-arbre. `'auto'` = pas d'attribut rendu. |
| `mode` | `TMode` | `'auto'` | Mode luminosité. `'auto'` = pas d'attribut rendu. |
| `tag` | `string` | `'div'` | Tag HTML du wrapper. Utiliser `'section'`/`'article'` si le wrapper est sémantique. |

**Comportement** :
- `theme === 'auto'` → `:data-theme="undefined"` (attribut absent, le parent hérite)
- `mode === 'auto'` → `:data-mode="undefined"` (attribut absent, le parent hérite)
- Le wrapper a `display: contents` en CSS — il est visuellement transparent

**Exemple** : afficher une Card en thème `sobre` à l'intérieur d'une page `light` :
```html
<OrigamThemeProvider theme="sobre" mode="light">
  <OrigamCard>Contenu en thème sobre</OrigamCard>
</OrigamThemeProvider>
```

### `<OrigamDefaultsProvider>` — injection de valeurs par défaut

**Fichier** : `packages/ds/src/components/DefaultsProvider/OrigamDefaultsProvider.vue`

Ce composant n'est pas un composant de thème mais un composant d'injection de props par défaut. Il est transparent (rend uniquement son slot `default`, pas de chrome DOM). Son rôle : `provide` une map de defaults que `useDefaults()` dans les composants descendants résoudra en priorité sur les props internes.

**Interface réelle** (`IDefaultProviderProps`) :

| Prop | Type | Rôle |
|---|---|---|
| `defaults` | `IDefault` | Map `{ global: {…}, 'origam-btn': {…}, … }` |
| `disabled` | `boolean` | Passe les defaults parent inchangés (désactive temporairement) |
| `reset` | `string \| number` | Supprime l'héritage des defaults parent ; valeur opaque pour DevTools |
| `root` | `string \| number` | Même comportement que `reset`, sémantique "sommet de l'arbre" |
| `scoped` | `boolean` | Pas d'héritage parent, le sous-arbre part de zéro |

**`IDefault`** : `{ global?: Record<string, unknown>; [componentName: string]: Record<string, unknown> | undefined }`. Le composant est identifié par son nom kebab-case retourné par `getCurrentInstanceName()` — ex. `'origam-btn'`.

**Exemple concret** :
```html
<OrigamDefaultsProvider :defaults="{
  global:        { density: 'comfortable' },
  'origam-btn':  { color: 'primary' },
  'origam-chip': { variant: 'outlined' }
}">
  <!-- Tous les OrigamBtn de ce sous-arbre ont color='primary' par défaut -->
</OrigamDefaultsProvider>
```

---

## 7. API color/intent — `TIntent`, dépréciation hex, `useColorEffect`

### `TIntent` — source de vérité

`TIntent` est défini dans `src/types/tokens.type.ts` (auto-généré) et dans `src/types/Commons/color.type.ts`. Les valeurs reconnues :

```ts
type TIntent =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
```

Ces huit valeurs correspondent aux groupes définis dans `semantic/light.json` (`color.action.{primary,secondary,ghost}` et `color.feedback.{success,warning,danger,info}`). `neutral` mappe sur `color.text.primary`.

### Dépréciation `color="#hex"`

Depuis v0.4, passer une valeur hexadécimale ou RGB sur les props `color`/`bgColor` est **déprécié** et avertit en console via `warnLegacyColor()` (dans `src/utils/Commons/color.util.ts`) :

```
[origam] received a raw color for prop "bgColor" (value: #ff00aa).
Pass a TIntent ('primary' | 'success' | ...) or use a :style binding
for one-off custom colors. Raw color support is deprecated and will
be removed in v3.0.0.
```

L'avertissement est émis **une seule fois par valeur** (set `warnedColors` en mémoire module pour éviter le spam console).

**Chemin de migration** :
```html
<!-- Avant (déprécié) -->
<OrigamBtn color="#7c3aed">Action</OrigamBtn>

<!-- Après — intent tokenisé -->
<OrigamBtn bgColor="primary">Action</OrigamBtn>

<!-- Après — couleur custom (one-off, pas de token) -->
<OrigamBtn :style="{ '--origam-btn---background-color': '#7c3aed' }">Action</OrigamBtn>
```

### `useColorEffect` — résolution d'état

`useColorEffect` (dans `composables/Commons/color.composable.ts`) est le composable principal pour les composants interactifs (Btn, Chip, Badge…). Il accepte :

```ts
useColorEffect(
  props:      IColorProps & IBgColorProps,
  isHover:    Ref<boolean> | ComputedRef<boolean>,   // défaut: ref(false)
  isActive:   Ref<boolean> | ComputedRef<boolean>,   // défaut: ref(false)
  isDisabled: Ref<boolean> | ComputedRef<boolean>    // défaut: ref(false)
)
```

Il retourne `{ colorClasses, colorStyles, color, bgColor }`.

**Résolution d'état** : pour chaque axe (bg et fg), il choisit entre `'default'`, `'hover'` et `'active'` en fonction des refs d'état, avec une logique de "same-intent bypass" — si `hoverBgColor === bgColor` et que les deux sont le même intent, l'état hover remonte quand même au token `bgHover` de l'intent (plutôt que de ne rien faire).

**Intents et tokens** : quand `bgColor` est un intent (ex. `'primary'`), `useColorEffect` construit `background-color: var(--origam-color__action--primary---bg)` (état default) ou `var(--origam-color__action--primary---bgHover)` (état hover). Ces expressions sont générées par `intentBgExpr()` / `tokenStylesForIntent()` dans `color.util.ts`.

**Auto-contrast** : si `bgColor` est un intent et que `color` n'est pas fourni, `useColorEffect` injecte automatiquement le token de foreground associé (`--origam-color__action--primary---fg`) pour garantir la lisibilité sans que le consommateur spécifie les deux axes.

**Gradients** : si la valeur est un gradient CSS (`linear-gradient(…)`, `radial-gradient(…)`), elle est routée via `resolveGradient()` sur `background-image` (non `background-color`). La dépréciation ne s'applique pas aux gradients.

---

## Tableau de synthèse : tier → fichier source → variable CSS

| Tier | Fichier source (extrait) | Variable CSS générée | Sélecteur |
|---|---|---|---|
| Primitif | `tokens/primitive.json` → `color.neutral.500` | `--origam-color__neutral---500` | `:root` |
| Primitif | `tokens/primitive.json` → `space.4` | `--origam-space---4` | `:root` |
| Primitif | `tokens/primitive.json` → `radius.sm` | `--origam-radius---sm` | `:root` |
| Primitif | `tokens/primitive.json` → `shadow.md` | `--origam-shadow---md` | `:root` |
| Primitif | `tokens/primitive.json` → `motion.duration.slow` | `--origam-motion__duration---slow` | `:root` |
| Sémantique light | `tokens/semantic/light.json` → `color.surface.default` | `--origam-color__surface---default` | `:root, [data-theme="light"]` |
| Sémantique light | `tokens/semantic/light.json` → `color.action.primary.bg` | `--origam-color__action--primary---bg` | `:root, [data-theme="light"]` |
| Sémantique dark | `tokens/semantic/dark.json` → `color.surface.default` | `--origam-color__surface---default` | `[data-theme="dark"]` + media |
| Sémantique brand | `tokens/semantic/sobre-light.json` → `color.action.primary.bg` | `--origam-color__action--primary---bg` | `[data-theme="sobre"][data-mode="light"]` |
| Composant (prop) | `tokens/component/btn.json` → `btn.background-color` | `--origam-btn---background-color` | (dans le CSS du thème actif) |
| Composant (variant) | `tokens/component/btn.json` → `btn.primary.background-color` | `--origam-btn--primary---background-color` | (dans le CSS du thème actif) |
| Composant (BEM child) | (pattern card) → `card.overlay.background-color` | `--origam-card__overlay---background-color` | (dans le CSS du thème actif) |
| Composant (BEM child + state) | (pattern card) → `card.overlay.hover.opacity` | `--origam-card__overlay--hover---opacity` | (dans le CSS du thème actif) |
