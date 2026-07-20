# Before Evidence

## Thesis
People often decide what evidence means only after seeing it. Before Evidence registers the standard for belief change before evidence is revealed, then audits the later interpretation against that record.

## Product flow
Case -> Commitment -> Server Lock -> Evidence Reveal -> Interpretation -> Belief Update -> GPT-5.6 Audit.

## Why GPT-5.6
GPT-5.6 acts as an epistemic auditor. It evaluates the locked commitment, fixed evidence, interpretation, confidence change, and deterministic comparisons. It never selects, generates, or modifies evidence.

## Architecture
Next.js App Router with TypeScript, Zod validation, server route handlers, a server-only fixed scenario module, and a file-backed session store. The audit uses the OpenAI Responses API with strict structured output validation.

## Local setup

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

## Environment variables

OPENAI_API_KEY is required only in the hosting environment or local .env.local. Never expose it in client code or commit it. OPENAI_MODEL is optional and defaults to gpt-5.6.

Without OPENAI_API_KEY, the audit returns an honest error and never produces a simulated result.

## Tests

```bash
npx tsc --noEmit
npm test
npm run build
```

The integration suite covers session isolation, one-time locking, evidence guards, stable evidence versions, audit packet integrity, missing API configuration, and structured audit validation.

## Deployment notes

Use a Node.js LTS deployment with the same commands as CI. Configure OPENAI_API_KEY as a secret in the hosting provider. The repository includes GitHub Actions CI for pushes and pull requests.

## Current persistence limitation

Sessions are stored in data/sessions.json, which is ignored by Git. This is suitable for a persistent single-server deployment. Serverless deployment should replace the file store with the platform's persistent database before production use.