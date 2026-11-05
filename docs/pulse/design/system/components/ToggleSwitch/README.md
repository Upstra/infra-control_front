A pill switch for an immediate on/off setting.

Props: `modelValue: boolean` (required) and `disabled?: boolean`; emits `update:modelValue`. On is `primary`, off is `toggle-off`; the knob is white with `shadow-sm`. It carries `role="switch"` and `aria-checked`, and takes a 2px `primary` focus ring.

The consumer supplies the visible label next to it, since the switch has no text. Use it for settings that apply at once; use a checkbox in forms that need a Save button.
Hand-written from `src/shared/components/ToggleSwitch.vue`.
