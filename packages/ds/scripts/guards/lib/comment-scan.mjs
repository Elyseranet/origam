/*********************************************************
 * comment-scan — repérer les commentaires SANS se faire piéger
 *
 * @description
 * Trouve les commentaires d'un source JS/TS en distinguant trois formes :
 * `canonical` (`/*****` — le format du dépôt), `jsdoc` (`/**`) et `line`
 * (`//`). Chaque occurrence porte sa ligne et son texte de première ligne.
 *
 * @description
 * POURQUOI UN SCANNER ET PAS UNE REGEX. Une recherche naïve de `//` compte
 * `https://exemple.fr` dans une chaîne, le `//` d'un littéral d'expression
 * régulière, et le `/*` d'un gabarit. Sur ce dépôt la différence n'est pas
 * marginale : les utils de couleur et de masque sont pleins d'expressions
 * régulières, et les fichiers de thème pleins d'URL. Un garde qui produit
 * des faux positifs est un garde qu'on désactive.
 *
 * @description
 * Le scanner suit donc quatre états — code, chaîne (simple/double), gabarit
 * (avec ses interpolations imbriquées), et expression régulière. Le seul
 * point réellement délicat est de distinguer une division d'un début
 * d'expression régulière : c'est indécidable sans parser, et on tranche
 * comme les coloriseurs syntaxiques le font, en regardant le dernier
 * caractère significatif. Après `)` `]` un identifiant ou un nombre, `/`
 * est une division ; partout ailleurs c'est une expression régulière.
 ********************************************************/

const REGEX_ALLOWED_BEFORE = /[([{;,:=!&|?+\-*%~^<>]$/

/*********************************************************
 * scanComments
 *
 * @description
 * Retourne la liste des commentaires trouvés, chacun décrit par son `kind`
 * (`canonical` | `jsdoc` | `line`), sa `line` 1-indexée et son `text`.
 ********************************************************/
export function scanComments (source) {
    const found = []
    const length = source.length

    let i = 0
    let line = 1
    let lastSignificant = ''

    /*********************************************************
     * Pile de contextes
     *
     * @description
     * `'code'` à la base ; un backtick empile `'template'` ; un `${` dans
     * un gabarit empile `{ interp: profondeur }`.
     * @description
     * C'est le retour EN MODE GABARIT après l'interpolation qui manquait
     * dans la première version, et le bug était silencieux : le backtick
     * fermant était alors lu comme une OUVERTURE, donc toute la suite du
     * fichier passait pour une chaîne. `border.util.ts` a deux blocs
     * JSDoc ; le scanner n'en voyait qu'un, et le garde bâti dessus était
     * aveugle sans jamais échouer. Un auto-test aux cas de trois lignes ne
     * peut pas voir ça — il faut un cas où du code SUIT un gabarit
     * interpolé.
     ********************************************************/
    const stack = [{ kind: 'code' }]
    const top = () => stack[stack.length - 1]

    const at = (offset) => source[i + offset] ?? ''

    while (i < length) {
        const char = source[i]

        if (char === '\n') {
            line++
            i++
            continue
        }

        if (top().kind === 'template') {
            if (char === '\\') { i += 2; continue }

            if (char === '`') { stack.pop(); lastSignificant = 'x'; i++; continue }

            if (char === '$' && at(1) === '{') { stack.push({ kind: 'interp', depth: 0 }); lastSignificant = '{'; i += 2; continue }

            i++
            continue
        }

        if (top().kind === 'interp') {
            if (char === '{') { top().depth++; lastSignificant = '{'; i++; continue }

            if (char === '}') {
                if (top().depth === 0) { stack.pop(); i++; continue }

                top().depth--
                lastSignificant = '}'
                i++
                continue
            }
        }

        if (char === '`') {
            stack.push({ kind: 'template' })
            i++
            continue
        }

        if (char === '"' || char === "'") {
            i = skipString(char)
            continue
        }

        if (char === '/' && at(1) === '/') {
            const end = source.indexOf('\n', i)
            const stop = end === -1 ? length : end

            found.push({ kind: 'line', line, text: source.slice(i, stop).trim() })
            i = stop
            continue
        }

        if (char === '/' && at(1) === '*') {
            let stars = 0

            while (source[i + 1 + stars] === '*') stars++

            const kind = stars >= 5 ? 'canonical' : stars === 2 ? 'jsdoc' : 'block'
            const end = source.indexOf('*/', i + 2)
            const stop = end === -1 ? length : end + 2
            const body = source.slice(i, stop)

            found.push({ kind, line, text: body.split('\n')[0].trim() })
            line += body.split('\n').length - 1
            i = stop
            continue
        }

        if (char === '/' && isRegexPosition()) {
            i = skipRegex()
            continue
        }

        if (!/\s/.test(char)) lastSignificant = char

        i++
    }

    return found

    function isRegexPosition () {
        if (!lastSignificant) return true

        return REGEX_ALLOWED_BEFORE.test(lastSignificant) || /^(?:return|typeof|case|in|of|new|delete|void)$/.test(lastWord())
    }

    function lastWord () {
        const before = source.slice(Math.max(0, i - 12), i)
        const match = before.match(/([A-Za-z]+)\s*$/)

        return match ? match[1] : ''
    }

    function skipString (quote) {
        let j = i + 1

        while (j < length) {
            if (source[j] === '\\') { j += 2; continue }
            if (source[j] === '\n') break
            if (source[j] === quote) { j++; break }
            j++
        }

        lastSignificant = 'x'

        return j
    }

    function skipRegex () {
        let j = i + 1
        let inClass = false

        while (j < length) {
            if (source[j] === '\\') { j += 2; continue }
            if (source[j] === '\n') break
            if (source[j] === '[') inClass = true
            else if (source[j] === ']') inClass = false
            else if (source[j] === '/' && !inClass) { j++; break }
            j++
        }

        while (j < length && /[gimsuyd]/.test(source[j])) j++

        lastSignificant = 'x'

        return j
    }
}

/*********************************************************
 * scriptOf
 *
 * @description
 * Pour un `.vue`, concatène tous les blocs `<script>`. Les commentaires de
 * `<template>` et de `<style>` relèvent d'une autre règle du dépôt (aucun
 * commentaire HTML ni CSS) et ne sont pas l'objet de ce garde.
 * @description
 * Concaténer plutôt que prendre le premier bloc : `OrigamCard.vue` en a
 * deux, et n'en lire qu'un rendrait le second invisible au garde.
 ********************************************************/
export function scriptOf (file, source) {
    if (!file.endsWith('.vue')) return source

    return [...source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n')
}

/*********************************************************
 * isToolDirective
 *
 * @description
 * Un commentaire ligne lu par un OUTIL, pas par un humain : il doit rester
 * en `//` sinon l'outil ne le voit plus. Ce sont les seules exemptions
 * structurelles, et elles sont énumérées plutôt que devinées.
 *
 * @description
 * La troisième barre est optionnelle et n'est pas un détail : une
 * directive TypeScript s'écrit `/// <reference …>`, avec trois barres. Un
 * motif n'en acceptant que deux la classait en commentaire humain — donc
 * en violation à corriger, alors que la retirer casserait la compilation.
 ********************************************************/
export function isToolDirective (text) {
    return /^\/\/\/?\s*(?:eslint-|@ts-|prettier-|stylelint-|c8\s|v8\s|webpackChunkName|#__PURE__|<reference)/.test(text)
}
