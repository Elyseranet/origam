# Visual regression testing (VRT) — mode d'emploi

Filet de non-régression **visuelle** et **déterministe**, établi en réponse
à ADR-005 (`packages/docs/internal/adr-005-variant-as-props-preset.md`,
branche `docs/adr-005-variant-props-preset`) : la migration `variant` (CSS →
préconfiguration de props) peut faire cesser silencieusement un variant de
peindre — aucun test de type ne voit ça, et sur 175 specs e2e une seule
appelait `toHaveScreenshot` (`e2e/icons.spec.ts:522`, sans image de
référence commitée). Ce dossier comble ce trou.

## Périmètre couvert (et ce qui ne l'est pas)

**Couvert** : `OrigamBtn`, ses 7 valeurs de `variant`
(`text` / `flat` / `elevated` / `tonal` / `outlined` / `plain` / `ghost`),
capturées au repos (pas d'interaction, pas de hover/active). C'est le
composant que la migration touche en premier (ADR-005, D7 — l'ordre place
`OrigamBtn` après le pilote `OrigamKbd`, mais Btn est le composant à plus
haut risque et celui explicitement cité dans le ticket qui a motivé cette
suite).

**Volontairement laissé de côté** :
- Les 13 autres composants qui portent `variant` (`OrigamBlockquote`,
  `OrigamField` et ses 6 descendants, `OrigamKbd`, `OrigamSkeleton`,
  `OrigamBracket`, `OrigamSliderField`, `OrigamAudio`, `OrigamTab`,
  `OrigamBtnGroup`). Étendre la suite à chacun est un travail répétitif
  mécanique une fois le pattern validé ici — mais élargir avant d'avoir
  prouvé que CE filet est fiable aurait produit une suite large et bruyante,
  l'inverse de ce qui est demandé. Prochaine étape logique : `OrigamKbd`
  (le pilote de l'ADR) puis `OrigamBtnGroup` (même vocabulaire `VARIANT`
  que Btn).
- Les états `hover` / `active` / `disabled` de chaque variant. Le risque
  identifié par l'ADR porte sur le rendu **au repos** («&nbsp;un variant qui
  cesse silencieusement de peindre&nbsp;»); les états interactifs ajoutent
  une dimension de non-déterminisme (transitions, timing) que ce lot ne
  traite pas.
- Les 3 autres navigateurs (Firefox, Webkit). CI comme cette suite ne
  tournent que sur Chromium — `test:a11y` applique déjà cette même
  restriction pour une raison analogue (axe-core / rendu indépendants du
  moteur), et démultiplier les captures par 3 moteurs triple le nombre de
  baselines pour un gain de signal quasi nul sur un composant CSS simple.

## Pourquoi une suite séparée (`vrt/`, pas `e2e/`)

Un diff de pixels n'est pas de la même nature qu'un `expect(locator)...`
qui échoue : le premier dit « quelque chose a visuellement changé », le
second dit « le comportement est cassé ». Les mélanger dans une seule
gate rend un run rouge ambigu. `playwright.vrt.config.ts` est une config
Playwright dédiée (même pattern que `playwright.a11y.config.ts`), avec son
propre `testDir`, son propre reporter, **zéro retry** — voir plus bas.

## Les 4 pièges traités

### 1. Écart de plateforme (macOS vs Linux CI)

**Décision : les baselines sont générées — et comparées en CI — DANS le
même conteneur Docker pinné, jamais sur la machine de l'auteur.**

```
mcr.microsoft.com/playwright:v<version @playwright/test>-jammy
```

