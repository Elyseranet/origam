/*********************************************************
 * lib — verrouillage VRT : le script local et le job CI (#606)
 *
 * @description
 * Extrait, de part et d'autre, ce qui DOIT coincider entre
 * `packages/tests/vrt/vrt-docker.sh` et le job `vrt` de
 * `.github/workflows/ci.yml` : la version de l'image Playwright et la
 * suite ordonnee des commandes `pnpm` executees dans le conteneur.
 *
 * @description
 * ⛔ POURQUOI CE VERROU EXISTE. Le script porte deja l'assertion dans son
 * propre en-tete — « The container steps below MUST stay in lockstep with
 * the `vrt` job in ci.yml ». Rien ne la verifiait. C'est la definition
 * meme du defaut que #606 decrit : la CI n'appelle pas ce script, donc
 * seul un lancement local l'exerce, donc il derive sans que personne ne le
 * voie. Il avait deja derive une fois — un `tokens:build` mort pendant
 * plus de deux semaines.
 *
 * @description
 * Le script ne peut pas etre cable a la CI : le job `vrt` tourne DEJA dans
 * le conteneur epingle, il ne peut pas lancer un `docker run`. Le verrou
 * porte donc sur le CONTRAT et non sur l'execution — c'est le seul angle
 * par lequel la CI peut surveiller un fichier qu'elle n'execute jamais.
 *
 * @description
 * Separe du garde pour etre testable a l'unite : le self-test injecte des
 * textes et verifie l'extraction, sans dependre de l'etat courant du
 * depot.
 ********************************************************/

/*********************************************************
 * Plomberie de conteneur — hors comparaison, et pourquoi
 *
 * @description
 * Toutes les commandes `pnpm` des deux cotes ne font pas partie de la
 * RECETTE. `pnpm config set store-dir /pnpm-store` pointe le store vers le
 * volume nomme qui met le registre en cache d'un lancement local a
 * l'autre ; son equivalent CI n'est pas une commande mais le `cache: pnpm`
 * de `actions/setup-node`. Les comparer produirait une divergence
 * permanente sur deux surfaces parfaitement alignees.
 *
 * @description
 * ⛔ La liste est NOMMEE et courte a dessein. Elargir cette exclusion pour
 * faire taire un rouge, c'est fabriquer le faux vert que ce garde existe
 * pour empecher : tout ce qui influence CE QUI EST TESTE doit rester
 * compare.
 ********************************************************/
export const PLUMBING_PREFIXES = ['pnpm config set ']

/** Vrai si la commande releve de la plomberie et non de la recette. */
export function isPlumbing (command) {
    return PLUMBING_PREFIXES.some((prefix) => command.startsWith(prefix))
}

/*********************************************************
 * Version de `@playwright/test` telle que l'installera `--frozen-lockfile`
 *
 * @description
 * Lue dans le lockfile et non dans `package.json` : la plage `^1.48.0`
 * declaree n'est pas ce qui sera installe, et c'est exactement l'ecart que
 * l'en-tete de `vrt-docker.sh` dit vouloir eviter. Le lockfile est aussi
 * toujours versionne, donc lisible sans `node_modules`.
 ********************************************************/
export function playwrightVersionFromLock (lockText) {
    const versions = new Set()

    for (const match of lockText.matchAll(/^\s{0,4}'@playwright\/test@([^'@]+)':/gm)) {
        versions.add(match[1])
    }

    return { versions: [...versions].sort() }
}

/*********************************************************
 * Bloc d'un job d'un workflow GitHub Actions
 *
 * @description
 * Decoupe a l'indentation plutot qu'avec un parseur YAML : le depot
 * n'embarque pas de dependance YAML cote gardes, et la forme visee est
 * stable (`  <job>:` a deux espaces, contenu a plus de deux).
 ********************************************************/
export function extractJobBlock (ymlText, jobName) {
    const lines = ymlText.split('\n')
    const start = lines.findIndex((line) => line === `  ${jobName}:`)

    if (start === -1) return null

    const block = [lines[start]]

    for (let i = start + 1; i < lines.length; i++) {
        const line = lines[i]

        if (line.trim() !== '' && !/^\s{3,}/.test(line)) break

        block.push(line)
    }

    return block.join('\n')
}

/*********************************************************
 * Version de l'image Playwright referencee par un bloc de job
 ********************************************************/
export function imageVersionFromJob (jobText) {
    const match = jobText.match(/image:\s*mcr\.microsoft\.com\/playwright:v([0-9]+\.[0-9]+\.[0-9]+)-/)

    return match ? match[1] : null
}

/*********************************************************
 * Commandes `pnpm` d'un bloc de job, dans l'ordre
 *
 * @description
 * Couvre les deux formes de `run:` — valeur sur la ligne, et bloc
 * litteral `run: |` sur plusieurs lignes. Seules les lignes qui COMMENCENT
 * par `pnpm` sont retenues : le reste (checkout, upload d'artefact) n'a
 * pas d'equivalent dans le conteneur local et n'a pas a en avoir.
 ********************************************************/
export function pnpmStepsFromJob (jobText) {
    const steps = []
    const lines = jobText.split('\n')

    for (let i = 0; i < lines.length; i++) {
        const inline = lines[i].match(/^\s*run:\s*(\S.*)$/)

        if (inline && inline[1] !== '|' && inline[1] !== '>') {
            if (inline[1].startsWith('pnpm ') && !isPlumbing(inline[1].trim())) steps.push(inline[1].trim())
            continue
        }

        if (!/^\s*run:\s*[|>]-?\s*$/.test(lines[i])) continue

        const indent = lines[i].match(/^\s*/)[0].length

        for (let j = i + 1; j < lines.length; j++) {
            const body = lines[j]

            if (body.trim() === '') continue
            if (body.match(/^\s*/)[0].length <= indent) break
            if (body.trim().startsWith('pnpm ') && !isPlumbing(body.trim())) steps.push(body.trim())
        }
    }

    return steps
}

/*********************************************************
 * Commandes `pnpm` du conteneur de `vrt-docker.sh`, dans l'ordre
 *
 * @description
 * Le script construit `CONTAINER_CMD` en deux temps : un tronc commun,
 * puis une derniere ligne qui depend du mode. `mode` choisit la branche
 * comparee — c'est `test` qui correspond au job CI, `update` n'ayant
 * aucun equivalent en CI (voir l'en-tete du script : la CI ne peut pas
 * committer une baseline).
 ********************************************************/
export function pnpmStepsFromDockerScript (shText, mode = 'test') {
    const steps = []
    const trunk = shText.match(/CONTAINER_CMD='\n([\s\S]*?)\n'/)

    if (trunk) {
        for (const line of trunk[1].split('\n')) {
            if (line.trim().startsWith('pnpm ') && !isPlumbing(line.trim())) steps.push(line.trim())
        }
    }

    const wanted = mode === 'update' ? /--update-snapshots/ : null

    for (const match of shText.matchAll(/CONTAINER_CMD\+='(.*?)'/g)) {
        const command = match[1].trim()

        if (!command.startsWith('pnpm ') || isPlumbing(command)) continue

        const isUpdate = /--update-snapshots/.test(command)

        if (wanted ? isUpdate : !isUpdate) steps.push(command)
    }

    return steps
}
