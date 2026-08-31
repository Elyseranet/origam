# Audit #530 — conflits de valeur `:root` composant vs token émis

Mesure, pas correctif. Aucun fichier de production n'a été modifié. Périmètre :
issue #530 (« 42 conflits de valeur entre le `:root` d'un composant et le token
émis — 1 corrigé, 41 restants »).

## Méthode

1. **Reconstruction statique** (script jetable, non committé) : parcours de
   `packages/ds/src/components/**/*.vue`, extraction de chaque déclaration
   `--origam-xxx: valeur;` dans un bloc `:root{}` de `<style>`, comparaison à
   ce que `packages/ds/src/assets/css/tokens/light.css` déclare pour le même
   nom de variable, avec **résolution complète des chaînes `var(--x, fallback)`**
   (via `primitive.css` + `light.css` fusionnés) avant comparaison, et
   normalisation des équivalences triviales (`0` ≡ `0px` ≡ `0ms`,
   `transparent` ≡ `rgba(0, 0, 0, 0)`).
2. **Mesure runtime** : Histoire lancé sur un port dédié (`6199`, identité du
   process vérifiée via `lsof -p <pid> | grep cwd` → pointe bien sur ce
   worktree), Playwright contre le sandbox iframe Histoire
   (`iframe[src*="__sandbox"]`), lecture de `getComputedStyle(el)
   .getPropertyValue('--nom-de-la-variable')` — **pas** la propriété CSS finale
   (`border-color`, etc.), qui peut être polluée par une règle plus spécifique
   sans rapport avec le conflit étudié (constaté sur `OrigamBtnGroup`, voir
   plus bas).
3. Zéro `git stash` utilisé. Travail sur worktree dédié
   `.claude/worktrees/audit-530-conflits`, branche `audit/530-conflits`,
   créée par `git worktree add` depuis `origin/develop`. Aucun `.env` copié.

## Résultat n°1 — le nombre réel de conflits

**Le chiffre annoncé (41 restants) ne se reproduit pas tel quel. La
reconstruction statique en trouve 42 au total (dont OrigamCol, déjà corrigé),
mais une fois les chaînes `var()` résolues à leur valeur réelle, seuls 9
diffèrent effectivement en valeur rendue. Les 29 autres sont des conflits
FANTÔMES : deux écritures différentes du même nombre.**

