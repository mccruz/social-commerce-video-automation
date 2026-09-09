import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [workflow] = JSON.parse(fs.readFileSync(path.join(root, 'workflows', 'social-commerce-video-automation-demo.json'), 'utf8'));
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
    'Build Multi-Platform Handoff Preview',
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

test('invalid metrics and evidence gates are ineligible', async () => {
  const [fixture] = await executeCode('Load Fictional Candidate Queue', [{ json: {} }]);

  const nullMetric = structuredClone(fixture);
  nullMetric.json.RawListingText = nullMetric.json.RawListingText.replace('Sold: 3.2K', 'Sold: null');
  const [nullMetricResult] = await executeCode('Extract Fields & Score Candidates', [nullMetric]);
  assert.equal(nullMetricResult.json.MonthlySold, null);
  assert.equal(nullMetricResult.json.Eligible, false);
  assert.match(nullMetricResult.json.SelectionReason, /MonthlySold/);

  const missingMetric = structuredClone(fixture);
  missingMetric.json.RawListingText = missingMetric.json.RawListingText.replace('Rating: 4.8\n', '');
  const [missingMetricResult] = await executeCode('Extract Fields & Score Candidates', [missingMetric]);
  assert.equal(missingMetricResult.json.Rating, null);
  assert.equal(missingMetricResult.json.Eligible, false);
  assert.match(missingMetricResult.json.SelectionReason, /Rating/);

  const missingSold = structuredClone(fixture);
  missingSold.json.RawListingText = missingSold.json.RawListingText.replace('Sold: 3.2K\n', '');
  const [missingSoldResult] = await executeCode('Extract Fields & Score Candidates', [missingSold]);
  assert.equal(missingSoldResult.json.MonthlySold, null);
  assert.equal(missingSoldResult.json.Eligible, false);
  assert.match(missingSoldResult.json.SelectionReason, /MonthlySold/);

  const missingReviews = structuredClone(fixture);
  missingReviews.json.RawListingText = missingReviews.json.RawListingText.replace('Reviews: 890\n', '');
  const [missingReviewsResult] = await executeCode('Extract Fields & Score Candidates', [missingReviews]);
  assert.equal(missingReviewsResult.json.ReviewCount, null);
  assert.equal(missingReviewsResult.json.Eligible, false);
  assert.match(missingReviewsResult.json.SelectionReason, /ReviewCount/);

  const stringFlag = structuredClone(fixture);
  stringFlag.json.FactsVerified = 'false';
  stringFlag.json.RightsConfirmed = 'false';
  const [stringFlagResult] = await executeCode('Extract Fields & Score Candidates', [stringFlag]);
  assert.equal(stringFlagResult.json.Eligible, false);
  assert.match(stringFlagResult.json.SelectionReason, /FactsVerified/);
  assert.match(stringFlagResult.json.SelectionReason, /RightsConfirmed/);

  const emptyFact = structuredClone(fixture);
  emptyFact.json.VerifiedFacts = ['   '];
  const [emptyFactResult] = await executeCode('Extract Fields & Score Candidates', [emptyFact]);
  assert.equal(emptyFactResult.json.Eligible, false);
  assert.match(emptyFactResult.json.SelectionReason, /VerifiedFacts/);

  const emptyFacts = structuredClone(fixture);
  emptyFacts.json.VerifiedFacts = [];
  const [emptyFactsResult] = await executeCode('Extract Fields & Score Candidates', [emptyFacts]);
  assert.equal(emptyFactsResult.json.Eligible, false);
  assert.match(emptyFactsResult.json.SelectionReason, /VerifiedFacts/);
});

test('script builder rejects malformed verified facts when called directly', async () => {
  const [fixture] = await executeCode('Load Fictional Candidate Queue', [{ json: {} }]);
  const malformed = {
    json: {
      SelectedCandidate: {
        ...fixture.json,
        Category: 'Motorcycle Rain Gear',
        VerifiedFacts: ['Waterproof outer layer', '  ']
      }
    }
  };

  await assert.rejects(
    executeCode('Build Hook-Proof-CTA Script', [malformed]),
    /VerifiedFacts must be a non-empty array of non-blank strings/
  );
});

test('workflow graph contains no network-capable nodes', () => {
  const types = new Set(workflow.nodes.map(node => node.type));
  assert.equal(types.has('n8n-nodes-base.httpRequest'), false);
  assert.equal(types.has('n8n-nodes-base.googleSheets'), false);
  assert.equal(types.has('n8n-nodes-base.readWriteFile'), false);
  assert.equal(workflow.active, false);
});
