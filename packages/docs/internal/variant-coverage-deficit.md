# Déficit de couverture des Variants — inventaire chiffré

Mesuré le 2026-08-16 sur `38be2928` (branche de travail `variant-coverage-audit`).
Tout chiffre de ce document a été recalculé ; aucun n'est repris d'une mesure
antérieure. Les outils de mesure sont décrits en fin de document, avec leurs
limites.

---

## 1. Le chiffre

| | |
|---|---|
| Stories du catalogue | **210** (1938 Variants) |
| Stories liées à ≥ 1 spec | **107** (1248 Variants) |
| Stories sans aucune spec | **103** (690 Variants — hors périmètre de ce document) |
| Stories intégralement visitées | **33** |
| Stories à trous | **74** |
| **Variants jamais visités** | **629** — 50,4 % des Variants des stories testées |

Répartition par nature du Variant :

| Nature | Nb | % du déficit |
|---|---:|---:|
| `Slots - …` | 278 | 44,2 % |
| `Events - …` / `Emit — …` | 170 | 27,0 % |
| `Functional` | 59 | 9,4 % |
| `Default` (playground) | 49 | 7,8 % |
| `Prop — …` (legacy) | 36 | 5,7 % |
| autres (matrices utilitaires, modes) | 17 | 2,7 % |
| `State` | 14 | 2,2 % |
| `Design` | 6 | 1,0 % |

**71 % du déficit porte sur les slots et les emits** — la surface de contrat,
c'est-à-dire précisément ce sur quoi un consommateur se branche. Ce n'est pas
un déficit de matrices visuelles.

---

## 2. Pourquoi les chiffres antérieurs ne sont pas réutilisables

La mesure de référence annonçait **235 Variants non visités sur 25 specs, dont
95 légitimes (6 specs `*-debug`), soit 140 de déficit réel**. Ce cadrage est
faux sur deux plans, et il l'était déjà avant les deux réparations de garde.

### 2.1 Les deux réparations n'ont RIEN changé à cette métrique

Contrairement à ce qui était supposé, la couverture n'a pas bougé :
`audit-variant-pins.mjs --coverage` rend toujours exactement **235 / 25 specs /
95 debug / 140**. Vérifié, et la raison est mécanique :

- `d65501a6` (« extracteur du garde des titres ») touche
  `audit-variant-titles.mjs` — **un autre outil** — plus `scroll.spec.ts`, qui
  n'a aucun Variant non visité.
- `0e85a8d8` (« 57 références aveugles → 0 ») ne modifie **que des
  commentaires** dans les specs. Vérification :
  `git show 0e85a8d8 -- <specs> | grep '^[+-]' | grep -v '^\s*[+-]\s*\(\*\|//\)'`
  ne rend **aucune ligne**. Les tableaux `N -> Titre` ont été corrigés, le code
  de navigation ne l'a pas été — il était déjà juste.

Documenter un index ne change pas quel Variant est visité. La métrique était
donc stable ; c'est le cadrage qui était à revoir.

### 2.2 Les specs `*-debug` ne sont pas du bruit à soustraire

Le premier filtre — écarter les 6 specs `*-debug` et leurs 95 Variants — est
l'erreur de méthode principale. L'auditeur compte **par spec**, alors que
plusieurs specs visent la même story. Une spec `-debug` ne « gaspille » pas de
la couverture : elle **en apporte**. En unionnant par story :

| Story | par spec | en union |
|---|---:|---:|
| `OrigamBtn` (btn + 2 debug) | 33 non visités | **0** |
| `OrigamTimeline` (timeline + debug) | 6 | **0** |
| `OrigamCheckbox` (`selection-control` + `checkbox`) | 9 | **0** |
| `OrigamPagination` (pagination + 3 debug) | 73 | **11** |

Soustraire les debug retirait 95 Variants du total tout en laissant leur
contribution de couverture hors du calcul.

### 2.3 Trois angles morts de l'extracteur gonflaient le reste

`audit-variant-pins.mjs` ne compte que les visites **par index**, et ignore
toute spec qui n'en fait aucune (`if (!idxs.length) continue`, l. 472). D'où
trois familles de faux positifs, chacune vérifiée sur un cas concret :

