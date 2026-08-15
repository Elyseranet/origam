/**
 * Resolved status of a single `<OrigamStepperItem>`. Drives the
 * indicator icon (check / exclamation / index number) and the
 * `origam-stepper-item--{status}` modifier class.
 */
export enum STEPPER_ITEM_STATUS {
    PENDING = 'pending',
    ACTIVE = 'active',
    DONE = 'done',
    ERROR = 'error'
}
