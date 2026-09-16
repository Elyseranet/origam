# Brief Claude Code — Plugin Figma "Origam DS Sync"

> **Mission** : construire un plugin Figma pour la design system **Origam UI** qui (a) génère les composants Figma à partir des tokens existants, (b) exporte les Variables Figma vers le format de tokens du repo, (c) optionnellement importe les tokens depuis le repo vers Figma.
>
> Ce document est ton point d'entrée unique. Lis-le entièrement avant de coder.
>
> **Note post-monorepo (mai 2026)** : tous les paths `src/`, `tokens/`, `scripts/`, `docs/` ci-dessous sont désormais préfixés `packages/ds/` (lib) ou `packages/docs/` (doc), et le plugin lui-même vit dans `packages/figma-plugin/`. Voir [`CLAUDE.md`](./CLAUDE.md) → *Project structure* pour le layout complet.

---

## 0. Contexte de travail (À LIRE EN PREMIER)

Tu travailles à la racine du **repo Origam UI**. La commande `claude` a été lancée à la racine du repo, donc tout ce qui suit est relatif à ce répertoire.

### 0.1 Branche active

- **Branch** : `feature/figma-plugin-ds-sync` (branchée sur `develop`, qui contient le merge de `feature/design-tokens-foundation`).
- Avant toute chose, vérifie : `git branch --show-current` doit retourner `feature/figma-plugin-ds-sync`.

### 0.2 Disposition du repo (post-monorepo, mai 2026)

```
origam/                                            # racine du repo (cwd de Claude Code)
├── packages/
│   ├── ds/                                        # lib publiée sur npm sous `origam`
│   │   ├── src/components/<Name>/                 # sources Vue + SCSS de chaque composant
│   │   ├── tokens/                                # workspace Tokens Studio for Figma (DTCG)
│   │   │   ├── $metadata.json
│   │   │   ├── $themes.json
│   │   │   ├── primitive.json
│   │   │   ├── semantic/{light,dark}.json
│   │   │   └── component/<name>.json
│   │   └── scripts/
│   │       ├── tokens.config.mjs                  # config Style Dictionary
│   │       └── build-tokens.mjs                   # build pipeline
│   ├── docs/components/<Name>/                    # doc markdown par composant
│   ├── stories/                                   # Histoire (.story.vue)
│   ├── tests/                                     # TU (vitest) + e2e/a11y (playwright)
│   ├── marketing/                                 # Nuxt 4 marketing site
│   └── figma-plugin/                              # le plugin (cible de ce brief)
├── maquettes/                                     # SHOWCASE HTML (source de vérité visuelle)
│   ├── Origam Components.html
│   ├── design-canvas.jsx
│   ├── screens-foundations.jsx
│   ├── screens-forms.jsx
│   ├── screens-feedback.jsx
│   ├── screens-nav.jsx
│   ├── screens-data.jsx
│   ├── screens-layout.jsx
│   ├── screens-extras.jsx
│   └── screens-extras2.jsx
└── CLAUDE_CODE_BRIEF.md                           # ce fichier
```

### 0.3 Catalogue des composants v1 (vérifié sur disque)