1. **Navigation par titre.** `textfield-mask.spec.ts` ouvre
   `Prop — mask (built-in patterns)` via
   `getByRole('link', { name: … })` — l'auditeur la déclare non visitée.
   87 des 175 specs utilisent `getByText`.
2. **Helper d'URL local.** `chip.spec.ts` construit ses URLs avec
   `sandboxUrl(idx)` ; l'auditeur ne reconnaît que `variantUrl(N)`. Les 15
   Variants de Chip étaient comptés non visités alors que la spec les visite
   **tous les 15** (`sandboxUrl(0)` … `sandboxUrl(14)`).
3. **Atterrissage implicite.** `audio.spec.ts` fait `page.goto(STORY)` sans
   `variantId` : Histoire rend le **premier** Variant. Story comptée 19/19 non
   visitée alors que l'index 0 l'est.

Enfin l'auditeur ne parcourt que `e2e/` : `vrt/btn-variant.spec.ts` lui est
invisible, d'où le faux positif `Btn — Prop — variant (VRT matrix)`.

---

## 3. Le tri par intention

### 3.1 Légitime à ne pas visiter

- **`Prop — variant (VRT matrix)` (OrigamBtn)** — réellement couvert par
  `packages/tests/vrt/btn-variant.spec.ts` (7 valeurs, captures commitées).
  **Seul cas** : la suite VRT couvre `OrigamBtn` et rien d'autre, et le dit
  explicitement (`vrt/VRT.md`). « Couvert par la régression visuelle » n'est
  donc **pas** un argument recevable pour les 13 autres composants portant
  `variant` — il n'y a pas de filet.
- **Les 36 `Prop — …` legacy** — doublons de contrôles déjà présents sur le
  Variant `Design` des mêmes stories (double structure en cours de migration).
  À traiter par **suppression du Variant**, pas par ajout de test.
- **17 emits couverts par les tests unitaires** (cf. § 3.2).

### 3.2 Emits — le tri est fait, et il est sévère

Les 170 Variants `Events` non visités ont été croisés avec la suite Vitest
(assertion `emitted('<nom>')`) :

- **17** ont tous leurs emits assertés en TU → couverts. Cas emblématique :
  **`OrigamPagination` `first`/`prev`/`next`/`last`**, que l'e2e ne déclenche
  jamais mais que `TU/components/Pagination/OrigamPagination.spec.ts` assère
  (l. 171-231). C'est la correction qui invalide l'hypothèse « 4 emits morts ».
- **153 restent sans aucune assertion connue**, ni e2e ni TU. Vérification
  complémentaire : `audio`, `video`, `treeview`, `select`, `data-table` ne
  contiennent **aucune** lecture de journal d'événements (`logEvent` /
  `[data-cy="log…"]` → 0 occurrence), donc l'emit n'est pas assérté ailleurs
  dans la spec.

Dont **69 entrées sur 29 composants qui n'ont aucun test unitaire du tout** —
pour ceux-là le Variant non visité est la seule couverture possible, et elle
est vide :

| Composant | Emits jamais déclenchés |
|---|---|
| `OrigamConfirmWrapper` | `update:modelValue`, `update:confirm`, `update:focused`, `click:prepend`, `click:append` |
| `OrigamChartCartesian` | `point-click`, `legend-click`, `series-toggle`, `drill`/`drill-up`, `zoom`/`reset-zoom` |
| `OrigamDatePicker` | `update:modelValue`, `update:month`, `update:year`, `update:viewMode` |
| `OrigamAvatarGroup` | `update:active`, `update:hover` |
| `OrigamExpansionPanels` | `update:modelValue`, `group:selected` |
| `OrigamSelectionControlGroup` | `update:modelValue` |
| `OrigamChipGroup` / `OrigamItemGroup` / `OrigamItem` | `update:modelValue` |
| `OrigamBtnToggle` / `OrigamWindow` / `OrigamAppBar` / `OrigamLazy` | `update:modelValue` |
| `OrigamContextualMenu` | `update:modelValue`, `contextmenu` |
| 13 stories `OrigamChart*` | `point-click`, `legend-click`, `series-toggle` |

