# Infra-Control Front

Infra-Control Front is the web interface for **Upstra**, a platform used to manage servers, rooms, and user roles. It is built with Vue 3, TypeScript, and Vite.

## Architecture

- **Features** – Each domain (auth, users, rooms, etc.) lives under `src/features/*`.
- **Components** – Reusable UI components are in `src/components`.
- **Router** – Application routes are defined in `src/router`.
- **State** – Pinia stores are created in `src/store`.

## Getting Started

1. Install Node.js 20 and pnpm 8.
2. Run `pnpm install` to install dependencies.
3. Copy `.env-example` to `.env` and adjust values as needed.
4. Start the development server with `pnpm dev`.
5. Create a production build with `pnpm build`.

## Development

Running `pnpm dev` launches Vite with hot module replacement. A production-ready bundle is generated in the `dist` directory using `pnpm build`.

## Contributing

We use a Git flow style for collaboration:

- Branches are prefixed with `feat/`, `fix/`, `chore/`, or `test/` depending on the work type.
- Commit messages mirror the branch style, e.g. `feat/auth: add login view`.
- Merge requests should target the `main` branch.

Feel free to open issues and merge requests to improve the project.
