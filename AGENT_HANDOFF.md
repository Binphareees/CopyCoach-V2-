# Agent Handoff

## Last Updated

September 7, 2026

## Current Objective

Create persistent project-context documentation files (`PROJECT_CONTEXT.md` and `AGENT_HANDOFF.md`) that capture the true state of the CopyCoach AI repository so future OpenCode agents can take over without losing context.

## Current Task

The documentation task itself is now complete. Both files have been created based on thorough inspection of the entire codebase.

## What Has Been Completed

1. **Full repository inspection**: Read every source file in `frontend/src/` including all API routes, lib files, components, pages, and configuration files.
2. **PROJECT_CONTEXT.md created**: Comprehensive documentation covering overview, tech stack, architecture, directory structure, feature status, completed work, WIP, not-yet-implemented features, architecture decisions, integrations, env vars, important files, known bugs, TODOs, and development instructions.
3. **AGENT_HANDOFF.md created**: Inter-agent communication file with session context and next steps.

## What Is Currently In Progress

Nothing is in progress. The documentation task is complete.

## Files Changed

| File | Purpose |
|------|---------|
| `PROJECT_CONTEXT.md` (new) | Comprehensive project documentation - the persistent source of truth |
| `AGENT_HANDOFF.md` (new) | Inter-agent handoff document for session continuity |

## Current State

Both documentation files are complete and accurately reflect the current state of the repository. The project is a fully functional AI copywriting coach web application with authentication, AI generation, payments, and admin features.

## Known Issues

1. **Dashboard is monolithic**: `frontend/src/app/dashboard/page.tsx` is 2074 lines and needs decomposition.
2. **CTA button has no link**: `frontend/src/components/landing/CTA.tsx` - "Start Learning Free" button does nothing.
3. **QR codes are placeholders**: Static SVGs, not real QR codes.
4. **FAQ not interactive**: Always-visible answers, no accordion.
5. **APK download is a stub**: Returns JSON manifest, not an actual APK.
6. **2FA toggle is cosmetic**: Not connected to real 2FA.
7. **Profile support form is simulated**: Uses setTimeout, no API call.
8. **Pricing mismatch**: Landing page shows 4 USD tiers, implementation has single NGN Pro tier.
9. **docs/COMPONENTS.md is empty**: No component documentation exists.
10. **V2 snapshot directories exist**: `CopyCoach-V2-/` at root and in `frontend/` - archived reference code.

## What The Next Agent Should Do

1. Read `PROJECT_CONTEXT.md` for full project understanding.
2. Read this `AGENT_HANDOFF.md` for current session context.
3. Choose a task from the High Priority TODO section in PROJECT_CONTEXT.md:
   - Decompose `dashboard/page.tsx` into smaller components
   - Fix the CTA button link
   - Implement real QR codes
   - Fix FAQ accordion
4. Or address any of the known bugs listed above.
5. After completing work, update both documentation files.

## Important Warnings

1. **Do NOT touch `CopyCoach-V2-` directories** - they are archived snapshots for reference only.
2. **Do NOT modify `getServerUser()` in `auth-server.ts`** without understanding all downstream API routes.
3. **Do NOT remove the AI fallback chain** (Gemini → Groq → Mock) in any AI endpoint.
4. **Do NOT expose `SUPABASE_SERVICE_ROLE_KEY` or `PAYSTACK_SECRET_KEY` in client-side code.**
5. **Do NOT add client-side state management libraries** without discussing architecture - the project uses local React state.
6. **Do NOT change the Paystack amount** (5,000 NGN) without understanding billing implications.
7. **Do NOT use Tailwind CSS v3 patterns** - this project uses v4 (`@import "tailwindcss"`, `@theme inline {}`).
8. **Do NOT bypass rate limiting** when adding new API endpoints.
9. **Do NOT trust request body for user identity** - always use `getServerUser()` to derive from verified JWT.
10. **Keep `PROJECT_CONTEXT.md` and `AGENT_HANDOFF.md` updated** after significant changes.

## Verification

- **What was tested**: Both files were written and will be read back for verification.
- **What passed**: Full codebase inspection completed successfully. All API routes, lib files, components, and pages documented.
- **What failed**: N/A
- **What still needs testing**: The documentation files themselves should be verified by the next agent for accuracy after reading them.

## Instructions For The Next OpenCode Agent

Before doing any work:

1. Read `PROJECT_CONTEXT.md`.
2. Read `AGENT_HANDOFF.md`.
3. Inspect the relevant existing code.
4. Determine what has already been implemented.
5. Do NOT assume the task is starting from scratch.
6. Do NOT rebuild existing functionality without a clear reason.
7. Continue from the current project state.
8. After making changes, update both documentation files.
9. Update `AGENT_HANDOFF.md` with exactly what was completed and what remains.
10. Keep the documentation synchronized with the actual code.
