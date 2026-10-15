import { computed, ref, watch } from 'vue'
import { CONTROL_KIND } from '../../enums/Commons/control-kind.enum'
import { PROP_COERCION } from '../../enums/Commons/prop-coercion.enum'
import type { IPlaygroundPropControlProps, IPropControlLabels } from '../../interfaces/Components/playground-prop-control.interface'
import type { TPropValue } from '../../types/Commons/prop-value.type'
import { admittedCoercions, coerceInput, coercionOf, formatPropValue } from '../../utils/Commons/prop-control.util'

/*********************************************************
 * usePropControl
 *
 * @description
 * Everything one prop editor decides, so `PlaygroundPropControl.vue` only
 * binds. It turns the editor's raw input into a `set` / `reset` intent and
 * holds the one piece of state that is not the prop value: the TEXT / JSON
 * draft while it does not parse yet.
 *
 * @description
 * ⛔ No default is ever emitted. Every `*Model` getter reads the EXPLICIT
 * value only (`isSet`); the default is exposed separately as `defaultLabel`,
 * which the control shows as a placeholder / caption. The one exception is
 * the switch's visual position, which has to be on or off: unset, it shows
 * the default position, and the row's "default" marker says so.
 ********************************************************/
export function usePropControl (
    props: IPlaygroundPropControlProps,
    emitSet: (value: TPropValue) => void,
    emitReset: () => void,
    labels: IPropControlLabels
) {
    /*********************************************************
     * Kind
     ********************************************************/
    const kind = computed(() => props.definition.control)
    const isSelect = computed(() => kind.value === CONTROL_KIND.SELECT && (props.definition.options?.length ?? 0) > 0)
    const isSwitch = computed(() => kind.value === CONTROL_KIND.SWITCH)
    const isNumber = computed(() => kind.value === CONTROL_KIND.NUMBER)
    const isJson = computed(() => kind.value === CONTROL_KIND.JSON)
    const isText = computed(() => !isSelect.value && !isSwitch.value && !isNumber.value && !isJson.value)

    /*********************************************************
     * Default (source A) — displayed, never written
     ********************************************************/
    const defaultLabel = computed(() => {
        const { defaultValue, hasFactoryDefault } = props.definition

        if (hasFactoryDefault) return labels.factoryDefault
        if (defaultValue === undefined) return labels.noDefault

        return formatPropValue(defaultValue)
    })

    /*********************************************************
     * SELECT
     *
     * @description
     * Items are keyed by INDEX, not by the member itself: a union may mix
     * kinds (`TAlways` = `false | true | 'always'`), and a `false` item value
     * is indistinguishable from "nothing selected" to most comparators.
     ********************************************************/
    const selectItems = computed(() => (props.definition.options ?? []).map((option, index) => ({
        title: formatPropValue(option),
        value: index
    })))

    const selectModel = computed<number | null>({
        get: () => {
            if (!props.isSet) return null

            const index = (props.definition.options ?? []).findIndex(option => option === props.value)

            return index === -1 ? null : index
        },
        set: index => {
            if (index === null || index === undefined) {
                emitReset()
                return
            }

            emitSet((props.definition.options ?? [])[index])
        }
    })

    /*********************************************************
     * SWITCH
     ********************************************************/
    const switchModel = computed<boolean>({
        get: () => (props.isSet ? props.value === true : props.definition.defaultValue === true),
        set: value => emitSet(!!value)
    })

    /*********************************************************
     * NUMBER
     *
     * @description
     * Emptying the field is a reset (the field then shows the default as its
     * placeholder again) — writing `null` would set a value the prop's type
     * does not admit.
     ********************************************************/
    const numberModel = computed<number | null>({
        get: () => (props.isSet && typeof props.value === 'number' ? props.value : null),
        set: value => {
            if (value === null || value === undefined || Number.isNaN(value)) {
                emitReset()
                return
            }

            emitSet(value)
        }
    })

    /*********************************************************
     * TEXT / JSON — explicit coercion
     *
     * @description
     * The field writes under the kind the user picked (`coercion`), among the
     * kinds the runtime type admits. A refused parse keeps the draft on
     * screen, flags it, and writes NOTHING — the previous prop value stays.
     ********************************************************/
    const coercions = computed<PROP_COERCION[]>(() => (isJson.value ? [PROP_COERCION.JSON] : admittedCoercions(props.definition.runtimeType)))
    const hasCoercionChoice = computed(() => isText.value && coercions.value.length > 1)
    const isEditable = computed(() => coercions.value.length > 0)

    const initialCoercion = () => (props.isSet && coercions.value.includes(coercionOf(props.value)) ? coercionOf(props.value) : coercions.value[0])

    const coercion = ref<PROP_COERCION | undefined>(initialCoercion())
    const draft = ref(props.isSet ? formatPropValue(props.value) : '')
    const invalid = ref(false)

    const commitDraft = () => {
        if (!coercion.value) return

        const result = coerceInput(draft.value, coercion.value)
        invalid.value = !result.ok

        if (result.ok) emitSet(result.value)
    }

    const textModel = computed<string>({
        get: () => draft.value,
        set: value => {
            draft.value = value ?? ''
            commitDraft()
        }
    })

    const coercionModel = computed<PROP_COERCION | undefined>({
        get: () => coercion.value,
        set: value => {
            coercion.value = value

            if (draft.value !== '' || props.isSet) commitDraft()
        }
    })

    const coercionItems = computed(() => coercions.value.map(value => ({ title: value, value })))

    watch(() => [props.isSet, props.value] as const, ([isSet, value]) => {
        if (!isSet) {
            draft.value = ''
            invalid.value = false
            coercion.value = coercions.value[0]
            return
        }

        if (!invalid.value && formatPropValue(value) !== draft.value) {
            draft.value = formatPropValue(value)
            if (coercions.value.includes(coercionOf(value))) coercion.value = coercionOf(value)
        }
    })

    return {
        isSelect,
        isSwitch,
        isNumber,
        isJson,
        isText,
        isEditable,
        defaultLabel,
        selectItems,
        selectModel,
        switchModel,
        numberModel,
        textModel,
        coercionModel,
        coercionItems,
        hasCoercionChoice,
        invalid
    }
}
