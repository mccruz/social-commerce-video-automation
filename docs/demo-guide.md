# Offline demo guide

## What you need

- Node.js 20 or newer for the automated test; or
- an n8n 2.x instance for the visual workflow demo.

You do not need marketplace access, Google Sheets, an API key, a video model, or a social-media account.

## Automated demo

Run:

```bash
npm test
```

The command rebuilds the n8n workflow, checks its structure and privacy contract, executes every Code node in order with an n8n-compatible harness, and compares the final payload with [`examples/expected-output.json`](../examples/expected-output.json).

The top candidate is deterministic because the fixtures, scoring month, weights, and tie-break are fixed.

## Visual n8n demo

1. Download [`shopee-affiliate-video-demo.json`](../workflows/shopee-affiliate-video-demo.json).
2. In n8n, choose **Import from File**.
3. Open **Shopee Affiliate Video Automation — Offline Recruiter Demo**.
4. Select **Execute workflow**.
5. Follow the colored stage notes from left to right.
6. Inspect **Output — NOT PUBLISHED**.

Expected output:

- 3 fictional candidates parsed;
- 3 candidates pass the demonstration evidence gates;
- 1 top candidate selected;
- 1 script, storyboard, and disabled provider brief created;
- 0 paid generation requests;
- 0 publishing actions;
- final status `NOT_PUBLISHED`.

## Useful interview walkthrough

1. Show the candidate fixture and explain the manual/API input boundary.
2. Open **Extract Fields & Score Candidates** and point to the parser, capped scores, and evidence gates.
3. Open **Rank & Select Top Candidate** and show deterministic tie-breaking.
4. Show the script and storyboard nodes as structured transformations, not free-form generation.
5. Show **Video Generation Adapter — DISABLED** and **Human Review Required**.
6. End on **Output — NOT PUBLISHED** and explain what a production approval would need.

## Safe cleanup

The workflow imports as inactive, has no credentials, has no external nodes, and creates no external state. Delete it from the n8n instance when finished; there is no remote cleanup.
