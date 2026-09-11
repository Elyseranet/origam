# Composants Formulaire — Saisie

## Introduction

Les composants de saisie d'Origam forment une **pyramide de composition** à trois niveaux. Au sommet, `OrigamField` et `OrigamInput` sont les deux briques primitives qui concentrent le rendu visuel (chrome, label flottant, icônes adjacentes, variantes d'outline) et la logique transversale (validation, messages d'erreur, hint, accessibilité). Toutes les spécialisations — `OrigamTextField`, `OrigamTextareaField`, `OrigamNumberField`, `OrigamPasswordField`, `OrigamFileField`, `OrigamOtpInputField`, `OrigamSliderField`, `OrigamRatingField` — sont construites par-dessus ces deux primitives, sans jamais dupliquer leur comportement.

La **chaîne de données** s'organise ainsi :

1. `useVModel` fournit un ref réactif bidirectionnel au niveau de chaque composant feuille (mode contrôlé / non contrôlé transparent).
2. `useValidation` consomme ce model, les props `rules`, `errorMessages`, `validateOn`, et s'enregistre automatiquement auprès du `useForm` parent via `inject(ORIGAM_FORM_KEY)`.
3. `useForm` (employé exclusivement dans `OrigamForm`) orchestre la validation de tous les champs enregistrés, maintient l'état global `isValid`, et expose `validate()`, `reset()`, `resetValidation()` à l'arbre.

---

## `OrigamField`

**Fichier :** `packages/ds/src/components/Field/OrigamField.vue`
**Interface props :** `IFieldProps` — `packages/ds/src/interfaces/Field/field.interface.ts`

### Rôle / utilité

`OrigamField` est le **chrome visuel** d'un champ de formulaire : il gère l'outline (outlined, filled, underlined, solo, plain), le label fixe + label flottant animé, les zones d'icônes prepend/append-inner, le préfixe/suffixe, la clearable icon, le loader (skeleton, linear, circular), et les tokens de taille / densité. Il ne porte pas lui-même la logique de validation ; c'est `OrigamInput` qui en est responsable. En pratique, tous les `*Field` instancient `OrigamInput` en racine et placent `OrigamField` dans le slot `#default` d'`OrigamInput`.

### Entrées (props)

`IFieldProps` étend les interfaces communes suivantes :

| Interface étendue | Propriétés apportées |
|---|---|
| `ICommonsComponentProps` | `id`, `class`, `style` |
| `ILoaderProps` | `loading`, `loaderProps` |
| `IColorProps` | `color` |
| `IBgColorProps` | `bgColor` |
| `IAdjacentInnerProps` | `prependInnerIcon`, `prependInnerAvatar`, `appendInnerIcon`, `appendInnerAvatar`, `clearable`, `clearIcon` |
| `IFocusProps` | `focused` |
| `IDensityProps` | `density` (`default` / `compact`) |
| `ILabelProps` | `label` |
| `IActiveProps` | `active`, `activeColor`, `activeBgColor` |
| `IVariantProps` | `variant` (`outlined` / `filled` / `underlined` / `solo` / `plain`) |
| `IRoundedProps` | `rounded` |
| `IElevationProps` | `elevation` |
| `ISizeProps` | `size` (`small` / `default` / `large` / `x-large`) |

Props propres à `IFieldProps` :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `centerAffix` | `boolean` | `true` | Centre verticalement les icônes prepend/append-inner |
| `dirty` | `boolean` | — | Force l'état "dirty" (label flottant visible même sans valeur) |
| `disabled` | `boolean` | — | Désactive le champ visuellement et aux interactions |
| `error` | `string \| boolean` | — | Peint le modifier `--error` ; si string, le texte est lisible par les consommateurs (ex: dropzone de FileField) |
| `flat` | `boolean` | — | Supprime la box-shadow (utile en variant `solo`) |
| `inline` | `boolean` | — | Mode inline : pas d'outline, padding réduit, fond transparent |
| `prefix` | `string` | — | Texte affiché avant la valeur |
| `suffix` | `string` | — | Texte affiché après la valeur |
| `persistentClear` | `boolean` | — | Affiche l'icône clear même sans focus |
| `reverse` | `boolean` | — | Inverse l'ordre prepend/append |
| `singleLine` | `boolean` | — | Cache le label (ne réserve pas la hauteur du label flottant) |
| `required` | `boolean` | — | Transmis au label (affiche `*`) |

**Défauts `withDefaults` :**
- `variant` : `VARIANT_INPUT.OUTLINED`
- `density` : `DENSITY.DEFAULT`
- `centerAffix` : `true`
- `clearIcon` : `MDI_ICONS.CLOSE_CIRCLE_OUTLINE`

### Sorties

**Emits (`IFieldEmits`) :** `IFocusEmits`, `ICommonsComponentEmits`, `IAdjacentInnerEmits`, `IActiveEmits` — inclut `click:clear`, `click:prepend-inner`, `click:append-inner`, `update:focused`, `update:active`.

**Slots (`IFieldSlots`) :**

| Slot | Scope | Description |
|---|---|---|
| `default` | `{ class, id, aria-describedby, isActive, isFocused, ref, onBlur, onFocus }` | Contenu principal (input natif ou autre) |
| `label` | `ILabelProps` | Remplace le `<OrigamLabel>` statique |
| `floatingLabel` | `ILabelProps` | Remplace le `<OrigamLabel>` flottant (dans l'outline notch) |
| `prefix` | — | Remplace le texte de préfixe |
| `suffix` | — | Remplace le texte de suffixe |
| `prependInner` | — | Remplace la zone icône/avatar prepend-inner |
| `appendInner` | — | Remplace la zone icône/avatar append-inner |
| `clear` | — | Remplace l'icône de clear |
| `loader` | — | Remplace la barre de progression |

**Classes CSS BEM émises :**
- `.origam-field` (racine)
- `--active`, `--focused`, `--dirty`, `--disabled`, `--error`, `--flat`, `--inline`, `--prepended`, `--appended`, `--center-affix`, `--reverse`, `--single-line`, `--no-label`, `--persistent-clear`, `--has-background`
- `--variant-outlined`, `--variant-filled`, `--variant-underlined`, `--variant-solo`, `--variant-plain`
- `--size-small`, `--size-default`, `--size-large`, `--size-x-large`
- `--rounded-shaped`, `--rounded-shaped-invert`

**expose :** `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`, `styleId`

### Dépendances

**Composables :** `useAdjacentInner`, `useActive`, `useFocus`, `useBothColor`, `useDensity`, `useLoader`, `useStateEffect`, `useRtl`, `useVariant`, `useSize`, `useProps`, `useStyle`, `useDefaults`

**Composants internes :** `OrigamAvatar`, `OrigamExpandX`, `OrigamIcon`, `OrigamLabel`, `OrigamProgress`, `OrigamSkeleton`

**Enums :** `DENSITY`, `EASING`, `KEYBOARD_VALUES`, `MDI_ICONS`, `PROGRESS_TYPE`, `VARIANT_INPUT`

**Utils :** `animate`, `convertToUnit`, `getUid`, `nullifyTransforms`

### Comportement notable

**Animation du label flottant :** quand `isActive` change (focus, présence de valeur, prefix/suffix), un watcher `post-flush` calcule la transformation pixel-perfect entre la position du label statique (`origamLabelRef`) et la position cible du label flottant (`origamFloatingLabelRef`) via `nullifyTransforms` + `Web Animations API` (fonction `animate`). L'opération se fait entièrement en JS car elle dépend de la position réelle du DOM.

**Protection des props `border` / `rounded` sur les labels :** le composant force explicitement `border: false` et `rounded: false` sur les props transmises à `<OrigamLabel>`, qu'il s'agisse du label statique ou flottant. Ceci évite que les variantes par défaut de FileField (qui déclare `border: true, rounded: true`) fassent apparaître un contour autour du texte du label.

**`isActive` composite :** l'état actif combine `props.dirty || active.value || hasPrefix.value || hasSuffix.value`. La présence d'un préfixe ou suffixe force le label à flotter même sans valeur.

**A11y :** le slot `default` injecte automatiquement `id` et `aria-describedby` (pointant sur l'id des messages d'`OrigamInput`) dans les props du slot. Le label est associé via `for` / `id` synchronisés. Le modifier `--error` déclenche la couleur danger sur le label et les icônes via des tokens CSS.

**SSR :** pas de lecture du DOM dans le setup ; la lecture de `getBoundingClientRect` est dans un `requestAnimationFrame` déclenché par un watcher `{flush: 'post'}`, donc sûre côté SSR.

### Exemple d'usage

```vue
<origam-field
  label="Email"
  variant="outlined"
  :dirty="!!email"
  prepend-inner-icon="mdi:email"
  clearable
>
  <template #default="{ id, onFocus, onBlur, class: cls }">
    <input
      :id="id"
      :class="cls"
      type="email"
      v-model="email"
      @focus="onFocus"
      @blur="onBlur"
    />
  </template>
</origam-field>
```

---

## `OrigamInput`

**Fichier :** `packages/ds/src/components/Input/OrigamInput.vue`
**Interface props :** `IInputProps` — `packages/ds/src/interfaces/Input/input.interface.ts`

### Rôle / utilité

`OrigamInput` est la **couche validation et layout** d'un champ de formulaire. Il porte : la logique de validation via `useValidation` (enregistrement auprès du formulaire parent, évaluation des `rules`, agrégation des `errorMessages`), l'affichage des messages (`OrigamMessages`), les zones externes prepend/append (via `useAdjacent`), la densité, les dimensions, et la grille CSS `horizontal` / `vertical`. Il est la racine de tous les `*Field`.

### Entrées (props)

`IInputProps` étend :

| Interface étendue | Propriétés apportées |
|---|---|
| `ICommonsComponentProps` | `id`, `class`, `style` |
| `IDensityProps` | `density` |
| `IPaddingProps`, `IMarginProps` | espacement externe |
| `IRoundedProps`, `IBorderProps`, `IElevationProps` | décoration visuelle |
| `IColorProps`, `IBgColorProps` | couleur |
| `IDimensionProps` | `width`, `height`, `maxWidth`, `maxHeight`, `minWidth`, `minHeight` |
| `IDirectionProps` | `direction` (`horizontal` / `vertical`) |
| `IValidationProps` | `rules`, `errorMessages`, `validateOn`, `maxErrors`, `validationValue`, `error`, `disabled`, `readonly`, `name` |
| `IAdjacentProps` | `prependIcon`, `prependAvatar`, `appendIcon`, `appendAvatar` |
| `ISizeProps` | `size` |

Props propres à `IInputProps` :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `centerAffix` | `boolean` | `true` | Centre les icônes prepend/append |
| `hideDetails` | `boolean \| 'auto'` | — | Masque la zone messages (`'auto'` : masquée si aucun message) |
| `hideSpinButtons` | `boolean` | — | Masque les spin buttons natifs des inputs `number` |
| `hint` | `string` | — | Texte d'aide affiché à la place des erreurs tant qu'on ne touche pas le champ |
| `persistentHint` | `boolean` | — | Affiche le hint même sans focus |
| `messages` | `Array<string> \| string` | — | Messages statiques à afficher dans la zone details |

**Défauts `withDefaults` :**
- `direction` : `DIRECTION.HORIZONTAL`
- `centerAffix` : `true`
- `density` : `DENSITY.DEFAULT`

### Sorties

**Emits (`IInputEmits`) :** `ICommonsComponentEmits`, `IAdjacentEmits`, `IFocusEmits` — inclut `click:prepend`, `click:append`, `update:focused`.

**Slots (`IInputSlots`) :**

| Slot | Scope | Description |
|---|---|---|
| `default` | `{ id, isDisabled, isDirty, isValid, isReadonly }` | Zone de contrôle (accueil du `<OrigamField>`) |
| `prepend` | — | Remplace l'icône/avatar externe gauche |
| `append` | — | Remplace l'icône/avatar externe droite |
| `messages` | `{ hasMessages, messages }` | Remplace l'`<OrigamMessages>` |
| `message` | `{ message }` | Template pour un message individuel |
| `details` | props de l'input | Zone de détails supplémentaires (counter, etc.) |

**Classes CSS BEM :**
- `.origam-input` (racine)
- `--horizontal`, `--vertical`
- `--center-affix`, `--hide-spin-buttons`
- `--disabled`, `--error`, `--dirty`
- `--density-default`, `--density-compact`
- `--size-small`, `--size-default`, `--size-large`, `--size-x-large`

**expose :** `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`, `styleId`

### Dépendances

**Composables :** `useAdjacent`, `useBothColor`, `useDensity`, `useDimension`, `useRtl`, `useSize`, `useValidation`, `useProps`, `useStyle`, `useDefaults`

**Composants internes :** `OrigamAvatar`, `OrigamIcon`, `OrigamMessages`

**Utils :** `getUid`, `wrapInArray`

### Comportement notable

**Priorité des messages :** la computed `messages` applique l'ordre de priorité : `props.errorMessages` (ou les erreurs de rules non pristine) > `props.hint` (si `persistentHint` ou focus) > `props.messages`. La zone `details` est visible si `hideDetails !== true`, ou si `hideDetails === 'auto'` et qu'il y a des messages ou un slot `details`.

**`useValidation` :** s'injecte automatiquement dans le formulaire parent via `inject(ORIGAM_FORM_KEY)`. Le champ s'enregistre sur `onBeforeMount` et se désenregistre sur `onBeforeUnmount`. Il expose `validate()`, `reset()`, `resetValidation()` dans le `inputProps` passé au slot.

**A11y :** `messagesId` est généré et passé au slot pour que chaque input natif puisse poser `aria-describedby`. Les icônes prepend/append ont `opacity: 0.7` par défaut, passent à `1` en état `--error` et `--disabled`.

### Exemple d'usage

```vue
<origam-input :rules="[v => !!v || 'Requis']" hint="Format: prenom.nom">
  <template #default="{ id, isDisabled, isReadonly }">
    <origam-field label="Nom">
      <template #default="{ class: cls, onFocus, onBlur }">
        <input :id="id" :class="cls" :disabled="isDisabled" :readonly="isReadonly"
               @focus="onFocus" @blur="onBlur" />
      </template>
    </origam-field>
  </template>
</origam-input>
```

---

## `OrigamTextField`

**Fichier :** `packages/ds/src/components/TextField/OrigamTextField.vue`
**Interface props :** `ITextFieldProps` — `packages/ds/src/interfaces/TextField/text-field.interface.ts`

### Rôle / utilité

`OrigamTextField` est le champ texte universel. Il compose `OrigamInput` (racine) + `OrigamField` (chrome) + `<input>` natif. Il ajoute la gestion du compteur de caractères, le masquage de saisie (`mask`), l'autofocus via `IntersectionObserver`, et transmet les types d'input HTML.

### Entrées (props)

`ITextFieldProps` étend `ICommonsComponentProps`, `IColorProps`, `IDensityProps`, `IFieldProps`, `IInputProps`, `IPaddingProps`, `IMarginProps`, `IBorderProps`, `IRoundedProps`, `IElevationProps`.

Props propres :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `type` | `TTextFieldType` | `TEXT_FIELD_TYPE.TEXT` | Type HTML de l'input (`text`, `email`, `tel`, `url`, `search`, …) |
| `autofocus` | `boolean` | — | Focus au premier scroll-into-view (via `IntersectionObserver`) |
| `counter` | `boolean \| number \| string` | — | Active le compteur de caractères ; si number, crée aussi une règle max |
| `counterValue` | `number \| Function` | — | Valeur personnalisée du compteur |
| `placeholder` | `string` | — | Placeholder HTML |
| `persistentPlaceholder` | `boolean` | — | Affiche le placeholder même quand le label est en position haute |
| `persistentCounter` | `boolean` | — | Affiche le compteur même sans focus |
| `role` | `string` | — | ARIA role transmis au Field |
| `modelModifiers` | `string \| boolean` | — | Modificateurs de modèle (ex: `trim`, `lazy`) |
| `mask` | `TMask` | — | Masque de saisie : preset (`'phone:fr'`), pattern brut (`'##/##/####'`), ou objet de config |

**Défauts `withDefaults` :**
- `type` : `TEXT_FIELD_TYPE.TEXT`
- `clearIcon` : `MDI_ICONS.CLOSE_CIRCLE_OUTLINE`
- `rounded` : `true`

### Sorties

**v-model :** `modelValue` (type `string | null`) — géré par `useVModel`.

**Emits (`ITextFieldEmits`) :** `IFieldEmits`, `IInputEmits` + :
- `click:control` — clic sur la zone du champ
- `mousedown:control` — mousedown sur la zone
- `valid` (boolean) — validité du masque à chaque frappe (quand `mask` actif)
- `complete` (`{ complete: boolean, unmasked: string }`) — masque entièrement rempli

**Slots (`ITextFieldSlots`) :** hérite de `IFieldSlots` et `IInputSlots` (sans `default`) + :
- `counter` — `{ counter, max, value }` : rendu personnalisé du compteur
- `field` — `{ id, isDisabled, isDirty, isValid, isReadonly }` : remplace l'`OrigamField` entier

**expose :** `filterProps` + membres d'`OrigamInput`, `OrigamField`, et l'`<input>` natif (via `forwardRefs`)

### Dépendances

**Composables :** `useAdjacent`, `useAdjacentInner`, `useFocus`, `useLocale`, `useMask`, `useVModel`, `useProps`, `useStyle`, `useDefaults`

**Composants internes :** `OrigamCounter`, `OrigamField`, `OrigamInput`

**Consts :** `ACTIVE_TEXT_FIELD_TYPE`, `INPUT_TEXT_FIELD_TYPE`

**Enums :** `TEXT_FIELD_TYPE`, `MDI_ICONS`, `DENSITY`, `DIRECTION`

**Directive :** `vIntersect` (autofocus lazy)

**Utils :** `applyMask`, `filterInputAttrs`, `forwardRefs`, `resolveMaskConfig`

### Comportement notable

**Masque de saisie :** quand `mask` est positionné, `useMask` maintient deux refs : `maskedValue` (affiché dans le DOM) et `unmaskedValue` (stocké dans le v-model). À chaque `@input`, `applyMask` reformate la valeur brute et réaligne le curseur via `setSelectionRange`. Un coller (`@paste`) reconstruit la valeur en concaténant l'unmasked courant et le texte collé. Une règle de validation est automatiquement ajoutée à `enrichedRules` pour que `OrigamInput` surface l'état d'erreur sans que le consommateur n'ait à écrire de règle.

**Type résolu :** si un masque téléphonique est détecté (pattern `phone:*` ou séquence de chiffres/tirets), l'input passe en `type="tel"` pour déclencher le clavier numérique mobile.

**Compteur :** si `counter` est un nombre, une règle `v.length <= counter` est injectée dans `enrichedRules`. La logique de priorité `attrs.maxlength > props.counter` est respectée pour le `max` de `OrigamCounter`.

**Autofocus :** l'`IntersectionObserver` (via `vIntersect`) déclenche le focus sur la première intersection avec `{ once: true }`, donc sans boucle infinie.

**`isActive` :** combinaison de `ACTIVE_TEXT_FIELD_TYPE.includes(props.type) || persistentPlaceholder || isFocused || props.active`. Les types comme `date`, `time`, `color` sont toujours "actifs" (label toujours flottant).

**A11y :** `aria-required` est positionné si `required`. `aria-invalid` est positionné côté masque seulement quand le champ n'est pas vierge (`!isFocused && !model.value` → pas d'invalidité affichée sur un champ vide non touché).

### Exemple d'usage

```vue
<origam-text-field
  v-model="phone"
  label="Téléphone"
  mask="phone:fr"
  :counter="14"
  @complete="onPhoneComplete"
/>
```

---

## `OrigamTextareaField`

**Fichier :** `packages/ds/src/components/TextareaField/OrigamTextareaField.vue`
**Interface props :** `ITextareaFieldProps` — `packages/ds/src/interfaces/TextareaField/textarea-field.interface.ts`

### Rôle / utilité

Champ de saisie multi-lignes. Compose `OrigamInput` + `OrigamField` + `<textarea>` natif en mode `plain`, ou un `contenteditable` + `OrigamRichToolbar` en mode `rich`. Supporte l'auto-grow (hauteur dynamique par `ResizeObserver`), le redimensionnement manuel par drag, et la sortie en HTML ou Markdown.

### Entrées (props)

`ITextareaFieldProps` étend `IFieldProps`, `IInputProps`, et les interfaces de décoration communes.

Props propres :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `rows` | `number \| string` | `3` | Nombre de lignes initiales |
| `maxRows` | `number \| string` | — | Nombre maximum de lignes en autoGrow |
| `autoGrow` | `boolean` | — | Hauteur calculée automatiquement selon le contenu |
| `noResize` | `boolean` | — | Désactive le grip de redimensionnement manuel |
| `counter` | `boolean \| number \| string` | — | Compteur de caractères |
| `counterValue` | `number \| Function` | — | Valeur personnalisée du compteur |
| `placeholder` | `string` | — | Placeholder |
| `persistentPlaceholder` | `boolean` | — | Placeholder visible même avec label haut |
| `persistentCounter` | `boolean` | — | Compteur visible sans focus |
| `persistentClear` | `boolean` | — | Clear icon visible sans focus |
| `prefix`, `suffix` | `string` | — | Texte avant/après |
| `modelModifiers` | `string \| boolean` | — | Modificateurs (`trim`, etc.) |
| `mode` | `TTextareaMode` | `TEXTAREA_MODE.PLAIN` | `'plain'` ou `'rich'` |
| `output` | `TTextareaOutput` | `TEXTAREA_OUTPUT.HTML` | Format émis en mode rich : `'html'` ou `'markdown'` |
| `toolbar` | `ReadonlyArray<TTextareaToolbarCommand> \| false` | `DEFAULT_TOOLBAR` | Commandes toolbar en mode rich |
| `toolbarPosition` | `TTextareaToolbarPosition` | `TEXTAREA_TOOLBAR_POSITION.TOP` | `'top'` ou `'bottom'` |

**Défauts `withDefaults` :**
- `density` : `DENSITY.DEFAULT`
- `clearIcon` : `MDI_ICONS.CLOSE_CIRCLE_OUTLINE`
- `rounded` : `true`
- `rows` : `3`
- `mode` : `TEXTAREA_MODE.PLAIN`
- `output` : `TEXTAREA_OUTPUT.HTML`
- `toolbarPosition` : `TEXTAREA_TOOLBAR_POSITION.TOP`

### Sorties

**v-model :** `modelValue` (type `string`) — `useVModel`.

**Emits (`ITextareaFieldEmits`) :** `IFieldEmits`, `IInputEmits` + :
- `update:height` (number) — hauteur mise à jour en autoGrow
- `click:control`, `mousedown:control`
- `format` (`command, value?`) — commande rich-text appliquée

**Slots (`ITextareaFieldSlots`) :** hérite de `IFieldSlots`, `IInputSlots` (sans `default`) + :
- `counter` — `{ counter, max, value }`
- `field` — override complet du Field
- `toolbar` — `ITextareaToolbarSlotProps` : remplace toute la toolbar rich
- `toolbar-item` — `{ command, label, icon, isActive, onClick }` : remplace un bouton

**expose :** `filterProps` + membres d'`OrigamField`, `OrigamInput`, `<textarea>` (via `forwardRefs`)

### Dépendances

**Composables :** `useAdjacent`, `useAdjacentInner`, `useDragResizer`, `useFocus`, `useLocale`, `useTextareaRich`, `useVModel`, `useProps`, `useStyle`, `useDefaults`

**Composants internes :** `OrigamCounter`, `OrigamField`, `OrigamInput`, `OrigamRichToolbar`

**Consts :** `DEFAULT_TOOLBAR`

**Enums :** `AXIS`, `DENSITY`, `MDI_ICONS`, `TEXTAREA_MODE`, `TEXTAREA_OUTPUT`, `TEXTAREA_TOOLBAR_POSITION`

**Utils :** `clamp`, `convertToUnit`, `filterInputAttrs`, `forwardRefs`, `htmlToMarkdown`, `sanitizeHtml`

**Directive :** `vIntersect` (autofocus lazy)

### Comportement notable

**AutoGrow :** un `ResizeObserver` surveille le `<textarea>`. À chaque mutation du model, `calculateInputHeight` réinitialise la hauteur de l'élément à `0`, lit `scrollHeight`, et applique `clamp(scrollHeight + padding, minHeight, maxHeight)`. La hauteur est stockée dans `controlHeight` et injectée via `--origam-textarea-field__control---height` en style inline sur le `<OrigamField>`.

**Drag resize :** une poignée SVG (`.origam-textarea-field__grip`) est rendue si `!autoGrow && !noResize && !isRichMode`. Elle délègue à `useDragResizer` sur l'axe Y, qui met à jour `controlHeight` dans les limites `minHeight..maxHeight`.

**Mode riche :** `useTextareaRich` gère le `contenteditable`, les commandes de formatage (Selection + manipulation DOM, sans `execCommand`), la désinfection HTML (`sanitizeHtml`), et la conversion Markdown (`htmlToMarkdown`). La synchronisation modèle vers DOM est protégée par un flag `isApplyingExternal` pour éviter les boucles.

**`isUniqueRow` :** quand `rows === 1`, `centerAffix` est activé sur le Field pour centrer verticalement les icônes.

**A11y :** mode riche : `role="textbox"`, `aria-multiline="true"`, `aria-disabled`, `aria-readonly`, `aria-label` sur le `contenteditable`. `data-empty` déclenche le pseudo-placeholder CSS (`:before { content: attr(data-placeholder) }`).

### Exemple d'usage

```vue
<origam-textarea-field
  v-model="content"
  label="Description"
  mode="rich"
  output="html"
  :auto-grow="true"
  :max-rows="20"
  :counter="2000"
/>
```

---

## `OrigamNumberField`

**Fichier :** `packages/ds/src/components/NumberField/OrigamNumberField.vue`
**Interface props :** `INumberFieldProps` — `packages/ds/src/interfaces/NumberField/number-field.interface.ts`

### Rôle / utilité

Champ numérique avec boutons d'incrément/décrément, validation des bornes, format décimal, et deux modes d'interface : `standard` (sur `OrigamTextField`) et `compact` (sur `OrigamInput` inline avec trois éléments : bouton −, input, bouton +).

### Entrées (props)

`INumberFieldProps` étend `IFieldProps`, `IInputProps`, `IVariantProps`.

Props propres :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `number \| null` | `null` | Valeur numérique courante |
| `min` | `number` | `Number.MIN_SAFE_INTEGER` | Borne inférieure |
| `max` | `number` | `Number.MAX_SAFE_INTEGER` | Borne supérieure |
| `step` | `number` | `1` | Pas d'incrément |
| `precision` | `number` | `0` | Nombre de décimales affichées |
| `incrementIcon` | `TIcon` | `MDI_ICONS.PLUS` | Icône bouton + |
| `decrementIcon` | `TIcon` | `MDI_ICONS.MINUS` | Icône bouton − |
| `holdDelay` | `number` | `500` | Délai (ms) avant répétition en long-press |
| `holdRepeat` | `number` | `50` | Intervalle (ms) de répétition |
| `split` | `boolean` | `false` | Bouton + à gauche, − à droite (input centré) |
| `hideControls` | `boolean` | — | Masque les boutons +/− |
| `hideInput` | `boolean` | — | Masque l'input (affiche seulement les contrôles) |
| `inset` | `boolean` | — | Style inset (diviseurs à 55% de hauteur) |
| `compact` | `boolean` | `false` | Mode compact inline (bouton − / input / bouton +) |

### Sorties

**v-model :** `modelValue` (type `number | null`) — géré par `useVModel` avec `transformOut` qui applique `clamp(Number(val), min, max)`.

**Emits (`INumberFieldEmits`) :** `IFieldEmits`, `IInputEmits` + :
- `click:control`, `mousedown:control`, `click:clear`
- `increment` (number | null) — après chaque incrément
- `decrement` (number | null) — après chaque décrément

**Slots (`INumberFieldSlots`) :** hérite de `IFieldSlots`, `IInputSlots` (sans `default`) + :
- `field`, `increment` (`{ canIncrease, onControlClick, onUpControlMousedown, onControlMouseup }`), `decrement` (symétrique)

### Dépendances

**Composables :** `useAdjacentInner`, `useFocus`, `useHold`, `useVModel`, `useProps`, `useStyle`

**Composants internes :** `OrigamBtn`, `OrigamDivider`, `OrigamInput`, `OrigamTextField`

**Utils :** `clamp`, `forwardRefs`

### Comportement notable

**Dual-mode de rendu :** si `compact === true`, le composant rend un `OrigamInput` simple avec un `<div role="group">` inline. Sinon, il rend un `OrigamTextField` avec les boutons dans les slots `prependInner`/`appendInner`.

**Long-press :** `useHold` reçoit `{ toggleUpDown }` et les params `holdDelay`/`holdRepeat`. Sur `pointerdown`, il démarre un `setInterval` qui répète `toggleUpDown` jusqu'au `pointerup`, avec capture du pointer pour ne pas perdre l'événement en dehors du bouton.

**Buffer de saisie :** `_inputText` (shallowRef) découple la chaîne affichée du model numérique. À `handleBlur`, `clampModel()` convertit la chaîne en nombre et la serre entre `min` et `max`. À `handleFocus`, `trimDecimalZeros()` supprime les zéros de fin pour une expérience d'édition propre.

**Validation `beforeinput` :** le handler `handleBeforeInput` teste `potentialNewInputVal` contre `/^-?(\d+(\.\d*)?|(\.\d+)|\d*|\.)$/` et empêche la saisie de tout caractère non numérique. Si `precision === 0`, le séparateur décimal est également bloqué.

**A11y :** mode compact : `role="group"` avec `aria-label` sur le conteneur ; boutons +/− ont `aria-label="Increment"` / `aria-label="Decrement"` et `tabindex="-1"` sur les boutons de contrôle standard (ils ne sont pas dans la tabulation).

**Note critique :** `useForm` ne doit **jamais** être appelé dans un champ individuel — il est réservé à `OrigamForm`. L'appeler dans un champ monterait une `provide(ORIGAM_FORM_KEY)` parasite et écraserait le v-model avec des booléens.

### Exemple d'usage

```vue
<origam-number-field
  v-model="quantity"
  label="Quantité"
  :min="1"
  :max="100"
  :step="5"
  :precision="0"
  split
/>
```

---

## `OrigamPasswordField`

**Fichier :** `packages/ds/src/components/PasswordField/OrigamPasswordField.vue`
**Interface props :** `IPasswordFieldProps` — `packages/ds/src/interfaces/PasswordField/password-field.interface.ts`

### Rôle / utilité

`OrigamTextField` spécialisé pour la saisie de mot de passe. Ajoute : toggle show/hide (icône dans `appendInner`), barre de force en 4 segments, checklist de critères inline, popup de requirements (legacy), et injection automatique de règles de validation correspondant aux critères activés.

### Entrées (props)

`IPasswordFieldProps` étend `ITextFieldProps`.

Props propres :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `onIcon` | `TIcon` | `MDI_ICONS.EYE_OUTLINE` | Icône "afficher" |
| `offIcon` | `TIcon` | `MDI_ICONS.EYE_OFF` | Icône "masquer" |
| `maxlength` | `number` | — | Attribut `maxlength` natif |
| `requirements` | `boolean` | — | Active le popup de requirements (legacy) |
| `persistentRequirements` | `boolean` | — | Popup toujours ouvert |
| `minLength` | `number` | `8` | Longueur minimale (règle auto-injectée) |
| `needTiny` | `boolean` | — | Requiert une minuscule |
| `needUppercase` | `boolean` | — | Requiert une majuscule |
| `needNumber` | `boolean` | — | Requiert un chiffre |
| `needSpecial` | `boolean` | — | Requiert un caractère spécial |
| `menuProps` | `IMenuProps` | voir code | Props de l'`OrigamMenu` du popup |
| `menu` | `boolean` | — | Toggle programmatique du menu |
| `strengthBar` | `boolean` | — | Affiche la barre de force 4 segments |
| `requirementRules` | `IPasswordRequirement[]` | — | Checklist inline moderne (predicates) |
| `requirementsLayout` | `'list' \| 'tiles'` | — | Layout de la checklist |
| `minimal` | `boolean` | — | Supprime toggle, barre et checklist |

**Défauts `withDefaults` :**
- `minLength` : `8`
- `eager` : `true`
- `offIcon` : `MDI_ICONS.EYE_OFF`
- `onIcon` : `MDI_ICONS.EYE_OUTLINE`
- `menuProps` : objet avec `closeDelay: 250`, `location: 'bottom left'`, etc.
- `rounded` : `true`

### Sorties

**v-model :** `modelValue` (string).
**v-model:strength** : `TPasswordStrengthLevel` (`'weak' | 'fair' | 'good' | 'strong'`).

**Emits (`IPasswordFieldEmits`) :** `IFieldEmits`, `IInputEmits` + `click:control`, `mousedown:control`, `update:strength`.

**Slots (`IPasswordFieldSlots`) :** hérite de `IFieldSlots`, `IInputSlots` (sans `default`) + :
- `info` — `{ [key: string]: any }` : corps du popup de requirements
- `counter` — `{ counter, max, value }`
- `field` — override du Field
- `appendInner` — `{ icon }` : remplace l'icône du toggle

### Dépendances

**Composables :** `computeStrength`, `useAdjacent`, `useAdjacentInner`, `useFocus`, `useLocale`, `useVModel`, `useProps`, `useStyle`, `useDefaults`

**Composants internes :** `OrigamChip`, `OrigamCol`, `OrigamCounter`, `OrigamField`, `OrigamIcon`, `OrigamInput`, `OrigamMenu`, `OrigamRow`, `OrigamSheet`

**Consts :** `DEFAULT_PASSWORD_REQUIREMENTS`, `REQUIREMENT_MIN_LENGTH`, `REQUIREMENT_NUMBER`, `REQUIREMENT_SPECIAL`, `REQUIREMENT_TINY`, `REQUIREMENT_UPPERCASE`

**Enums :** `MDI_ICONS`, `TEXT_FIELD_TYPE`

**Utils :** `filterInputAttrs`, `forwardRefs`

### Comportement notable

**Toggle show/hide :** `show` (ref booléen) permute `currentType` entre `text` et `password`. L'icône est affichée dans `appendInner` via un slot dédié avec `@mousedown` (pas `@click`) pour éviter de perdre le focus sur l'input.

**Injection automatique de règles :** `enrichedRules` construit le tableau de règles en parcourant les `infos` (map des critères actifs). Chaque critère possède un champ `reg` (RegExp) et `message` (i18n). Si la regex ne passe pas, la règle retourne `t('origam.validation.must_contains', { value: info.message })`. Cela permet à l'`OrigamInput` sous-jacent de gérer l'état d'erreur standard.

**Deux modes d'affichage des critères :**
1. **Popup (legacy)** — `requirements: true` → `OrigamMenu` s'ouvre sur focus. Le slot `#info` montre une grille de `OrigamSheet` avec coche/croix par critère.
2. **Inline (moderne)** — `requirementRules` (array de `IPasswordRequirement`) ou `requirements + requirementsLayout` → liste `<ul>` ou `<OrigamChip>` sous l'input dans la zone `details`.

**Barre de force :** 4 `<span>` colorés par data-attribut `data-strength-level` + `data-strength-score`. Les couleurs sont des tokens CSS (`--origam-password-field__strength---bg-{level}`). `computeStrength` retourne `{ level, score }`.

**`minimal` :** désactive le toggle appendInner, la barre et la checklist. Utile pour le champ "confirmer le mot de passe".

**A11y :** le menu de requirements a `aria-haspopup="listbox"` sur l'activateur. La checklist `<ul>` est sémantique ; les chips portent `data-satisfied` et `data-requirement-id` pour les tests.

### Exemple d'usage

```vue
<origam-password-field
  v-model="password"
  v-model:strength="passwordStrength"
  label="Mot de passe"
  :min-length="12"
  :need-uppercase="true"
  :need-number="true"
  :strength-bar="true"
  :requirement-rules="customRules"
  requirements-layout="list"
/>
```

---

## `OrigamOtpInputField`

**Fichier :** `packages/ds/src/components/OtpInputField/OrigamOtpInputField.vue`
**Interface props :** `IOtpInputFieldProps` — `packages/ds/src/interfaces/OtpInputField/otp-input-field.interface.ts`

### Rôle / utilité

Champ OTP (One-Time Password) composé de `length` cellules individuelles. Chaque cellule est un `OrigamField` encapsulant un `<input>` natif. La navigation clavier (flèches, backspace, delete) et le collage sont gérés manuellement pour un UX optimal.

### Entrées (props)

`IOtpInputFieldProps` étend `IFieldProps`, `IInputProps`, `IVariantProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `number \| string \| null` | — | Valeur OTP jointe |
| `length` | `number \| string` | `6` | Nombre de cellules |
| `type` | `TOtpInputFieldType` | `OTP_INPUT_FIELD_TYPE.NUMBER` | `'number'` ou `'text'` |
| `autofocus` | `boolean` | — | Focus sur la première cellule au montage |
| `divider` | `string` | — | Séparateur entre cellules (ex: `'-'`) |
| `focusAll` | `boolean` | — | Toutes les cellules sont "focused" simultanément |
| `placeholder` | `string` | — | Placeholder de chaque cellule |
| `loading` | `boolean \| string` | — | Superpose un `OrigamProgress` circulaire |

### Sorties

**v-model :** `modelValue` (string) — `useVModel` avec `transformIn: val → val.split('')` et `transformOut: arr → arr.join('')`. Le model interne est un tableau de caractères.

**Emits (`IOtpInputFieldEmits`) :** `IFieldEmits`, `IInputEmits` + `finish(value: string)` — déclenché quand toutes les cellules sont remplies.

**Slots :** hérite de `IFieldSlots` et `IInputSlots` (sans `default`) + `field`.

**expose :** `blur()`, `focus()`, `reset()`, `resetValidation()`, `validate()`, `isValid`, `isValidating`, `errorMessages`, `isFocused`, `filterProps` + style helpers

### Dépendances

**Composables :** `useDimension`, `useFocus`, `useLocale`, `useValidation`, `useVModel`, `useProps`, `useStyle`

**Composants internes :** `OrigamField`, `OrigamOverlay`, `OrigamProgress`, `OrigamMessages`

**Utils :** `filterInputAttrs`, `focusChild`, `forwardRefs`, `getUid`, `wrapInArray`

### Comportement notable

**Validation sur `useValidation` via Proxy :** un `Proxy` sur `props` intercepte les accès à `modelValue` et `validationValue` pour retourner la valeur OTP jointe (`otpStringValue`). Cela permet d'appliquer les `rules` du consommateur sur la chaîne complète sans doublon du `useVModel`.

**Navigation :** `handleKeydown` gère `ArrowLeft` / `ArrowRight` (focus prev/next), `Backspace` (efface cellule courante + focus prev), `Delete` (efface cellule courante). La fonction utilitaire `focusChild(contentRef, 'next' | 'prev' | number)` pilote le focus dans l'arbre DOM.

**Collage :** `handlePaste` appelle `e.clipboardData.getData('Text').slice(0, length)`, valide (pas de non-numérique en mode `number`), puis distribue les caractères dans le model tableau.

**Validation déclenchée automatiquement :** un `watch` sur `model` appelle `validate()` quand `val.length === length.value`.

**Input masqué :** un `<input type="hidden">` porte la valeur jointe pour la soumission HTML classique des formulaires.

**A11y :** chaque cellule porte `aria-label` via `t('origam.input.otp', i + 1)` (ex: "OTP digit 1"). `autocomplete="one-time-code"` est positionné sur chaque input pour le remplissage automatique OTP sur mobile.

### Exemple d'usage

```vue
<origam-otp-input-field
  v-model="otp"
  :length="6"
  type="number"
  divider="-"
  :rules="[v => v.length === 6 || 'Code incomplet']"
  @finish="verifyOtp"
/>
```

---

## `OrigamFileField`

**Fichier :** `packages/ds/src/components/FileField/OrigamFileField.vue`
**Interface props :** `IFileFieldProps` — `packages/ds/src/interfaces/FileField/file-field.interface.ts`

### Rôle / utilité

Champ de sélection de fichier(s). Deux modes visuels : mode **inline** (OrigamField classique avec `<input type="file">` caché) et mode **dropzone** (grande zone `<label>` acceptant le drag-and-drop). Gère la sélection multiple, la progression de téléversement, l'affichage des fichiers sélectionnés (list, chips, counter) et la validation de taille maximale.

### Entrées (props)

`IFileFieldProps` étend `ICommonsComponentProps`, `IColorProps`, `IDensityProps`, `IFieldProps`, `IInputProps`, `IPaddingProps`, `IMarginProps`, `IBorderProps`, `IRoundedProps`, `IElevationProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `TFile` | — | `File \| File[] \| null` |
| `multiple` | `boolean` | — | Sélection multiple |
| `chips` | `boolean` | — | (legacy) force `display='chips'` |
| `display` | `TFileFieldDisplay` | `'list'` | `'list' \| 'chips' \| 'counter'` |
| `counter` | `boolean` | — | Active le compteur de fichiers |
| `showSize` | `TFileSize` | `false` | Affiche la taille (`true`/`'B'`/`'KB'`/etc.) |
| `maxFileSize` | `number` | — | Taille maximale par fichier (bytes) |
| `divider` | `string` | `','` | Séparateur entre noms de fichiers (mode inline) |
| `dragndrop` | `boolean` | — | (legacy) équivalent de `dropzone` |
| `dropzone` | `boolean` | — | Mode dropzone |
| `dragndropIcon` | `string` | `MDI_ICONS.CLOUD_UPLOAD_OUTLINE` | Icône du dropzone vide |
| `fileIcon` | `string` | `MDI_ICONS.FILE` | Icône de fichier |
| `removeIcon` | `string` | `MDI_ICONS.CLOSE` | Icône suppression |
| `downloadIcon` | `string` | `MDI_ICONS.DOWNLOAD` | Icône téléchargement |
| `downloadable` | `boolean` | — | Affiche le bouton de téléchargement |
| `progress` | `Array<number>` | — | Progression (0-100) par index de fichier |
| `dropzoneTitle`, `dropzoneSubtitle`, `browseText` | `string` | clés i18n | Textes du dropzone |
| `chipProps` | `IChipProps` | — | Props des chips en mode `'chips'` |
| `prependInnerIcon` | `string` | `MDI_ICONS.PAPERCLIP` | Icône trombones (inline) |

**Défauts `withDefaults` :** `clearable: true`, `border: true`, `rounded: true`, `density: DENSITY.DEFAULT`.

### Sorties

**v-model :** `modelValue` (`File | File[] | null`).

**Emits (`IFileFieldEmits`) :** `IFieldEmits`, `IInputEmits` + :
- `click:control`, `mousedown:control`
- `click:remove` — `{ file, index }`
- `click:download` — `{ file, index }`
- `drop` — `{ files, event }`
- `error:max-size` — `{ files, maxFileSize, message }`

**Slots (`IFileFieldSlots`) :** hérite de `IFieldSlots`, `IInputSlots` (sans `default`) + :
- `field` — override du Field
- `dropzone` — `{ isDragging, browse }` : corps du dropzone quand vide
- `item` — `{ file, index, progress, remove, download }` : chaque fichier sélectionné
- `chip` — `{ fileNames, totalBytes, totalBytesReadable, props }` : chip custom
- `selection` — texte de sélection

### Dépendances

**Composables :** `useAdjacent`, `useAdjacentInner`, `useBothColor`, `useDensity`, `useFocus`, `useLocale`, `useVModel`, `useProps`, `useStyle`, `useDefaults`

**Composants internes :** `OrigamChip`, `OrigamCounter`, `OrigamField`, `OrigamIcon`, `OrigamInput`, `OrigamFileFieldDragNDropItem`, `OrigamFileFieldListItem`

**Utils :** `filterInputAttrs`, `forwardRefs`, `humanReadableFileSize`, `wrapInArray`

### Comportement notable

**Dual mode rendu :** `isDropzoneMode` (alias `dropzone || dragndrop`) commute entièrement la structure du template. En mode dropzone, un `<label>` natif encapsule l'`<input type="file">` caché pour que le clic sur la zone déclenche le sélecteur système sans JS supplémentaire. En mode inline, l'`<OrigamField>` standard est utilisé.

**Validation de taille :** `handleChange` et `handleDrop` filtrent les fichiers qui dépassent `maxFileSize`, émettent `error:max-size` avec les fichiers en erreur et les messages i18n, et ne mettent pas ces fichiers dans le model.

**Noms des fichiers :** `fileNames` (computed) retourne un tableau de strings. `selectionText` agrège les noms avec `divider`. `totalBytesReadable` formate la taille totale via `humanReadableFileSize`.

**Compteur inline :** `OrigamCounter` avec `value={n} fichiers` est rendu dans la zone `origam-file-field__inline-counter` pour le mode `counter`.

**A11y :** la liste de fichiers est une `<ul role="list">`. Le message d'erreur en mode dropzone a `role="alert"`. L'`<input type="file">` est visuellement masqué mais accessible. `aria-required` est transmis si `required`.

### Exemple d'usage

```vue
<origam-file-field
  v-model="files"
  label="Documents"
  multiple
  dropzone
  :max-file-size="5 * 1024 * 1024"
  display="list"
  downloadable
  @error:max-size="onSizeError"
/>
```

---

## `OrigamSliderField`

**Fichier :** `packages/ds/src/components/SliderField/OrigamSliderField.vue`
**Interface props :** `ISliderFieldProps` — `packages/ds/src/interfaces/SliderField/slider-field.interface.ts`

### Rôle / utilité

Curseur de sélection numérique. Supporte le mode simple (une valeur) et le mode range (deux valeurs). Trois variants visuels : `'field'` (dans `OrigamInput` avec label), `'timer'` (barre media player), `'audio'` (barre waveform). Supporte les ticks, la barre bufferisée, le tooltip au survol.

### Entrées (props)

`ISliderFieldProps` étend `ICommonsComponentProps`, `IDensityProps`, `IColorProps`, `IInputProps`, `IFocusProps`, et les interfaces de décoration.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `number \| string \| Array<number \| string>` | — | Valeur(s) courante(s) |
| `min`, `max` | `number \| string` | — | Bornes de la plage |
| `step` | `number \| string` | — | Pas de déplacement |
| `range` | `boolean` | — | Mode range (deux poignées) |
| `variant` | `TSliderFieldVariant` | `'field'` | `'field' \| 'timer' \| 'audio'` |
| `showTicks` | `TAlways` | — | Affichage des ticks |
| `ticks` | `Array<number> \| Record<string, string>` | — | Positions des ticks (avec labels optionnels) |
| `tickSize` | `TSize \| number` | — | Taille des ticks |
| `trackProps` | `ISliderFieldTrackProps` | — | Props visuelles de la piste |
| `reverse` | `boolean` | — | Inverse la direction |
| `inset` | `boolean` | — | Pouce à l'intérieur de la piste |
| `showThumbOnHoverOnly` | `boolean` | — | Cache le pouce au repos |
| `showHoverTooltip` | `boolean` | — | Tooltip sous le curseur |
| `formatHoverTooltip` | `Function` | `v => String(v)` | Formateur du tooltip |
| `buffered` | `number` | — | Valeur de remplissage buffered |
| `peaks` | `ReadonlyArray<number>` | — | Forme d'onde (variant `'audio'`) |
| `label` | `string` | — | Label du champ (variant `'field'`) |
| `disabled`, `readonly`, `error`, `required` | `boolean` | — | États standard |

### Sorties

**v-model :** `modelValue`.

**Emits (`ISliderFieldEmits`) :** `ICommonsComponentEmits`, `IFocusEmits` + `start` / `end` (pointerdown/pointerup sur le pouce).

**Slots :**
- `prepend` (variant `'field'`)
- `default` — `{ id, messagesId, isDisabled, isReadonly, isValid }`
- `label` — remplace `<OrigamLabel>`
- `item` — itemSlotProps de `OrigamSliderFieldTrack` (tick/label custom)

### Dépendances

**Composables :** `useFocus`, `useVModel`, `useProps`, `useStyle`, `useDefaults` + composables de calcul géométrique internes

**Composants internes :** `OrigamInput`, `OrigamLabel`, `OrigamSliderFieldTrack`

### Comportement notable

**`<input type="range">` natif** est conservé comme pivot d'interaction (keyboard, pointer, voiceover). Le composant améliore l'apparence via CSS sur `OrigamSliderFieldTrack`, sans réimplémenter la logique de position.

**Mode range :** deux `<input type="range">` superposés avec `position: absolute`. Les valeurs `trackRangeStart` / `trackRangeStop` pilotent la largeur du remplissage via le composant Track.

**Tooltip hover :** `--origam-slider-field__hover-tooltip---left` est une CSS custom property mise à jour dans un handler `pointermove` RAF-throttlé, sans aucune mutation de state réactif.

**Variant `'timer'` / `'audio'` :** pas d'`OrigamInput` ; le slider est rendu directement dans son wrapper. En `'audio'`, `peaks` est rendu en SVG inline via `OrigamSliderFieldTrack`.

**A11y :** l'`<input type="range">` porte `aria-label`, `aria-describedby`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow` via ses attributs natifs (`min`, `max`, `value`). Navigation clavier (flèches) native.

### Exemple d'usage

```vue
<origam-slider-field
  v-model="volume"
  label="Volume"
  :min="0"
  :max="100"
  :step="5"
  show-ticks="always"
  show-hover-tooltip
  :format-hover-tooltip="v => v + '%'"
/>
```

---

## `OrigamRatingField`

**Fichier :** `packages/ds/src/components/RatingField/OrigamRatingField.vue`
**Interface props :** `IRatingFieldProps` — `packages/ds/src/interfaces/RatingField/rating-field.interface.ts`

### Rôle / utilité

Champ d'évaluation par étoiles (ou autre icône). S'appuie sur `OrigamInput` pour les messages de validation. Chaque étoile est un `OrigamRatingFieldItem` (input radio caché + icône). Supporte les demi-étoiles, le hover, les labels par étoile, et le mode clearable.

### Entrées (props)

`IRatingFieldProps` étend `IInputProps`, `IRippleProps`, `ITagProps`, `ILabelProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `number \| string` | `0` | Valeur courante (0 à `length`) |
| `length` | `number \| string` | `5` | Nombre d'étoiles |
| `emptyIcon` | `TIcon` | — | Icône étoile vide |
| `fullIcon` | `TIcon` | — | Icône étoile pleine |
| `halfIncrements` | `boolean` | — | Active les demi-étoiles |
| `hover` | `boolean` | — | Highlight au survol |
| `clearable` | `boolean` | — | Click sur la valeur active → reset à 0 |
| `disabled`, `readonly` | `boolean` | — | États |
| `itemLabels` | `Array<string>` | — | Labels par étoile |
| `itemLabelPosition` | `TBlock` | `BLOCK.TOP` | Position des labels (`'top' \| 'bottom'`) |
| `itemAriaLabel` | `string` | — | Aria label template pour chaque item |
| `name` | `string` | auto-generated | Attribut `name` des inputs radio |

**Défauts `withDefaults` :**
- `length` : `5`
- `modelValue` : `0`
- `itemLabelPosition` : `BLOCK.TOP`
- `tag` : `'div'`
- `density` : `DENSITY.DEFAULT`
- `size` : `SIZES.DEFAULT`

### Sorties

**v-model :** `modelValue` (number).

**Emits (`IRatingFieldEmits`) :** `ICommonsComponentEmits`.

**Slots :**
- `prepend`, `append` (externes)
- `default` — `{ id, messagesId, isDisabled, isReadonly, isValid }`
- `label` — label du champ
- `itemLabel.{index}` — label par étoile (slot dynamique)
- `itemLabel` — fallback générique pour tous les labels

### Dépendances

**Composables :** `useLocale`, `useVModel`, `useProps`, `useStyle`

**Composants internes :** `OrigamBtn`, `OrigamInput`, `OrigamLabel`, `OrigamRatingFieldItem`

**Enums :** `BLOCK`, `DENSITY`, `MDI_ICONS`, `SIZES`, `VARIANT`

**Utils :** `clamp`, `createRange`, `filterInputAttrs`, `getUid`

### Comportement notable

**Architecture basée sur les input radio :** chaque `OrigamRatingFieldItem` enveloppe un `<input type="radio">` avec `name` partagé. Ceci assure la navigation clavier native (flèches entre items du même groupe) et la sémantique.

**Demi-étoiles :** si `halfIncrements`, chaque entier génère deux `OrigamRatingFieldItem` (0.5 et 1). L'item fantôme d'index -1 avec `show-star: false` et `value: 0` gère le reset clavier.

**Hover :** `hoverIndex` (shallowRef) est mis à jour par les handlers `onMouseenter`/`onMouseleave` des items. `itemState` fusionne `isFilled`, `isHovered`, `isHovering` pour chaque item.

**Bouton clear :** visible si `clearable && normalizedValue > 0 && !disabled && !readonly`. Un `OrigamBtn` (icon, variant text) remet `model.value = 0` au clic.

**A11y :** les inputs radio sont la primitive a11y native. Le groupe de radios est identifié par `name`. Le bouton clear a `aria-label` via `t('origam.rating.clear')`.

### Exemple d'usage

```vue
<origam-rating-field
  v-model="score"
  label="Votre avis"
  :length="5"
  half-increments
  hover
  clearable
  :item-labels="['Très mauvais', 'Mauvais', 'Moyen', 'Bon', 'Excellent']"
/>
```

---

## `OrigamForm`

**Fichier :** `packages/ds/src/components/Form/OrigamForm.vue`
**Interface props :** `IFormProps` — `packages/ds/src/interfaces/Form/form.interface.ts`

### Rôle / utilité

Conteneur de formulaire HTML sémantique (`<form novalidate>`). Orchestre la validation de tous les champs enfants via `provide(ORIGAM_FORM_KEY)`, agrège leur état de validité dans un v-model booléen, et expose `validate()`, `reset()`, `resetValidation()`. Supporte les règles de validation au niveau du formulaire lui-même et le scroll automatique vers le premier champ en erreur.

### Entrées (props)

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `boolean \| null` | — | État de validité global (true / false / null = indéterminé) |
| `disabled` | `boolean` | — | Désactive tous les champs enfants |
| `readonly` | `boolean` | — | Met tous les champs en lecture seule |
| `fastFail` | `boolean` | — | Stoppe la validation au premier champ invalide |
| `validateOn` | `TValidateOn` | — | Stratégie globale : `'input'`, `'blur'`, `'submit'`, `'lazy'` |
| `rules` | `Array<any>` | — | Règles de validation au niveau du formulaire |
| `errorMessages` | `Array<string> \| string` | — | Erreurs forcées au niveau formulaire |
| `hint` | `string` | — | Texte d'aide au niveau formulaire |
| `messages` | `Array<string> \| string` | — | Messages statiques formulaire |
| `scrollToError` | `boolean \| ScrollIntoViewOptions` | — | Scroll auto vers le premier champ `.origam-input--error` après soumission invalide |

### Sorties

**v-model :** `modelValue` (`boolean | null`). Mis à jour par `useForm` : `true` si tous les champs valides, `false` si au moins un invalide, `null` si l'état est indéterminé.

**Emits (`IFormEmits`) :** `submit(ISubmitEventPromise)`, `reset(Event)`.

**Slots (`IFormSlots`) :**

| Slot | Scope | Description |
|---|---|---|
| `default` | `{ validate, reset, resetValidation, isDisabled, isReadonly, isValidating, isValid, items, errors }` | Corps du formulaire |
| `messages` | `{ hasMessages, messages }` | Messages niveau formulaire |
| `message` | — | Template message individuel |
| `actions` | `{ submit, reset }` | Boutons d'action |

**expose :** `filterProps`, `validate()`, `reset()`, `resetValidation()`, `errorMessages`, `formIsValid`, `scrollToFirstError()`, `css`, `id`, `load`, `unload`, `isLoaded` + membres du `<form>` natif (via `forwardRefs`)

### Dépendances

**Composables :** `useForm`, `useMessage`, `useValidation`, `useProps`, `useStyle`, `useDefaults`

**Composants internes :** `OrigamMessages`

**Utils :** `forwardRefs`, `getUid`

### Comportement notable

**`useForm` + `provide` :** `useForm(props)` crée un contexte `ORIGAM_FORM_KEY` injecté via `provide`. Chaque champ enfant consommant `useValidation` s'enregistre automatiquement à `onBeforeMount` via `form.register({ id, vm, validate, reset, resetValidation })` et se désenregistre via `form.unregister(id)`.

**Soumission asynchrone :** `handleSubmit` transforme l'événement `SubmitEvent` en `ISubmitEventPromise` en attachant `.then`/`.catch`/`.finally` au Promise de `Promise.all([form.validate(), validateFormRules()])`. Le consommateur écrit `@submit="async e => { const { valid } = await e; ... }"`. La soumission HTML native n'est déclenchée que si `valid === true && !e.defaultPrevented`.

**`fastFail` :** `useForm.validate()` itère `items.value` dans un `for` et sort dès qu'un item retourne des erreurs si `props.fastFail === true`. Évite la surcharge sur les très grands formulaires.

**Scroll vers l'erreur :** `scrollToFirstError` appelle `formRef.value.querySelector('.origam-input--error')` après un `nextTick` puis `el.scrollIntoView(options)`. Par défaut : `{ behavior: 'smooth', block: 'center' }`.

**Validation du formulaire lui-même :** `useValidation` est également appelé sur le formulaire (avec `props as any`), ce qui permet d'avoir des règles et des errorMessages au niveau du `<OrigamForm>` affichés dans `.origam-form__details`.

**A11y :** `<form novalidate>` neutralise la validation native du navigateur pour laisser Origam en prendre le contrôle. La zone d'erreurs formulaire a un `id` unique (`origam-form-messages-{uid}`) pour être référençable.

### Exemple d'usage

```vue
<origam-form
  v-model="formValid"
  validate-on="blur"
  :scroll-to-error="{ behavior: 'smooth', block: 'center' }"
  @submit="async (e) => {
    const { valid, errors } = await e
    if (valid) submitData()
  }"