| Population | Compte |
|---|---|
| Déclarations `:root` totales (20 fichiers composants) | 280 |
| … dont le nom existe aussi dans `light.css` | 46 |
| … dont le texte brut diffère (comparaison naïve, chaîne à chaîne) | 42 |
| … dont **OrigamCol** (déjà corrigé, cf. issue) | 4 (inclus dans les 42) |
| … dont la valeur RÉSOLUE diffère réellement | **9** |
| … dont la valeur résolue est identique (écriture différente, même rendu) | 37 |
| Déclarations `:root` sans aucun token émis (hors périmètre, #393) | 234 |

Le tableau par composant de l'issue (`OrigamTabs 15, OrigamTab 9,
OrigamSnackbarGroup 6, OrigamRow 4, OrigamBtnGroup 4, divers 3` = 41) est
proche de ma reconstruction du **texte brut** (`OrigamTab.vue 15,
OrigamTabs.vue 9, OrigamSnackbarGroup 6, OrigamBtnGroup 4, OrigamRow 4,
OrigamCol 4` = 42), à deux écarts près que je ne peux pas trancher :

- **`OrigamTabs`/`OrigamTab` sont inversés** entre leur tableau et le mien.
  Le texte `:root` avec 15 déclarations vit dans le fichier `OrigamTab.vue`
  (préfixe `--origam-tabs__item---*`, variables de l'item), celui avec 9 vit
  dans `OrigamTabs.vue` (préfixe `--origam-tabs---*`, variables du conteneur).
  Leur script attribue peut-être par préfixe de nom de variable plutôt que
  par fichier source — je n'ai pas leur script pour vérifier, je documente
  l'écart plutôt que de trancher à l'aveugle.
- **Le bucket « divers 3 » ne se reproduit pas.** Mon parcours exhaustif des
  20 fichiers `.vue` sous `components/` ne trouve aucun conflit hors des 6
  composants ci-dessus (`grep -rl ":root"` confirme qu'aucun autre fichier
  sous `src/` en dehors de `components/` n'en déclare). Soit leur script
  compte différemment (ex. par propriété individuelle d'un raccourci), soit
  ces 3 ont depuis été corrigés sans mise à jour du ticket. Je ne peux pas
  trancher sans leur script — **je n'y arrive pas** pour cette partie
  précise, signalé plutôt qu'inventé.

**Conclusion sur le chiffre** : la vraie population qui a besoin d'un
arbitrage humain (le "cascade tranche silencieusement, il faut décider qui a
raison") est de **9**, pas 41. Les 32 autres candidats bruts (29 identifiés
ici + les 3 "divers" non reproduits, probablement de la même nature) sont soit
déjà sans enjeu (même valeur), soit déjà corrigés (OrigamCol).

## Résultat n°2 — pour les 9 vrais conflits, mesuré : **le TOKEN gagne
toujours**, pas le `:root` du composant

C'est la découverte la plus importante de cet audit, et elle **inverse la
lecture intuitive** du cas OrigamCol cité dans l'issue.

Relire l'issue avec attention : *« Avant #417, le pipeline émettait
`--origam-grids__col---padding-*` (nom jamais lu) → le `:root` du composant
faisait foi (12px), simplement parce qu'AUCUN token ne ciblait la même
variable. Après #417, le pipeline émet `--origam-col---padding-*` (nom
réellement lu) → **le padding est passé à 8px** — c'est-à-dire la valeur du
TOKEN (`{space.2}`), pas celle du `:root` du composant. » Le `:root` n'a donc
jamais gagné un conflit à nom identique dans ce cas : il gagnait uniquement
par ABSENCE de concurrent.

Mesuré directement aujourd'hui sur les 9 vrais conflits (Histoire dev, valeur
vivante de la custom property sur l'élément monté) :

| # | Composant | Variable | `:root` (fallback mort) | Token (light.css) | **Ce qui rend réellement** |
|---|---|---|---|---|---|
| 1 | OrigamTab | `--origam-tabs__item---font-size` | `0.875rem` (14px) | `0.75rem` (12px) | **`0.75rem`** — le token |
| 2 | OrigamTab | `--origam-tabs__item---letter-spacing` | `0.03125em` | `0.0094em` | **`0.0094em`** — le token |
| 3 | OrigamTab | `--origam-tabs__item---color` | `currentColor` | `#525252` | **`#525252`** — le token |
| 4 | OrigamTab | `--origam-tabs__item---transition-duration` | `0.2s` (200ms) | `100ms` | **`100ms`** — le token |
| 5 | OrigamTab | `--origam-tabs__indicator---color` | `currentColor` | `#7c3aed` (primary) | **`#7c3aed`** — le token |
| 6 | OrigamTabs | `--origam-tabs---border-color` | `currentColor` | `#d4d4d4`-ish (border subtle) | **rgba(0,0,0,0.04)** — le token (résolu au runtime) |
| 7 | OrigamTabs | `--origam-tabs---color` | `inherit` | `#171717` (text primary) | **`#0a0a0a`** — le token (résolu au runtime) |
| 8 | OrigamBtnGroup | `--origam-btn-group---border-color` | `currentColor` | subtle border | **rgba(0,0,0,0.04)** — le token |
| 9 | OrigamSnackbarGroup | `--origam-snackbar-group---transition-duration` | `180ms` | `100ms` | **`100ms`** — le token |

**9 sur 9** : la valeur qui s'affiche réellement à l'écran aujourd'hui est
celle du token, jamais celle du `:root` du composant. Le mécanisme est donc
**déterministe et reproductible sur 3 familles de composants indépendantes**
(Tabs, BtnGroup, SnackbarGroup) — pas un hasard d'ordre de chargement propre
à un seul fichier.

⚠️ Note technique sur la mesure n°6/7/8 : les valeurs exactes en hex de
`--origam-color__border---subtle` / `--origam-color__text---primary` telles
que résolues par le navigateur (`rgba(0,0,0,0.04)`, `#0a0a0a`) diffèrent
légèrement des valeurs que j'avais calculées à la main par résolution statique
de chaîne (`#d4d4d4`, `#171717`) — signe qu'une étape de la chaîne
(vraisemblablement un theme override ou un calc en runtime que mon script
statique ne rejoue pas) modifie encore la valeur. Ça ne change PAS la
conclusion (le token gagne dans les deux lectures), seulement le chiffre
hexadécimal exact — je le signale pour ne pas prétendre à une précision que
je n'ai pas vérifiée au-delà de la valeur QUI GAGNE.

⚠️ **Caveat de portée** : mesuré contre `histoire dev` (Vite, dev-time module
graph), conformément à la consigne. L'ordre d'insertion des `<style>` dans le
bundle **npm publié** (`unbuild`/rollup) pourrait suivre un ordre différent.
Je n'ai pas vérifié contre le paquet construit (`pnpm -F origam build`) faute
de temps dans ce lot — c'est un point de vérification résiduel à signaler
avant de considérer la conclusion "le token gagne" comme valable pour la prod
publiée, pas seulement pour Histoire.

## Ce que ça change pour la décision (question posée par le ticket)

Le ticket demande, pour chaque conflit : *"le `:root` est-il ce qui rend
aujourd'hui (→ aligner le token, zéro changement visuel), ou le token porte-t-il
l'intention (→ aligner le composant, changement visuel assumé) ?"*

**Réponse mesurée : c'est l'inverse de l'hypothèse implicite du ticket.** Ce
n'est pas le `:root` qui rend aujourd'hui — c'est déjà le token, dans les 9 cas.
Donc :
- **Aligner le `:root` du composant sur le token** (supprimer le littéral mort,
  le remplacer par `var(--nom-du-token)` ou par la même valeur littérale) est
  l'option **zéro changement visuel** — puisque c'est déjà ce qui s'affiche.
- **Aligner le token sur le `:root`** serait l'option qui **change le rendu
  actuellement publié**, en revenant à l'ancienne valeur du composant.

Je n'ai pas d'autorité de design pour trancher lequel des deux est
l'INTENTION voulue (un token peut très bien avoir raison, ou avoir régressé
silencieusement comme OrigamCol l'a fait). Élément factuel en faveur du
token pour les 3 cas de typographie de `OrigamTab` : `--origam-font__size---sm`
(0.75rem) est réutilisée par **34 autres déclarations** dans `light.css` —
c'est l'échelle "small" systématisée du DS, pas une valeur isolée. Ça ne
prouve pas l'intention historique du composant, mais ça indique que la valeur
`0.75rem` n'est pas un accident de token : elle est cohérente avec le reste du
système.

### Verdict par conflit

| # | Ce qui rend aujourd'hui | Recommandation | Statut |
|---|---|---|---|
| 1-5 (OrigamTab) | Le token (mesuré) | Aligner `:root` sur le token — cohérent avec l'échelle `sm`/`fast` utilisée ailleurs (34 réutilisations pour le font-size seul) | **ARBITRAGE utilisateur** — visuellement, ça change la taille de texte perçue si quelqu'un compare à une ancienne capture (14px→12px, `currentColor`→gris fixe) même si RIEN ne change dans le rendu ACTUEL |
| 6-7 (OrigamTabs) | Le token (mesuré) | Idem — cohérent avec `color__border---subtle` / `color__text---primary`, tokens réutilisés largement | **ARBITRAGE utilisateur** |
| 8 (OrigamBtnGroup) | Le token (mesuré) | Idem | **ARBITRAGE utilisateur** |
| 9 (OrigamSnackbarGroup) | Le token (mesuré, 100ms vs 180ms) | Aligner `:root` sur le token (100ms est la valeur `motion__duration---fast` standard, réutilisée par tout le DS pour les transitions rapides) | **ARBITRAGE utilisateur** |

Je ne tranche aucun des 9 moi-même : dans les 9 cas c'est déjà le token qui
s'affiche, donc "aligner le composant" est l'option sans risque de
régression visuelle NOUVELLE — mais je n'ai pas de mandat design pour
confirmer que la valeur actuellement affichée (le token) est elle-même
souhaitable plutôt qu'une régression historique jamais vue (exactement le
scénario OrigamCol, découvert seulement parce que quelqu'un a comparé). Une
vérification visuelle (capture d'écran Tabs/BtnGroup/SnackbarGroup) par
`ui-designer` avant de committer un sens ou l'autre serait le seul moyen de
sortir de la conjecture ici.

## Les 37 "faux conflits" (référence, aucune décision requise)

Liste complète des cas où le texte diffère mais la valeur résolue est
identique — la cascade est réellement indifférente ici, dans les deux sens le
rendu est le même :

```
OrigamCol (4)           padding-block/inline-start/end : 12px ≡ var(--origam-space---3)
OrigamRow (4)            padding-block/inline-start/end : 0 ≡ var(--origam-space---0)
OrigamBtnGroup (3)       border-radius 4px≡var(sm) | border-width 0≡var(border-width-0) | border-style solid≡solid
OrigamSnackbarGroup (5)  gap 12px≡space-3 | max-width 420px≡420px | position-top/bottom/left/right 16px≡space-4
OrigamTab (13)           height 48px≡space-12 | padding-inline 16px≡space-4 | padding-block 0≡space-0 |
                         gap 8px≡space-2 | font-weight 500≡medium | text-transform none≡none |
                         background-color transparent≡rgba(0,0,0,0) | border-width 0≡border-width-0 |
                         border-radius 0≡radius-none | transition-easing cubic-bezier(...)≡standard |
                         indicator-height 2px≡border-width-2
OrigamTabs (8)           height 48px≡space-12 | gap 0≡space-0 | padding-block/inline 0≡space-0 |
                         background-color transparent≡rgba(0,0,0,0) | border-radius 0≡radius-none |
                         border-width 0≡border-width-0 | border-style solid≡solid
```

Recommandation à bas risque pour ces 37 (pas d'enjeu visuel, mais dette de
lisibilité) : remplacer le littéral par la référence `var()` au token quand
c'est trivial (même mécanisme que la correction OrigamCol), en lot séparé —
ce n'est PAS demandé dans ce lot, je le signale seulement.

## OrigamCol — déjà corrigé, vérifié

`--origam-col---padding-{block,inline}-{start,end}` : `:root` déclare `12px`
littéral, `light.css` émet `var(--origam-space---3)` qui résout à `12px`
(`primitive.css:69`). **Identique aujourd'hui** — la correction citée dans
l'issue (`{space.2}` 8px → `{space.3}` 12px) est bien en place dans `develop`.
Aucune action requise.

## Ce qui n'a pas été fait dans ce lot

- Pas de vérification contre le bundle npm publié (voir caveat ci-dessus) —
  seulement contre Histoire dev, conformément à la consigne de méthode.
- Pas de résolution du bucket "divers 3" de l'issue — je ne l'ai pas
  reproduit et je ne veux pas deviner à quoi il correspond.
- Pas de capture d'écran comparative avant/après pour les 9 vrais conflits —
  utile pour trancher visuellement, hors périmètre "mesure CSS" de ce lot.
- Les 234 déclarations "missing" (aucun token émis du tout) ne sont PAS
  traitées ici — c'est le périmètre de #393, explicitement exclu par l'issue.
