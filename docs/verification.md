# Verification record

## Public-artifact checks

The repository verification command is:

```bash
npm test
```

It performs these checks:

1. rebuilds the importable n8n workflow from the reviewed Code-node files;
2. parses the generated JSON and checks the graph for missing nodes;
3. checks that the workflow imports inactive;
4. rejects credential fields, network-capable nodes, private addresses, Google identifiers, service-account addresses, affiliate URLs, media files, execution metadata, and production paths;
5. compiles every Code node as JavaScript;
6. executes the full offline path using the embedded Code-node source;
7. compares the final result with the expected deterministic output;
8. exercises invalid metrics, non-boolean verification flags, blank verified facts, and direct script-builder validation;
9. verifies local Markdown links.

## Evidence interpretation

A passing test validates the public demo and its privacy boundary. It does not validate live marketplace data, Google authentication, provider availability, video fidelity, posting APIs, or revenue performance.

On 2026-09-09, `npm test` passed all five tests using Node.js 22.23.1,
including the invalid-input cases. This was a local Code-node harness run,
not a new execution inside n8n.
