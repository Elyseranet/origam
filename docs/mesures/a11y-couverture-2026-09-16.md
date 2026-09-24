# Suite a11y — couverture réelle et panne de fond (2026-09-16) — #573

Point de départ : « la suite a11y ne balaye aucun composant de la famille
Media ». Le point 2 du ticket disait que vérifier les **autres** familles
valait plus que corriger Media. Il avait raison au-delà de ce qu'il visait.

## ⛔ Le fait principal : la suite ne mesurait RIEN, sur AUCUN composant

Les 30 tests chargeaient une **page d'erreur**, n'y trouvaient aucun nœud
`origam-*`, concluaient « 0 violation » et **passaient**. Y compris `Btn` et
`Alert`, verts depuis mai 2026.

Mesure des quatre combinaisons d'URL, story `MediaVolumeControl`, chromium,
`histoire dev` sur un port isolé :

| URL | iframes | nœuds `origam-*` |
|---|---|---|
| `/story/stories-components-…` — **ce que la spec faisait** | 0 | **0** |
| `/stories/story/stories-components-…` (base seule) | 0 | **0** |
| `/story/components-stories-…` (id seul) | 0 | **0** |
| `/stories/story/components-stories-…` | 1 | **170** ✅ |

### Deux régressions indépendantes, chacune suffisante

| quand | commit | ce qui a changé | effet |
|---|---|---|---|
| **2026-05-27** | `70f1819f6` | passage en monorepo : les stories passent de `stories/` à `packages/stories/` | la racine de dérivation de l'id change, le segment `stories-` en tête disparaît — l'id codé en dur dans la spec devient faux |
| **2026-06-22** | `bf5c1bbcb` | `vite.base = '/stories/'` | toutes les routes sont préfixées |

La suite a été créée le **2026-05-24**. Elle a donc mesuré quelque chose
pendant **trois jours**.

⛔ Le commentaire de `histoire.config.js` affirme que « `histoire dev` is
unaffected (base only applies to the production build) ». **Mesuré faux** : le
serveur dev répond littéralement *« The server is configured with a public base
URL of /stories/ »*.

⛔ **La CI n'exécute `test:a11y` nulle part** (`grep` sur `.github/workflows/`)
— la porte pré-livraison décrite dans `CLAUDE.md` n'est adossée à aucun job.

## Couverture déclarée — le chiffre, pas l'impression

| | |
|---|---|
| stories du catalogue | **218** |
| balayées avant #573 | **30** (13,8 %) |
| balayées après #573 | **36** (16,5 %) |
| reconnues non balayées (baseline) | **182** |

Par famille (dossier de stories), avant #573 :

| couverture | familles |
|---|---|
| **zéro** | **72** |
| partielle | 13 |
| complète | 15 |

Les familles à couverture **partielle** sont les plus trompeuses — elles ont
l'air présentes : `Chart` **1/26**, `Breadcrumb` 1/3, `Btn` 1/3, `Card` 1/3,
`Checkbox` 1/3, `Radio` 1/3, `Snackbar` 1/3, `Avatar` 1/2, `Chip` 1/2,
`Dialog` 1/2, `Stepper` 1/2, `Switch` 1/2, `Treeview` 1/2.

Media n'avait rien de particulier : `Audio` 0/2, `Video` 0/1,
`MediaController` 0/1, `MediaScrubber` 0/1, `MediaVolumeControl` 0/1 — cinq
dossiers parmi les 72 à zéro.

### Pourquoi la liste n'a jamais suivi

Ce n'est **pas** une construction d'URL : les 30 slugs listés correspondaient
tous à un fichier réel (0 slug mort). C'est une **liste tenue à la main** dont
le commentaire promettait l'inverse de ce qu'il livrait — « *deliberately
explicit (not auto-discovered) so … a new untested component doesn't silently
disappear from the smoke pass* ». Un composant neuf ne *disparaissait* pas : il
n'*entrait* jamais. Rien ne comparait la liste au catalogue.