>
  <template #default>
    <origam-text-field v-model="email" label="Email" :rules="emailRules" />
    <origam-password-field v-model="password" label="Mot de passe" :min-length="12" />
  </template>
  <template #actions="{ submit, reset }">
    <origam-btn @click="submit">Valider</origam-btn>
    <origam-btn @click="reset" variant="text">Réinitialiser</origam-btn>
  </template>
</origam-form>
```

---

## `OrigamLabel`

**Fichier :** `packages/ds/src/components/Label/OrigamLabel.vue`
**Interface props :** `ILabelProps` — `packages/ds/src/interfaces/Label/label.interface.ts`

### Rôle / utilité

Label de champ de formulaire. Rendu via `<component :is="tag">` (par défaut `<label>`). Affiche un texte avec un `<sup>*</sup>` optionnel si `required`. Supporte border, rounded, padding, margin, color via les interfaces communes. Utilisé à deux reprises dans `OrigamField` : comme label statique (associé via `for`) et comme label flottant (dans l'outline notch).

### Entrées (props)

`ILabelProps` étend `ICommonsComponentProps`, `IMarginProps`, `IPaddingProps`, `IBorderProps`, `IRoundedProps`, `IColorProps`, `IBgColorProps`, `ITagProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `text` | `string` | — | Texte du label |
| `floating` | `boolean` | — | Active le modifier `--floating` (position cible dans le notch) |
| `required` | `boolean` | — | Affiche le `<sup>*</sup>` |
| `name` | `string` | — | Attribut `name` (pour usages non-formulaire) |
| `tag` | `string` | `'label'` | Élément HTML racine |

