<template>
  <repl
    :store="store"
    :editor="CodeMirrorEditor"
    :show-compile-output="false"
    :show-import-map="false"
    :show-ts-config="false"
    :clear-console="false"
    layout="vertical"
    class="home-playground__repl"
    data-cy="playground-repl"
  />
</template>

<script setup lang="ts">
/**
 * HomePlaygroundEditor.client.vue
 *
 * Suffixe `.client.vue` = Nuxt 4 auto-client-only : jamais évalué côté SSR.
 *
 * Mini-spec — décision éditeur :
 * Monaco retiré (incompat Vite 7 : dynamic import → 404 hash mismatch,
 * static import → stack overflow au transform Vite). Éditeur = CodeMirror
 * par défaut de @vue/repl (aucun prop `editor` passé au composant Repl).
 * Monaco différé à une iteration ultérieure si Vite résout la compatibilité.
 */
import { Repl, useStore } from '@vue/repl'
import CodeMirrorEditor from '@vue/repl/codemirror-editor'
import '@vue/repl/style.css'
import { PLAYGROUND_REPL_SNIPPET } from '~/consts/playground.const'

/*
 * The live editor runs a self-contained Vue SFC (PLAYGROUND_REPL_SNIPPET) so
 * the preview renders with a clean console — the published `origam` ESM cannot
 * be reliably resolved inside the browser sandbox. The origam-branded source
 * is showcased by the static <OrigamCode> fallback in HomePlayground.vue.
 */
const store = useStore()
void store.setFiles({ 'App.vue': PLAYGROUND_REPL_SNIPPET }, 'App.vue').catch(() => {})
</script>

<style scoped lang="scss">
/*
 * La hauteur 480px est définie dans HomePlayground.vue via :deep(.vue-repl).
 * Ce bloc scoped gère uniquement les overrides internes au REPL CodeMirror.
 */
.home-playground__repl {
    width: 100%;
    height: 480px;
}
</style>