La version de l'image suit exactement `packages/tests/package.json →
devDependencies["@playwright/test"]` (résolue dynamiquement par
`vrt-docker.sh`, jamais recopiée à la main) — c'est ce qui garantit que
« généré ici » et « comparé en CI » désignent le même environnement, y
compris quand la version de Playwright change.

Pourquoi pas une simple tolérance de pixels sur un run natif macOS/Linux ?
Testé implicitement en écrivant cette suite : la police `Inter` posée par
le design system (`--origam-font__family---sans: Inter, 'Helvetica Neue',
Arial, sans-serif`) n'est **pas** embarquée en `@font-face` — aucun fichier
`.woff`/`.woff2` dans `packages/ds` ni `packages/stories`. Le navigateur
retombe donc sur la police système, qui diffère entre macOS (Helvetica
Neue / San Francisco) et Ubuntu (Liberation Sans / DejaVu Sans selon
fontconfig) : les glyphes n'ont ni la même chasse ni le même antialiasing.
Une tolérance de pixels assez large pour absorber ça absorberait aussi une
vraie régression de padding/couleur — elle ne discrimine plus rien.
Le conteneur élimine le problème à la source plutôt que de le masquer.

Playwright nomme ses fichiers de référence avec un segment `{platform}`
par défaut (`btn-variant-flat-chromium-linux.png`). Parce que génération
ET comparaison CI tournent toutes les deux dans le même conteneur Linux,
`process.platform` vaut `linux` des deux côtés et les noms de fichiers
correspondent sans configuration `snapshotPathTemplate` custom. Un run
natif sur macOS produirait des `*-darwin.png` — gitignorés (racine
`.gitignore`) pour qu'un `--update-snapshots` lancé par erreur en local ne
puisse jamais atterrir dans un commit.

### 2. Non-déterminisme du rendu

- `toHaveScreenshot(..., { animations: 'disabled', caret: 'hide' })` —
  gèle les animations/transitions CSS à leur état final avant la capture
  (déjà le défaut Playwright, explicité ici pour la lisibilité).
- Le Variant story ciblé (`Prop — variant (VRT matrix)`,
  `OrigamBtn.story.vue`) est **statique** : pas de `HstSelect`, pas
  d'icône (`prependIcon`/`appendIcon`), pas de `loading`, pas de contenu
  aléatoire. Chaque bouton porte un `data-cy` fixe.
- `document.fonts.ready` est attendu avant toute capture — même en
  l'absence de webfont custom, ça couvre l'éventualité où le user-agent
  charge une police système de façon asynchrone.
- `retries: 0` dans `playwright.vrt.config.ts` — voir plus bas, ce n'est
  pas un oubli.

### 3. Le double-montage Histoire

Voir `packages/tests/e2e/KNOWN_LIMITATIONS.md` pour le détail : chaque
story s'exécute deux fois (document Histoire principal + iframe sandbox),
pontées par un `postMessage` asynchrone. Conséquence directe pour cette
suite : **on ne capture jamais un état atteint par interaction rapide**
(frappe, clic, drag) — uniquement le rendu au repos d'un Variant statique,
navigué directement par `variantId` (pas de clic sur un contrôle). C'est
précisément le type de capture pour lequel la limitation documentée ne
s'applique pas : il n'y a pas de course entre deux arbres réactifs
puisqu'il n'y a pas de mutation d'état après le montage initial.

### 4. Le poids des images

- Chaque capture cible un `data-cy` précis (`locator.toHaveScreenshot`),
  pas la page entière — un bouton fait quelques Ko en PNG, une page
  complète en ferait des centaines.
- 7 baselines pour ce lot (une par valeur de `variant`), sur un seul
  navigateur (chromium) — pas de multiplication par moteur ni par thème.
- **Cycle de renouvellement** : une baseline ne se met à jour que par un
  geste explicite (`pnpm test:vrt:docker:update`, ci-dessous), jamais
  automatiquement. Le diff du/des `.png` doit être revu (ouvrir l'image,
  confirmer que le changement est le changement *voulu*) avant d'être
  commité — au même titre qu'un changement de code.

## Un détail qui a failli casser la suite existante

`OrigamBtn.story.vue` compte 15 `<Variant>` avant ce lot ; `e2e/btn.spec.ts`
(GREEN_SPECS, actuellement vert en CI) navigue vers plusieurs d'entre elles
par **index numérique** (`variantUrl(5)` → `Events - click`, `variantUrl(14)`
→ `Default`, etc. — recette documentée en tête de ce fichier). Une première
version de ce lot insérait la nouvelle Variant `Prop — variant (VRT matrix)`
au milieu du fichier (juste après `Prop — color & bgColor`), ce qui décalait
de +1 l'index de tout ce qui suit — cassant silencieusement 10 tests
`btn.spec.ts` (ils auraient continué à "passer" mais en pointant vers la
mauvaise Variant, un faux-positif pire qu'un échec franc). Repéré avant
commit en grep-comptant les `<Variant` avant/après l'édit, pas par un run
qui aurait échoué bruyamment. **La nouvelle Variant est donc ajoutée en
DERNIÈRE position** (index 15, après le Playground `Default`) — ce qui
déroge à l'ordre canonique documenté dans `CLAUDE.md` (§ *Story file
structure*, qui veut `Default` en dernier) mais préserve la stabilité des
15 index existants, contrainte plus dure ici qu'une convention d'ordre. Si
`btn.spec.ts` est un jour réécrit pour naviguer par titre plutôt que par
index (la doc en tête du fichier appelle déjà l'utilisation de `getByText`
comme filet côté clic manuel), cette Variant peut être déplacée à sa place
canonique (juste après `Prop — color & bgColor`) sans risque.

## Lancer la suite

**Ne jamais lancer `pnpm -F @origam/tests test:vrt` nativement pour en
tirer un verdict** (macOS/Windows) — les baselines commitées sont pour
Linux, un run natif macOS échouera par différence de police, pas par
régression réelle. Utiliser l'un des deux chemins ci-dessous.

### En local (recommandé — via Docker, même image que la CI)

```bash
pnpm -F @origam/tests test:vrt:docker
```

Nécessite Docker Desktop (ou équivalent) démarré. Le script
(`packages/tests/vrt/vrt-docker.sh`) :
1. résout la version `@playwright/test` installée et pin l'image
   `mcr.microsoft.com/playwright:v<version>-jammy` ;
2. isole le `node_modules` du conteneur du `node_modules` hôte (volumes
   anonymes sur chaque dossier `node_modules` du monorepo) — un
   `pnpm install` frais tourne DANS le conteneur, jamais sur les binaires
   macOS de l'hôte ; un volume nommé (`origam-vrt-pnpm-store`) cache le
   store pnpm entre deux runs pour ne pas re-télécharger le registre à
   chaque fois ;
3. build les tokens + le Histoire statique (mêmes commandes que le job CI
   `test-e2e`) ;
4. lance `playwright test --config=playwright.vrt.config.ts`.

### En CI

Job dédié `vrt` dans `.github/workflows/ci.yml`, **séparé** du job
`test-e2e` (GREEN_SPECS) : `container: mcr.microsoft.com/playwright:v<...>-jammy`
— le runner GitHub Actions exécute directement DANS le conteneur pinné
(pas de `playwright install --with-deps` sur l'OS de l'hôte du runner, qui
introduirait une variable de plus : quelle version de fontconfig/Ubuntu le
runner `ubuntu-latest` embarque exactement, question qui change au fil du
temps sans que ce repo ne le décide). Voir la section CI plus bas.

## Lire un échec

Un run VRT rouge signifie : un pixel du bouton capturé diffère de la
baseline commitée, au-delà de la tolérance par défaut de Playwright
(comparaison perceptuelle pixelmatch, pas un diff naïf — un antialiasing
sub-pixel isolé ne déclenche pas un échec, un changement de couleur/
padding/ombre si).

1. `pnpm -F @origam/tests test:vrt:report` (ou télécharger l'artifact CI
   `playwright-report-vrt`) ouvre le rapport HTML avec, pour chaque test
   en échec, l'image attendue, l'image obtenue, et le diff pixel-à-pixel
   en surimpression.
2. Si le changement est un **bug** (régression involontaire) : corriger le
   composant/la story, relancer `pnpm test:vrt:docker` jusqu'au vert. Ne
   PAS mettre à jour la baseline pour faire passer un bug.
3. Si le changement est **voulu** (nouvelle valeur de design assumée) :
   voir la section suivante.

## Preuve que le filet détecte (et ce qu'elle a révélé)

Vérifié en pratique (pas supposé) : `&--variant-outlined { background-color:
transparent !important; }` remplacé temporairement par une couleur pleine
(`#e0245e`) dans `OrigamBtn.vue`, suite relancée via `pnpm test:vrt:docker`
→ **1 échec (`outlined`), 6 verts** (aucun faux positif sur les variants non
touchés), diff PNG lisible à l'œil dans le rapport. Le fichier restauré à
l'identique (`git diff` vide), la suite repasse **7/7 vert**.