| Composant | `.vue` source | tokens | maquette JSX | doc |
|---|---|---|---|---|
| Btn | `packages/ds/src/components/Btn/OrigamBtn.vue` | `packages/ds/tokens/component/btn.json` | `screens-extras2.jsx`, `screens-data.jsx` | `packages/docs/components/Btn/OrigamBtn.md` |
| TextField | `packages/ds/src/components/TextField/OrigamTextField.vue` | `packages/ds/tokens/component/text-field.json` | `screens-forms.jsx` | `packages/docs/components/TextField/OrigamTextField.md` |
| Textarea | `packages/ds/src/components/TextareaField/OrigamTextareaField.vue` | `packages/ds/tokens/component/textarea-field.json` | `screens-forms.jsx` | `packages/docs/components/TextareaField/OrigamTextareaField.md` |
| Select | `packages/ds/src/components/Select/OrigamSelect.vue` | `packages/ds/tokens/component/select.json` | `screens-forms.jsx` | `packages/docs/components/Select/OrigamSelect.md` |
| Checkbox | `packages/ds/src/components/Checkbox/OrigamCheckbox.vue` | `packages/ds/tokens/component/checkbox.json` | `screens-forms.jsx` | `packages/docs/components/Checkbox/OrigamCheckbox.md` |
| Radio | `packages/ds/src/components/Radio/OrigamRadio.vue` | `packages/ds/tokens/component/radio.json` | `screens-forms.jsx` | `packages/docs/components/Radio/OrigamRadio.md` |
| Switch | `packages/ds/src/components/Switch/OrigamSwitch.vue` | `packages/ds/tokens/component/switch.json` | `screens-forms.jsx` | `packages/docs/components/Switch/OrigamSwitch.md` |
| Card | `packages/ds/src/components/Card/OrigamCard.vue` | `packages/ds/tokens/component/card.json` | `screens-data.jsx` | `packages/docs/components/Card/OrigamCard.md` |
| Chip | `packages/ds/src/components/Chip/OrigamChip.vue` | `packages/ds/tokens/component/chip.json` | `screens-data.jsx` | `packages/docs/components/Chip/OrigamChip.md` |
| Avatar | `packages/ds/src/components/Avatar/OrigamAvatar.vue` | `packages/ds/tokens/component/avatar.json` | `screens-data.jsx` | `packages/docs/components/Avatar/OrigamAvatar.md` |
| Alert | `packages/ds/src/components/Alert/OrigamAlert.vue` | `packages/ds/tokens/component/alert.json` | `screens-feedback.jsx` | `packages/docs/components/Alert/OrigamAlert.md` |
| Dialog | `packages/ds/src/components/Dialog/OrigamDialog.vue` | `packages/ds/tokens/component/dialog.json` | `screens-data.jsx` | `packages/docs/components/Dialog/OrigamDialog.md` |
| Toolbar | `packages/ds/src/components/Toolbar/OrigamToolbar.vue` | `packages/ds/tokens/component/toolbar.json` | `screens-nav.jsx` | `packages/docs/components/Toolbar/OrigamToolbar.md` |
| Badge | `packages/ds/src/components/Badge/OrigamBadge.vue` | `packages/ds/tokens/component/badge.json` | `screens-data.jsx` | `packages/docs/components/Badge/OrigamBadge.md` |
| ~~Tabs~~ | **MISSING** — pas de `.vue` dédié, composé via Btn+BtnGroup. **Skip pour v1**, à noter dans le README plugin. | — | — | — |

Composants à fort volume (à scoper soigneusement) :
- **Btn** — 988 lignes
- **Select** — 1185 lignes

---

## 1. Tech & convention de nommage tokens

- **Tokens** : Style Dictionary v4 + `@tokens-studio/sd-transforms`. Config : `packages/ds/scripts/tokens.config.mjs`. Build : `pnpm -F origam tokens:build`.
- **Convention CSS** émise par le transform `origam/name/css` :
  - `primitive.color.neutral.0` → `--origam-color-neutral-0`
  - `semantic.color.surface.default` → `--origam-color-surface-default`
  - `component.btn.bg` → `--origam-btn---bg` (triple tiret entre block et prop)
  - `component.btn.success.bg` → `--origam-btn--success---bg` (double tiret pour states/intents)
- **Intents reconnus** par le transform : `primary`, `secondary`, `ghost`, `success`, `warning`, `danger`, `info`, `selected`.

