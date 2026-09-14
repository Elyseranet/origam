# OrigamCheckbox

`<OrigamCheckbox>` is the high-level checkbox form atom. It wraps `<OrigamInput>` +
`<OrigamCheckboxBtn>` and wires validation, hint, error messages and the full
mixin set (density, color, rounded, border, elevation).

## Basic usage with v-model

```vue
<script setup lang="ts">
import { ref } from 'vue'
const accepted = ref(false)
</script>

<template>
  <OrigamCheckbox v-model="accepted" label="Accept terms" />
</template>
```

## Color

```vue
<template>
  <OrigamCheckbox color="primary"   label="Primary"   :model-value="true" />
  <OrigamCheckbox color="success"   label="Success"   :model-value="true" />
  <OrigamCheckbox color="danger"    label="Danger"    :model-value="true" />
</template>
```

## Density

```vue
<template>
  <OrigamCheckbox density="compact"     label="Compact" />
  <OrigamCheckbox density="default"     label="Default" />
  <OrigamCheckbox density="comfortable" label="Comfortable" />
</template>
```

## Rounded

```vue
<template>
  <OrigamCheckbox rounded="sm" label="Small radius" />
  <OrigamCheckbox rounded="lg" label="Large radius" />
  <OrigamCheckbox :rounded="true" label="Full round" />
</template>
```

`rounded` / `border` / `elevation` apply to the control's **state-layer box**
— the hit/hover area behind the glyph — not to the glyph itself. The
checked/unchecked mark is an icon-font character (`mdi-checkbox-*`,
`mdi-radiobox-*`) with no border-radius of its own.

::: warning `rounded` alone paints nothing at rest
The state-layer box has **no background and no border by default**. Changing
its `border-radius` is real — it is measurable in the computed style — but
there is nothing for the new corner to reveal, so a `rounded` prop passed on
its own produces **no visible difference at rest**.

`rounded` becomes visible when something paints that box:

- **on hover**, the state layer fills in and follows the radius;
- **combined with `border`**, which draws a ring on the box;
- **combined with `elevation`**, which casts a shadow shaped by the radius;
- with a custom background of your own.

This matters for theme authors: a theme block such as
`'origam-checkbox': { rounded: 'md' }` changes the hover halo, **not** the
resting silhouette of the checkbox. If you want the mark itself to be
square-with-rounded-corners rather than the DS glyph, that is a rendering
change (glyph → drawn CSS box), not a prop — see
[#241](https://github.com/Elyseranet/origam/issues/241).
:::

## States (disabled / readonly / indeterminate)

```vue
<template>
  <OrigamCheckbox label="Disabled"      disabled />
  <OrigamCheckbox label="Readonly"      readonly :model-value="true" />
  <OrigamCheckbox label="Indeterminate" indeterminate />
</template>
```

## Error & validation

```vue
<script setup lang="ts">
const rules = [(v: boolean) => v || 'You must accept']
</script>

<template>
  <OrigamCheckbox label="Accept" :rules="rules" />
</template>
```

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `default` | `{ id, messagesId, isDisabled, isReadonly, isValid }` | Replaces the inner `<OrigamCheckboxBtn>` entirely |
| `label` | — | Custom label content |
| `input` | `{ props, icon, textColorStyles, backgroundColorStyles, model }` | Custom visual control (the box itself) |

## Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `any` | Fired when the checkbox is toggled. Carries the **array** in accumulation mode. |
| `update:focused` | `boolean` | Focus state, emitted through `useFocus` → `useVModel(props, 'focused')`. `<OrigamCheckboxBtn>` does **not** emit it — it has no focus handling — so bind it here. |
| `focus` | `FocusEvent` | Native focus on the inner input |
| `blur` | `FocusEvent` | Native blur on the inner input |
| `click:label` | `MouseEvent` | Label element was clicked |

## Accumulation sur un v-model partagé

Plusieurs cases liées au **même** `v-model` de tableau accumulent :

```vue
<origam-checkbox v-model="selected" value="a" label="A" />
<origam-checkbox v-model="selected" value="b" label="B" />
<!-- selected === ['a', 'b'] une fois les deux cochées -->
```

> ⛔ **Ne passez pas `multiple` « pour être explicite ».** La coercition des
> props booléennes de Vue résout une prop *non passée* à la valeur concrète
> `false`, jamais à `null`. L'auto-détection du mode tableau teste
> `props.multiple == null && Array.isArray(model)` : un `false` non voulu
> **coupe l'accumulation** et chaque clic écrase le précédent, en silence.
> C'est le trajet exact du bug de perte de données #396.

## Design tokens

⛔ **Il n'existe AUCUN token `--origam-checkbox---*`.** `OrigamCheckbox` ne
peint pas la case : il compose `<OrigamInput>` (le chrome du champ) et
`<OrigamCheckboxBtn>` → `<OrigamSelectionControl>` (le controle). Les seules
variables que sa propre SCSS lit, et celles que le controle lit, sont
ci-dessous — verifiees une par une contre `assets/css/tokens/light.css` et
contre les `var()` du code.

Ce tableau annoncait auparavant `--origam-checkbox---density` et
`--origam-selection-control---icon-size` : **ni l'un ni l'autre n'existe** —
jamais declares, jamais lus. Un token documente mais inexistant coute une
session de debug a qui essaie de s'en servir.

| CSS variable | Valeur par defaut | Ce qu'elle regle |
|---|---|---|
| `--origam-input---density` | `0px` | Hauteur minimale de la ligne du champ (lu par la SCSS d'`OrigamCheckbox`) |
| `--origam-selection-control---density` | `0px` | Decalage de densite applique a la boite du controle |
| `--origam-selection-control---opacity-disabled` | `0.5` | Opacite de l'ensemble en etat desactive |
| `--origam-selection-control__wrapper---width` / `---height` | `40px` | Gabarit de la zone cliquable |
| `--origam-selection-control__input---border-radius` | `var(--origam-radius---full)` | Forme du controle **et** de son halo (le halo herite) |
| `--origam-selection-control__input---overlay-background-color` | `currentColor` | Couleur du halo |
| `--origam-selection-control__input---overlay-opacity-focus` | `0.12` | Opacite du halo au focus visible |
| `--origam-selection-control__input---backdrop-filter` | `none` | Filtre d'arriere-plan du controle |
| `--origam-selection-control__icon---opacity-active` | `1` | Opacite de l'icone en etat coche / erreur / desactive |
| `--origam-selection-control__icon---color-error` | `var(--origam-color__feedback--danger---fgSubtle)` | Couleur de l'icone en erreur |
| `--origam-selection-control__label---color-error` | idem | Couleur du label en erreur |
| `--origam-selection-control__label---opacity-disabled` | `1` | Opacite du label en erreur / desactive |

Reglez d'abord par les **props** (`color`, `density`, `rounded`, `elevation`,
`trueIcon` / `falseIcon`) ; ces variables sont le second recours, pour ce
qu'aucune prop n'exprime.
