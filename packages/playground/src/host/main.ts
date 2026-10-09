import { createApp } from 'vue'
import { createOrigam } from 'origam'
import 'origam/styles'
import HostApp from './HostApp.vue'

/*
 * The standalone host — "a minimal page to open it" (lot 2, see README).
 * Installs the DS plugin so every `<origam-*>` tag the playground's
 * templates use resolves through global registration, exactly like any
 * other origam consumer (`packages/marketing`'s Nuxt module does the same
 * `createOrigam()` call). The playground itself never calls this — it
 * receives its theme as a PROP; only a HOST owns the plugin install.
 */
createApp(HostApp).use(createOrigam()).mount('#app')