`tokens/$themes.json` déclare 2 thèmes : **Light** + **Dark** (primitive + semantic/{light,dark} + tous component/*).

---

## 2. Décisions d'architecture validées

| # | Décision | Détail |
|---|---|---|
| 1 | **Plugin Figma** | manifest dev mode, TypeScript strict, esbuild |
| 2 | **Stratégie Tokens Studio** | l'utilisateur installe Tokens Studio for Figma et importe `tokens/`. Notre plugin se concentre sur **les composants** + **l'export** |
| 3 | **Périmètre v1** | 15 composants — listés section 0.3 |
| 4 | **Component Properties Figma** | `intent` (Variant), `variant` (Variant), `size` (Variant), `disabled`/`loading`/`icon-prepend`/`icon-append` (Boolean), `label` (Text), icônes (Instance Swap) |
| 5 | **Variables Figma avec modes** | une variable, deux modes (Light/Dark). Géré par Tokens Studio |
| 6 | **Export** | format JSON Tokens Studio (consommable par `build-tokens.mjs`). Bonus : SCSS Origam exact |
| 7 | **Sync inverse repo→Figma** | v2 |
| 8 | **Icônes** | pas de lib MDI livrée. Instance Swap slot |
| 9 | **Installation** | source TypeScript à compiler. README explique `pnpm install && pnpm -F @origam/figma-plugin build` puis "Plugins → Development → Import from manifest" |

---

## 3. Architecture cible du plugin

```
packages/figma-plugin/
├── README.md
├── manifest.json
├── package.json
├── tsconfig.json
├── esbuild.config.mjs
├── src/
│   ├── code.ts                    # main thread (Figma API)
│   ├── ui.html
│   ├── ui.tsx                     # React UI — onglets Generate / Export / Sync
│   ├── lib/
│   │   ├── variables.ts
│   │   ├── styles.ts
│   │   ├── messaging.ts
│   │   ├── tokens-types.ts
│   │   └── color.ts
│   ├── components/
│   │   ├── _shared.ts
│   │   ├── Btn.ts
│   │   ├── TextField.ts
│   │   ├── ... (1 par composant v1)
│   ├── exporters/
│   │   ├── tokens-studio.ts
│   │   └── scss-origam.ts
│   └── importers/
│       └── from-tokens-studio.ts  # v2
└── dist/                          # build output (gitignoré)
```

---

## 4. UI plugin (3 onglets)

### Generate
- Bandeau prérequis : "Install Tokens Studio for Figma and import `tokens/` first"
- Bouton "Detect Origam variables" → vérifie présence des Variables `Origam/Color/Semantic/...`
- 14 cases à cocher (par défaut toutes cochées)
- Bouton "Generate components" → crée chaque composant comme COMPONENT_SET dans une page `[Origam] Components`

### Export
- Sélecteur format : Tokens Studio JSON / SCSS Origam / W3C Design Tokens JSON
- Bouton "Export" → génère un .zip téléchargeable
- Le fichier suit la structure attendue par `build-tokens.mjs`

### Sync (v2)
- Affiche "Coming soon"

---

## 5. Composants — règles communes

Tout composant suit ce template :

1. **COMPONENT_SET** nommé `Origam/<Component>` avec :
   - `intent` / `variant` / `size` / `state` (Variant)
   - Toggles boolean : `disabled`, `loading`, `icon-prepend`, `icon-append`, …
   - Properties Text : `label`, `helper`, …
   - Properties Instance Swap : icônes
2. **Auto layout** sur tous les frames
3. **Tokens Figma Variables** via `setBoundVariable()` pour fill, stroke, corner radius, padding
4. **Text Styles** locaux (Origam/Body/MD, Origam/Title/LG, …)

Spécifications par composant : voir le brief originel utilisateur (section 4.3) — pour chaque composant, lire AVANT de coder :
1. `packages/ds/src/components/<Name>/Origam<Name>.vue`
2. `packages/ds/src/components/<Name>/_origam.<name>.scss` (ou inline dans le .vue)
3. `packages/ds/tokens/component/<name>.json`
4. `maquettes/screens-*.jsx` (cf. catalogue 0.3)
5. `packages/docs/components/<Name>/Origam<Name>.md` si présente

---

## 6. Exporter Tokens Studio JSON

Output mirroring `packages/ds/tokens/` :
```
tokens-export/
├── $metadata.json
├── $themes.json
├── primitive.json
├── semantic/{light,dark}.json
└── component/<name>.json
```

Format DTCG : `{ "$type": "color", "$value": "{color.neutral.0}" }`. Les alias `{...}` sont les références Tokens Studio.

---

## 7. Exporter SCSS Origam (bonus)

Génère `_origam.semantic.scss` au format `--origam-color-...` :
```scss
:root,
[data-theme="light"] {
  --origam-color-surface-default: #FFFFFF;
}
[data-theme="dark"] {
  --origam-color-surface-default: #0A0A0A;
}
```
(Reproduire le format du transform `origam/css/themed` dans `packages/ds/scripts/tokens.config.mjs`.)

---

## 8. Workflow utilisateur

1. Designer installe **Tokens Studio for Figma**
2. Tokens Studio pointe vers `packages/ds/tokens/` du repo
3. Tokens Studio crée les Variables Figma avec modes Light/Dark
4. Designer installe **Origam DS Sync** en dev mode
5. Onglet **Generate** → crée les 14 composants
6. Designer maquette une UI avec ces composants
7. Designer change un token (Tokens Studio) → toute la maquette se met à jour
8. Onglet **Export** → produit un zip JSON Tokens Studio
9. Dev consomme ce zip dans le repo, lance `pnpm -F origam tokens:build`

---

## 9. Stack

- **TypeScript strict**
- **Bundler** : esbuild
- **UI** : React 18
- **Tests** : optionnel v1
- **Lint/Format** : config minimale

---

## 10. Plan de livraison (phases)

| Phase | Contenu |
|---|---|
| 1 | Scaffold (manifest, package.json, tsconfig, esbuild, README skeleton) — **done** |
| 2 | UI plugin (3 onglets, postMessage typés) |
| 3 | Lib helpers (variables, styles, color, messaging, tokens-types) |
| 4 | Btn (composant le plus complexe — référence) |
| 5 | TextField + Textarea + Select + Checkbox + Radio + Switch |
| 6 | Card + Chip + Avatar + Alert + Dialog + Toolbar + Badge |
| 7 | Exporter Tokens Studio JSON |
| 8 | Exporter SCSS Origam |
| 9 | README final + screenshots + CHANGELOG + pre-delivery checks |

---

## 11. Pièges connus

1. **Variables Figma** ne supportent pas tous les types DTCG. `dimension`, `color`, `number`, `string`, `boolean` OK. `shadow` / `typography` (composé) → utiliser **Effect Styles** + **Text Styles**.
2. **Component Properties → Variant tradeoff** : exposer chaque dimension en Variant fait exploser la matrice. Btn = `intent` + `variant` + `size` en Variants, le reste en Boolean/Text/Instance Swap.
3. **Naming Variables Figma** : Tokens Studio expose en hiérarchie. Vérifier `primitive.color.neutral.0` → `Primitive/Color/Neutral/0`. Si différent, ajuster le plugin.
4. **Auto layout** partout. Padding/gap via Variables Figma. Aucune valeur hardcodée.
5. **Modes Light/Dark** : Tokens Studio crée 2 modes sur la collection Semantic. `setBoundVariable()` pointe vers la collection (pas un mode spécifique).
6. **Performance** : 14 × ~50 variants = ~700 frames. Faire les insertions par batch avec `figma.notify()` toutes les 50 frames.
7. **Dev mode** : Figma desktop required. Manifest `editorType: ["figma"]`.

---

## 12. Livraison finale

- Code source dans `packages/figma-plugin/`
- `dist/` build à jour
- README avec captures du workflow (ou GIF)
- `CHANGELOG.md` listant la matrice composants/variants livrée

**Ne pas livrer les 60 composants du premier coup. Livrer les 14 v1, demander validation, étendre ensuite.**