**Défaut `withDefaults` :** `tag` : `'label'`

### Sorties

**Emits (`ILabelEmits`) :** `click(MouseEvent)`.

**Slots :** `default` — remplace le `<span>{{ text }}</span><sup>*</sup>` par défaut.

**Classes CSS :**
- `.origam-label`
- `--floating` (quand `floating: true`)

**Tokens CSS consommés :**
- `--origam-label---color`, `--origam-label---font-size`, `--origam-label---font-weight`, `--origam-label---line-height`, `--origam-label---letter-spacing`, `--origam-label---pointer-events`, `--origam-label---transition-duration`, `--origam-label---transition-easing`
- `--origam-label---required-indicator-color` (couleur du `*`)
- `--origam-label__floating---font-size`, `--origam-label__floating---visibility`

**expose :** `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`

### Dépendances

**Composables :** `useBorder`, `useBothColor`, `useMargin`, `usePadding`, `useRounded`, `useProps`, `useStyle`, `useDefaults`

### Comportement notable

**Isolation dans `OrigamField` :** `OrigamField` force `border: false` et `rounded: false` sur les props transmises au label. Cela empêche que les déclarations visuelles du champ parent (ex: `border: true, rounded: true` par défaut dans FileField) fassent apparaître un contour autour du texte.