**Note utile pour la suite** : une première tentative de démonstration sur
`&--variant-tonal` (en forçant `background-color: transparent` là où le
token résout normalement vers `--origam-color__surface---overlay`) **n'a
PAS été détectée** — testé, pas supposé. Cause : sur le thème par défaut
(non sombre), ce token résout vers un gris quasi-blanc, visuellement
indissociable du fond blanc de la page à l'œil ET pour l'algorithme de
comparaison pixel de Playwright. Ce n'est pas un défaut du filet — c'est un
rappel que **la sensibilité de détection dépend du contraste réel entre
l'état correct et l'état régressé**, pas seulement de l'existence d'une
capture. Si une régression future sur `tonal` doit rester détectable à coup
sûr, envisager un fond de page à contraste connu (gris moyen) plutôt que le
blanc par défaut d'Histoire — non fait ici pour ne pas complexifier le
premier lot, à reconsidérer si un futur échec silencieux sur `tonal` est
constaté.

## Accepter un changement voulu (mettre à jour une baseline)

```bash
pnpm -F @origam/tests test:vrt:docker:update
```

Puis :
1. `git diff --stat packages/tests/vrt/` — vérifier que seuls les
   `.png` du/des variant(s) réellement modifié(s) bougent. Si un variant
   que vous n'avez pas touché change aussi, c'est un signal qu'autre chose
   a régressé ailleurs (token partagé, composable transversal) — enquêter
   avant de commiter.
