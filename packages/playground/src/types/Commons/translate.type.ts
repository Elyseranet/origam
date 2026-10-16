/*********************************************************
 * TTranslate
 *
 * @description
 * The signature of `useT().t` — `t(key, fallback, named)`. Typed here so a
 * builder that produces translated DATA (the default snippets) can take the
 * translator as an argument instead of calling `useT()` itself, which keeps
 * it a pure function a unit test can drive with a stub.
 ********************************************************/
export type TTranslate = (key: string, fallback?: string, named?: Record<string, string | number>) => string
