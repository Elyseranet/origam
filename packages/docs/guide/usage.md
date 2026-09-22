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
  défaut global). **Avec `name`** : elles sont scopées sur
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