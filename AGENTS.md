# Infra-Control Front – Development Guide

## Project overview

- Vue 3 + TypeScript application built with Vite.
- Package manager: pnpm.
- State management: Pinia.
- Features are modularized under `src/features/*` (auth, users, presence, etc.).

## Getting started

1. Install Node 20 and pnpm 8 (see Dockerfile/workflow for reference).
2. Run `pnpm install` to install dependencies.
3. Copy `.env-example` to `.env` and adjust values if needed.
4. Start the development server with `pnpm dev`.
5. Create a production build with `pnpm build`.

## Repository structure

- `src/features/` – one directory per feature (auth, users, rooms…).
- `src/components/` – shared components (e.g., `CommandPalette.vue`).
- `src/router/` – Vue Router configuration.
- `src/store/` – Pinia instance.
- `public/` – static assets served by Vite.

## Contributing

- **Branch naming** follows Git flow:
  - `feat/<topic>` for new features.
  - `fix/<topic>` for bug fixes.
  - `chore/<topic>` for maintenance tasks.
  - `test/<topic>` for test-related changes.
- **Commit messages** mirror this style, e.g.\
  `feat(authentication): add 2FA support`\
  `fix(profile): handle empty names`.
- **Merge requests** must not include the label “codex”.

## Testing

- The repository currently provides no automated tests. Add tests alongside new features when possible.
