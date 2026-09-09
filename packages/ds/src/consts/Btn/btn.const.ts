/*********************************************************
 * ADJACENT_EMIT_REPLACEMENT
 *
 * @description
 * Guidance shown when a consumer attaches `click:prepend` / `click:append`
 * to `<OrigamBtn>` — both deprecated (#443), removed in v3.0.0.
 *
 * @description
 * They were a documented, story-demonstrated API that NO keyboard user
 * could ever reach. The emits fire from a `@click` bound to the
 * `origam-btn__prepend` / `origam-btn__append` `<span>`; a keyboard
 * activation synthesises its click on the component ROOT, so the event
 * never reaches a listener bound to a descendant.
 *
 * @description
 * ⛔ The remedy `useAdjacent` applies on the other ten consumers — turn the
 * zone into a real `role="button"` tab stop when a listener is attached —
 * is ILLEGAL here, and that is why Btn is the one component that has to
 * drop the emit instead of fixing it. Btn's root renders as `<button>` or
 * `<a>`, and the HTML content model for both forbids any interactive
 * content descendant AND any descendant carrying a `tabindex` attribute.
 * A nested `<button type="button">` is invalid at that position for the
 * same reason.
 *
 * @description
 * The shape was wrong, not merely the markup: a control that already owns
 * one action cannot host a second. Two actions are two buttons — compose
 * them with `<origam-btn-group>`. The `prepend` / `append` SLOTS are
 * untouched and stay entirely legitimate for decorative or informational
 * content.
 ********************************************************/
export const ADJACENT_EMIT_REPLACEMENT = 'It was never reachable by keyboard (the emit fires from a descendant span, and keyboard activation targets the button root), and Btn cannot be given a focusable sub-control because <button>/<a> forbid interactive descendants. Use two buttons in an <origam-btn-group> instead. The prepend/append slots themselves are unaffected.'
