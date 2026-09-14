# Passe e2e : serveur Histoire en dev contre statique prebuild

Mesure du 2026-08-31, meme commit, meme machine, chromium, suite complete.
La seule variable est le serveur que les specs attaquent.

| | `histoire dev` (live) | `histoire preview` (prebuild) |
|---|---|---|
| duree | **53,9 min** | **15,7 min** |
| passed | 2558 | 2561 |
| failed | **7** | **2** |
| skipped | 42 | 44 |

Commandes :

```sh
# lent, ce que faisaient les passes locales
cd packages/tests && pnpm exec playwright test --project=chromium

# rapide, ce que fait le CI depuis toujours
pnpm -F @origam/stories build
cd packages/tests && E2E_STATIC=1 pnpm exec playwright test --project=chromium
```

## Ce que la mesure etablit

**3,4x plus rapide, et la plupart des specs « flaky » cessent de l'etre.**
Contre le serveur de dev, chaque spec paie une compilation Vite a froid par
story ; les workers paralleles se privent mutuellement de CPU. Les echecs qui
en decoulent sont des timeouts uniformes `toBeVisible` / `page.goto` — ils
ressemblent trait pour trait a des defauts produit, et n'en sont pas.

`playwright.config.ts` le documentait deja dans le commentaire de son
`webServer`. Le CI a toujours fait juste ; seules les passes locales prenaient
le chemin lent.

## Le piege du deplacement de flake

`textarea-richtext.spec.ts` echouait 4 fois sous charge. Son timeout est passe
de 5 s a 12 s — correctif defendable, le spec frere qui charge le meme chunk
utilisait deja 12 s.

Consequence non prevue : ces tests occupent desormais leur worker deux fois
plus longtemps au lieu d'echouer vite. La passe est passee de 37 a 54 min, et
`carousel.spec.ts` — vert aux trois passes precedentes — a pris leur place avec
**7 echecs**.

Relance seul, mono-worker : **carousel 33/33**. Sous `E2E_STATIC=1` : les 7
disparaissent.

**Ajuster un timeout deplace le flake, il ne le supprime pas.** Tant que la
contention est la cause, le prochain spec le plus lent devient le suivant sur
la liste.

## Les 2 echecs residuels du mode statique

```
expansion-panels.spec.ts:81  Border — border modifier class is applied
radio.spec.ts:400            Events - update:modelValue — clicking updates value
```

Tous deux `page.goto` / test timeout a 30 s. Non qualifies : meme signature de
contention, a rejouer isoles avant toute conclusion.

## Regle de methode

⛔ **Ne jamais mesurer la stabilite d'une suite parallele pendant qu'autre
chose charge la machine.** Trois agents compilant des paquets et faisant
tourner des serveurs Nuxt et un Postgres ont suffi a fabriquer des echecs.
On mesure alors sa propre charge, pas son code.
