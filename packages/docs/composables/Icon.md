# Composables — Icon

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

3 symbole(s) exporte(s).

## `createIcons`

```ts
export function createIcons (options?: TIconOptions)
```

Construit la configuration d'icones fournie a l'application par
`createOrigam()` : jeu par defaut, jeux disponibles et alias. Les options du
consommateur sont fusionnees en profondeur sur les valeurs du DS, donc
declarer un alias n'efface pas les autres.

Le jeu par defaut est `mdi`, et les alias MDI sont pre-charges — c'est ce
qui permet d'ecrire `icon="mdi-account"` sans configuration prealable.

**Source** : `packages/ds/src/composables/Icon/icon.composable.ts`

**Consommateurs** (1) : `origam.ts`

## `useIcon`

```ts
export const useIcon = (props: Ref<TIcon | undefined>)
```

Resout une valeur de prop `icon` en composant a rendre : suit les alias,
choisit le jeu, et retombe sur `OrigamComponentIcon` quand la valeur est
absente.

⛔ LEVE si `createOrigam()` n'a pas installe la configuration d'icones
(`Missing Origam Icons provide!`). C'est deliberement bruyant : une icone
qui ne resout pas silencieusement laisserait un trou dans l'interface sans
que rien ne l'explique.

**Source** : `packages/ds/src/composables/Icon/icon.composable.ts`

**Consommateurs** (1) : `components/Icon/OrigamIcon.vue`

## `useIconAccessibility`

```ts
export function useIconAccessibility ()
```

⛔ issue #427 / #653 — shared accessibility contract for every icon leaf
(`OrigamIcon`, `OrigamClassIcon`, `OrigamComponentIcon`,
`OrigamLigatureIcon`). A glyph is decorative by default
(`aria-hidden="true"`).

⛔ issue #653 — this hook used to also set `role="button"` the moment a
`@click` listener was attached, and briefly grew a typed `clickable`
prop + a `vue-tsc`-enforced discriminated union
(`IAccessibleClickableProps`) to force an accessible name alongside it.
BOTH were removed:
- Zero components across the whole repo (DS, stories, docs, marketing)
  ever passed `clickable` — constraining an API nobody used just delays
  the real fix.
- `role="button"` was measured (not assumed) to be actively harmful:
  the icon family sets NO `tabindex` and NO keydown handler anywhere,
  so the element was announced as an interactive control a keyboard or
  switch-device user could never reach (`Tab` never lands on it) or
  activate (`Enter` / `Space` do nothing) — a WCAG 2.1.1 (Keyboard)
  violation, not a defensible ARIA fallback.
- Compared against `OrigamCard` (#392), the DS's own precedent for
  `role="button"` on a non-native element: Card pairs the role with
  `tabindex="0"` AND a keydown handler, and does so ONLY because its
  content model makes a native `<button>` illegal (Card renders flow
  content a `<button>` cannot legally contain). `OrigamIcon` has no
  such constraint — `OrigamBtn`'s icon-only mode (a REAL `<button>`,
  full keyboard support for free) is always available, so reproducing
  Card's tabindex+keydown machinery here would just duplicate `OrigamBtn`
  instead of removing the anti-pattern.

The DS's own rule already covered this: an interactive control is a
`<button>` or `<a href>` — "ARIA is a complement, never a replacement".
`<origam-icon @click="…">` remains POSSIBLE (nothing stops a consumer
attaching a plain DOM listener) but no longer announces itself as a
control it cannot behave as. This hook does not fabricate a label (a
guessed "icon button" string would itself be bad ARIA, see #622 — the
auto-label that overwrote a visible `<label for>`); it surfaces the
anti-pattern as a dev-time warning pointing at the real fix,
`origam-btn`, instead of asking for `aria-label` / `aria-labelledby`
on an element that was never going to be operable either way. See the
#653 ticket report for the full measurements, and #660 for
`OrigamSvgIcon`'s separate, still-open gap (never calls this hook at
all).

Reads `$attrs` only (`onClick`, `aria-label`, `aria-labelledby`) —
never a themable prop — so this carries no ADR-005 lazy-read
obligation. `useAttrs()` is safe to call from within a composable:
it resolves against whichever component is currently mid-`setup()`,
regardless of how many function calls deep it's invoked from.

**Source** : `packages/ds/src/composables/Icon/iconAccessibility.composable.ts`

**Consommateurs** (5) : `components/Icon/OrigamClassIcon.vue`, `components/Icon/OrigamComponentIcon.vue`, `components/Icon/OrigamIcon.vue`, `components/Icon/OrigamLigatureIcon.vue`, `utils/Commons/color.util.ts`

