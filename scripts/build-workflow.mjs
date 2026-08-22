import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readCode = name => fs.readFileSync(path.join(root, 'workflow_code', name), 'utf8').trim();

const note = (id, name, content, position, width, height, color) => ({
  id,
  name,
  type: 'n8n-nodes-base.stickyNote',
  typeVersion: 1,
  position,
  parameters: { content, width, height, color }
});
const codeNode = (id, name, file, position) => ({
  id,
  name,
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position,
  parameters: {
    mode: 'runOnceForAllItems',
    jsCode: readCode(file)
  }
});

const nodes = [
  note(
    'note-overview',
    'READ ME — Offline Recruiter Demo',
    '## Shopee Affiliate Video Automation\n\n**Flow:** fictional product text → extraction → deterministic ranking → script → storyboard → disabled generation receipt → human review → Shopee Video handoff preview.\n\n**Safety state:** inactive, credential-free, offline, zero paid calls, and no publishing nodes.',
    [-1120, -500],
    760,
    300,
    7
  ),
  note(
    'note-stage-1',
    '1 — Intake, extraction, and ranking',
    '## 1 · Product intelligence\n\nParses only fictional user-supplied text. Evidence and media-rights fields gate eligibility before transparent weighted scoring.',
    [-1120, -120],
    1220,
    520,
    5
  ),
  note(
    'note-stage-2',
    '2 — Script and storyboard',
    '## 2 · Creative planning\n\nBuilds source-grounded copy, a one-shot storyboard, continuity anchors, forbidden changes, and a provider-neutral prompt.',
    [180, -120],
    960,
    520,
    4
  ),
  note(
    'note-stage-3',
    '3 — Locked production boundary',
    '## 3 · Generation and approval controls\n\nThe adapter compiles a request shape but submits nothing. Human review remains required and publishing stays blocked.',
    [1220, -120],
    960,
    520,
    2
  ),
  note(
    'note-stage-4',
    '4 — Manual Shopee Video handoff',
    '## 4 · Non-publishing handoff\n\nPrepares a review package only. The final status is always `NOT_PUBLISHED`.',
    [2260, -120],
    700,
    520,
    3
  ),
  {
    id: 'manual-trigger',
    name: 'Manual Trigger — Offline Demo',
    type: 'n8n-nodes-base.manualTrigger',
    typeVersion: 1,
    position: [-1040, 100],
    parameters: {}
  },
  codeNode('load-fixtures', 'Load Fictional Candidate Queue', 'load_fixtures.js', [-820, 100]),
  codeNode('extract-score', 'Extract Fields & Score Candidates', 'extract_score.js', [-560, 100]),
  codeNode('rank-select', 'Rank & Select Top Candidate', 'rank_select.js', [-280, 100]),
  codeNode('build-script', 'Build Hook-Proof-CTA Script', 'build_script.js', [260, 100]),
  codeNode('build-storyboard', 'Build & Validate Storyboard', 'build_storyboard.js', [560, 100]),
  codeNode('compile-adapter', 'Video Generation Adapter — DISABLED', 'compile_disabled_adapter.js', [1300, 100]),
  codeNode('human-review', 'Human Review Required — LOCKED', 'human_review.js', [1640, 100]),
  codeNode('build-handoff', 'Build Shopee Video Handoff Preview', 'build_handoff.js', [2340, 100]),
  codeNode('final-output', 'Output — NOT PUBLISHED', 'final_output.js', [2660, 100])
];

const chain = [
  'Manual Trigger — Offline Demo',
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
const connections = {};
for (let index = 0; index < chain.length - 1; index += 1) {
  connections[chain[index]] = {
    main: [[{ node: chain[index + 1], type: 'main', index: 0 }]]
  };
}

const workflow = {
  name: 'Shopee Affiliate Video Automation — Offline Recruiter Demo',
  active: false,
  nodes,
  connections,
  settings: {
    executionOrder: 'v1',
    saveManualExecutions: false,
    saveDataErrorExecution: 'none',
    saveDataSuccessExecution: 'none',
    saveExecutionProgress: false
  },
  meta: {
    publicPortfolioArtifact: true,
    fictionalDataOnly: true,
    credentialsEmbedded: false,
    networkCallsEnabled: false,
    paidGenerationEnabled: false,
    publishingEnabled: false,
    version: '0.1.0'
  },
  tags: []
};

const output = path.join(root, 'workflows', 'shopee-affiliate-video-demo.json');
fs.writeFileSync(output, `${JSON.stringify([workflow], null, 2)}\n`);
console.log(`Built ${path.relative(root, output)} with ${nodes.length} nodes`);
