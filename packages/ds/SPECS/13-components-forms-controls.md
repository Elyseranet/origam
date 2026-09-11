# Composants Formulaire — contrôles

Ce document constitue la référence technique ultra-détaillée des **composants de saisie et de contrôle** du design system origam. Il couvre la couche de base partagée (`OrigamSelectionControl` / `OrigamSelectionControlGroup`) et les quatorze composants qui en dérivent ou la complètent : Checkbox, Radio, Switch, Select, ColorPicker, ColorPickerField, DatePicker, DatePickerField, Calendar, Counter, NumberFormat, TextMask, InlineEdit.

## Architecture commune

Trois composants forment le socle de tous les contrôles de sélection booléenne.

```
OrigamSelectionControlGroup        ← fournisseur de contexte (inject/provide)
    └── OrigamSelectionControl     ← bloc BEM, logique v-model, a11y input
            ├── OrigamCheckboxBtn  ← instancie SelectionControl type="checkbox"
            ├── OrigamRadioBtn     ← instancie SelectionControl type="radio"
            └── OrigamSwitch       ← instancie SelectionControl + SwitchTrack
```

`OrigamCheckbox` et `OrigamRadio` sont des _wrappers_ qui encapsulent respectivement `OrigamInput` + `OrigamCheckboxBtn` / `OrigamRadioBtn` pour bénéficier du layout, des messages de validation et du focus visible de `OrigamInput`.

---

## `OrigamSelectionControl`

**Fichier** : `packages/ds/src/components/SelectionControl/OrigamSelectionControl.vue`

**Rôle** : Bloc BEM racine de tout contrôle de sélection. Gère le v-model (single / multiple), la dérivation trueValue / falseValue, le comparateur de valeurs, la gestion du focus visible, l'état hover/error/disabled, l'injection de couleur via `useTextColor`, le ripple, et le bridge avec `OrigamSelectionControlGroup` via `inject`.

### Entrées (props)

L'interface `ISelectionControlProps` étend `ICommonsComponentProps`, une partie de `ISelectionControlGroupProps` (sauf `items`), `IColorProps`, `IBgColorProps`, `IActiveProps` et `IHoverProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `any` | — | Valeur contrôlée du v-model |
| `label` | `string` | — | Texte du `<OrigamLabel>` associé |
| `trueValue` | `any` | `true` (calculé) | Valeur émise quand la case est cochée ; si absent, `value` est utilisé |
| `falseValue` | `any` | `false` (calculé) | Valeur émise quand la case est décochée |
| `value` | `any` | — | Valeur d'item dans un groupe multiple |
| `required` | `boolean` | — | Marqueur sémantique requis |
| `type` | `string` | — | Type natif (`checkbox`, `radio`) propagé au `<input>` |
| `color` | `TIntent \| string` | — | Couleur de la coche / texte (actif) |
| `bgColor` | `TIntent \| string` | — | Couleur de fond (actif) |
| `activeColor` | `TIntent \| string` | — | Couleur dérivée quand `model.value === true` |
| `activeBgColor` | `TIntent \| string` | — | Couleur de fond dérivée quand actif |
| `hoverColor` | `TIntent \| string` | — | Couleur hover (via `useHover` + `useStateEffect`) |
| `disabled` | `boolean` | — | Désactive et bloque les interactions |
| `readonly` | `boolean` | — | Lecture seule ; force une resynchronisation via `group.forceUpdate()` si en mode groupe |
| `error` | `boolean` | — | Bascule l'icône et le label en rouge erreur |
| `inline` | `boolean` | — | Mode `display: inline-flex` (pas `flex: 1 0`) |
| `multiple` | `boolean \| null` | — | Mode tableau ; auto-détecté si `modelValue` est un `Array` |
| `name` | `string` | — | Attribut `name` de l'input natif |
| `ripple` | `boolean` | — | Active le ripple `v-ripple` autour du cercle tactile |
| `falseIcon` | `TIcon` | — | Icône rendue par `OrigamIcon` quand `model === false` |
| `trueIcon` | `TIcon` | — | Icône rendue quand `model === true` |
| `valueComparator` | `(a,b) => boolean` | `deepEqual` | Comparateur de valeur personnalisable |
| `id` | `string` | `input-{uid}` | ID du `<input>` natif |
| `density` | `DENSITY` | — | Taille du cercle tactile via `useDensity` |

### Sorties

**Emits** : `click:label` (MouseEvent).

**v-model** : `modelValue` (lecture/écriture).

**Slots** :

| Slot | Portée | Description |
|---|---|---|
| `default` | `{ model, color, bgColor, icon, props: { onFocus, onBlur, id } }` | Zone précédant le cercle d'input (rarissime — pour Switch thumb) |
| `input` | `{ model, color, bgColor, icon, props: { ...inputAttrs, disabled, label, name, type, value, onFocus, onBlur, id, onInput } }` | Remplace entièrement le `<input>` natif + icône |
| `label` | — | Remplace le `<OrigamLabel>` |

**Classes BEM** :

- `.origam-selection-control` (bloc)
- `--dirty` : model = true
- `--disabled` : opacité 0.5, pointer-events none
- `--error` : icône et label en rouge via token `--origam-selection-control__label---color-error`
- `--focused` / `--focus-visible` : outline visible sur le cercle
- `--inline` : display inline-flex
- `--density-default` / `--density-compact` : CSS var `--origam-selection-control--density`

**Styles** : la couleur (`color`) est injectée sur `.origam-selection-control__wrapper` via `useTextColor` → classes `.origam--color-{intent}` ou inline `color:` pour les valeurs brutes. C'est ce mécanisme qui alimente le `currentColor` du thumb Switch.

### Dépendances

- **Composables** : `useDefaults`, `useDensity`, `useHover`, `useStateEffect`, `useVModel`, `useTextColor`, `useStyle`, `useProps`
- **Directives** : `v-ripple`
- **Utils** : `deepEqual`, `filterInputAttrs`, `forwardRefs`, `getUid`, `matchesSelector`, `wrapInArray`
- **Composants** : `OrigamIcon`, `OrigamLabel`
- **Clé inject** : `ORIGAM_SELECTION_CONTROL_GROUP_KEY` (fourni par `OrigamSelectionControlGroup`)
- **Interface** : `ISelectionControlProps`, `ISelectionControlEmits`, `ISelectionControlSlots`

### Comportement notable

- L'`<input>` natif est positionné en `position: absolute; opacity: 0` à la taille complète du cercle tactile 40px × 40px (±density). L'icône ou le contenu du slot `input` est rendu par-dessus.
- En mode `readonly` dans un groupe, `nextTick(() => group.forceUpdate())` resynchronise l'état natif coché pour éviter un décalage DOM/VNode.
- `matchesSelector(e.target, ':focus-visible')` détermine si la classe `--focus-visible` (outline) est activée, sans JavaScript supplémentaire — suit la pseudo-classe CSS native.
- La classe `--focused` et `--focus-visible` sont distinctes : `--focused` déclenche le halo de hover sur `__input:before`, `--focus-visible` active l'outline de 2px.

### Exemple d'usage

```vue
<origam-selection-control
  v-model="isAccepted"
  type="checkbox"
  label="J'accepte les CGU"
  color="primary"
  true-icon="mdi:checkbox-marked-outline"
  false-icon="mdi:checkbox-blank-outline"
/>
```

---

## `OrigamSelectionControlGroup`

**Fichier** : `packages/ds/src/components/SelectionControl/OrigamSelectionControlGroup.vue`

**Rôle** : Conteneur (`role="group"`) qui injecte le contexte `ORIGAM_SELECTION_CONTROL_GROUP_KEY` dans tous ses descendants `OrigamSelectionControl`. Propage le `modelValue` commun (géré par le groupe), et descend ses props visuelles/comportementales via `OrigamDefaultsProvider`.

### Entrées (props)

L'interface `ISelectionControlGroupProps` étend `ICommonsComponentProps`, `IColorProps`, `IDensityProps`, `IRippleProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `any` | — | Valeur(s) sélectionnée(s) pour le groupe |
| `tag` | `string` | `'div'` | Élément racine |
| `density` | `DENSITY` | `DENSITY.DEFAULT` | Descendu aux enfants |
| `color` | `TIntent \| string` | — | Descendu aux enfants |
| `type` | `string` | — | Type (`checkbox`, `radio`) descendu aux enfants via slotDefaults |
| `disabled` | `boolean` | — | Descendu aux enfants |
| `readonly` | `boolean` | — | Descendu aux enfants |
| `error` | `boolean` | — | Descendu aux enfants |
| `multiple` | `boolean` | — | Descendu aux enfants |
| `name` | `string` | — | Attribut HTML `name` du groupe |
| `inline` | `boolean` | — | Classe `--inline` |
| `ripple` | `boolean` | — | Descendu aux enfants |
| `falseIcon` / `trueIcon` | `TIcon` | — | Descendus aux enfants |
| `valueComparator` | `(a,b)=>boolean` | — | Descendu aux enfants |
| `items` | `Array \| Record` | `[]` | Items à itérer dans le slot `item` |

