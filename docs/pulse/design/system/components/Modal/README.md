A centred dialog over a dimmed backdrop, with ConfirmModal as its ready-made confirm/cancel version.

Modal props: `open?: boolean` and `size?: 'sm' | 'md' | 'lg' | 'xl'` (max widths 24, 32, 42 and 56rem); slots `header`, default and `footer`; emits `close` when the backdrop is clicked. Body is `surface-modal` with `radius-lg` and `shadow-xl`; the footer sits on `surface-sunken` with buttons right-aligned, `space-2` apart.

ConfirmModal adds `title`, `message`, `confirmText`, `cancelText` (all required) and `variant: 'danger' | 'primary'`; it emits `confirm` and `cancel`. Use `danger` only for destructive actions. The consumer supplies translated button text.
Hand-written from `src/shared/components/Modal.vue` and `ConfirmModal.vue`.
