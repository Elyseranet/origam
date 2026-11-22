import type { TEnvName } from '../types/mcp.type.ts'

/*********************************************************
 * Constantes du serveur MCP origam
 ********************************************************/

export const ENV_NAMES = ['local', 'dev', 'prod'] as const satisfies readonly TEnvName[]

export const DEFAULT_ENV: TEnvName = 'local'

/** `local` est surchargeable via `ORIGAM_MCP_LOCAL_URL`. */
export const DEFAULT_LOCAL_URL = 'http://localhost:3000'

export const ENV_URLS: Record<Exclude<TEnvName, 'local'>, string> = {
    dev: 'https://origam.dev.elysera.net',
    prod: 'https://origam.elysera.net'
}

export const HTTP_TIMEOUT_MS = 15000

export const ENV_VAR_LOCAL_URL = 'ORIGAM_MCP_LOCAL_URL'
export const ENV_VAR_ALLOW_PROD_WRITE = 'ORIGAM_MCP_ALLOW_PROD_WRITE'
export const ENV_VAR_PLAYGROUND_URL = 'ORIGAM_MCP_PLAYGROUND_URL'
export const ENV_VAR_STYLE_PROPS = 'ORIGAM_MCP_STYLE_PROPS'

/** Prefixe du nom de l'entree trousseau / de la variable d'env de repli. */
export const PASSWORD_ENTRY_PREFIX = 'ORIGAM_ADMIN_PASSWORD_'

/** Miroir de `DOC_KINDS` (packages/marketing/src/consts/db.const.ts). */
export const DOC_KINDS = ['component', 'composable', 'const', 'directive', 'enum', 'interface', 'type', 'util'] as const

/** Miroir de `REL_TYPES` (idem). */
export const REL_TYPES = ['used_by', 'related', 'family', 'extends'] as const

/** Miroir de `ALLOWED_COLLECTIONS` (packages/marketing/src/consts/admin-mappers.const.ts). */
export const ITEM_COLLECTIONS = ['prop', 'value', 'param', 'return', 'emit', 'slot', 'directive_arg', 'directive_modifier'] as const

export const DEFAULT_PLAYGROUND_URL = 'http://localhost:5183'

/** Delai d'attente de `data-playground-ready` / `data-playground-error`. */
export const PLAYGROUND_READY_TIMEOUT_MS = 20000

export const DEFAULT_VIEWPORT = { width: 1024, height: 768 }

/** Version du modele de scene (miroir de `SCENE_VERSION`, packages/playground). */
export const PLAYGROUND_SCENE_VERSION = 1

/**
 * Longhands uniquement : `getPropertyValue` sur un shorthand contenant `var()`
 * renvoie "" (CLAUDE.md, « getPropertyValue sur un shorthand »).
 */
export const DEFAULT_STYLE_PROPS = [
    'color', 'background-color',
    'border-top-color', 'border-top-width', 'border-top-style',
    'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius',
    'box-shadow', 'width', 'height',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'opacity', 'font-size', 'font-weight'
] as const
