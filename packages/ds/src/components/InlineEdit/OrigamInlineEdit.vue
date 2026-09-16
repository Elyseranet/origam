<template>
	<component
			:is="tag"
			:id="id"
			ref="rootRef"
			class="origam-inline-edit"
			:class="rootClasses"
			:style="rootStyles"
			:aria-busy="isPending ? 'true' : 'false'"
			data-cy="origam-inline-edit"
	>
		<template v-if="!isEditing">
			<slot
					name="display"
					:value="displayValue"
					:edit="handleEnterEdit"
					:is-empty="isEmpty"
					:placeholder="resolvedPlaceholder"
					:disabled="disabled"
			>
				<button
						type="button"
						class="origam-inline-edit__display"
						:class="{
							'origam-inline-edit__display--empty': isEmpty,
							'origam-inline-edit__display--disabled': disabled
						}"
						:disabled="disabled"
						:aria-label="displayAriaLabel"
						data-cy="origam-inline-edit-display"
						@click="handleEnterEdit"
				>
					{{ isEmpty ? resolvedPlaceholder : displayValue }}
				</button>
			</slot>

			<div
					v-if="showActions"
					class="origam-inline-edit__actions"
					data-cy="origam-inline-edit-actions-display"
			>
				<origam-btn
						:icon="MDI_ICONS.PENCIL_OUTLINE"
						class="origam-inline-edit__action-btn origam-inline-edit__action-btn--edit"
						:disabled="disabled"
						:aria-label="editActionLabel"
						:data-cy="`origam-inline-edit-action-${INLINE_EDIT_ACTION.EDIT}`"
						size="x-small"
						variant="text"
						tabindex="-1"
						aria-hidden="true"
						@click="handleEnterEdit"
				/>
			</div>
		</template>

		<template v-else>
			<slot
					name="edit"
					:value="draft"
					:set-value="setValue"
					:confirm="handleConfirm"
					:cancel="handleCancel"
					:error="error"
					:is-pending="isPending"
			>
				<origam-textarea-field
						v-if="multiline"
						ref="inputRef"
						:model-value="draft"
						:placeholder="resolvedPlaceholder"
						:disabled="disabled || isPending"
						:aria-label="fieldAriaLabel"
						:aria-invalid="error !== null"
						:aria-describedby="error !== null ? errorId : undefined"
						class="origam-inline-edit__field"
						data-cy="origam-inline-edit-input"
						hide-details
						@update:model-value="handleInput"
						@focusout="handleFocusOut"
						@keydown="handleKeyDown"
				>
					<template
							v-if="showActions"
							#appendInner
					>
						<slot
								name="actions"
								:confirm="handleConfirm"
								:cancel="handleCancel"
								:is-pending="isPending"
						>
							<origam-btn
									:icon="MDI_ICONS.CHECK"
									class="origam-inline-edit__action-btn origam-inline-edit__action-btn--confirm"
									:disabled="disabled || isPending"
									:aria-label="confirmActionLabel"
									:data-cy="`origam-inline-edit-action-${INLINE_EDIT_ACTION.CONFIRM}`"
									size="x-small"
									variant="text"
									color="success"
									@mousedown.prevent
									@click="handleConfirm"
							/>
							<origam-btn
									:icon="MDI_ICONS.CLOSE"
									class="origam-inline-edit__action-btn origam-inline-edit__action-btn--cancel"
									:disabled="disabled"
									:aria-label="cancelActionLabel"
									:data-cy="`origam-inline-edit-action-${INLINE_EDIT_ACTION.CANCEL}`"
									size="x-small"
									variant="text"
									color="danger"
									@mousedown.prevent
									@click="handleCancel"
							/>
						</slot>
					</template>
				</origam-textarea-field>

				<origam-text-field
						v-else
						ref="inputRef"
						:model-value="draft"
						:type="inputType"
						:placeholder="resolvedPlaceholder"
						:disabled="disabled || isPending"
						:aria-label="fieldAriaLabel"
						:aria-invalid="error !== null"
						:aria-describedby="error !== null ? errorId : undefined"
						class="origam-inline-edit__field"
						data-cy="origam-inline-edit-input"
						hide-details
						@update:model-value="handleInput"
						@focusout="handleFocusOut"
						@keydown="handleKeyDown"
				>
					<template
							v-if="showActions"
							#appendInner
					>
						<slot
								name="actions"
								:confirm="handleConfirm"
								:cancel="handleCancel"
								:is-pending="isPending"
						>
							<origam-btn
									:icon="MDI_ICONS.CHECK"
									class="origam-inline-edit__action-btn origam-inline-edit__action-btn--confirm"
									:disabled="disabled || isPending"
									:aria-label="confirmActionLabel"
									:data-cy="`origam-inline-edit-action-${INLINE_EDIT_ACTION.CONFIRM}`"
									size="x-small"
									variant="text"
									color="success"
									@mousedown.prevent
									@click="handleConfirm"
							/>
							<origam-btn
									:icon="MDI_ICONS.CLOSE"
									class="origam-inline-edit__action-btn origam-inline-edit__action-btn--cancel"
									:disabled="disabled"
									:aria-label="cancelActionLabel"
									:data-cy="`origam-inline-edit-action-${INLINE_EDIT_ACTION.CANCEL}`"
									size="x-small"
									variant="text"
									color="danger"
									@mousedown.prevent
									@click="handleCancel"
							/>
						</slot>
					</template>
				</origam-text-field>

				<span
						v-if="error !== null"
						:id="errorId"
						class="origam-inline-edit__error"
						role="alert"
						data-cy="origam-inline-edit-error"
				>{{ error }}</span>
			</slot>

			<slot
					v-if="!showActions"
					name="actions"
					:confirm="handleConfirm"
					:cancel="handleCancel"
					:is-pending="isPending"
			/>
		</template>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import {
		computed,
		nextTick,
		ref,
		type ComponentPublicInstance,
		type StyleValue,
		useId,
		watch
	} from 'vue'

	import OrigamBtn from '../Btn/OrigamBtn.vue'
	import OrigamTextField from '../TextField/OrigamTextField.vue'
	import OrigamTextareaField from '../TextareaField/OrigamTextareaField.vue'

	import { useInlineEdit } from '../../composables/InlineEdit/inline-edit.composable'
	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useTypography } from '../../composables/Commons/typography.composable'

	import { INLINE_EDIT_ACTION } from '../../enums/InlineEdit/inline-edit.enum'
	import { MDI_ICONS } from '../../enums/Commons/mdi.enum'

	import type { IInlineEditProps } from '../../interfaces/InlineEdit/inline-edit.interface'

	import type { IInlineEditEmits, IInlineEditSlots } from '../../interfaces/InlineEdit/inline-edit.interface'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props + defaults for `<OrigamInlineEdit>`. Defaults are inlined
	 * here (not pulled from a const) because the Vue SFC compiler
	 * analyses `withDefaults` statically and only resolves literals —
	 * cf. CLAUDE.md "withDefaults — inline literals only" rule.
	 *
	 * @description
	 * `placeholder` therefore has NO literal default: it is localised,
	 * and a `t()` call is not a literal. `resolvedPlaceholder` falls back
	 * to `t('origam.inline_edit.placeholder')` instead.
	 ********************************************************/
	/*********************************************************
	 * `tag` default — 'div', not 'span' (arbitrage utilisateur, C6)
	 *
	 * @description
	 * The root used to default to `<span>` (phrasing content) while edit
	 * mode renders `<OrigamTextField>` / `<OrigamTextareaField>`, both of
	 * which render a `<div>` (`OrigamField`) — a `<div>` is flow content,
	 * not phrasing content, so a `<span>` could never legally contain it.
	 * `.origam-inline-edit { display: inline-flex }` already overrides
	 * the box type regardless of the underlying tag, so switching the
	 * default to `<div>` is visually neutral (measured in Chromium — see
	 * `packages/tests/e2e/inline-edit-tag.spec.ts`) while making the
	 * rendered HTML valid again.
	 * @description
	 * ⛔ Migration note: a consumer who placed `<origam-inline-edit>`
	 * inside a phrasing-only ancestor (`<p>`, `<label>`, …) relied on the
	 * OLD default. A `<div>` closes an open `<p>` implicitly when the
	 * browser's HTML parser is involved (raw HTML text / SSR markup being
	 * parsed on load) — pass `tag="span"` explicitly to keep the previous
	 * behaviour; the prop itself did not change, only its default.
	 ********************************************************/
	const props = withDefaults(defineProps<IInlineEditProps>(), {
		tag: 'div',
		placeholder: undefined,
		rules: undefined,
		validate: undefined,
		autoFocus: true,
		selectOnFocus: true,
		confirmOnBlur: true,
		confirmOnEnter: true,
		cancelOnEscape: true,
		disabled: false,
		multiline: false,
		trim: true,
		inputType: 'text',
		loadingOnConfirm: false,
		showActions: false
	})

	const emit = defineEmits<IInlineEditEmits>()

	defineSlots<IInlineEditSlots>()

	/*********************************************************
	 * Model — reactive accessor so the composable always reads the
	 * up-to-date value (props are not Refs themselves).
	 ********************************************************/
	const modelRef = computed<string | number>(() => props.modelValue)

	/*********************************************************
	 * i18n — every user-facing string of this component goes through the
	 * DS locale provider. Strict `useLocale()` matches the 74 other
	 * components; the plugin is already required here anyway, since edit
	 * mode renders `OrigamTextField` which calls it strictly too.
	 ********************************************************/
	const {t} = useLocale()

	/*********************************************************
	 * Composable — owns the IDLE → EDITING → VALIDATING state machine.
	 * The SFC layer adds DOM glue: focus, keyboard, blur, ARIA wiring.
	 ********************************************************/
	const {
		isEditing,
		draft,
		error,
		isPending,
		edit,
		confirm,
		cancel,
		setValue
	} = useInlineEdit(modelRef, () => ({
		rules: props.rules,
		validate: props.validate,
		trim: props.trim,
		onConfirm: (value: string) => {
			// Preserve the original v-model shape (string vs number)
			// when round-tripping through the input. Failed coercion
			// (NaN) falls back to the raw string.
			const normalised: string | number =
				typeof props.modelValue === 'number'
					? Number(value)
					: value
			const out = typeof normalised === 'number' && Number.isNaN(normalised) ? value : normalised
			emit('confirm', out)
			emit('update:modelValue', out)
		},
		onCancel: () => emit('cancel'),
		onError: (message: string) => emit('validate-error', message),
		invalidMessage: t('origam.inline_edit.invalid_value')
	}))

	/*********************************************************
	 * Refs / IDs
	 * inputRef points to OrigamTextField or OrigamTextareaField.
	 * Both expose .focus() and .select() via forwardRefs() proxying
	 * through their internal HTMLInputElement / HTMLTextAreaElement.
	 ********************************************************/
	const inputRef = ref<ComponentPublicInstance & { focus?: () => void; select?: () => void } | null>(null)
	const errorId = `origam-inline-edit-error-${useId()}`

	/*********************************************************
	 * rootRef / rootEl — l'element racine, pas l'instance
	 *
	 * @description
	 * `tag` est une prop : la racine peut etre un element natif (`ref`
	 * rend alors l'`Element`) comme un composant (`ref` rend l'instance).
	 * `rootEl()` normalise les deux cas en un `HTMLElement | null`, seule
	 * forme sur laquelle `.contains()` a un sens. Sert au confinement du
	 * focus (#614, `handleFocusOut`) et au rapatriement du focus apres
	 * confirmation / annulation.
	 ********************************************************/
	const rootRef = ref<Element | ComponentPublicInstance | null>(null)

	const rootEl = (): HTMLElement | null => {
		const r = rootRef.value
		if (!r) return null
		const el = r instanceof Element ? r : (r as ComponentPublicInstance).$el
		return el instanceof HTMLElement ? el : null
	}

	/*********************************************************
	 * Derived display state
	 ********************************************************/
	const displayValue = computed<string>(() => {
		const v = props.modelValue
		if (v === null || v === undefined) return ''
		return String(v)
	})

	const isEmpty = computed<boolean>(() => displayValue.value.trim().length === 0)

	const resolvedPlaceholder = computed<string>(() => props.placeholder ?? t('origam.inline_edit.placeholder'))

	const displayAriaLabel = computed<string>(() => {
		const label = isEmpty.value ? resolvedPlaceholder.value : displayValue.value
		return t('origam.inline_edit.edit_aria_label', label)
	})

	/*********************************************************
	 * Accessible names
	 *
	 * @description
	 * The pencil button gets the SHORT label, not the same
	 * `"Edit {value}"` string as the display affordance: with
	 * `showActions`, both are focusable at once and previously carried
	 * the IDENTICAL name, so a screen-reader user heard the same command
	 * announced twice with no way to tell them apart. The underlying
	 * redundancy — two tab stops for one action — is settled at the
	 * template level: the pencil carries `tabindex="-1"` + `aria-hidden`,
	 * so it stays visible and clickable for mouse users but leaves the
	 * keyboard path, where the display affordance already does the job.
	 * Nothing disappears on screen. Its `aria-label` is kept as a
	 * defensive net for a consumer who strips `aria-hidden`.
	 *
	 * @description
	 * `fieldAriaLabel` closes a harder gap: the edit field had NO
	 * accessible name at all. Neither `label` nor `aria-label` reached
	 * OrigamTextField / OrigamTextareaField, and `OrigamField` renders a
	 * `<label>` only when `props.label || slots.label` is set — so the
	 * one naming source left was `placeholder`, the last-resort branch of
	 * the accname algorithm, which yields NO name under `placeholder=""`.
	 * `aria-label` is neither an `on*` handler nor `class/style/id/data-*`,
	 * so `filterInputAttrs` routes it to `inputAttrs` and it lands on the
	 * native `<input>` / `<textarea>`, not on the wrapper.
	 ********************************************************/
	const editActionLabel = computed<string>(() => t('origam.inline_edit.edit'))
	const confirmActionLabel = computed<string>(() => t('origam.inline_edit.confirm'))
	const cancelActionLabel = computed<string>(() => t('origam.inline_edit.cancel'))
	const fieldAriaLabel = computed<string>(() => t('origam.inline_edit.field_aria_label'))

	/*********************************************************
	 * Edit / confirm / cancel handlers — own the SFC-level emits.
	 ********************************************************/
	const handleEnterEdit = (): void => {
		if (props.disabled) return
		edit()
		emit('edit')
	}

	/*********************************************************
	 * noteTransition — la RAISON de la sortie, decidee a l'instant ou
	 * elle est demandee
	 *
	 * @description
	 * ⛔ #614. Il faut distinguer deux sorties qui produisent le meme
	 * etat final mais appellent des gestes de focus opposes :
	 *
	 *   - Confirmer / Annuler actionnes, ou `Entree` / `Echap` dans le
	 *     champ : le focus est DANS le composant et l'element qui le
	 *     porte va etre demonte. Il faut le rapatrier, sinon il retombe
	 *     sur `<body>` (mesure) et le clavier est largue.
	 *   - `focusout` sortant : l'utilisateur est parti de lui-meme. Lui
	 *     reprendre le focus serait un defaut de plus.
	 *
	 * @description
	 * La question « le focus est-il encore chez moi ? » ne peut PAS etre
	 * posee plus tard : pendant la phase `focusout`, le navigateur a deja
	 * retire le focus a l'ancien element sans l'avoir donne au nouveau,
	 * et `activeElement` vaut transitoirement `<body>` — une tabulation
	 * sortante se lit alors exactement comme un focus perdu. Mesure a
	 * l'appui : le focus revenait sur l'affordance d'affichage au lieu de
	 * continuer vers le controle suivant. On tranche donc AU MOMENT de la
	 * demande, ou l'information est encore vraie, et on transporte la
	 * reponse jusqu'au watcher.
	 ********************************************************/
	let restoreFocusOnLeave = false

	const noteTransition = (fromFocusOut: boolean): void => {
		if (fromFocusOut) {
			restoreFocusOnLeave = false
			return
		}
		if (typeof document === 'undefined') {
			restoreFocusOnLeave = false
			return
		}
		const root = rootEl()
		const active = document.activeElement
		restoreFocusOnLeave = !!root && !!active && root.contains(active)
	}

	const handleConfirm = (): void => {
		noteTransition(false)
		void confirm()
	}

	const handleCancel = (): void => {
		noteTransition(false)
		cancel()
	}

	/*********************************************************
	 * Input / keyboard glue
	 * handleInput now receives the new string value directly from
	 * OrigamTextField / OrigamTextareaField's @update:model-value emit.
	 ********************************************************/
	const handleInput = (value: string | null): void => {
		setValue(value ?? '')
	}

	/*********************************************************
	 * handleKeyDown — les raccourcis appartiennent au CHAMP DE SAISIE
	 *
	 * @description
	 * ⛔ #614. L'ecouteur est pose sur `<origam-text-field>` ; `onKeydown`
	 * fait partie des evenements que `filterInputAttrs` route vers la
	 * RACINE du champ, pas vers le `<input>`. Un `keydown` emis par les
	 * boutons Confirmer / Annuler — rendus DANS le champ, slot
	 * `appendInner` — y remontait donc lui aussi, et `Entree` sur
	 * ANNULER partait dans la branche `confirmOnEnter`.
	 *
	 * @description
	 * Mesure Chromium d'avant correctif, brouillon « BROUILLON », focus
	 * sur le bouton Annuler, `Entree` :
	 *
	 *   valeur committee  "Editable value"  ->  "BROUILLON"
	 *
	 * Annuler CONFIRMAIT. Et le `preventDefault()` de cette branche tuait
	 * au passage l'activation native du bouton, donc son propre `click`
	 * n'arrivait jamais.
	 *
	 * @description
	 * `Entree` et `Echap` sont les raccourcis DU CHAMP. On ne les traite
	 * donc que lorsque la cible est le controle de saisie lui-meme — ce
	 * qui reste vrai pour un `#edit` personnalise, tant qu'il rend un
	 * `<input>` ou un `<textarea>`.
	 ********************************************************/
	const handleKeyDown = (event: KeyboardEvent): void => {
		const target = event.target
		if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement)) return

		if (event.key === 'Enter' && props.confirmOnEnter && !props.multiline) {
			event.preventDefault()
			handleConfirm()
			return
		}
		if (event.key === 'Enter' && props.confirmOnEnter && props.multiline && (event.metaKey || event.ctrlKey)) {
			event.preventDefault()
			handleConfirm()
			return
		}
		if (event.key === 'Escape' && props.cancelOnEscape) {
			event.preventDefault()
			handleCancel()
		}
	}

	/*********************************************************
	 * handleFocusOut — `confirmOnBlur`, mais au niveau du COMPOSANT
	 *
	 * @description
	 * ⛔ #614 — la version precedente ecoutait `@blur` sur le champ et
	 * appelait `handleConfirm()` sans regarder OU partait le focus. Un
	 * seul `Tab` depuis le champ suffisait donc a quitter le mode edition
	 * et a DEMONTER Confirmer / Annuler avant que le focus puisse les
	 * atteindre. Mesure Chromium d'avant correctif, story InlineEdit,
	 * `showActions` actif :
	 *
	 *   entree en edition   activeElement = input   confirmBtn present
	 *   Tab #1              activeElement = body    confirmBtn ABSENT
	 *   Tab #2              activeElement = button.origam-inline-edit__display
	 *
	 * Les deux boutons etaient donc inatteignables au clavier seul — la
	 * souris y arrivait uniquement grace au `@mousedown.prevent` pose sur
	 * chacun d'eux, qui empeche le blur avant le `click`. Il n'existait
	 * aucun equivalent clavier de ce garde-fou.
	 *
	 * @description
	 * Le correctif ne supprime PAS le comportement voulu : sortir du mode
	 * edition quand l'utilisateur s'en va reste exactement ce que promet
	 * `confirmOnBlur`. Il en corrige la portee — « le focus quitte le
	 * CHAMP » devient « le focus quitte le COMPOSANT ». C'est la
	 * transposition clavier du `@mousedown.prevent` : les deux disent que
	 * passer sur un bouton de la barre d'action n'est pas partir.
	 *
	 * @description
	 * Mecanisme de plate-forme, aucune minuterie : `focusout` REMONTE
	 * (contrairement a `blur`), et son `relatedTarget` porte deja
	 * l'element qui recoit le focus. `relatedTarget === null` (fenetre
	 * quittee, zone non focalisable) vaut « parti » — c'est le
	 * comportement qu'avait deja `@blur`.
	 *
	 * @description
	 * ⛔ L'ECOUTEUR EST SUR LE CHAMP, PAS SUR LA RACINE — et ce n'est pas
	 * un detail. Pose sur la racine il attrape aussi le focusout de
	 * l'affordance d'AFFICHAGE au moment ou elle cede la place au champ,
	 * et confirme aussitot : le composant rouvrait puis refermait le mode
	 * edition dans le meme clic. Mesure Chromium de ce focusout parasite :
	 *
	 *   target = origam-inline-edit-display   relatedTarget = null
	 *   target.isConnected = true             document.hasFocus() = true
	 *
	 * Aucun de ces trois signaux ne le distingue d'un vrai depart : ni
	 * `relatedTarget`, ni `isConnected`, ni `hasFocus`. Ce qui le
	 * distingue, c'est son ORIGINE — il ne vient pas du sous-arbre
	 * d'edition. Ecouter sur le champ le dit sans aucun test : les deux
	 * boutons sont rendus DANS le champ (slot `appendInner`), l'affordance
	 * d'affichage non. Un seul ecouteur, zero garde compensatoire.
	 *
	 * @description
	 * Reste asynchrone-conscient : tant qu'une promesse de validation est
	 * en vol on la laisse atterrir, sinon on double-commit.
	 ********************************************************/
	const handleFocusOut = (event: FocusEvent): void => {
		if (!props.confirmOnBlur) return
		if (!isEditing.value) return
		if (isPending.value) return

		const root = rootEl()
		const next = event.relatedTarget

		if (root && next instanceof Node && root.contains(next)) return

		noteTransition(true)
		void confirm()
	}

	/*********************************************************
	 * restoreFocusAfterEdit — ne pas echouer le focus sur `<body>`
	 *
	 * @description
	 * ⛔ #614, seconde moitie. Quitter le mode edition DEMONTE le champ
	 * et les deux boutons. Si l'utilisateur venait d'actionner Confirmer
	 * ou Annuler au clavier, l'element qui portait le focus disparait
	 * sous lui : mesure Chromium, `document.activeElement` retombe sur
	 * `body`. Le point d'insertion du clavier est perdu et la tabulation
	 * repart du debut du document — atteindre les boutons ne suffit donc
	 * pas, encore faut-il ne pas etre largue apres les avoir actionnes.
	 *
	 * @description
	 * La decision — rapatrier ou pas — a ete prise par `noteTransition`
	 * AU MOMENT de la demande, pas ici : voir le bloc de ce nom pour la
	 * raison (pendant un `focusout`, `activeElement` vaut transitoirement
	 * `<body>` et une sortie volontaire se lit comme un focus perdu). Ici
	 * il ne reste qu'a attendre que l'affordance d'affichage soit remontee
	 * avant de la focaliser.
	 ********************************************************/
	const restoreFocusAfterEdit = async (): Promise<void> => {
		if (!restoreFocusOnLeave) return
		restoreFocusOnLeave = false

		await nextTick()

		const target = rootEl()?.querySelector<HTMLElement>('[data-cy="origam-inline-edit-display"]')
		if (target && typeof target.focus === 'function') target.focus()
	}

	/*********************************************************
	 * Focus management — auto-focus on transition into edit mode and
	 * (optionally) select the text so the user can type a replacement
	 * immediately.
	 *
	 * inputRef now points to OrigamTextField / OrigamTextareaField.
	 * Both proxy .focus() and .select() via forwardRefs() through
	 * their internal HTMLInputElement / HTMLTextAreaElement.
	 ********************************************************/
	watch(isEditing, async (next: boolean): Promise<void> => {
		if (!next) {
			void restoreFocusAfterEdit()
			return
		}
		if (!props.autoFocus) return
		await nextTick()
		const el = inputRef.value
		if (!el) return
		if (typeof el.focus === 'function') el.focus()
		if (props.selectOnFocus && typeof el.select === 'function') {
			el.select()
		}
	})


	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			'origam-inline-edit--editing': isEditing.value,
			'origam-inline-edit--disabled': props.disabled,
			'origam-inline-edit--pending': isPending.value,
			'origam-inline-edit--loading-on-confirm': props.loadingOnConfirm && isPending.value,
			'origam-inline-edit--multiline': props.multiline,
			'origam-inline-edit--has-error': error.value !== null,
			'origam-inline-edit--show-actions': props.showActions
		},
		props.class
	])

	// __error reads --origam-inline-edit__error---font-{size,weight}.
	// __action-btn reads --origam-inline-edit__action-btn---font-size.
	// Both var sets are declared on the root so they cascade to their
	// respective descendants via normal CSS custom-property inheritance.
	const {typographyStyles: errorTypoStyles} = useTypography(props, 'inline-edit__error')
	const {typographyStyles: actionBtnTypoStyles} = useTypography(props, 'inline-edit__action-btn')

	const rootStyles = computed<StyleValue>(() => [props.style, errorTypoStyles.value, actionBtnTypoStyles.value] as StyleValue)

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		edit: handleEnterEdit,
		confirm: handleConfirm,
		cancel: handleCancel,
		isEditing,
		draft,
		error,
		isPending
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-inline-edit {
		position: relative;
		display: inline-flex;
		flex-direction: row;
		align-items: flex-start;
		gap: var(--origam-inline-edit__actions---gap, 4px);
		max-width: 100%;
		transition: opacity var(--origam-inline-edit---transition-duration, 160ms) ease;
	}

	.origam-inline-edit--disabled {
		opacity: 0.65;
		pointer-events: none;
	}

	.origam-inline-edit--loading-on-confirm {
		opacity: 0.75;
		pointer-events: none;
	}

	/*********************************************************
	 * ⛔ C1 (vague 3) — les cinq classes d'etat racine suivantes
	 * (--editing, --pending, --multiline, --has-error, --show-actions)
	 * etaient posees sur la racine sans la moindre regle SCSS : la classe
	 * existait, aucune ne peignait. Chacune produit desormais un style
	 * calcule reellement distinct, mesure en Playwright (voir
	 * packages/tests/e2e/inline-edit.spec.ts, describe "root state classes").
	 *********************************************************/

	.origam-inline-edit--editing {
		background-color: var(--origam-inline-edit--editing---background-color, var(--origam-color__surface---raised));
		border-radius: var(--origam-inline-edit__display---border-radius, 4px);
	}

	.origam-inline-edit--pending {
		cursor: progress;
	}

	.origam-inline-edit--multiline {
		width: 100%;
	}

	.origam-inline-edit--has-error {
		outline: 1px solid var(--origam-inline-edit--has-error---outline-color, var(--origam-color__feedback--danger---border));
		outline-offset: 2px;
		border-radius: var(--origam-inline-edit__display---border-radius, 4px);
	}

	.origam-inline-edit--show-actions {
		align-items: center;
	}

	.origam-inline-edit__display {
		all: unset;
		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		min-height: var(--origam-inline-edit__display---min-height, 24px);
		padding: var(--origam-inline-edit__display---padding-block, 2px)
		         var(--origam-inline-edit__display---padding-inline, 6px);
		border-radius: var(--origam-inline-edit__display---border-radius, 4px);
		font: inherit;
		color: var(--origam-color__text---primary);
		cursor: text;
		transition: background-color var(--origam-inline-edit---transition-duration, 160ms) ease,
		            color var(--origam-inline-edit---transition-duration, 160ms) ease;
	}

	.origam-inline-edit__display:hover:not(:disabled) {
		background-color: var(--origam-inline-edit__display---hover-bg-color);
	}

	.origam-inline-edit__display:focus-visible {
		outline: 2px solid var(--origam-color__action--primary---bg);
		outline-offset: 2px;
	}

	.origam-inline-edit__display--empty {
		color: var(--origam-inline-edit__display---color-empty);
		font-style: italic;
	}

	.origam-inline-edit__display--disabled {
		cursor: not-allowed;
	}

	.origam-inline-edit__field {
		flex: 1;
		min-width: var(--origam-inline-edit__input---min-width, 180px);
	}

	.origam-inline-edit__error {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		z-index: 2;
		padding: var(--origam-inline-edit__error---padding-block, 4px)
		         var(--origam-inline-edit__error---padding-inline, 8px);
		border-radius: var(--origam-inline-edit__error---border-radius, 4px);
		background-color: var(
			--origam-inline-edit__error---background-color,
			color-mix(in srgb, var(--origam-color__feedback--danger---bg-subtle, #ffe5e7) 75%, transparent)
		);
		color: var(--origam-inline-edit__error---color, var(--origam-color__feedback--danger---fgSubtle, #b91c1c));
		font-size: var(--origam-inline-edit__error---font-size, 0.75rem);
		font-weight: var(--origam-inline-edit__error---font-weight, 500);
		line-height: 1.3;
		pointer-events: none;
	}

	.origam-inline-edit__actions {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		gap: var(--origam-inline-edit__actions---gap, 2px);
	}

	.origam-inline-edit__action-btn {
		all: unset;
		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--origam-inline-edit__action-btn---size, 28px);
		height: var(--origam-inline-edit__action-btn---size, 28px);
		border-radius: var(--origam-inline-edit__action-btn---border-radius, 4px);
		cursor: pointer;
		font-size: var(--origam-inline-edit__action-btn---font-size, 0.875rem);
		font-weight: 600;
		transition: background-color var(--origam-inline-edit---transition-duration, 160ms) ease,
		            color var(--origam-inline-edit---transition-duration, 160ms) ease,
		            opacity var(--origam-inline-edit---transition-duration, 160ms) ease;
	}

	.origam-inline-edit__action-btn:focus-visible {
		outline: 2px solid var(--origam-color__action--primary---bg);
		outline-offset: 2px;
	}

	.origam-inline-edit__action-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		pointer-events: none;
	}

	.origam-inline-edit__action-btn--edit {
		color: var(--origam-color__text---secondary, #555);
	}

	.origam-inline-edit__action-btn--edit:hover:not(:disabled) {
		background-color: var(--origam-color__surface---raised, #f5f5f5);
		color: var(--origam-color__text---primary);
	}

	.origam-inline-edit__action-btn--confirm {
		background-color: var(--origam-color__feedback--success---bgSubtle, #e6f6ec);
		color: var(--origam-color__feedback--success---fgSubtle, #16a34a);
	}

	.origam-inline-edit__action-btn--confirm:hover:not(:disabled) {
		background-color: var(--origam-color__feedback--success---bg, #16a34a);
		color: var(--origam-color__feedback--success---fg, #fff);
	}

	.origam-inline-edit__action-btn--cancel {
		background-color: var(--origam-color__feedback--danger---bgSubtle, #fee);
		color: var(--origam-color__feedback--danger---fgSubtle, #b00);
	}

	.origam-inline-edit__action-btn--cancel:hover:not(:disabled) {
		background-color: var(--origam-color__feedback--danger---bg, #dc2626);
		color: var(--origam-color__feedback--danger---fg, #fff);
	}

	.origam-inline-edit__action-icon {
		line-height: 1;
	}
</style>
