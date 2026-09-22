import type { CSSProperties } from 'vue'
import type {
    IInstallationStep,
    IInstallationCodeBlock,
    IInstallationPeerDep,
    IInstallationPackageManager
} from '~/interfaces/installation.interface'

/**
 * Hero badge CSS vars — same pattern as roadmap/why-origam.
 */
export const INSTALLATION_HERO_BADGE_VARS: CSSProperties = {
    '--origam-chip---background-color': 'transparent'
} as CSSProperties

/**
 * Steps for the ordered installation flow.
 * titleKey / descriptionKey / noteKey → i18n keys.
 */
export const INSTALLATION_STEPS: IInstallationStep[] = [
    {
        id: 'install',
        icon: 'mdi-package-down',
        titleKey: 'installation.steps.install.title',
        descriptionKey: 'installation.steps.install.description'
    },
    {
        id: 'register',
        icon: 'mdi-code-braces',
        titleKey: 'installation.steps.register.title',
        descriptionKey: 'installation.steps.register.description',
        noteKey: 'installation.steps.register.note'
    },
    {
        id: 'use',
        icon: 'mdi-play-circle-outline',
        titleKey: 'installation.steps.use.title',
        descriptionKey: 'installation.steps.use.description'
    },
    {
        id: 'theming',
        icon: 'mdi-palette-outline',
        titleKey: 'installation.steps.theming.title',
        descriptionKey: 'installation.steps.theming.description',
        noteKey: 'installation.steps.theming.note'
    },
    {
        id: 'nuxt',
        icon: 'mdi-nuxt',
        titleKey: 'installation.steps.nuxt.title',
        descriptionKey: 'installation.steps.nuxt.description',
        noteKey: 'installation.steps.nuxt.note'
    }
]

/**
 * Code snippets — pure data, identical across all locales.
 * Never put these in i18n (brace conflicts with vue-i18n).
 */
export const INSTALLATION_PACKAGE_MANAGERS: IInstallationPackageManager[] = [
    { value: 'npm', label: 'npm', code: 'npm install origam' },
    { value: 'pnpm', label: 'pnpm', code: 'pnpm add origam' },
    { value: 'yarn', label: 'yarn', code: 'yarn add origam' }
]

export const INSTALLATION_CODE_REGISTER: IInstallationCodeBlock = {
    lang: 'ts',
    filename: 'main.ts',
    code: `import { createApp } from 'vue'
import { createOrigam } from 'origam'
import { origamTheme } from 'origam/themes'

import 'origam/tokens/css/primitive'
import 'origam/tokens/css/light'
import 'origam/tokens/css/utilities'

import App from './App.vue'

const origam = createOrigam({ themes: origamTheme })

createApp(App).use(origam).mount('#app')`
}

export const INSTALLATION_CODE_USE: IInstallationCodeBlock = {
    lang: 'vue',
    filename: 'App.vue',
    code: `<template>
  <OrigamBtn intent="primary" @click="onClick">
    Save
  </OrigamBtn>
</template>

<script setup lang="ts">
const onClick = () => console.log('clicked')
</script>`
}

export const INSTALLATION_CODE_THEME_HTML: IInstallationCodeBlock = {
    lang: 'html',
    filename: 'index.html',
    code: `<html data-theme="dark">`
}

export const INSTALLATION_CODE_THEME_RUNTIME: IInstallationCodeBlock = {
    lang: 'ts',
    code: `import { useTheme } from 'origam'

const { theme, set, toggle } = useTheme()

set('dark')   // 'light' | 'dark' | 'auto' | 'brand-x'
toggle()      // cycles light <-> dark`
}

export const INSTALLATION_CODE_THEME_SCOPED: IInstallationCodeBlock = {
    lang: 'vue',
    code: `<OrigamThemeProvider theme="dark">
  <OrigamCard>I am dark, even on a light page.</OrigamCard>
</OrigamThemeProvider>`
}

export const INSTALLATION_CODE_NUXT: IInstallationCodeBlock = {
    lang: 'ts',
    filename: 'nuxt.config.ts',
    code: `export default defineNuxtConfig({
    modules: ['origam/nuxt'],
})`
}

/**
 * Peer dependencies table data.
 * pkg / required → static data. usedByKey → i18n key.
 */
export const INSTALLATION_PEER_DEPS: IInstallationPeerDep[] = [
    {
        pkg: 'vue',
        required: '^3.5',
        usedByKey: 'installation.peer_deps.vue_used_by'
    },
    {
        pkg: 'vue-i18n',
        required: '^11.1',
        usedByKey: 'installation.peer_deps.vue_i18n_used_by'
    },
    {
        pkg: 'vue-router',
        required: '^4.5',
        usedByKey: 'installation.peer_deps.vue_router_used_by'
    }
]
