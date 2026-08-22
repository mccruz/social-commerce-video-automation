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
8. verifies local Markdown links.

## Evidence interpretation

A passing test validates the public demo and its privacy boundary. It does not validate live marketplace data, Google authentication, provider availability, video fidelity, posting APIs, or revenue performance.

The exact local run result and commit are recorded when the publication candidate is finalized.
