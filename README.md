# Affiliate Video Automation

> A recruiter-friendly n8n demo that turns user-supplied product details into an explainable product ranking, source-grounded short-form script, storyboard, and locked affiliate-platform handoff preview.

[![n8n](https://img.shields.io/badge/built%20with-n8n-EA4B71.svg)](https://n8n.io/) [![Demo](https://img.shields.io/badge/demo-offline%20and%20credential--free-2D6A4F.svg)](docs/demo-guide.md) [![Generation](https://img.shields.io/badge/video%20generation-disabled-6B7280.svg)](docs/architecture.md) [![License: MIT](https://img.shields.io/badge/license-MIT-0B7F5C.svg)](LICENSE)

![Architecture showing fictional product input, extraction, deterministic ranking, creative planning, disabled generation, human review, and a not-published output](assets/architecture.svg)

The project demonstrates an automation pattern for affiliate content operations without scraping a marketplace, making a paid AI call, or publishing content. It is designed for automation and implementation roles: the interesting work is the orchestration, evidence gates, deterministic decision logic, cost boundary, and human-in-the-loop handoff.

## Review this project in 3 minutes

1. Follow the architecture diagram from fictional product text to the locked handoff preview.
2. Scan the [business controls](#business-controls) and [design decisions](#design-decisions).
3. Open the [importable n8n workflow](workflows/affiliate-video-automation-demo.json) or read the [architecture notes](docs/architecture.md).
4. See the [verification record](docs/verification.md) for the exact checks run.

Running n8n is optional. The repository includes an offline test harness that executes the same JavaScript embedded in the workflow.

## The business problem

Affiliate content production has several separate decisions that are easy to blur together:

- Which products are worth testing?
- Which product facts are sufficiently supported?
- Can the supplied media be used?
- What should the video show and say?
- Is a paid generation request authorized?
- Has a person reviewed the final media and disclosure?

This workflow makes each decision visible. Product selection is deterministic and explainable. Creative planning uses only reviewed facts. Video generation remains disabled. The final node explicitly reports that nothing was published.

## The workflow in plain English

1. **Load fictional candidate text.** Three commuter-product fixtures simulate rows that could come from a reviewed Google Sheet.
2. **Extract and validate fields.** Parse price, commission, sales, ratings, reviews, category, and product features from user-supplied text.
3. **Score and rank products.** Combine commission economics, demand, trust, commuter fit, video fit, angle depth, and seasonality using visible weights.
4. **Create the content plan.** Build a hook-proof-CTA script, one-shot storyboard, continuity constraints, and a provider-neutral video prompt.
5. **Stop before generation.** Record a disabled generation adapter with zero paid calls.
6. **Require human review.** Block publishing until facts, rights, affiliate disclosure, product fidelity, and final media are reviewed.
7. **Prepare an affiliate-platform preview.** Produce a configurable manual handoff package and end at `NOT_PUBLISHED`.

## What this demonstrates

| Automation need | Workflow response |
| --- | --- |
| Product data arrives as semi-structured text | Parse it into a consistent candidate schema |
| Selection should be explainable | Use explicit weights and per-candidate score components |
| High sales should not override weak evidence | Require fact and image-rights gates before eligibility |
| AI video can alter product details | Add continuity anchors, forbidden changes, and mandatory final-media review |
| Paid generation needs a boundary | Keep the adapter disabled and report zero submitted requests |
| Affiliate content needs disclosure | Include disclosure in the script and handoff checklist |
| Platform posting is not yet integrated | End in a manual affiliate-platform package marked `NOT_PUBLISHED` |

## Business controls

- **No marketplace scraping.** The demo parses only supplied text. A production intake should use an approved API or a reviewed manual input process.
- **Deterministic ranking.** The same candidate inputs and scoring month produce the same result.
- **Evidence before eligibility.** A candidate cannot rank unless facts and media rights are confirmed.
- **Source-grounded copy.** The script uses verified facts and blocks unverified superlatives, scarcity, prices, and guarantees.
- **Zero-cost demo.** There are no HTTP, Google Sheets, Gemini, or publishing nodes in the public workflow.
- **Human approval cannot be bypassed.** The final preview remains non-publishable even when upstream checks pass.
- **Synthetic media disclosure.** A production handoff must identify AI-generated footage and follow current platform and advertising requirements.

## Design decisions

### Why rules before an AI agent

Product ranking is a structured decision. Fixed formulas make the outcome reproducible, inexpensive, and easy to audit. A future language model can suggest creative angles, but it should not silently override evidence, rights, or eligibility gates.

### Why storyboard before generation

The storyboard separates camera movement, subject action, environmental motion, continuity anchors, and prohibited changes. That gives a video model a constrained single-shot brief and gives the human reviewer a concrete fidelity checklist.

### Why the public workflow is offline

A raw live export would expose more operational detail than recruiters need. This clean derivative preserves the architecture and decision logic while replacing external integrations, identifiers, credentials, real links, and media with fictional fixtures.

## Run the offline demo

### Option 1: automated verification

```bash
npm test
```

Expected final status:

```json
{
  "status": "NOT_PUBLISHED",
  "selectedCandidateId": "DEMO-COMMUTER-001",
  "paidGenerationRequests": 0,
  "publishingTriggered": false
}
```

### Option 2: import into n8n

1. Use n8n 2.x.
2. Import [`workflows/affiliate-video-automation-demo.json`](workflows/affiliate-video-automation-demo.json).
3. Open **Affiliate Video Automation — Offline Recruiter Demo**.
4. Select **Execute workflow**.
5. Inspect **Output — NOT PUBLISHED**.

No credentials, network access, API key, marketplace account, or paid model subscription is required. See the [demo guide](docs/demo-guide.md).

## Repository map

```text
assets/architecture.svg                     Recruiter-facing system overview
assets/social-preview.png                   1280×640 repository preview asset
docs/architecture.md                        Detailed flow and tradeoffs
docs/demo-guide.md                          Import and demo walkthrough
docs/provenance.md                          Public/private derivation boundary
docs/verification.md                        Checks and evidence boundary
examples/expected-output.json               Deterministic demo contract
scripts/build-workflow.mjs                  Builds the importable workflow
scripts/check-workflow.mjs                  Privacy and structure checks
tests/workflow.test.mjs                     Offline end-to-end execution
workflow_code/*.js                          Reviewable n8n Code-node logic
workflows/affiliate-video-automation-demo.json  Generated credential-free workflow
```

## Deliberate limitations

- The demo does not retrieve current marketplace data or affiliate metrics.
- It does not write extracted fields back to Google Sheets.
- Heuristic content-fit scores need human calibration against conversion data.
- It does not generate, host, upload, or publish video.
- It does not claim that ranking score predicts revenue.
- Platform rules, affiliate disclosures, model availability, and prices are time-sensitive and must be rechecked before production use.

## Interview talking points

- How would you make candidate claiming idempotent when multiple n8n runs share one queue?
- When should an LLM enrich deterministic ranking, and what may it never override?
- How would you monitor extraction drift without storing sensitive raw source data?
- What evidence should unlock a paid generation node?
- How would you design an attributable approve/reject step before publishing?

## Brand-neutral demo notice

This independent portfolio project is not affiliated with or endorsed by any marketplace, social network, affiliate network, or video-generation provider. All products, sellers, metrics, URLs, and media references in the demo are fictional. Production use must follow the current rules of each selected network.

Copyright © 2026 Mark Cruz. Released under the [MIT License](LICENSE).
