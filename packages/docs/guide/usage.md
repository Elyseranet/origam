# Utilisation

Origam UI est une bibliothèque de composants Vue 3 native. Vous pouvez l'utiliser soit en enregistrant tous les composants globalement, soit en les important à la demande.

## Import Global

Pour rendre tous les composants disponibles dans votre application sans import manuel :

```typescript
import { createApp } from 'vue'
import { createOrigam } from '@origam'
import { origamTheme } from '@origam/themes'
import App from './App.vue'

// Import des styles obligatoires
import '@origam/dist/style.css'

const app = createApp(App)
// ⛔ Depuis #360 (récolte v3.0.0), `createOrigam()` nu n'installe aucun thème —
// le thème par défaut est un choix explicite du consommateur.
app.use(createOrigam({ themes: origamTheme }))
app.mount('#app')
```

## Entrée allégée (`origam/core`)

`createOrigam` importe **tous** les composants et directives, et le CSS de la police MDI (`@mdi/font`) : même avec `components: { … }`, le bundler garde tout l'arbre. Pour une vitrine ou un site qui n'utilise que quelques composants, `createOrigamCore` offre la même API sans ces trois coûts :

- ni composants ni directives par défaut : on passe ceux qu'on utilise ;
- ni CSS MDI : les icônes sont en opt-in ;
- thèmes, bloc `components` du thème (PROPS-FIRST), locale, display et styles SSR (`getSsrStyles`) **identiques**.

```typescript
import { createSSRApp } from 'vue'
import { createOrigamCore } from 'origam/core'
import { OrigamBtn } from 'origam/components/Btn'
import { OrigamTitle } from 'origam/components/Title'
import { myTheme } from './my-theme'

const app = createSSRApp(App)
app.use(createOrigamCore({
    ssr: true,
    themes: [myTheme],
    components: { OrigamBtn, OrigamTitle }
}))
```

Importez chaque composant par son sous-chemin (`origam/components/Btn`), pas par le barrel `origam/components` qui référence tous les composants.

**Icônes.** Les icônes `mdi-*` et les alias sémantiques (`$loading`, `$close`, …) sont résolus par le jeu `mdi`, mais la police n'est plus chargée. Ajoutez-la vous-même si vous l'utilisez, ou passez des icônes SVG :

```typescript
import '@mdi/font/css/materialdesignicons.css'
```

Les alias `$ABACUS`-style (les ~7 000 entrées de `MDI_ICONS`) ne sont plus pré-enregistrés par l'entrée allégée ; `createOrigam` les garde. Pour les retrouver : `createOrigamCore({ icons: { aliases: MDI_ICONS } })` (importer `MDI_ICONS` de `origam/enums` embarque l'enum, ~325 Kio minifié, mesuré).

`createOrigam` est inchangé : même signature, mêmes défauts. Avec Nuxt, voir l'option `lite` du [module](../integrations/nuxt.md).

## Thème runtime (`createOrigam({ theme })`)

`createOrigam` accepte une option `theme` : un objet de tokens injecté à
l'installation sous forme de variables CSS `--origam-*` dans le `<head>`.
C'est le point d'intégration des thèmes exportés par le Theme Builder.

```typescript
import { createOrigam } from '@origam'
import { myTheme } from './my-theme' // exporté par le Theme Builder

app.use(createOrigam({ theme: myTheme }))
```

L'objet `theme` suit l'interface `IOrigamTheme` :

```typescript
interface IOrigamTheme {
    // Nom de marque. Scope les variables sur [data-theme="<name>"]
    // au lieu de :root (activé via useTheme().setTheme(name)).
    name?: string
    // Mode couleur. Avec `name` : [data-theme="<name>"][data-mode="<mode>"].
    mode?: 'auto' | 'light' | 'dark'
    // Map de variables CSS pré-résolue. Clés avec ou sans `--`.
    vars?: Record<string, string | number>
    // Arbre de tokens DTCG ; chaque feuille devient une variable via le
    // util de naming partagé du DS (mêmes noms que les feuilles publiées).
    tokens?: ITokenTree
    // Traite `tokens` comme des tokens de composant (grammaire de naming).
    component?: boolean
}
```

Comportement :

- **SSR-safe** : l'injection est un no-op côté serveur (`document`
  absent) ; les variables sont posées à la première installation client.
- **Sans `name`** : les variables sont injectées sur `:root` (thème par
  défaut global) ; avec un `mode` seul, sur `html[data-mode="<mode>"]`, qui
  l'emporte sur la palette intégrée de ce mode mais reste en dessous de toute
  marque nommée. **Avec `name`** : elles sont scopées sur
  `[data-theme="<name>"]` et ne s'appliquent que lorsque ce thème est
  actif.
- **Naming partagé** : un arbre `tokens` est résolu via le même util
  (`tokenPathToCssVar`) que la pipeline de build, donc les noms de
  variables sont identiques à ceux des feuilles de tokens publiées —
  aucune dérive possible.

Pour usage avancé / export, le DS expose les utils purs :

```typescript
import { themeToCss, resolveThemeVars, tokenPathToCssVar } from '@origam'

// Sérialiser un thème en règle CSS (sans toucher au DOM)
const css = themeToCss(myTheme)

// Résoudre vers une map { '--origam-…': valeur }
const vars = resolveThemeVars(myTheme)

// Convertir un chemin de token en nom de variable CSS
tokenPathToCssVar(['color', 'action', 'primary', 'bg'], false)
// → '--origam-color__action--primary---bg'
```