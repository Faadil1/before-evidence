# Before Evidence

## Thesis
People often decide what evidence means only after seeing it. Before Evidence registers the standard for belief change before evidence is revealed, then audits the later interpretation against that record.

## Product flow
Case -> Commitment -> Server Lock -> Evidence Reveal -> Interpretation -> Belief Update -> GPT-5.6 Audit.

## Why GPT-5.6
GPT-5.6 acts as an epistemic auditor. It evaluates the locked commitment, fixed evidence, interpretation, confidence change, and deterministic comparisons. It never selects, generates, or modifies evidence.

## Architecture
Next.js App Router with TypeScript, Zod validation, server route handlers, a server-only fixed scenario module, and Postgres-backed session persistence. Commitment locking is enforced in the database with an atomic status-guarded update. The audit uses OpenRouter's OpenAI-compatible chat completions endpoint with strict JSON schema output and server-side Zod validation.

## Local setup

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

For local runtime sessions, set `DATABASE_URL` to a Postgres database. Tests use an isolated in-memory store and do not require database credentials or model API calls.

## Environment variables

`DATABASE_URL` is required for deployed runtime persistence. Use Vercel Postgres, Neon Postgres, or another Postgres database available to the hosting environment.

`OPENROUTER_API_KEY` is required for production audits. Configure it only in the hosting provider environment or local `.env.local`. Never expose it in client code or commit it.

`OPENROUTER_MODEL` is required for production audits. The selected GPT-5.6 OpenRouter model slug is `openai/gpt-5.6-sol-20260709`, verified from OpenRouter's model catalog on 2026-07-20.

`OPENROUTER_SITE_URL` and `OPENROUTER_SITE_NAME` are optional server-only OpenRouter attribution headers. Empty values are not sent.

Direct OpenAI billing is not required. OpenRouter usage remains server-side only, and no API secrets belong in GitHub.

Without complete OpenRouter configuration, the audit returns an honest error and never produces a simulated result.

## Tests

```bash
npx tsc --noEmit
npm test
npm run build
```

The integration suite covers session isolation, one-time locking, evidence guards, stable evidence versions, audit packet integrity, missing OpenRouter configuration, structured audit validation, malformed provider output, provider failure, and the store lock contract.

## Deployment notes

Deploy the `main` branch to Vercel. Configure `DATABASE_URL`, `OPENROUTER_API_KEY`, and `OPENROUTER_MODEL` only through the hosting provider environment-variable system. Do not commit `.env` files, API keys, or database credentials.

Production URL: pending deployment.

## Persistence note

Sessions are stored in Postgres. The production app no longer depends on `data/sessions.json`. The fixed evidence remains server-owned and versioned in the scenario domain module; GPT never generates or modifies it.