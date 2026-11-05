An inline error banner with a warning icon and one message.

Prop: `message?: string`; nothing renders when it is empty. It uses `danger-surface`, `danger-border` and `danger-text` with a 20px Heroicons exclamation-triangle, `radius-md` and `space-4` padding.

The consumer supplies the message, already translated. Place it under the form field or section it concerns; use BaseToast for transient confirmations instead.
Hand-written from `src/shared/components/ErrorAlert.vue`.