Les composants **de groupe** (`SelectionControlGroup`, `ChipGroup`,
`ItemGroup`, `Item`, `BtnToggle`, `ExpansionPanels`) forment le cluster le plus
inquiétant : `update:modelValue` est leur raison d'être, et il n'est déclenché
nulle part.

Et **84 entrées sur des composants qui ONT un TU** mais où l'emit n'y est pas
assérté — notamment `OrigamAudio` (8 emits), `OrigamVideo` (11),
`OrigamDataTable` (7), `OrigamFileField` (7), `OrigamDatePickerField` (7),
`OrigamCalendar` (6).

### 3.3 Slots — tri structurel seulement (non terminé)

Les 278 `Slots - …` n'ont **pas** été triés un par un ; je ne prétends pas le
contraire. Ce qui est établi :

- Une grande part appartient à la famille **Field** (`TextField`,
  `PasswordField`, `Select`, `ColorPickerField`, `DatePickerField`,
  `FileField`, `Input`, `Field`) et concerne les mêmes slots génériques
  (`Prepend`, `Append`, `PrependInner`, `AppendInner`, `Clear`, `Label`,
  `FloatingLabel`, `Prefix`, `Suffix`, `Loader`, `Counter`, `Details`,
  `Messages`, `Message`, `Field`).
- `text-field.spec.ts` visite **tous** ses Variants de slot (30/36 visités) :
  le mécanisme de transfert de slots est donc prouvé une fois.
- **Question non tranchée** : ces slots sont-ils rendus par le même chemin de
  code pour tous les descendants, ou chaque composant re-déclare-t-il son
  transfert ? Tant que ce n'est pas vérifié, on ne peut pas déclarer les
  doublons légitimes. C'est le premier travail à faire sur ce lot, avant
  d'écrire la moindre spec.

---

## 4. Le playground `Default` — 49 stories, pas 6

La liste de six specs (`avatar-group`, `selection-control`, `bottom-nav-shift`,
`table`, `parallax`, `selection-control-group-layout`) est **exacte au niveau
spec** dans la fenêtre étroite de l'auditeur — je l'ai vérifiée. Deux
corrections :

- En union par story, `selection-control` **sort** de la liste :
  `checkbox.spec.ts` visite le `Default` de `OrigamCheckbox`. Il en reste 5
  dans cette fenêtre.
- À l'échelle du catalogue, **49 stories** n'ont jamais leur `Default` visité.

C'est le point d'entrée recommandé : le `Default` porte `v-bind="state"` et les
emits, c'est le Variant le plus riche, et c'est là qu'a dormi le faux-vert de
`avatar.spec.ts` (index 9 au lieu de 16). Extrait des 49 :
`FileField`, `Audio`, `Video`, `Calendar`, `DataList`, `ExpansionPanels`,
`Treeview`, `InlineEdit`, `CommandPalette`, `Window`, `Sheet`, `Bracket`,
`Table`, `Parallax`, `AvatarGroup`, `SelectionControlGroup`, `ChipGroup`,
`ItemGroup`, `BtnGroup`, `BtnToggle`, `SlideGroup`, `VirtualScroll`,
`Messages`, `TextMask`, `NumberFormat`, `Code`, `ColorGradient`,
`SnackbarItem`, `SnackbarGroup`, `AppBar`, + les 14 stories `Chart*`.

---

## 5. Candidats prioritaires — comportement douteux

Signalés nommément parce que l'absence de test y masque peut-être un défaut,
et non seulement un manque de couverture.