**Animation :** `OrigamField` pilote l'animation label/label-flottant via la Web Animations API, en lisant les positions réelles du DOM. Le `OrigamLabel` lui-même ne porte aucune logique d'animation.

**A11y :** `<label for="...">` est l'élément natif optimal. Le `tag` prop permet de dégrader en `<span>` pour les cas où l'association native n'est pas appropriée (ex: dans un `<legend>`).

### Exemple d'usage

```vue
<origam-label
  text="Nom complet"
  :required="true"
  :for="inputId"
/>
```

---

## Tableau récapitulatif

| Composant | Primitives utilisées | v-model type | Validation | Composable clé |
|---|---|---|---|---|
| `OrigamField` | — | — | ✗ | `useAdjacentInner`, `useFocus`, `useActive`, `useLoader` |
| `OrigamInput` | — | tout type | via `useValidation` | `useValidation`, `useAdjacent` |
| `OrigamTextField` | Input + Field | `string \| null` | via Input | `useVModel`, `useMask` |
| `OrigamTextareaField` | Input + Field | `string` | via Input | `useVModel`, `useTextareaRich`, `useDragResizer` |
| `OrigamNumberField` | TextField (ou Input compact) | `number \| null` | via Input | `useVModel`, `useHold` |
| `OrigamPasswordField` | Input + Field | `string \| null` | enrichedRules + Input | `useVModel`, `computeStrength` |
| `OrigamOtpInputField` | Field (n fois) | `string \| number` | Proxy + `useValidation` | `useVModel` (array↔string) |
| `OrigamFileField` | Input + Field (ou dropzone) | `File \| File[] \| null` | via Input | `useVModel`, `useBothColor` |
| `OrigamSliderField` | Input (variant field) | `number \| Array<number>` | via Input | `useVModel`, `useFocus` |
| `OrigamRatingField` | Input | `number` | via Input | `useVModel` |
| `OrigamForm` | — | `boolean \| null` | `useForm` + `useValidation` | `useForm`, `useValidation` |
| `OrigamLabel` | — | — | ✗ | `useBorder`, `useRounded`, `useBothColor` |