2. Ouvrir chaque `.png` modifié et confirmer visuellement que c'est le
   changement voulu.
3. Committer le(s) `.png` **dans le même commit** que le changement de
   code qui les justifie, avec un message qui dit *pourquoi* le rendu a
   changé (pas juste « update snapshots »).

## CI — comment ça s'insère

`.github/workflows/ci.yml`, job `vrt`, indépendant du job `test-e2e` :
- ne bloque **pas** le job `test-e2e` (GREEN_SPECS) ni l'inverse — un échec
  visuel sur `OrigamBtn` n'empêche pas de vérifier que les autres
  composants fonctionnent, et réciproquement ;
- tourne dans le conteneur pinné (voir ci-dessus) ;
- publie le rapport HTML en artifact (`playwright-report-vrt`) pour lecture
  post-mortem, comme le job `test-e2e` le fait déjà pour son propre rapport.

Ce job **bloque le merge** (requis au même titre que les autres checks CI)
— c'est le sens même de « filet de régression » : un filet qu'on peut
contourner en l'ignorant n'en est pas un. La contrepartie de ce choix est
la discipline de mise à jour ci-dessus : sans le geste documenté, ce gate
devient l'obstacle que l'on contourne (`--no-verify`, revert du job) plutôt
que le filet qu'il doit être — d'où le soin mis à documenter comment
l'accepter proprement.
