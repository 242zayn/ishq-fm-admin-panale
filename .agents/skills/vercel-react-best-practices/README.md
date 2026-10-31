# React and Next.js Performance Guidance

This directory contains the Vercel React Best Practices reference used while developing this Next.js admin dashboard. The upstream guidance is useful, but project changes should follow the dashboard's own architecture and conventions described in the repository `AGENTS.md`.

## Project context

- Next.js 16 App Router with React 19 and strict TypeScript.
- Tailwind CSS v4 and shadcn/ui (New York style).
- Feature modules live under `src/features/`; routes live under `src/app/`.
- TanStack Query is the default for server state, with per-feature `types.ts`, `service.ts`, and `queries.ts` layers.
- TanStack Table and nuqs power data tables and URL-backed filters.
- Server Components are the default. Add a client boundary only where interactivity, browser APIs, or client hooks require it.

## Contents

- `rules/` contains individual performance rules, grouped by filename prefix.
- `AGENTS.md` is the compiled reference used by coding agents.
- `SKILL.md` describes when and how to apply this guidance in the project.

This is a vendored reference collection, not a standalone package in this dashboard. The source README mentions build scripts and package commands from its original repository; those commands are not assumed to exist here. Preserve upstream rule content unless you are intentionally updating the reference itself.

## Applying the guidance here

When changing dashboard code:

1. Read the relevant feature and a nearby implementation before adding a new pattern.
2. Keep data access in the feature service layer; components should use the feature's query options and service functions rather than importing mock data directly.
3. For query-backed pages, follow the project's prefetch, hydration, `useSuspenseQuery`, and Suspense boundary conventions documented in the root `AGENTS.md`.
4. Keep components server-rendered by default and avoid unnecessary client state, effects, and broad client boundaries.
5. Use the shared shadcn components and `cn()` utility, and register icons through `src/components/icons.tsx` rather than importing icon packages in feature code.
6. Prefer changes that fit the existing feature structure and avoid editing generated or vendored reference files to solve an application-level issue.

Performance guidance is a tool for choosing a good implementation, not a reason to make code harder to understand. Follow the project's established patterns when they already solve the problem cleanly.
