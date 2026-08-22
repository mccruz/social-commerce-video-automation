import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [workflow] = JSON.parse(fs.readFileSync(path.join(root, 'workflows', 'shopee-affiliate-video-demo.json'), 'utf8'));
const expected = JSON.parse(fs.readFileSync(path.join(root, 'examples', 'expected-output.json'), 'utf8'));
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

const codeByName = new Map(
  workflow.nodes
    .filter(node => node.type === 'n8n-nodes-base.code')
    .map(node => [node.name, node.parameters.jsCode])
);

async function executeCode(name, items) {
  const source = codeByName.get(name);
  assert.ok(source, `missing code node ${name}`);
  const $input = {
    all: () => items,
    first: () => items[0]
  };
  const fn = new AsyncFunction('$input', source);
  const result = await fn($input);
  assert.ok(Array.isArray(result), `${name} must return items`);
  return result;
}

async function runDemo() {
  const sequence = [
    'Load Fictional Candidate Queue',
    'Extract Fields & Score Candidates',
    'Rank & Select Top Candidate',
    'Build Hook-Proof-CTA Script',
    'Build & Validate Storyboard',
    'Video Generation Adapter — DISABLED',
    'Human Review Required — LOCKED',
    'Build Shopee Video Handoff Preview',
    'Output — NOT PUBLISHED'
  ];
  let items = [{ json: {} }];
  for (const nodeName of sequence) items = await executeCode(nodeName, items);
  return items;
}

test('offline demo produces the documented non-publishing output', async () => {
  const result = await runDemo();
  assert.equal(result.length, 1);
  assert.deepEqual(result[0].json, expected);
});

test('ranking is deterministic and keeps generation disabled', async () => {
  let items = await executeCode('Load Fictional Candidate Queue', [{ json: {} }]);
  items = await executeCode('Extract Fields & Score Candidates', items);
  const scored = items.map(item => item.json);
  assert.equal(scored.length, 3);
  assert.ok(scored.every(candidate => candidate.Eligible));
  assert.ok(scored.every(candidate => candidate.MarketplaceQueried === false));

  const ranked = await executeCode('Rank & Select Top Candidate', items);
  assert.equal(ranked[0].json.SelectedCandidate.CandidateId, 'DEMO-COMMUTER-001');
  assert.deepEqual(
    ranked[0].json.RankedCandidates.map(candidate => candidate.CandidateId),
    ['DEMO-COMMUTER-001', 'DEMO-COMMUTER-002', 'DEMO-COMMUTER-003']
  );
  assert.equal(ranked[0].json.PaidGenerationTriggered, false);
  assert.equal(ranked[0].json.PublishingTriggered, false);
});

test('workflow graph contains no network-capable nodes', () => {
  const types = new Set(workflow.nodes.map(node => node.type));
  assert.equal(types.has('n8n-nodes-base.httpRequest'), false);
  assert.equal(types.has('n8n-nodes-base.googleSheets'), false);
  assert.equal(types.has('n8n-nodes-base.readWriteFile'), false);
  assert.equal(workflow.active, false);
});