Croissance : **28 entrées (2026-05-24) → 30 (2026-08-27)**, +2 en trois mois,
pendant que le catalogue atteignait 218 stories.

## Les trois correctifs structurels

1. **Une seule dérivation d'URL.** La spec réutilise `storyIdForFile()` et
   `HISTOIRE_BASE_PATH` de `e2e/_support/histoire-manifest*` — les helpers que
   la suite e2e utilise déjà — au lieu de recopier le schéma à la main. Les
   stories sont désignées par leur **fichier**, plus par un slug recopié.
2. **`assertStoryRendered()`** refuse de rendre un verdict sur une page où
   aucun nœud `origam-*` n'a été trouvé. Un test a11y ne peut plus passer sur
   une page vide. L'attente est **pollée**, pas fixe : un `waitForTimeout(2500)`
   faisait échouer `Alert` et `Badge` (0 nœud à 2,5 s, 14 à 6 s) — une attente
   fixe transforme la charge machine en verdict produit.
3. **Test `inventaire`** : confronte `SWEPT_STORIES` + `UNSWEPT_STORIES` au
   disque. Échoue si une story n'est dans ni l'une ni l'autre, ou si une entrée
   ne correspond à aucun fichier. Le chiffre de couverture est imprimé à chaque
   run. `UNSWEPT_STORIES` est une **baseline à faire décroître**, pas une liste
   d'exemptions : aucune de ces 182 stories n'est déclarée conforme.

## Preuves

### Contrôle positif — la suite détecte bien une violation sur Media

Un `<button class="origam-a11y-probe">` sans nom accessible est injecté dans la
story `MediaVolumeControl`, Histoire est **redémarré** à chaque étape, et le
test de ce composant est rejoué :

| étape | résultat |
|---|---|
| sans sonde | **1 passed** |
| avec sonde | **1 failed** — `button-name` (critical) |
| sonde retirée | **1 passed** |

⛔ Le redémarrage est obligatoire : mesuré, le module transformé servi par
`histoire dev` **ne contient pas** la sonde même 60 s après l'écriture (cache
de transformation non invalidé sans client HMR connecté). Les deux premières
versions de ce contrôle mesuraient le module précédent et concluaient « rien
détecté » sur une suite qui n'avait jamais vu la sonde.

### Mutation — les deux régressions d'URL échouent désormais

| mutation | avant | après |
|---|---|---|
| retirer la base `/stories/` | vert (vacuité) | **rouge**, message du garde |
| remettre le préfixe `stories-` | vert (vacuité) | **rouge**, message du garde |
| retirer `assertStoryRendered` sur URL saine | vert | **vert** (le garde ne crie pas à tort) |

### Suite complète, port isolé 6050

`36 passed, 1 skipped` (`OrigamSelect`, `test.fixme` préexistant), 2,7 min.
Trois composants remontent désormais des violations non bloquantes —
`Breadcrumb`, `Card`, `Chart`, 1 chacune — là où tout affichait 0 avant.

## ⛔ Ce qui n'a PAS été mesuré

- **Les 182 stories de `UNSWEPT_STORIES`.** Elles ne sont pas balayées ; aucune
  n'est déclarée conforme. Le nombre est publié pour être réduit.
- **Les Variants autres que la première** de chaque story balayée. La suite ne
  regarde que `variantId=<id>-0`.
- **Les états interactifs** : hover, focus, ouverture d'overlay, lecture d'un
  média. Un composant peut être conforme au repos et fautif une fois ouvert.
- **`serious` reste non bloquant** (`IMPACT_FAIL_LEVEL = ['critical']`) —
  inchangé ici, mais ce seuil n'a jamais été éprouvé puisque rien n'était
  scanné. Les violations `serious` réelles du catalogue sont, à ce jour,
  **inconnues**.
- **La suite sous `E2E_STATIC=1`** (`histoire preview`). Seul `histoire dev` a
  été exercé. La base `/stories/` vaut aussi pour le build, mais ce n'est pas
  vérifié ici.
- **Le comportement en CI**, puisque la CI ne lance pas cette suite.