---

## Mini-diagramme de composition Field → *Field

```
OrigamForm
  └─ provide(ORIGAM_FORM_KEY)
       │
       ▼
OrigamInput  ←─ useValidation ─────────────────→ inject(ORIGAM_FORM_KEY)
  ├─ slot#default → {id, isDisabled, isDirty, isValid, isReadonly}
  │    └─ OrigamField  ←─ useActive, useFocus, useAdjacentInner, useLoader
  │         └─ slot#default → {class, id, aria-describedby, isActive, isFocused}
  │              └─ <input> / <textarea> / <div contenteditable> / <input type="range"> / (n × <input>)
  └─ slot#details → OrigamMessages + OrigamCounter

Spécialisations (toutes construites sur OrigamInput + OrigamField) :
  OrigamTextField        ─ ajoute mask, counter, autofocus (IntersectionObserver)
  OrigamTextareaField    ─ ajoute autoGrow (ResizeObserver), dragResize, mode rich
  OrigamNumberField      ─ ajoute increment/decrement (useHold), clamping, mode compact
  OrigamPasswordField    ─ ajoute toggle show/hide, strength bar, requirements
  OrigamOtpInputField    ─ n × OrigamField, useValidation via Proxy, focus routing
  OrigamFileField        ─ ajoute mode dropzone (DnD natif), display list/chips/counter
  OrigamSliderField      ─ ajoute <input type="range"> natif, track, ticks, variants
  OrigamRatingField      ─ n × OrigamRatingFieldItem (radio), hover, half-increments
```

La flèche `useValidation → inject(ORIGAM_FORM_KEY)` est le canal unique par lequel chaque champ s'enregistre dans son formulaire parent, sans couplage direct entre les composants. `OrigamForm` fournit le contexte via `useForm` ; chaque `OrigamInput` (ou `OrigamOtpInputField`) s'y abonne automatiquement au montage et se désenregistre à la destruction.
