# Before Evidence

Define what would change your mind before seeing the result. Before Evidence locks that standard, reveals fixed evidence, then uses GPT-5.6 to audit whether you honored it.

## Live demo

https://before-evidence.vercel.app

No account or credentials are required.

## Thesis

People often decide what evidence means only after seeing it. Before Evidence registers the standard for belief change before evidence is revealed, then audits the later interpretation against that record.

A decision journal records what you thought. Before Evidence records what you promised would change your mind.

## Product flow

```text
Case
→ Commitment
→ Deterministic quality check
→ GPT-5.6 semantic validation
→ Review
→ Server lock
→ Evidence reveal
→ Interpretation
→ Confidence update
→ GPT-5.6 audit
```

## Judge quick test

1. Open the live demo.
2. Complete the fixed onboarding-experiment commitment.
3. Run semantic validation.
4. Review and seal the commitment.
5. Reveal the predetermined evidence.
6. Submit an interpretation and confidence update.
7. Review the normalized verdict, discrepancy map, confidence calibration, surviving rivals, next-experiment assessment, and provider record.

The core demo scenario uses a 10% refutation threshold, 55% initial confidence, an observed 18% activation lift, and a post-evidence confidence reduction to 35% based on a new unregistered concern.

## Why GPT-5.6

GPT-5.6 has two distinct roles.

### Before lock

It checks whether the user-authored commitment is understandable, operational, internally coherent, and suitable for later auditing. It does not see the predetermined evidence, rewrite the user's belief, choose the threshold, or generate the prediction.

### After evidence

It compares the sealed commitment, fixed evidence, interpretation, confidence update, and proposed next experiment. It returns a structured result including:

- normalized verdict;
- evidence relation;
- discrepancy map;
- post-hoc threshold or exclusion flags;
- confidence calibration;
- surviving rival explanations;
- next-experiment assessment.

GPT-5.6 never selects, generates, or modifies the evidence, and it is not presented as an authority that determines truth.

## How Codex was used

Codex helped implement and harden:

- the Next.js application;
- server-enforced commitment locking;
- evidence-access guards;
- Postgres persistence;
- deterministic input validation;
- structured GPT-5.6 schemas;
- OpenRouter integration;
- provider failure and retry handling;
- canonical SHA-256 record fingerprints;
- JSON and Markdown export;
- deterministic record verification;
- responsive UX and accessibility improvements;
- adversarial tests;
- GitHub Actions and Vercel deployment.

Key product decisions remained human-led:

- keeping one fixed scenario;
- refusing AI-generated evidence;
- keeping the commitment user-authored;
- separating pre-lock validation from post-evidence auditing;
- preventing GPT-5.6 from rewriting the user's commitment;
- enforcing immutability server-side;
- making evidence inaccessible before lock;
- using a discrepancy map instead of a generic AI summary;
- rejecting chat UI, gamification, and unsupported claims of legal or scientific authority.

## Sample scenario

**Claim**  
The revised onboarding sequence increases day-7 activation among eligible new accounts.

**Initial confidence**  
55%

**Rival explanations**

- Acquisition mix changed during the experiment.
- A temporary novelty effect changed user behavior.

**Prediction**  
Activation increases for new accounts.

**Refutation condition**  
A lift below 10% refutes the claim.

**Experiment**  
A 14-day randomized holdout using activation within 7 days as the metric.

**Predetermined evidence**  
An 18% activation lift.

**Demo update**  
Confidence decreases from 55% to 35% after introducing a new concern that was not registered before seeing the evidence.

**Expected audit direction**  
The evidence supports the registered prediction and does not trigger the refutation condition, while the later confidence reduction introduces a post-hoc standard change.

## Architecture

Before Evidence uses:

- Next.js App Router;
- TypeScript;
- React;
- Zod validation;
- server route handlers;
- a server-only fixed-scenario module;
- Postgres-backed session persistence;
- OpenRouter's OpenAI-compatible chat-completions endpoint;
- strict JSON-schema output with server-side Zod validation;
- GitHub Actions;
- Vercel.

Commitment locking is enforced in the database with an atomic, status-guarded update. Fixed evidence remains server-owned and versioned. The audit packet is assembled from server-owned state rather than trusting client-submitted commitment or evidence data.

## Integrity model

- The commitment becomes immutable after sealing.
- Predetermined evidence is unavailable before lock.
- A client cannot replace the stored commitment or evidence.
- The audit uses the server-owned record.
- Exports can be checked against a canonical SHA-256 fingerprint.
- The fingerprint verifies record consistency; it does not prove identity, legal validity, blockchain registration, or independent third-party timestamping.

## Local setup

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

For local runtime sessions, set `DATABASE_URL` to a Postgres database. Tests use an isolated in-memory store and do not require database credentials or model API calls.

## Environment variables

`DATABASE_URL` is required for deployed runtime persistence. Use Neon Postgres, Vercel Postgres, or another Postgres database available to the hosting environment.

`OPENROUTER_API_KEY` is required for production audits. Configure it only in the hosting provider environment or local `.env.local`. Never expose it in client code or commit it.

`OPENROUTER_MODEL` is required for production audits. The selected GPT-5.6 OpenRouter model slug is `openai/gpt-5.6-sol-20260709`.

`OPENROUTER_SITE_URL` and `OPENROUTER_SITE_NAME` are optional server-only OpenRouter attribution headers. Empty values are not sent.

Direct OpenAI billing is not required. OpenRouter usage remains server-side only, and no API secrets belong in GitHub.

Without complete OpenRouter configuration, the audit returns an honest error and never produces a simulated result.

## Tests

```bash
npx tsc --noEmit
npm test
npm run build
```

The integration suite covers session isolation, one-time locking, evidence guards, stable evidence versions, audit-packet integrity, missing OpenRouter configuration, structured audit validation, malformed provider output, provider failure, semantic-validation behavior, record fingerprinting, export verification, and the store lock contract.

## Deployment

Deploy the `main` branch to Vercel. Configure `DATABASE_URL`, `OPENROUTER_API_KEY`, and `OPENROUTER_MODEL` only through the hosting provider environment-variable system.

Production URL: https://before-evidence.vercel.app

Do not commit `.env` files, API keys, or database credentials.

## Persistence

Sessions are stored in Postgres. The production app does not depend on `data/sessions.json`. Fixed evidence remains server-owned and versioned in the scenario domain module; GPT never generates or modifies it.

## Limitations

- The submission intentionally uses one fixed scenario to prove the mechanism clearly.
- The audit evaluates consistency with the user's prior standard; it does not determine objective truth.
- The product does not claim to eliminate bias.
- The record fingerprint is an integrity check, not identity or legal proof.

## License

MIT. See [LICENSE](./LICENSE).
