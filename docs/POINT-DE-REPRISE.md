# Point de reprise — 2026-08-30, avant redémarrage machine

> Dire simplement **« reprends »**. Tout ce qui suit est vérifié, pas supposé.

---

## 1. État de `develop` — tout est poussé

| porte | valeur |
|---|---|
| gardes | **17/17** |
| lint | silencieux (`--max-warnings 0`) |
| tests unitaires | **5715 verts, 0 échec**, 5 expected-fail, 77 skipped |
| `audit:id-forwarding` | **0 `lost`**, PASS |
| `tokens:build` | succès, idempotent |
| arbre de travail | propre |
| `git stash` | **vide** |
| secrets non suivis dans les worktrees | **0** |

HEAD : `f36d0d32` — *Merge branch 'fix/a11y-clavier-2' into develop (#443 #390 #404 #494)*

---

## 2. ⛔ Ce qui est PERDU au redémarrage

**La passe e2e complète était en cours et n'a pas fini.** Son log vivait dans
`/tmp/e2e-reel-f36d0d32.log` (264 Mo) — répertoire vidé au redémarrage.

Ce qui a été sauvé avant la perte : `docs/mesures/e2e-echecs-chromium-partiel.txt`.

**État atteint** : chromium seul, **2146 lignes de test sur 134 specs**.
Firefox et webkit **jamais atteints** — Playwright enchaîne les moteurs, le run
n'était qu'au tiers environ.

**75 échecs uniques sur chromium**, concentrés sur 25 specs :

| spec | échecs |
|---|---|
| `expansion-panel.spec.ts` | 28 |
| `marketing-primary-nav.spec.ts` | 16 |
| `color-gradient.spec.ts` | 6 |
| `badge.spec.ts` | 3 |
| `audio.spec.ts` | 2 |
| 20 autres | 1 chacune |

⛔ **Ces 75 ne sont PAS qualifiés.** Avant de conclure quoi que ce soit :
1. `marketing-primary-nav` (16) cible le serveur Nuxt sur `:3000`, **pas Histoire** —
   si ce serveur n'était pas lancé, ces 16 sont un artefact du harnais, pas des
   défauts. Précédent : 1188 rouges de cette nature ont déjà été diagnostiqués.
2. `expansion-panel` (28) est massif et concentré — soit un vrai défaut de famille,
   soit une spec dont le harnais a cassé. Le garde `variant-titles` signalait
   d'ailleurs « 2 story slugs pour 12 index — l'index ne peut pas être attribué
   sans ambiguïté » sur cette spec précise.
3. **La première question est « est-ce que ça se reproduit ? »**, pas « quel moteur ».
   Un *artefact du run* est une catégorie à part entière (leçon de la campagne).

### Comment relancer

```sh
cd packages/tests
pnpm exec playwright test > /tmp/e2e-$(git rev-parse --short HEAD).log 2>&1
```

⛔ **Ne pas utiliser `pnpm -F @origam/tests test:e2e`** : le hook `pretest:e2e`
échoue sur le garde `variant-titles` et **bloque Playwright avant qu'une seule spec
ne démarre**, tout en rendant `exit code 0` à l'appelant. C'est le ticket #46, et
c'est un piège dans lequel je suis tombé aujourd'hui.

⛔ Avant de lancer : vérifier qu'aucun serveur périmé ne tient le port 6006
(`lsof -ti :6006`, puis `lsof -p <pid> | grep cwd` pour identifier le worktree
propriétaire). Un serveur appartenant au worktree d'un autre agent a déjà produit
un faux négatif (#517).

---

## 3. Le tableau des tickets

| | |
|---|---|
| bugs ouverts | **34** (69 ce matin) |
| requalifiés en arbitrage/enhancement | **8** |
| audités avec verdict rendu | **35** |
| fermés aujourd'hui | **~35** |

### Audits terminés
`#320 #335 #357 #370 #371 #383 #387 #388 #391 #399 #407 #411 #413 #419 #423 #429
#432 #434 #440 #468 #482 #503 #505 #507 #508 #524 #528 #530`

### Audit en cours (session pair `audit-lot-tokens-1`)
`#389 #393 #394 #405 #436 #479 #492 #514 #515`

Mesures partielles à **vérifier et non reprendre** :
- #389 : 10 annoncés → **1** réel (`bracket` seul)
- #436-B : 12 → **3**
- #393 : 13 fichiers / 215 vars → **18 / 281** (dont 42 conflits, 234 sans émission)
- #405 : 338 → **62** avant les correctifs du jour, **43** après
- #394 : **déjà réglé** par la grammaire de #435

### Correction en cours (session pair `audit-lot-composants-1`)
`#532` (docker-compose), `#423` (InfiniteScroll), `#524` (contraste), `#419` (Dialog/Divider/Drawer)

### Mesure en cours (session pair `audit-lot-archi`)
`#530` — livrable attendu : `docs/audit-530-conflits-root-token.md`

---

## 4. ⛔ Arbitrages qui attendent l'utilisateur

1. **#391** — `border` mort sur Btn. Trois architectures possibles (règle
   conditionnelle / spécificité des utilitaires montée / assumer et corriger le
   CLAUDE.md). **Contient un défaut concret corrigeable indépendamment** : la règle
   lit `--origam-btn-group---border-width`, le modificateur écrit
   `--origam-btn---border-width` — deux variables différentes.
2. **#399** — les 12 tokens `code.syntax.*` sont inatteignables par construction
   (shiki peint avec ses propres thèmes figés). Construire un thème shiki depuis
   les tokens origam, ou déprécier les 12.
3. **#426** — `colorScheme` sur `Candlestick` / `Heatmap` / `Map` : modèle de couleur
   binaire ou dégradé continu, une palette discrète rotative n'y a aucune
   application. Câbler = inventer un rendu ; retirer = rupture d'API.
4. **#426** — `ChartMap.legendPosition` : positionner la légende sur 3 ancrages
   exige une géométrie qu'il n'y a pas mandat d'inventer sans maquette.
5. **#320** — le statut HTTP 404 est bon, mais la branche `not_found` du template
   n'est probablement jamais atteinte (`createError({fatal:true})` déclenche la page
   d'erreur Nuxt générique). Fermer sur le statut, ou garder ouvert sur l'UX ?
6. **#528** — `data-table.json` / `list.json` / `tabs.json` émettent 61 noms morts.
   Deux directions opposées : renicher les blocs (zéro changement visuel) ou changer
   ce que lisent les composants (**rupture de l'API de theming publique**).

---

## 5. Ce qui n'a jamais été mesuré

- **`test:a11y` en global** — lancé par des agents sur leur périmètre uniquement.
- **Le classeur d'inspection** (colonnes C3/C4/C7 par composant). Aucun outillage de
  lecture n'existe dans le dépôt — pas de script gviz, rien. Si « le tableau »
  désigne ce classeur, **il faut son lien**. Dernier état connu, ancien : C7 (Doc)
  échouait sur 168 lignes sur 174, et 174 verdicts Composables étaient sans
  provenance.
- Les **36 consommateurs d'`OrigamContainer`** après le changement de breakpoints
  (#527) — analyse statique faite, rendu visuel non rejoué.

---

## 6. Pièges de méthode confirmés aujourd'hui — à ne pas réapprendre

- ⛔ **Un garde qui affiche `PASS` avec 638 violations baselinées** dit « rien de
  nouveau », **pas** « rien à corriger ».
- ⛔ **`getComputedStyle` sous jsdom ne résout JAMAIS `var()`** — il renvoie `16px`,
  une valeur plausible qui a déjà fait conclure faux (#398).
- ⛔ **Faux vert par cache Vite** : redémarrer Histoire après tout revert de fichier.
  Constaté deux fois.
- ⛔ **Un serveur Histoire peut appartenir au worktree d'un autre agent** — vérifier
  `lsof -p <pid> | grep cwd`, ou prendre un port dédié (#517).
- ⛔ **Réparer un nom de token rend lisible une valeur jamais validée.** Régression
  `OrigamCol` : 12px → 8px, livrée sans être vue.
- ⛔ **Le correctif évident a été faux trois fois aujourd'hui** : `useLink` (aurait
  cassé le routage), l'id d'`OrigamInput` (aurait créé des doublons chez 6
  consommateurs sur 11), `border` sur Btn (écrirait dans une variable que personne
  ne lit).
- ⛔ **Les chiffres des tickets vieillissent dans les DEUX sens** : 92→10, 5→87,
  46→117, 338→62, 41→9, 35→61.
- ⛔ **JAMAIS `git stash`** — `refs/stash` est partagé par tous les worktrees. Deux
  agents y ont échangé leur travail, 464 insertions y dormaient depuis des semaines.

---

## 7. Branches non mergées à connaître

| branche | contenu | état |
|---|---|---|
| `recover/no-emits-convention` | convention `INoEmits`/`INoSlots` récupérée d'un stash, 464 insertions | **non évaluée** — ticket #518 |
| `fix/439-keyboard-activation` | token `item-scale-rotate-transition` (Window) | non évaluée |
| `fix/501-typography-paint` | pilote SnackbarItem — ⛔ **va à contre-sens** de l'arbitrage #501 (câble ce qu'il fallait retirer) | à ne pas merger tel quel |
| `audit/tableau` | worktree de l'audit en cours | en cours |