1. **Composants de groupe — `update:modelValue` jamais déclenché.**
   `OrigamSelectionControlGroup`, `OrigamChipGroup`, `OrigamItemGroup`,
   `OrigamItem`, `OrigamBtnToggle`, `OrigamExpansionPanels` : aucun TU, aucun
   e2e sur l'emit central. Un groupe qui n'émet pas est indétectable
   aujourd'hui — exactement le mode de panne d'ADR-005 sur
   `OrigamSelectionControl` (`:type="type"` rendu sans attribut, jamais
   d'`update:modelValue`).
2. **`OrigamAvatarGroup` — 13 Variants sur 14 non visités.** Seul `Design` est
   ouvert. `expandOnClick` / `expandOnHover` / `max` / `direction` ne sont
   exercés nulle part, et les emits `update:active` / `update:hover` non plus.
   La story la plus creuse du lot, sur un composant interactif.
3. **`OrigamBottomNav` — 8/9 non visités**, dont les trois emits. La spec
   s'appelle `bottom-nav-shift` et ne couvre que le décalage visuel.
4. **13 stories `Chart*` — `point-click` / `legend-click` / `series-toggle`
   jamais déclenchés**, aucun TU. Toute l'interactivité des graphiques repose
   sur trois emits que rien ne vérifie.
5. **`OrigamAudio` (9 emits) et `OrigamVideo` (11 emits).** Les deux ont un TU
   qui n'assère aucun de ces emits, et leur spec e2e ne lit aucun journal
   d'événements. Une partie est probablement non testable sans média réel — à
   arbitrer explicitement plutôt qu'à laisser en silence.

Aucun de ces points n'est un bug **constaté** : ce sont des zones où un bug ne
serait pas vu. La distinction est volontaire — je n'ai pas exécuté la suite
pour les confirmer.

---

## 6. Ordre de traitement proposé

L'ordre suit la règle de `docs/work-priorities.md` (le coût d'un défaut non vu
d'abord), et le rapport valeur/effort ensuite.

1. **Vérifier le chemin de transfert des slots de la famille Field.** Une
   journée de lecture décide du sort de ~150 des 278 Variants de slot. Aucun
   test écrit avant cette réponse.
2. **Emits des composants de groupe** (6 composants, ~8 emits). Coût faible,
   risque le plus élevé, et le précédent ADR-005 montre que le mode de panne
   est réel.
3. **Supprimer les 36 Variants `Prop — …` legacy** des stories à double
   structure. Réduit le déficit sans écrire un test, et supprime la source de
   décalage d'index qui a produit le faux-vert d'`avatar.spec.ts`.
4. **`AvatarGroup` et `BottomNav`** — deux stories quasi vides sur des
   composants interactifs.
5. **Les 13 stories `Chart*`** — trois emits identiques partout : un helper
   partagé couvre les 39 entrées d'un coup.
6. **`Default` des 49 stories** — en dernier pour l'écriture, mais à cadrer
   d'abord : c'est un Variant par story, mécanique, et il ferme la classe de
   faux-verts d'`avatar.spec.ts`.
7. **`Audio` / `Video`** — arbitrage à demander : ce qui est testable
   headlessly, et ce qui doit être documenté comme non testable.

---

## 7. Comment les chiffres ont été produits, et ce qu'ils ne disent pas

Deux scripts de mesure, hors dépôt (dans le scratchpad de session), réutilisant
verbatim l'extraction de slug et d'index de `audit-variant-pins.mjs` pour
rester comparables, et y ajoutant : les visites par titre, les helpers d'URL
locaux, l'atterrissage implicite sur le premier Variant, le parcours de `vrt/`,
et l'union **par story** au lieu de par spec.

Limites à connaître avant de réutiliser ces chiffres :

- **« Visité » ≠ « testé ».** La métrique compte l'ouverture d'un Variant, pas
  la présence d'une assertion. Un Variant visité peut n'être l'objet d'aucune
  vérification utile. Le déficit réel est donc **au moins** 629.
- Le tri des **slots** est structurel, pas individuel (§ 3.3).
- Le croisement des emits avec la suite TU repose sur la détection de
  `emitted('<nom>')` ; une assertion écrite autrement serait comptée comme
  absente. Les 17 cas couverts ont été trouvés ainsi, dont Pagination vérifié à
  la main.
- Les **103 stories sans aucune spec** (690 Variants) sont hors de ce
  périmètre. Le déficit total du catalogue est donc très supérieur à 629.
- Aucune suite n'a été exécutée pour produire ce document : c'est une analyse
  statique. Les comportements douteux du § 5 sont des hypothèses à confirmer
  par un test, pas des bugs constatés.
