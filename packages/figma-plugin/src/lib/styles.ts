/**
 * styles.ts — Local Text Style and Effect Style wrappers.
 *
 * Stubs for Phase 4+ component builders. Provide a clear, consistent API that
 * the component builders will consume to create / reuse Figma local styles.
 *
 * All functions are defensive: return null / no-op instead of throwing when
 * an operation is unsupported or data is missing.
 */

// ---------------------------------------------------------------------------
// Text Styles
// ---------------------------------------------------------------------------

/**
 * Find an existing local Text Style by exact name (case-sensitive, Figma
 * convention uses `Category/Subcategory` names, e.g. `"Origam/Body/MD"`).
 *
 * Returns `null` if not found.
 */
export function findTextStyle(name: string): TextStyle | null {
  try {
    return figma.getLocalTextStyles().find((s) => s.name === name) ?? null
  } catch {
    return null
  }
}

/**
 * Find an existing Text Style by name, or create one if it does not exist.
 * Applies the provided `props` to the style on creation. On an existing style
 * the props are NOT updated (callers should call this once at init time and
 * then rely on the designer keeping styles in sync).
 *
 * Returns the found-or-created `TextStyle`.
 * @throws if Figma cannot create the style (e.g. in a context without write
 * access) — let this bubble so the component builder can handle it.
 */
export function ensureTextStyle(
  name: string,
  props: Partial<
    Pick<
      TextStyle,
      | 'fontSize'
      | 'fontName'
      | 'lineHeight'
      | 'letterSpacing'
      | 'textDecoration'
      | 'textCase'
      | 'paragraphSpacing'
      | 'paragraphIndent'
      | 'description'
    >
  >,
): TextStyle {
  const existing = findTextStyle(name)
  if (existing) return existing

  const style = figma.createTextStyle()
  style.name = name

  // Apply provided properties defensively.
  if (props.fontSize !== undefined) style.fontSize = props.fontSize
  if (props.fontName !== undefined) style.fontName = props.fontName
  if (props.lineHeight !== undefined) style.lineHeight = props.lineHeight
  if (props.letterSpacing !== undefined)
    style.letterSpacing = props.letterSpacing
  if (props.textDecoration !== undefined)
    style.textDecoration = props.textDecoration
  if (props.textCase !== undefined) style.textCase = props.textCase
  if (props.paragraphSpacing !== undefined)
    style.paragraphSpacing = props.paragraphSpacing
  if (props.paragraphIndent !== undefined)
    style.paragraphIndent = props.paragraphIndent
  if (props.description !== undefined) style.description = props.description

  return style
}

// ---------------------------------------------------------------------------
// Effect Styles
// ---------------------------------------------------------------------------

/**
 * Find an existing local Effect Style by exact name.
 * Returns `null` if not found.
 */
export function findEffectStyle(name: string): EffectStyle | null {
  try {
    return figma.getLocalEffectStyles().find((s) => s.name === name) ?? null
  } catch {
    return null
  }
}

/**
 * Find an existing Effect Style by name, or create one with the provided
 * `effects` array. Existing styles are returned as-is (effects not updated).
 *
 * Returns the found-or-created `EffectStyle`.
 * @throws if Figma cannot create the style.
 */
export function ensureEffectStyle(
  name: string,
  effects: Effect[],
): EffectStyle {
  const existing = findEffectStyle(name)
  if (existing) return existing

  const style = figma.createEffectStyle()
  style.name = name
  style.effects = effects

  return style
}