### Sorties

**Emits** : `update:modelValue`.

**Contexte injecté** (`ISelectionGroupContext`) :

```ts
{
  modelValue: Ref<any>             // modèle partagé
  forceUpdate: () => void          // déclenche resync DOM
  onForceUpdate: (fn) => void      // s'abonner à forceUpdate (auto-dispose)
}
```

**Slots** :

| Slot | Portée | Description |
|---|---|---|
| `default` | `{ items }` | Contenu libre ou itération manuelle |
| `item` | `{ item, index }` | Rendu d'un item de la liste `items` |
| `item.${index}` | `{ item }` | Slot individualisé par index |

**Classes** : `.origam-selection-control-group`, `--inline`.

### Comportement notable

La propagation des props aux enfants passe par `OrigamDefaultsProvider`. Les propriétés forwarded (`slotDefaults`) sont : `density`, `color`, `type`, `disabled`, `readonly`, `error`, `multiple`, `name`, `ripple`, `falseIcon`, `trueIcon`, `valueComparator`. Cette liste a été élargie (fix task #24) pour inclure `type` — sans lequel les radios ne recevaient pas `type="radio"` et ne déclenchaient jamais de changement.

---

## `OrigamCheckbox`

**Fichier** : `packages/ds/src/components/Checkbox/OrigamCheckbox.vue`

**Rôle** : Contrôle de case à cocher complet avec layout `OrigamInput` (ligne label + messages de validation). Délègue la saisie à `OrigamCheckboxBtn`.

### Entrées (props)

`ICheckboxProps` étend `ICommonsComponentProps`, `IInputProps`, `ICheckboxBtnProps`, `IDensityProps`, `IPaddingProps`, `IMarginProps`, `IRoundedProps`, `IColorProps`, `IBorderProps`, `IElevationProps`, `IActiveProps`, `IHoverProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `any` | — | Valeur cochée |
| `density` | `DENSITY` | `DENSITY.DEFAULT` | Densité du contrôle |
| `indeterminate` | `boolean` | — | État indéterminé (via `ICheckboxBtnProps`) |
| `indeterminateIcon` | `TIcon` | `MDI_ICONS.MINUS_BOX` | Icône état indéterminé |
| `trueIcon` | `TIcon` | `MDI_ICONS.CHECKBOX_MARKED_OUTLINE` | Icône cochée |
| `falseIcon` | `TIcon` | `MDI_ICONS.CHECKBOX_BLANK_OUTLINE` | Icône non cochée |
| (+ props Input) | — | — | `label`, `hint`, `messages`, `rules`, `validateOn`, `errorMessages`, `hideDetails`, `prependIcon`, `appendIcon`, etc. |
| (+ props color/border/elevation) | — | — | Via interfaces Commons |
| `focused` | `boolean` | — | Contrôle l'état focused depuis l'extérieur |

### Sorties

**Emits** : `update:modelValue`, `update:indeterminate`, `update:focused`, `focus`, `blur`, `click:label`.

**Slots** :

| Slot | Portée | Description |
|---|---|---|
| `default` | `{ id, messagesId, isDisabled, isReadonly, isValid }` | Remplace le bloc entier (délégué à CheckboxBtn) |
| `label` | — | Remplace le label |
| `input` | `{ props, icon, textColorStyles, backgroundColorStyles, model }` | Remplace l'input natif |

**Classes** : `.origam-checkbox` (hérite de `.origam-input`).

**Style** : `.origam-checkbox .origam-selection-control { min-height: calc(56px + 2 * var(--origam-input---density)) }`.

### Dépendances

- **Composables** : `useVModel`, `useFocus`, `useProps`, `useStyle`
- **Composants** : `OrigamInput`, `OrigamCheckboxBtn`
- **Utils** : `filterInputAttrs`, `getUid`
- **Interface** : `ICheckboxProps`, `ICheckboxEmits`, `ICheckboxSlots`

### Comportement notable

`filterInputAttrs(attrs)` sépare les attributs racine des attributs d'input. `inputProps` est résolu via `origamInputRef.value?.filterProps(props, [...])` — les props partagées entre `Checkbox` et `Input` sont transmises sans duplication.

### Exemple d'usage

```vue
<origam-checkbox
  v-model="agreed"
  label="J'accepte les conditions générales"
  color="primary"
  :rules="[v => !!v || 'Requis']"
/>
```

---

## `OrigamCheckboxBtn`

**Fichier** : `packages/ds/src/components/Checkbox/OrigamCheckboxBtn.vue`

**Rôle** : Version légère de la case à cocher, sans wrapper `OrigamInput`. Délègue directement à `OrigamSelectionControl` avec `type="checkbox"`. Gère l'état indéterminé.

### Entrées (props)

`ICheckboxBtnProps` étend `ICommonsComponentProps`, `ISelectionControlProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `any` | — | Valeur |
| `indeterminate` | `boolean` | — | État tri-state |
| `indeterminateIcon` | `TIcon` | `MDI_ICONS.MINUS_BOX` | Icône état indéterminé |
| `trueIcon` | `TIcon` | `MDI_ICONS.CHECKBOX_MARKED_OUTLINE` | Icône cochée |
| `falseIcon` | `TIcon` | `MDI_ICONS.CHECKBOX_BLANK_OUTLINE` | Icône décochée |
| `density` | `DENSITY` | `DENSITY.DEFAULT` | |

### Sorties

**Emits** : `update:modelValue`, `update:indeterminate`, `click:label`.

**Comportement indéterminé** : quand `indeterminate` est vrai, `falseIcon` et `trueIcon` affichent `indeterminateIcon` ; au premier changement d'état (`handleChange`), `indeterminate` passe à `false`.

**Classes** : `.origam-checkbox-btn`.

---

## `OrigamRadio`

**Fichier** : `packages/ds/src/components/Radio/OrigamRadio.vue`

**Rôle** : Contrôle radio avec layout `OrigamInput`. Miroir structurel de `OrigamCheckbox`, avec les slots `prepend`, `append`, `details`, `messages`, `message` supplémentaires.

### Entrées (props)

`IRadioProps` étend `ICommonsComponentProps`, `IInputProps`, `IRadioBtnProps`, `IDensityProps`, `IPaddingProps`, `IMarginProps`, `IRoundedProps`, `IColorProps`, `IBorderProps`, `IElevationProps`, `IActiveProps`, `IHoverProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `any` | — | Valeur du groupe |
| `density` | `DENSITY` | `DENSITY.DEFAULT` | |
| `trueIcon` | `TIcon` | `MDI_ICONS.RADIOBOX_MARKED` | Icône sélectionné |
| `falseIcon` | `TIcon` | `MDI_ICONS.RADIOBOX_BLANK` | Icône non sélectionné |
| (+ props Input + color + margin/padding) | — | — | Hérités |

### Sorties

**Emits** : `update:modelValue`, `focus`, `blur`, `click:label`.

**Slots** : `prepend`, `default`, `append`, `details`, `messages`, `message`, `label`, `input`.

**Classes** : `.origam-radio`.

**Spécificité** : `useHover` + `useStateEffect` sont consommés directement dans `OrigamRadio` (pas dans `OrigamRadioBtn`) — la réactivité de couleur au hover est gérée au niveau wrapper.

---

## `OrigamRadioBtn`

**Fichier** : `packages/ds/src/components/Radio/OrigamRadioBtn.vue`

**Rôle** : Version légère du radio, sans `OrigamInput`. Délègue à `OrigamSelectionControl` avec `type="radio"`.

| Prop | Défaut |
|---|---|
| `trueIcon` | `MDI_ICONS.RADIOBOX_MARKED` |
| `falseIcon` | `MDI_ICONS.RADIOBOX_BLANK` |
| `density` | `DENSITY.DEFAULT` |

Pas d'état indéterminé (contrairement à `CheckboxBtn`). Classes : `.origam-radio-btn`.

---

## `OrigamRadioGroup`

**Fichier** : `packages/ds/src/components/Radio/OrigamRadioGroup.vue`

Voir `OrigamSelectionControlGroup` — `OrigamRadioGroup` est un alias spécialisé. Son interface `IRadioGroupProps` étend `ISelectionControlGroupProps` sans props supplémentaires.

---

## `OrigamSwitch`

**Fichier** : `packages/ds/src/components/Switch/OrigamSwitch.vue`

**Rôle** : Interrupteur on/off avec track + thumb animé, états de chargement (circular / line / skeleton), mode inset et indéterminé.

### Entrées (props)

`ISwitchProps` étend `ICommonsComponentProps`, `ITagProps`, `IPaddingProps`, `IMarginProps`, `IBorderProps`, `IRoundedProps`, `IInputProps`, `ISelectionControlProps`, `ILoaderProps`, `IColorProps`, `IDensityProps`, `IElevationProps`, `IActiveProps`, `IHoverProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `boolean` | — | État on/off |
| `indeterminate` | `boolean` | — | État tri-state (thumb à mi-chemin, `aria-checked="mixed"`) |
| `inset` | `boolean` | — | Variante inset : track 52×32px, thumb 24px |
| `flat` | `boolean` | — | Supprime l'ombre du track |
| `density` | `DENSITY` | `DENSITY.DEFAULT` | |
| `centerAffix` | `boolean` | `true` | Aligne les éléments adjacent au centre |
| `loading` | `boolean \| ILoaderConfig` | — | Active le loader ; `kind: 'circular'` (défaut), `'line'`, `'skeleton'` |
| `color` / `bgColor` | `TIntent \| string` | — | Couleur du thumb/track — STRICTEMENT scoped à `OrigamSelectionControl` pour ne pas peindre toute la ligne Input |

### Sorties

**Emits** : `update:modelValue`, `update:indeterminate`, `focus`, `blur`, `click:label`.

**Slots** :

| Slot | Description |
|---|---|
| `track.true` | Contenu côté ON du track |
| `track.false` | Contenu côté OFF du track |
| `loader` | Remplace le spinner circulaire dans le thumb |

**Classes** :

- `.origam-switch`
- `--flat`, `--inset`, `--indeterminate`
- `origam-input--loading` (via `loaderClasses`)

### Dépendances

- **Composables** : `useFocus`, `useHover`, `useStateEffect`, `useVModel`, `useLoader`, `useProps`, `useStyle`
- **Composants** : `OrigamInput`, `OrigamSelectionControl`, `OrigamSwitchTrack`, `OrigamProgress`, `OrigamIcon`, `OrigamTranslateScale`
- **Enums** : `DENSITY`, `PROGRESS_TYPE`, `SIZES`
- **Utils** : `filterInputAttrs`, `getUid`

### Contrat inline-style du thumb — architecture classes-first

Le thumb (`__thumb`) reçoit sa couleur via `currentColor` grâce à la chaîne suivante :

1. `OrigamSwitch` strip `color` / `bgColor` de `inputProps` (ne remonte pas à `OrigamInput`) pour ne pas peindre toute la rangée.
2. `OrigamSelectionControl` applique `useTextColor(color)` sur `.origam-selection-control__wrapper` → classe `.origam--color-{intent}` (valeur tokenisée) **ou** inline `color: {value}` (valeur brute).
3. Le SCSS de `OrigamSwitch` cible `.origam-selection-control__wrapper.origam--color-{intent} .origam-switch__thumb { background-color: currentColor }` pour toutes les intentions (primary, secondary, success, warning, danger, info, neutral).
4. Le sélecteur `[style*="color:"] .origam-switch__thumb` couvre les couleurs brutes (hex/rgb) — fallback legacy.

Cette double stratégie (classe + sélecteur d'attribut) garantit la compatibilité ascendante tout en étant compatible avec le mode classes-first (Strategy A, v2.x).

### Loaders

Trois modes de chargement sont supportés :

| Kind | Rendu | Composant |
|---|---|---|
| `'circular'` | Spinner `OrigamProgress` DANS le thumb | `OrigamTranslateScale` wrapper |
| `'line'` | Barre `OrigamProgress` linéaire SUR le track, couvrant sa hauteur totale | Slot `overlay` de `OrigamSwitchTrack` |
| `'skeleton'` | Remplace entièrement le switch par un placeholder animé `.origam-switch__skeleton` | Bloc conditionnel `v-if="isSkeletonLoading"` |

Le skeleton utilise l'animation `origam-switch-skeleton-pulse` (keyframe CSS, 1.6s, `prefers-reduced-motion` respecté).

### Comportement notable — gestion du clic sur le track

`OrigamSwitchTrack` appelle `e.stopPropagation()` + `e.preventDefault()` avant d'émettre `click`. `OrigamSwitch` reçoit cet emit et appelle `origamSelectionControlRef.value?.inputRef?.click()` pour déclencher le toggle via l'`<input>` natif. Avant le fix (Phase 5), le clic bubbling depuis le track déclenchait un double toggle silencieux.

### Exemple d'usage

```vue
<origam-switch
  v-model="darkMode"
  label="Mode sombre"
  color="primary"
  inset
  :loading="{ kind: 'circular', isActive: isLoading }"
>
  <template #track.true><origam-icon icon="mdi:weather-night" size="x-small"/></template>
  <template #track.false><origam-icon icon="mdi:weather-sunny" size="x-small"/></template>
</origam-switch>
```

---

## `OrigamSwitchTrack`

**Fichier** : `packages/ds/src/components/Switch/OrigamSwitchTrack.vue`

**Rôle** : Sous-composant interne du Switch. Rend le rail arrondi, gère son état visuel (dirty, disabled, readonly, error, inset), expose les demi-contenus `track.true` / `track.false` et le slot `overlay` pour les loaders.

### Entrées (props)

`ISwitchTrackProps` étend `ICommonsComponentProps`, `IColorProps`, `IBgColorProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `boolean` | `false` | ON/OFF — drive `--dirty` |
| `isValid` | `boolean \| null` | `null` | État de validation |
| `disabled` | `boolean` | `false` | |
| `readonly` | `boolean` | `false` | |
| `error` | `boolean` | `false` | Peint le track en rouge via token SCSS |
| `inset` | `boolean` | `false` | Track 52×32px (vs 36×14px standard) |
| `bgColor` | `TIntent \| string` | — | Couleur du rail ; ignorée si `disabled` ou `error` (tokens priment) |
| `color` | — | — | Exposé pour les slot consumers mais non appliqué au track lui-même |

### Sorties

**Emits** : `click` (MouseEvent) — après `stopPropagation` + `preventDefault`.

**Slots** : `track.true`, `track.false`, `overlay` (scope : `{ model, isValid }`).

**Classes** : `.origam-switch-track`, `--dirty`, `--disabled`, `--readonly`, `--error`, `--inset`.

**Couleur** : `useBackgroundColor(trackBgColor)` → `backgroundColorStyles` sur le style root. Le canal `bgColor` est null si `disabled` ou `error` afin que les tokens SCSS `--origam-switch__track---background-color-disabled` / `rgba(255,0,0,1)` puissent exprimer leur priorité sans être court-circuités.

---

## `OrigamSelect`

**Fichier** : `packages/ds/src/components/Select/OrigamSelect.vue`

**Rôle** : Champ de sélection mono ou multi-valeurs avec dropdown virtualisé. Supporte le mode autocomplete (filtre côté client), les chips, le clavier ARIA combobox, la recherche incrémentale et les avatars/icônes en prepend.

### Entrées (props)

`ISelectProps` étend `ICommonsComponentProps`, `IColorProps`, `IBgColorProps`, `ITextFieldProps`, `IDensityProps`, `IAdjacentProps`, `IAdjacentInnerProps`, `IFieldProps`, `IInputProps`, `IPaddingProps`, `IMarginProps`, `IBorderProps`, `IRoundedProps`, `IElevationProps`, `IItemProps`, `ITransitionComponentProps`, `IFiltersProps`, `ILazyProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `any` | `null` | Valeur(s) sélectionnée(s) |
| `items` | `Array` | `[]` | Liste des options ; chaque item peut contenir `title`, `value`, `prependAvatar`, `prependIcon`, `props`, … |
| `itemTitle` | `string` | `'title'` | Chemin de la propriété d'affichage |
| `itemValue` | `string` | `'value'` | Chemin de la propriété de valeur |
| `itemChildren` | `string` | `'children'` | Chemin des enfants (items imbriqués) |
| `itemProps` | `string` | `'props'` | Chemin des props d'item |
| `multiple` | `boolean` | — | Multi-sélection |
| `chips` | `boolean` | — | Affiche les sélections comme chips |
| `closableChips` | `boolean` | — | Bouton fermer sur chaque chip |
| `chipProps` | `IChipProps` | — | Props transmises aux `OrigamChip` |
| `divider` | `string` | `','` | Séparateur en mode texte multi |
| `menu` | `boolean` | — | Contrôle l'état ouvert/fermé du menu (v-model:menu) |
| `menuIcon` | `TIcon` | `MDI_ICONS.CHEVRON_DOWN` | Icône de l'indicateur de menu |
| `menuProps` | `IMenuProps` | — | Props transmises à `OrigamMenu` |
| `listProps` | `IListProps` | — | Props transmises à `OrigamList` |
| `autocomplete` | `boolean` | — | Active le mode autocomplétion (input filtrant) |
| `autoSelectFirst` | `boolean \| 'exact'` | — | Sélectionne automatiquement le premier résultat filtré |
| `clearOnSelect` | `boolean` | — | Vide la recherche après sélection en autocomplete |
| `hideNoData` | `boolean` | — | Cache le slot `noData` si la liste est vide |
| `hideSelected` | `boolean` | — | Masque les items déjà sélectionnés de la liste |
| `noDataText` | `string` | `'origam.noDataText'` | Clé i18n quand la liste est vide |
| `openOnClear` | `boolean` | — | Réouvre le menu après clear |
| `search` | `string` | `''` | Texte de filtre (v-model:search) |
| `filterMode` | `FILTERS_MODE` | `FILTERS_MODE.INTERSECTION` | Mode de filtre |
| `filterKeys` | `string[]` | `['title']` | Clés filtrées dans les items |
| `valueComparator` | `(a,b)=>boolean` | `deepEqual` | Comparateur |
| `closeText` / `openText` | `string` | i18n keys | Aria-label du champ selon état menu |
| `type` | `TEXT_FIELD_TYPE` | `TEXT_FIELD_TYPE.TEXT` | |
| `role` | `string` | `'combobox'` | ARIA role du champ |
| `eager` | `boolean` | — | Charge le contenu du menu dès le montage |

### Sorties

**Emits** : `update:modelValue`, `update:menu`, `update:search`, `focus`, `blur`, `click:control`, `mousedown:control`, émits adjacent (prepend/append/prependInner/appendInner/clear).

**v-model** : `modelValue` (valeur unique ou tableau), `menu` (boolean), `search` (string).

**Slots** :

| Slot | Portée | Description |
|---|---|---|
| `prepend` | — | Avant le champ |
| `append` | — | Après le champ |
| `prependInner` | — | Dans le champ, avant le contenu |
| `appendInner` | — | Dans le champ, après le contenu (chevron par défaut) |
| `loader` | — | Remplace le loader |
| `label` / `floatingLabel` | — | Labels personnalisés |
| `prefix` / `suffix` | — | Affixes |
| `clear` | — | Bouton de vidage |
| `item` | `{ item, index, props }` | Rendu d'un item de liste |
| `chip` | `{ item, index, props }` | Rendu d'un chip de sélection |
| `selection` | — | Texte de la sélection |
| `noData` | — | État liste vide |
| `items.prepend` / `items.append` | — | Éléments fixes en tête / pied de liste |

**Classes** :

- `.origam-select`
- `--multiple` / `--single`
- `--autocomplete` : l'`<input>` natif est visible et filtrant
- `--active-menu` : l'icône chevron pivote à 180°
- `--chips` : sélections rendues comme chips
- `--selected` : un chip est actif

### Dépendances

- **Composables** : `useFilter`, `useItems`, `useLocale`, `useScrolling`, `useTextColor`, `useVModel`, `useProps`, `useStyle`
- **Composants** : `OrigamTextField`, `OrigamMenu`, `OrigamList`, `OrigamListItem`, `OrigamVirtualScroll`, `OrigamCheckboxBtn`, `OrigamChip`, `OrigamAvatar`, `OrigamIcon`, `OrigamExpandY`, `OrigamTranslateScale`
- **Consts** : `IN_BROWSER`, `ORIGAM_FORM_KEY`
- **Enums** : `BLOCK`, `DENSITY`, `DIRECTION`, `FILTERS_MODE`, `KEYBOARD_VALUES`, `MDI_ICONS`, `SELECT_STRATEGY`, `TEXT_FIELD_TYPE`
- **Utils** : `deepEqual`, `forwardRefs`, `getUid`, `matchesSelector`, `noop`, `wrapInArray`

### Comportement notable — ARIA combobox

Le Select implémente le pattern WAI-ARIA Combobox 1.2 sans déplacer le focus DOM :

- `role="combobox"` sur le `<input>` (via `comboboxAriaAttrs`).
- `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls="{listboxId}"`.
- `aria-activedescendant="{optionId}"` pointe sur l'option keyboard-highlightée.
- Les options portent `role="option"` et `aria-selected`.
- Navigation clavier (↑↓ Home End Enter Esc Tab) maintient `highlightIndex` sans déplacer le focus.

### Comportement notable — autocomplete

En mode `autocomplete`, l'`<input>` est visible, la position CSS `static` est restorée, et la sélection en cours n'est plus masquée. Sur focus initial en mode single (fix v1→v2), `input.select()` est appelé via `setTimeout(0)` (macrotask) pour garantir que le browser a fini de placer le curseur avant l'opération select-all.

### Exemple d'usage

```vue
<origam-select
  v-model="selectedCountry"
  :items="countries"
  item-title="name"
  item-value="code"
  label="Pays"
  color="primary"
  chips
  closable-chips
  multiple
  autocomplete
/>
```

---

## `OrigamColorPicker`

**Fichier** : `packages/ds/src/components/ColorPicker/OrigamColorPicker.vue`

**Rôle** : Sélecteur de couleur complet intégrant un canvas HSV, des sliders, un éditeur de valeurs numérique, et une grille de swatches. Toutes les valeurs circulent en HSVA en interne.

### Entrées (props)

`IColorPickerProps` étend `ICommonsComponentProps`, `IBorderProps`, `IRoundedProps`, `IElevationProps`, `IPaddingProps`, `IMarginProps`, `IPickerProps`, `IColorProps`, et les interfaces de chaque sous-composant (`IColorPickerCanvasProps`, `IColorPickerPreviewProps`, `IColorPickerEditProps`, `IColorPickerSwatchesProps`).

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `Record \| string \| null` | — | Couleur courante (format brut : hex, rgb(a), hsl(a), objet) |
| `mode` | `TColorModes` | `COLOR_MODES_NAMES.RGBA` | Mode d'affichage des inputs (v-model:mode) |
| `modes` | `TColorModes[]` | `[RGB, RGBA, HSL, HSLA, HEX, HEXA]` | Modes proposés dans l'éditeur |
| `canvasHeight` | `string \| number` | `150` | Hauteur du canvas HSV |
| `canvasWidth` | `string \| number` | `'100%'` | Largeur du canvas |
| `hideCanvas` | `boolean` | — | Masque le canvas |
| `hideSliders` | `boolean` | — | Masque les sliders H/A |
| `hideInputs` | `boolean` | — | Masque l'éditeur numérique |
| `showSwatches` | `boolean` | — | Affiche la grille de swatches |
| `swatchesMaxHeight` | `string \| number` | `150` | Hauteur max de la grille |
| `dotSize` | `number` | `10` | Taille du curseur sur le canvas |

### Sorties

**Emits** : `update:modelValue`, `update:mode`.

**v-model** : `modelValue`, `mode`.

**Slots** : `title`, `header`, `default` (remplace canvas + contrôles + swatches), `actions`.

**CSS custom property** : `--origam-color-picker-color-hsv` (calculé via `HSVtoCSS`) est injecté en inline style sur le root pour permettre à des CSS descendants d'accéder à la couleur courante.

**Classes** : `.origam-color-picker`, `--{mode}` (ex. `--rgba`).

### Dépendances

- **Composables** : `useVModel`, `useProps`, `useRtl`, `useStyle`
- **Composants** : `OrigamPicker`, `OrigamColorPickerCanvas`, `OrigamColorPickerPreview`, `OrigamColorPickerEdit`, `OrigamColorPickerSwatches`
- **Utils** : `consoleWarn`, `extractColor`, `HSVtoCSS`, `parseColor`, `RGBtoHSV` (depuis `packages/ds/src/utils/ColorPicker/color-picker.util.ts`)
- **Types** : `THSVA`, `TColorModes`
- **Enums** : `COLOR_MODES_NAMES`

### Comportement notable

La conversion entrée (`parseColor` → `RGBtoHSV`) normalise tous les formats en interne en HSVA. Un `hue` ref séparé est maintenu pour éviter le shift de teinte lors des conversions aller-retour (les calculs RGB→HSV sur les extrêmes du spectre peuvent introduire une dérive de hue). Le flag `externalChange` distingue les mises à jour programmatiques (depuis le parent) des mises à jour internes (depuis le canvas/sliders), ce qui bloque le remplacement du `hue` ref lors des changements internes.

---

## `OrigamColorPickerField`

**Fichier** : `packages/ds/src/components/ColorPickerField/OrigamColorPickerField.vue`

**Rôle** : Champ texte avec un swatch de couleur en prepend et un `OrigamColorPicker` dans un menu dropdown. Combine les patterns `OrigamSelect` et `OrigamDatePickerField`.

### Entrées (props)

`IColorPickerFieldProps` étend `ICommonsComponentProps`, `IColorProps`, `ITextFieldProps`, `IDensityProps`, `IAdjacentProps`, `IAdjacentInnerProps`, `IFieldProps`, `IInputProps`, `IPaddingProps`, `IMarginProps`, `IBorderProps`, `IRoundedProps`, `IElevationProps`, `ITransitionComponentProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `TColor \| null` | `null` | Couleur sélectionnée (v-model) |
| `menu` | `boolean` | — | État du menu (v-model:menu) |
| `menuProps` | `IMenuProps` | — | Props passées à `OrigamMenu` |
| `openOnClear` | `boolean` | — | Réouvre le menu lors du clear |
| `closeOnSelect` | `boolean` | `false` | Ferme le menu dès qu'une couleur est sélectionnée |
| `closeText` / `openText` | `string` | i18n keys | Label aria selon état menu |
| (+ TextField props) | — | — | `label`, `border`, `rounded`, `density`, etc. |

### Sorties

**Emits** : hérite de `ITextFieldProps` via `OrigamTextField`.

**v-model** : `modelValue`, `menu`.

**Slots** :

| Slot | Description |
|---|---|
| `prependInner` | Swatch de couleur (`OrigamSheet` bg-color = couleur courante ou `HSVtoCSS(COLOR_NULL)`) |
| `colorSelection` | Texte de la couleur sélectionnée |
| `prepend`, `append`, `loader`, `floatingLabel`, `label`, `prefix`, `suffix`, `appendInner`, `clear` | Délégués à `OrigamTextField` |

**Classes** : `.origam-color-picker-field`, `--active-menu`.

**Style** : `--origam-field---padding-start: 0` pour aligner le swatch contre le bord ; `.origam-field__prepend-inner > .origam-sheet` s'étire sur toute la hauteur du champ via `align-self: stretch`.

### Dépendances

- **Composables** : `useLocale`, `useVModel`, `useProps`, `useStyle`
- **Composants** : `OrigamTextField`, `OrigamMenu`, `OrigamColorPicker`, `OrigamSheet`, `OrigamTranslateScale`
- **Consts** : `COLOR_NULL`, `ORIGAM_FORM_KEY`
- **Enums** : `BLOCK`, `DENSITY`, `DIRECTION`, `TEXT_FIELD_TYPE`
- **Utils** : `forwardRefs`, `HSVtoCSS`, `matchesSelector`

### Comportement notable

Les props `rounded`, `border`, `borderColor`, `borderStyle`, `density`, `direction` sont **explicitement exclues** du forwarding vers `OrigamColorPicker` via la liste de filtre (`colorPickerProps`). Ce filtre évite que les defaults du champ (`rounded: true`, `border: true`) cascadent jusqu'à l'`OrigamSheet` du picker et créent un radius 24px visible dans le coin des carreaux du popup.

---

## `OrigamDatePicker`

**Fichier** : `packages/ds/src/components/DatePicker/OrigamDatePicker.vue`

**Rôle** : Sélecteur de date complet avec vues mois / mois-liste / années, navigation prev/next, contraintes min/max, support mono / multiple / range.

### Entrées (props)

`IDatePickerProps` étend `ICommonsComponentProps`, `IColorProps`, `IBorderProps`, `IRoundedProps`, `IElevationProps`, `IPaddingProps`, `IMarginProps`, `IPickerProps`, `IDatePickerControlsProps`, `IDatePickerMonthProps`, `IDatePickerMonthsProps`, `IDatePickerYearsProps`, `IDatePickerHeaderProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `string \| Date \| Array<string\|Date>` | — | Date(s) sélectionnée(s) (v-model) |
| `viewMode` | `TDateMode` | — | Vue active : `'month'`, `'months'`, `'years'` (v-model:viewMode) |
| `multiple` | `boolean` | — | Multi-sélection de dates |
| `range` | `boolean` | — | Sélection de plage |
| `month` | `number` | — | Mois courant (v-model:month) |
| `year` | `number` | — | Année courante (v-model:year) |
| `min` | `string \| Date` | — | Borne inférieure de sélection |
| `max` | `string \| Date` | — | Borne supérieure de sélection |
| `showWeek` | `boolean` | — | Affiche la colonne des numéros de semaine |
| `weeksInMonth` | `CALENDAR_STRATEGY` | `CALENDAR_STRATEGY.STATIC` | Stratégie d'affichage des semaines |
| `title` | `string` | `'origam.datePicker.title'` | Clé i18n titre du picker |
| `header` | `string` | `'origam.datePicker.header'` | Clé i18n header par défaut |
| `disabledMonth` / `disabledYear` / `disabledNext` / `disabledPrev` | `boolean` | — | Désactive les contrôles de navigation |
| `disabled` | `boolean` | — | Désactive tous les contrôles |

### Sorties

**Emits** : `update:modelValue`, `update:month`, `update:year`, `update:viewMode`.

**Slots** : `title`, `header` (scope : `{ header, transition }`), `default` (remplace controls + grille), `actions`.

**Classes** : `.origam-date-picker`, `--{viewMode}` (ex. `--month`, `--years`), `--show-week`.

**Largeur** : 328px (standard) ou 368px avec `showWeek`.

### Dépendances

- **Composables** : `useDate`, `useLocale`, `useVModel`, `useProps`, `useStyle`
- **Composants** : `OrigamPicker`, `OrigamDatePickerControls`, `OrigamDatePickerHeader`, `OrigamDatePickerMonth`, `OrigamDatePickerMonths`, `OrigamDatePickerYears`, `OrigamFade`, `OrigamTranslatePicker`, `OrigamReverseTranslatePicker`
- **Enums** : `CALENDAR_STRATEGY`, `DATE_MODE`
- **Utils** : `wrapInArray`

### Comportement notable

Le `headerTransition` bascule entre `OrigamTranslatePicker` et `OrigamReverseTranslatePicker` selon `isReversing`, qui est calculé en comparant la dernière date sélectionnée avec la précédente (`adapter.isBefore(before, after)`). La navigation prev/next wrape l'année quand on atteint janvier/décembre. Les contrôles prev/next sont désactivés automatiquement via `disabledControlers` quand la date courante touche les bornes `min`/`max`.

---

## `OrigamDatePickerField`

**Fichier** : `packages/ds/src/components/DatePickerField/OrigamDatePickerField.vue`

**Rôle** : Champ texte avec `OrigamDatePicker` dans un menu dropdown. Supporte les modes single, multiple (chips) et range.

### Entrées (props)

`IDatePickerFieldProps` étend `ITextFieldProps`, `ITransitionComponentProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `string \| Date \| Array<string\|Date> \| null` | `null` | Date(s) (v-model) |
| `menu` | `boolean` | — | État menu (v-model:menu) |
| `menuProps` | `IMenuProps` | — | Props `OrigamMenu` |
| `range` | `boolean` | `false` | Mode plage |
| `multiple` | `boolean` | — | Multi-sélection |
| `closeOnSelect` | `boolean` | `true` | Ferme le menu après une sélection (désactivé si multiple ou range) |
| `closableChips` | `boolean` | — | Chips avec bouton fermer |
| `chipProps` | `IChipProps` | — | Props chips |
| `openOnClear` | `boolean` | — | Réouvre le menu après clear |
| `closeText` / `openText` | `string` | i18n keys | Aria-label selon état |
| `appendInnerIcon` | `TIcon` | `MDI_ICONS.CALENDAR_OUTLINE` | Icône calendrier dans le champ |
| (+ TextField props) | — | — | `label`, `border`, `rounded`, etc. |

### Sorties

**Emits** : hérite de `ITextFieldProps`.

**v-model** : `modelValue`, `menu`.

**Slots** :

| Slot | Description |
|---|---|
| `rangeSelection` | Texte de la plage (scope : dates start/end formatées) |
| `selection` | Texte d'une date unique |
| `chip` | Rendu d'un chip de date (multi) |
| (tous les slots TextField) | Délégués à `OrigamTextField` |

**Classes** : `.origam-date-picker-field`, `--single` / `--range`, `--active-menu`.

### Comportement notable

En mode range, `selectedValues` n'expose que les deux extrêmes du tableau (first + last). Les dates sont formatées via `adapter.format(adapter.date(selection), 'keyboardDate')`. La logique de `closeOnSelect` est calculée par la computed `closeOnSelect` qui retourne `false` si `multiple` ou `range` est actif. Même exclusion que `OrigamColorPickerField` pour les props `rounded`, `border`, `density`, `direction` afin d'éviter la cascade jusqu'au picker interne.

---

## `OrigamCalendar`

**Fichier** : `packages/ds/src/components/Calendar/OrigamCalendar.vue`

**Rôle** : Composant calendrier complet supportant quatre vues (month, week, day, agenda), les événements récurrents (RRULE), le drag-select pour créer des plages, la navigation clavier, et la colorisation par catégorie ou par token d'intention.

### Entrées (props)

`ICalendarProps` étend `ICommonsComponentProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `view` | `TCalendarView` | `'month'` | Vue active (v-model:view) : `'month'`, `'week'`, `'day'`, `'agenda'` |
| `currentDate` | `Date \| string` | `new Date()` | Date d'ancrage (v-model:currentDate) |
| `events` | `IEvent[]` | `[]` | Liste des événements |
| `firstDayOfWeek` | `0..6` | `1` | Premier jour (1=lundi, 0=dimanche) |
| `timeFormat` | `TCalendarTimeFormat` | `'24h'` | Format des horaires week/day |
| `locale` | `string` | — | Tag BCP-47 ; sinon `<html lang>` → `navigator.language` → `'en-US'` |
| `selectable` | `boolean` | `true` | Active le drag-select |
| `eventColorKey` | `'category' \| 'color' \| string` | `'category'` | Propriété source de couleur |
| `categoryColors` | `Record<string, TIntent\|string>` | `{}` | Map catégorie → couleur |
| `weekendHighlight` | `boolean` | `true` | Teinte les samedis/dimanches |
| `showWeekNumbers` | `boolean` | `false` | Colonne numéros de semaine ISO |
| `dayStartHour` | `number` | `0` | Première heure visible (vues week/day) |
| `dayEndHour` | `number` | `24` | Dernière heure visible |
| `slotDuration` | `number` | `30` | Minutes par ligne de la grille timeline |
| `minDate` | `Date \| string` | — | Borne de navigation inférieure |
| `maxDate` | `Date \| string` | — | Borne de navigation supérieure |
| `disabledDates` | `Array<Date\|string> \| (d: Date)=>boolean` | — | Dates désactivées |

### Sorties

**Emits** :

| Emit | Payload | Description |
|---|---|---|
| `update:view` | `TCalendarView` | |
| `update:currentDate` | `Date` | |
| `event-click` | `(event: IEvent, originalEvent: MouseEvent)` | |
| `date-click` | `Date` | Click sur une cellule/slot |
| `range-select` | `(start: Date, end: Date)` | Fin de drag-select |
| `create-event-request` | `(start: Date, end: Date)` | Signal de création d'événement |
| `view-change` | `TCalendarView` | |
| `navigate` | `TCalendarNavigate` | |

**Slots** :

| Slot | Portée | Description |
|---|---|---|
| `header` | `{ view, title, canPrev, canNext, setView, navigate }` | Remplace toute la toolbar |
| `event` | `{ event, view, isPast, isToday }` | Rendu d'un événement |
| `day` | `{ date, events, isToday, isPast, isOutside, isWeekend, isDisabled }` | Cellule jour (vue month) |
| `dayHeader` | `{ date }` | En-tête de colonne (vue week) |
| `empty` | `{ view }` | État liste agenda vide |

**Expose** : `visibleDateRange`, `expandedEvents`, `navigate`, `setView`.

### Dépendances

- **Composable** : `useCalendar` (`packages/ds/src/composables/Calendar/calendar.composable.ts`)
- **Utils Calendar** : `buildDisabledPredicate`, `formatDate`, `formatTime`, `getWeekdayNames`, `isAfter`, `isBefore`, `isoWeekNumber`, `isPast`, `isSameDay`, `isToday`, `isWeekend`, `startOfDay`, `toDate` (`packages/ds/src/utils/Calendar/date.util.ts`), et `expandRecurrence`, `parseRRule` (`packages/ds/src/utils/Calendar/rrule.util.ts`)
- **Types** : `TCalendarView`, `TCalendarNavigate`, `TCalendarTimeFormat`, `TIntent`

### Comportement notable — ARIA

- Racine : `role="application"`, `aria-label="Calendar"`.
- Toolbar : `role="toolbar"`.
- Onglets de vue : `role="tablist"` + `role="tab"` + `aria-selected`.
- Grille mois : `role="grid"` + `role="row"` + `role="gridcell"`.
- En-têtes jours : `role="columnheader"`.
- Numéros de semaine : `role="rowheader"`.
- Événements : `role="button"` + `aria-label` incluant date+heure formatées localement.
- Cellules de day : `tabindex="0"` pour la navigation clavier.

### Comportement notable — navigation clavier

Handler `onKeydown` sur le root (garde si `INPUT` ou `TEXTAREA` focalisé) :

| Touche | Action |
|---|---|
| ArrowRight | +1 jour |
| ArrowLeft | -1 jour |
| ArrowUp | -7 jours |
| ArrowDown | +7 jours |
| PageUp | -1 mois |
| PageDown | +1 mois |

### Comportement notable — drag-select

Deux systèmes coexistent :

1. **Vue mois** : `mousedown` sur cellule → drag `monthDrag` → `mouseenter` étend la plage → `mouseup` (global window) émet `range-select` + `create-event-request`.
2. **Vues week/day** : `mousedown` sur slot → calcul des minutes via `pxPerMin` → drag → `mouseup` émet si la durée > `slotDuration`.

L'écouteur `mouseup` est attaché directement sur `window` (SSR-safe : condition `typeof window !== 'undefined'`) pour capter les fins de drag hors du composant.

### Comportement notable — colorisation des événements

La fonction `resolveColor` mappe les `TIntent` vers `var(--origam-color__action--{intent}---bg, ...)`. Les valeurs non-intent (hex, rgb, …) sont passées en brut comme `background-color`. Le CSS var dispose d'un fallback vers `--origam-color__feedback--{intent}---bg` pour couvrir les deux familles de tokens d'intention.

### Structure `IEvent`

| Champ | Type | Requis | Description |
|---|---|---|---|
| `id` | `string \| number` | Oui | Identifiant stable |
| `title` | `string` | Oui | Titre affiché |
| `start` | `string \| Date` | Oui | Début (ISO-8601 ou Date) |
| `end` | `string \| Date` | Non | Fin (omis pour `allDay`) |
| `allDay` | `boolean` | Non | Bannière all-day (week/day) |
| `description` | `string` | Non | Desc longue (agenda) |
| `category` | `string` | Non | Clé pour `categoryColors` |
| `color` | `TIntent \| string` | Non | Override direct de couleur |
| `rrule` | `string` | Non | RFC 5545 subset : FREQ + INTERVAL + COUNT/UNTIL + BYDAY |
| `metadata` | `Record<string,unknown>` | Non | Données libres pass-through |

### Exemple d'usage

```vue
<origam-calendar
  v-model:current-date="today"
  v-model:view="currentView"
  :events="events"
  :category-colors="{ meeting: 'primary', focus: 'success', personal: 'warning' }"
  :selectable="true"
  :show-week-numbers="true"
  @event-click="openEventDetail"
  @create-event-request="openCreateModal"
/>
```

---

## `OrigamCounter`

**Fichier** : `packages/ds/src/components/Counter/OrigamCounter.vue`

**Rôle** : Affiche un compteur de caractères ou de sélections, avec état d'erreur automatique quand `value > max`, animation de montée (`OrigamSlideY` par défaut), et gestion SSR via `useSsrBoot`.

### Entrées (props)

`ICounterProps` étend `ICommonsComponentProps`, `ITagProps`, `IPaddingProps`, `IMarginProps`, `IBorderProps`, `IRoundedProps`, `IColorProps`, `IElevationProps`, `IDensityProps`, `ITransitionComponentProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `value` | `string \| number` | `0` | Valeur courante |
| `max` | `string \| number` | — | Valeur max ; si dépassée, classe `--error` |
| `active` | `boolean` | — | Affiche ou masque (via `v-show` + transition) |
| `disabled` | `boolean` | — | Désactive l'état d'erreur automatique |
| `tag` | `string` | `'div'` | Élément racine |
| `transition` | `TTransitionProps` | `{ component: OrigamSlideY }` | Transition |
| `color` / `bgColor` | `TIntent \| string` | — | Via `useBothColor` → classes `.origam--color-{intent}` + inline |

### Sorties

**Slot** `default` : scope `{ counter: string, max, value }`.

**Classes** : `.origam-counter`, `--error` (quand `parseFloat(value) > parseFloat(max)` et `!disabled`).

**Style** : `color: currentColor`, `font-size: 12px`.

### Dépendances

- **Composables** : `useBothColor`, `useSsrBoot`, `useProps`, `useStyle`
- **Composants** : `OrigamTransition`, `OrigamSlideY`

### Comportement notable

- `isBooted` (de `useSsrBoot`) désactive la transition tant que le composant n'a pas été monté côté client, évitant un flash SSR.
- La valeur affichée est `${value} / ${max}` si `max` est présent, sinon `String(value)`.
- `parseFloat` est utilisé pour la comparaison d'erreur afin de gérer les chaînes numériques.

---

## `OrigamNumberFormat`

**Fichier** : `packages/ds/src/components/NumberFormat/OrigamNumberFormat.vue`

**Rôle** : Composant d'affichage pur qui formate un nombre via `Intl.NumberFormat` (zéro dépendance externe). Expose le résultat formaté et les parties structurées dans le slot scoped pour les rendus personnalisés.

### Entrées (props)

`INumberFormatProps` étend `ICommonsComponentProps`, `ITagProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `value` | `number \| string` | **Requis** | Valeur à formater (les strings sont coercées via `Number()`) |
| `format` | `TNumberFormatFormat` | `'decimal'` | Dialecte : `'decimal'`, `'currency'`, `'percent'`, `'unit'`, `'compact'` |
| `locale` | `TNumberFormatLocale` | `'auto'` | BCP-47 ou `'auto'` (résolution : `<html lang>` → `navigator.language` → `'en-US'`) |
| `currency` | `string` | — | Code ISO 4217 (requis si `format='currency'`) |
| `currencyDisplay` | `TNumberFormatCurrencyDisplay` | `'symbol'` | `'symbol'`, `'narrowSymbol'`, `'code'`, `'name'` |
| `unit` | `string` | — | Unité ECMAScript sanctionnée (requis si `format='unit'`) |
| `unitDisplay` | `TNumberFormatUnitDisplay` | `'short'` | `'short'`, `'long'`, `'narrow'` |
| `notation` | `TNumberFormatNotation` | — | `'standard'`, `'scientific'`, `'engineering'`, `'compact'` |
| `compactDisplay` | `TNumberFormatCompactDisplay` | `'short'` | `'short'`, `'long'` (si notation compact) |
| `minimumFractionDigits` | `number` | — | Min décimales |
| `maximumFractionDigits` | `number` | — | Max décimales |
| `minimumSignificantDigits` | `number` | — | Min chiffres significatifs |
| `maximumSignificantDigits` | `number` | — | Max chiffres significatifs |
| `useGrouping` | `TNumberFormatUseGrouping` | `true` | Séparateur de milliers |
| `signDisplay` | `TNumberFormatSignDisplay` | `'auto'` | `'auto'`, `'always'`, `'except-zero'`, `'negative'`, `'never'` |
| `tag` | `string` | `'span'` | Élément racine |

### Sorties

**Slot** `default` : scope `{ formatted: string, parts: Intl.NumberFormatPart[], value: number }`.

**Expose** : `formatted`, `parts`, `value` (numericValue).

**Classes** : `.origam-number-format`, `--{format}`.

**Style SCSS** : `font-variant-numeric: tabular-nums` pour aligner les colonnes de chiffres.

### Dépendances

- **Composable** : `useNumberFormat` (`packages/ds/src/composables/NumberFormat/number-format.composable.ts`)

### Comportement notable — ARIA compact

En mode compact (`format='compact'` ou `notation='compact'`), `aria-label` est renseigné avec la représentation longue via un `Intl.NumberFormat({ compactDisplay: 'long' })` temporaire. Les lecteurs d'écran lisent « 1,2 million » là où l'affichage visuel montre « 1,2M ». Pour les autres formats, `aria-label` est `undefined`.

### Exemple d'usage

```vue
<origam-number-format
  :value="1234567.89"
  format="currency"
  currency="EUR"
  locale="fr-FR"
/>
```

---

## `OrigamTextMask`

**Fichier** : `packages/ds/src/components/TextMask/OrigamTextMask.vue`

**Rôle** : Composant typographique qui applique un gradient / image / vidéo poster en arrière-plan de texte via `background-clip: text`. Le texte reste intact dans le DOM — la transformation est purement visuelle (invisible aux lecteurs d'écran et moteurs de recherche).

### Entrées (props)

`ITextMaskProps` étend `ICommonsComponentProps`, `ITagProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `text` | `string` | — | Texte à masquer (ignoré si le slot `default` est fourni) |
| `background` | `string \| IGradient` | **Requis** | Source du fond : objet `IGradient`, string CSS gradient, preset `gradient-{slug}`, ou `url(...)` |
| `animated` | `boolean` | `false` | Active une animation keyframe |
| `animationDuration` | `string` | `'3s'` | Durée CSS (`<time>`) |
| `animationType` | `TTextMaskAnimation` | `'pan'` | `'pan'`, `'rotate'`, `'pulse'`, `'zoom'` |
| `fontSize` | `string \| number` | `'inherit'` | Taille de police (numbers → px) |
| `fontWeight` | `string \| number` | `'inherit'` | Graisse |
| `fontFamily` | `string` | `'inherit'` | Famille de polices |
| `lineHeight` | `string \| number` | `1.1` | Interligne |
| `letterSpacing` | `string` | — | Espacement de lettres |
| `align` | `TBlockquoteAlign` | `'left'` | `'left'`, `'center'`, `'right'` |
| `tag` | `string` | `'span'` | Élément racine |

### Sorties

**Slot** `default` : contenu riche remplaçant `text` (multi-lignes, `<h1>`, `<span>`, `<em>`, …).

**Expose** : `resolvedBackground`, `hasSlot`.

**Classes** : `.origam-text-mask`, `--align-{align}`, `--{animationType}`, `--animated`.

**Propriétés CSS custom** injectées en inline : `--origam-text-mask---bg`, `--origam-text-mask---duration`, `--origam-text-mask---font-size`, `--origam-text-mask---font-weight`, `--origam-text-mask---font-family`, `--origam-text-mask---line-height`, `--origam-text-mask---letter-spacing`.

### Dépendances

- **Utils** : `resolveGradient` (`packages/ds/src/utils/Commons/gradient.util.ts`)

### Comportement notable — résolution du background

`resolveGradient` tente de convertir la prop `background` :

1. Si objet `IGradient` → génère une function CSS `linear-gradient|radial-gradient|conic-gradient`.
2. Si string correspondant à un preset → émet `var(--origam-gradient---{slug})`.
3. Sinon la string est utilisée telle quelle (CSS natif, `url(...)`).

### Comportement notable — animations

Quatre keyframes sont définis dans le SCSS scopé :

| Type | Keyframe | Description |
|---|---|---|
| `pan` | `origam-text-mask-pan` | `background-position` de 0% à 100%, `background-size: 200% 100%` |
| `rotate` | `origam-text-mask-rotate` | `filter: hue-rotate(0→360deg)` |
| `pulse` | `origam-text-mask-pulse` | `background-size` 100% ↔ 140% |
| `zoom` | `origam-text-mask-zoom` | `background-size` 100% → 220% (alternate) |

`prefers-reduced-motion: reduce` désactive toutes les animations via `animation: none !important; background-size: cover; filter: none`.

### Exemple d'usage

```vue
<origam-text-mask
  text="Design System origam"
  :background="{ type: 'linear', angle: 135, stops: [{ color: 'primary', position: 0 }, { color: 'success', position: 100 }] }"
  font-size="4rem"
  font-weight="700"
  animated
  animation-type="pan"
  animation-duration="4s"
/>
```

---

## `OrigamInlineEdit`

**Fichier** : `packages/ds/src/components/InlineEdit/OrigamInlineEdit.vue`

**Rôle** : Composant edit-in-place (« cliquer pour éditer ») avec machine d'états IDLE → EDITING → VALIDATING, validation synchrone et asynchrone, support multi-ligne, gestion complète du clavier, et boutons d'action optionnels.

### Entrées (props)

`IInlineEditProps` étend `ICommonsComponentProps`, `ITagProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `string \| number` | **Requis** | Valeur affichée et éditée (v-model) |
| `placeholder` | `string` | `'Click to edit'` | Placeholder et aria-label de l'état vide |
| `rules` | `TInlineEditRule[]` | — | Règles de validation (même contrat que TextField) ; évaluées en séquence |
| `validate` | `TInlineEditValidator` | — | Validateur callback (sync ou async) ; ne tourne que si toutes les rules passent |
| `autoFocus` | `boolean` | `true` | Auto-focus à l'entrée en mode édition |
| `selectOnFocus` | `boolean` | `true` | Sélectionne tout le texte au focus |
| `confirmOnBlur` | `boolean` | `true` | Confirme le draft au blur |
| `confirmOnEnter` | `boolean` | `true` | Confirme sur Enter (désactivé en multiline recommandé) |
| `cancelOnEscape` | `boolean` | `true` | Annule sur Escape |
| `disabled` | `boolean` | `false` | Désactive le composant |
| `multiline` | `boolean` | `false` | Utilise `OrigamTextareaField` au lieu de `OrigamTextField` |
| `trim` | `boolean` | `true` | Supprime les espaces avant/après la validation |
| `inputType` | `TInlineEditInputType` | `'text'` | Type HTML de l'input (non-multiline) |
| `loadingOnConfirm` | `boolean` | `false` | Applique la classe `--loading-on-confirm` pendant la validation async |
| `showActions` | `boolean` | `false` | Affiche les boutons Edit / Confirm / Cancel |
| `tag` | `string` | `'span'` | Élément racine |

### Sorties

**Emits** :

| Emit | Payload | Description |
|---|---|---|
| `update:modelValue` | `string \| number` | Après validation réussie |
| `edit` | — | Entrée en mode édition |
| `confirm` | `string \| number` | Après validation, avant update:modelValue |
| `cancel` | — | Annulation (draft discardé) |
| `validate-error` | `string` | Message d'erreur de validation |

**Expose** : `edit`, `confirm`, `cancel`, `isEditing`, `draft`, `error`, `isPending`.

**Slots** :

| Slot | Portée | Description |
|---|---|---|
| `display` | `{ value, edit, isEmpty, placeholder, disabled }` | Remplace le bouton d'affichage |
| `edit` | `{ value, setValue, confirm, cancel, error, isPending }` | Remplace entièrement la zone d'édition |
| `actions` | `{ confirm, cancel, isPending }` | Remplace les boutons confirm/cancel |

**Classes** :

- `.origam-inline-edit`
- `--editing` : mode édition actif
- `--disabled` : opacité 0.65, pointer-events none
- `--pending` : async validator en cours
- `--loading-on-confirm` : visual hook pendant la validation
- `--multiline` : textarea mode
- `--has-error` : erreur de validation présente
- `--show-actions` : boutons d'action visibles

### Dépendances

- **Composable** : `useInlineEdit` (`packages/ds/src/composables/InlineEdit/inline-edit.composable.ts`) — possède la machine d'états IDLE → EDITING → VALIDATING
- **Composants** : `OrigamBtn`, `OrigamTextField`, `OrigamTextareaField`
- **Enums** : `INLINE_EDIT_ACTION`, `MDI_ICONS`

### Comportement notable — machine d'états

`useInlineEdit` encapsule :

- `isEditing` (Ref<boolean>)
- `draft` (Ref<string>)
- `error` (Ref<string|null>)
- `isPending` (Ref<boolean>)
- Méthodes : `edit()`, `confirm()` (async — court `rules` puis `validate`), `cancel()`, `setValue()`

### Comportement notable — gestion du type

À l'émission de `update:modelValue`, le type original est préservé : si `modelValue` est un `number`, le draft string est recoercé via `Number(value)` (NaN → fallback string brut).

### Comportement notable — multiline

En mode multiline, `confirmOnEnter` est ignoré pour un simple Enter ; seul `Ctrl+Enter` / `Cmd+Enter` confirme. L'`OrigamTextareaField` est utilisé à la place de `OrigamTextField`.

### Comportement notable — blur async

Dans `handleBlur`, si `isPending.value` est vrai (validator async en vol), la confirmation sur blur est supprimée pour éviter un double-commit.

### Comportement notable — focus management

`watch(isEditing, async (next) => { if (!next) return; await nextTick(); el.focus(); if (selectOnFocus) el.select() })` s'assure que le focus et la sélection se font après que Vue a terminé le rendu du champ.

### Exemple d'usage

```vue
<origam-inline-edit
  v-model="pageTitle"
  placeholder="Cliquer pour nommer la page"
  :rules="[v => v.length >= 3 || 'Minimum 3 caractères']"
  :validate="async (v) => await checkUnique(v)"
  show-actions
  confirm-on-enter
  cancel-on-escape
/>
```

---

## Tableau récapitulatif

| Composant | Fichier principal | v-model | Dépendances clés | SSR | A11y native |
|---|---|---|---|---|---|
| `OrigamSelectionControl` | `SelectionControl/OrigamSelectionControl.vue` | `modelValue` | `useVModel`, `useTextColor`, `useDensity`, `v-ripple`, `ORIGAM_SELECTION_CONTROL_GROUP_KEY` | Oui | `<input>` natif + `aria-checked`, `aria-disabled`, `aria-label` |
| `OrigamSelectionControlGroup` | `SelectionControl/OrigamSelectionControlGroup.vue` | `modelValue` | `useVModel`, `OrigamDefaultsProvider`, provide/inject | Oui | `role="group"` |
| `OrigamCheckbox` | `Checkbox/OrigamCheckbox.vue` | `modelValue` | `OrigamInput`, `OrigamCheckboxBtn`, `useFocus` | Oui | Via `OrigamInput` + `<input type="checkbox">` |
| `OrigamCheckboxBtn` | `Checkbox/OrigamCheckboxBtn.vue` | `modelValue`, `indeterminate` | `OrigamSelectionControl`, `MDI_ICONS` | Oui | `aria-checked="mixed"` si indéterminé |
| `OrigamRadio` | `Radio/OrigamRadio.vue` | `modelValue` | `OrigamInput`, `OrigamRadioBtn`, `useFocus`, `useHover` | Oui | Via `OrigamInput` + `<input type="radio">` |
| `OrigamRadioBtn` | `Radio/OrigamRadioBtn.vue` | `modelValue` | `OrigamSelectionControl` | Oui | `<input type="radio">` |
| `OrigamSwitch` | `Switch/OrigamSwitch.vue` | `modelValue`, `indeterminate` | `OrigamInput`, `OrigamSelectionControl`, `OrigamSwitchTrack`, `useLoader` | Oui | `aria-checked="mixed"` si indéterminé ; skeleton `role="status"` |
| `OrigamSwitchTrack` | `Switch/OrigamSwitchTrack.vue` | — (sous-composant) | `useBackgroundColor` | Oui | N/A (sous-composant) |
| `OrigamSelect` | `Select/OrigamSelect.vue` | `modelValue`, `menu`, `search` | `OrigamTextField`, `OrigamMenu`, `OrigamList`, `useFilter`, `useItems`, `useScrolling` | Partiel | `role="combobox"`, `aria-haspopup`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `role="option"` |
| `OrigamColorPicker` | `ColorPicker/OrigamColorPicker.vue` | `modelValue`, `mode` | `OrigamPicker`, sous-composants canvas/edit/preview/swatches, `RGBtoHSV`, `HSVtoCSS` | Oui | Hérité des sous-composants |
| `OrigamColorPickerField` | `ColorPickerField/OrigamColorPickerField.vue` | `modelValue`, `menu` | `OrigamTextField`, `OrigamMenu`, `OrigamColorPicker`, `OrigamSheet` | Partiel | `aria-haspopup="colorpickerbox"` |
| `OrigamDatePicker` | `DatePicker/OrigamDatePicker.vue` | `modelValue`, `viewMode`, `month`, `year` | `OrigamPicker`, sous-composants controls/header/month/months/years, `useDate` | Oui | Hérité des sous-composants |
| `OrigamDatePickerField` | `DatePickerField/OrigamDatePickerField.vue` | `modelValue`, `menu` | `OrigamTextField`, `OrigamMenu`, `OrigamDatePicker` | Partiel | `aria-haspopup="datepickerbox"` |
| `OrigamCalendar` | `Calendar/OrigamCalendar.vue` | `view`, `currentDate` | `useCalendar`, utils Calendar (date.util, rrule.util) | Partiel (window global) | `role="application"`, `role="grid"`, `role="gridcell"`, `role="button"` sur événements, navigation clavier complète |
| `OrigamCounter` | `Counter/OrigamCounter.vue` | — (display) | `useBothColor`, `useSsrBoot`, `OrigamTransition` | Oui | N/A (affichage pur) |
| `OrigamNumberFormat` | `NumberFormat/OrigamNumberFormat.vue` | — (display) | `useNumberFormat`, `Intl.NumberFormat` | Oui | `aria-label` long-form en mode compact |
| `OrigamTextMask` | `TextMask/OrigamTextMask.vue` | — (display) | `resolveGradient` | Oui | Texte DOM intact, transparent CSS uniquement |
| `OrigamInlineEdit` | `InlineEdit/OrigamInlineEdit.vue` | `modelValue` | `useInlineEdit`, `OrigamTextField`, `OrigamTextareaField`, `OrigamBtn` | Oui | `aria-busy`, `aria-invalid`, `aria-describedby`, `role="alert"` sur erreur, focus management |
