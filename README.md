# Before Evidence

## Thesis
People often decide what evidence means only after seeing it. Before Evidence registers the standard for belief change before evidence is revealed, then audits the later interpretation against that record.

## Product flow
Case -> Commitment -> Server Lock -> Evidence Reveal -> Interpretation -> Belief Update -> GPT-5.6 Audit.

## Why GPT-5.6
GPT-5.6 acts as an epistemic auditor. It evaluates the locked commitment, fixed evidence, interpretation, confidence change, and deterministic comparisons. It never selects, generates, or modifies evidence.

## Architecture
Next.js App Router with TypeScript, Zod validation, server route handlers, a server-only fixed scenario module, and Postgres-backed session persistence. Commitment locking is enforced in the database with an atomic status-guarded update. The audit uses the OpenAI Responses API with strict structured output validation.

## Local setup

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

For local runtime sessions, set `DATABASE_URL` to a Postgres database. Tests use an isolated in-memory store and do not require database credentials.

## Environment variables

`DATABASE_URL` is required for deployed runtime persistence. Use Vercel Postgres, Neon Postgres, or another Postgres database available to the hosting environment.

`OPENAI_API_KEY` is required only in the hosting environment or local `.env.local`. Never expose it in client code or commit it. `OPENAI_MODEL` is optional and defaults to `gpt-5.6`.

Without `OPENAI_API_KEY`, the audit returns an honest error and never produces a simulated result.

## Tests

```bash
npx tsc --noEmit
npm test
npm run build
```

The integration suite covers session isolation, one-time locking, evidence guards, stable evidence versions, audit packet integrity, missing API configuration, structured audit validation, and the store lock contract.

## Deployment notes

Deploy the `main` branch to Vercel. Configure `DATABASE_URL` and `OPENAI_API_KEY` only through the hosting provider environment-variable system. Do not commit `.env` files or database credentials.

Production URL: pending deployment.

## Persistence note

Sessions are stored in Postgres. The production app no longer depends on `data/sessions.json`. The fixed evidence remains server-owned and versioned in the scenario domain module; GPT never generates or modifies it.