/*********************************************************
 * useThrottleFn
 *
 * @description
 * Limite `fn` a un appel toutes les `wait` ms — pattern LEADING-edge :
 * le premier appel dans une fenetre passe immediatement, les suivants
 * dans la meme fenetre sont ignores (pas mis en file). Contrairement a
 * un debounce, `fn` n'est jamais appele "en retard" apres la derniere
 * invocation.
 *
 * @description
 * Aucun mecanisme de nettoyage n'est retourne : le `setTimeout` interne
 * n'est pas annule si le composant se demonte avant `wait`. Sans
 * consequence sur `fn` elle-meme — le timer ne fait que reinitialiser le
 * flag interne (`timer = null`), il ne rappelle jamais `fn` — mais le
 * timer continue de tourner en memoire jusqu'a son echeance.
 ********************************************************/
export function useThrottleFn<T extends unknown[], R = void> (fn: (...args: T) => R, wait: number): (...args: T) => void {
    let timer: ReturnType<typeof setTimeout> | null = null
    return (...args: T) => {
        if (!timer) {
            fn(...args)
            timer = setTimeout(() => {
                clearTimeout(timer!)
                timer = null
            }, wait)
        }
    }
}
