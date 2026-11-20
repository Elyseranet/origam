import type { IOrigamTheme } from '../../../../ds/src/interfaces'

// Theme with a `components` block (PROPS-FIRST): the resolver must apply it
// even though the fixture installs the lightweight entry.
export const FIXTURE_THEME: IOrigamTheme = {
    name: 'fixture',
    label: 'Fixture',
    components: {
        'origam-blockquote': {variant: 'pull', align: 'center'},
        'origam-btn': {rounded: 'lg'}
    }
}
