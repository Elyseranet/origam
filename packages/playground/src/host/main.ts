import { createApp } from 'vue'
import { createOrigam } from 'origam'
import 'origam/styles'
import HostApp from './HostApp.vue'
import { catalogNameOfTag, CATALOG_COMPONENT_NAMES, loadCatalogDefinitions } from '../utils/Commons/catalog.util'
import { collectComponentNames } from '../utils/Commons/scene-instance.util'
import { resolveExternalScene } from '../utils/Commons/scene-param.util'

/*
 * The standalone host — "a minimal page to open it" (lot 2, see README).
 * Installs the DS plugin so every `<origam-*>` tag the playground's
 * templates use resolves through global registration, exactly like any
 * other origam consumer (`packages/marketing`'s Nuxt module does the same
 * `createOrigam()` call). The playground itself never calls this — it
 * receives its theme as a PROP; only a HOST owns the plugin install.
 *
 * #1441 — a scene (`?scene=`) or a one-component shortcut (`?component=`)
 * is resolved BEFORE mounting, so the registry can be seeded with the
 * definitions it names. See README, "Pilotage externe".
 */
const knownNames = new Set(CATALOG_COMPONENT_NAMES)
const external = resolveExternalScene(window.location.search, name => knownNames.has(name), catalogNameOfTag)
const extraDefinitions = external.status === 'scene' ? await loadCatalogDefinitions(collectComponentNames(external.scene.roots)) : []

createApp(HostApp, { external, extraDefinitions }).use(createOrigam()).mount('#app')
