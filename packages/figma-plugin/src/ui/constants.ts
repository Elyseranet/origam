// Static UI catalogues — kept here so the React tree stays presentational.

export type TTabId = 'generate' | 'export' | 'sync'

export interface ITab {
  id: TTabId
  label: string
}

export const TABS: readonly ITab[] = [
  {id: 'generate', label: 'Generate'},
  {id: 'export', label: 'Export'},
  {id: 'sync', label: 'Sync'},
] as const

/**
 * The 14 v1 components the plugin can generate. Order matches the brief
 * (CLAUDE_CODE_BRIEF.md §0.3 / §4.1).
 */
export const GENERATABLE_COMPONENTS: readonly string[] = [
  'Btn',
  'TextField',
  'Textarea',
  'Select',
  'Checkbox',
  'Radio',
  'Switch',
  'Card',
  'Chip',
  'Avatar',
  'Alert',
  'Dialog',
  'Toolbar',
  'Badge',
] as const

export type TExportFormat = 'tokens-studio' | 'scss-origam' | 'w3c'

export interface IExportFormatOption {
  id: TExportFormat
  label: string
  description: string
}

export const EXPORT_FORMATS: readonly IExportFormatOption[] = [
  {
    id: 'tokens-studio',
    label: 'Tokens Studio JSON',
    description: 'Mirrors the tokens/ folder; consumable by build-tokens.mjs.',
  },
  {
    id: 'scss-origam',
    label: 'SCSS Origam',
    description: 'Drop-in _origam.semantic.scss with --origam-* variables.',
  },
  {
    id: 'w3c',
    label: 'W3C Design Tokens JSON',
    description: 'DTCG-compliant export for third-party tooling.',
  },
] as const
