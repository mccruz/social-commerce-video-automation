# Social Commerce Video Planning

An offline n8n demo that helps a content operator choose a product to review
and prepare a short video brief. It separates product evidence, creative
planning, and human approval before paid generation or publishing.

## Example result

**Synthetic offline result:** three fictional candidates produce one selected
product, **All-Weather Commuter Rain Cover**.

| Deliverable | Example |
| --- | --- |
| Selection | Visible scoring rules choose one eligible candidate |
| Storyboard | One 8-second portrait shot; slow push-in, light rain, product details preserved |
| Reviewer decision | Check facts, media rights, disclosure, and the eventual rendered video |
| Final status | `NOT_PUBLISHED`; zero paid generation requests |

This is a video **plan**, not a generated video. Inspect the
[expected result](examples/expected-output.json) and
[storyboard construction](workflow_code/build_storyboard.js).

## My contribution

I built the input checks, deterministic ranking, script and storyboard
construction, and locked review handoff. The public workflow uses fixed
templates and rules; it makes no LLM or video-generation calls.

[![n8n](https://img.shields.io/badge/built%20with-n8n-EA4B71.svg)](https://n8n.io/)
[![Demo](https://img.shields.io/badge/demo-offline%20and%20credential--free-2D6A4F.svg)](docs/demo-guide.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-0B7F5C.svg)](LICENSE)

![Architecture showing fictional product input, explainable ranking, creative planning, human review, and a not-published output](assets/architecture.svg)

<a id="review-this-project-in-3-minutes"></a>

## Explore the project

Start with the example above, then follow the diagram and the
[engineering evidence](#engineering-evidence). Setup is optional for review.

## The problem

Social-commerce content requires several different decisions: which product to
test, which facts are supported, whether supplied media can be used, what the
video should show, and whether a person has approved the result. Combining all
of those decisions inside one AI prompt makes the process difficult to review.

This workflow separates them into visible steps. Fixed rules select a product,
the content plan uses only reviewed facts, and the process stops before any paid
generation or publishing action.

## How it works

1. Load fictional product details that represent reviewed source data.
2. Convert the supplied text into consistent product fields.
3. Check that required facts and media rights are present.
4. Rank eligible products with visible scoring rules.
5. Build a hook, script, storyboard, and video brief from supported facts.
6. Stop before video generation and require human review.
7. Prepare a manual multi-platform handoff marked `NOT_PUBLISHED`.

## Engineering evidence

| Capability | Implementation | Check |
| --- | --- | --- |
| Reject incomplete metrics and evidence | [Input gate](workflow_code/extract_score.js) | [Invalid-input tests](tests/workflow.test.mjs) |
| Produce a repeatable selection | [Ranking](workflow_code/rank_select.js) | [Fixture and ranking assertions](tests/workflow.test.mjs) |
| Require a review before publishing | [Locked review](workflow_code/human_review.js) | [Expected non-publishing output](examples/expected-output.json) |

## Important controls

- **No marketplace scraping.** The demo reads only supplied fictional text.
- **Repeatable ranking.** The same inputs and scoring month produce the same
  order.
- **Reviewed facts and limited claim checks.** The script uses supplied verified
  facts and rejects a fixed list of phrases such as “guaranteed” and “lowest
  price.” A person must still confirm factual support and current pricing.
- **No paid generation.** The public adapter is disabled and records zero
  submitted requests.
- **No automatic publishing.** The final output is a review package, not a
  platform post.
- **Disclosure remains required.** A production reviewer must confirm current
  affiliate and synthetic-media disclosure requirements.

## Optional offline demo

The demo requires Node.js but no credentials, network access, marketplace
account, or model subscription.

```bash
npm test
```

The final output should show that one fictional candidate was selected, zero
paid generation requests were submitted, and publishing was not triggered.

To inspect the workflow in n8n:

1. Import
   [`workflows/social-commerce-video-automation-demo.json`](workflows/social-commerce-video-automation-demo.json)
   into n8n 2.x.
2. Open **Social Commerce Video Automation — Offline Recruiter Demo**.
3. Select **Execute workflow**.
4. Inspect **Output — NOT PUBLISHED**.

See the [demo guide](docs/demo-guide.md) for the complete walkthrough.

## Public demo boundary

The repository is a clean portfolio demonstration, not a production export. It
uses fictional products, sellers, metrics, links, and media references. It does
not retrieve current marketplace data, write to Google Sheets, generate video,
upload media, or publish to a platform.

A production version would need approved data access, attributable human
approval, current advertising and platform-policy checks, and monitored
generation and publishing integrations. Ranking scores would also need human
calibration against real outcomes; this demo does not claim that a score
predicts revenue.

## Project guide

- [Architecture and design decisions](docs/architecture.md)
- [Offline demo guide](docs/demo-guide.md)
- [Verification record](docs/verification.md)
- [Public/private boundary](docs/provenance.md)
- [Expected output](examples/expected-output.json)
- [Importable workflow](workflows/social-commerce-video-automation-demo.json)

## License and independence

This independent project is not affiliated with or endorsed by a marketplace,
social network, affiliate network, or video-generation provider.

Copyright © 2026 Mark Cruz. Released under the [MIT License](LICENSE).
