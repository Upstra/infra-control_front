A small floating notice, top-right, that confirms an action or reports a result.

Props: `visible`, `message` and `type: 'success' | 'error' | 'info'`, all required. A status dot (`status-success`, `status-error`, `status-info`) precedes the message in `label` on `surface`, with `radius-xl`, `shadow-lg` and a 240px minimum width. It fades in and out over 0.3s.

The consumer controls `visible` and dismisses it after a few seconds. Keep messages to one line; use ErrorAlert for errors that need to stay on screen.
Hand-written from `src/shared/components/BaseToast.vue`.
