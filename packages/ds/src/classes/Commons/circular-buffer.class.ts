export class CircularBuffer<T = never> {
    readonly #arr: Array<T> = []
    #pointer = 0

    constructor (public readonly size: number) {
    }

    push (val: T) {
        this.#arr[this.#pointer] = val
        this.#pointer = (this.#pointer + 1) % this.size
    }

    values (): Array<T> {
        return this.#arr.slice(this.#pointer).concat(this.#arr.slice(0, this.#pointer))
    }
}
