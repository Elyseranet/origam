import type { ICodeProps } from '../../interfaces/Code/code.interface'

/*********************************************************
 * CODE_GROUP_EMBED_PROPS
 *
 * @description
 * What `<OrigamCodeGroup>` forces on every `<OrigamCode>` it hosts: the tab
 * already shows the label, the group already owns the one surface and the
 * one copy button.
 ********************************************************/
export const CODE_GROUP_EMBED_PROPS: Pick<ICodeProps, 'hideHeader' | 'flat' | 'copyable'> = {
    hideHeader: true,
    flat: true,
    copyable: false
}

export const CODE_GROUP_DEFAULTS = {
    tag: 'figure',
    copyable: true,
    lineNumbers: false,
    wrap: false
} as const
