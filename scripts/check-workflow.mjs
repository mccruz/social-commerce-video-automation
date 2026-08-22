import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflowPath = path.join(root, 'workflows', 'shopee-affiliate-video-demo.json');
const raw = fs.readFileSync(workflowPath, 'utf8');

const forbiddenPatterns = [
  ['credential field', /"credentials"\s*:/i],
  ['private IPv4 address', /\b(?:10\.|127\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)\d{1,3}\.\d{1,3}\b/],
  ['Tailscale address', /\b100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d{1,3}\.\d{1,3}\b/],
  ['external URL', /https?:\/\//i],
  ['Google document reference', /(?:documentId|spreadsheetId|spreadsheets\/d\/)/i],
  ['cloud project identifier', /(?:projectId|googleCloudProject)/i],
  ['service-account address', /iam\.gserviceaccount\.com/i],
  ['affiliate link', /(?:s\.shopee\.|shopee\.[a-z.]+\/product)/i],
  ['authorization secret shape', /(?:bearer\s+[a-z0-9._-]+|api[_ -]?key|client[_ -]?secret|password|access[_ -]?token)/i],
  ['private filesystem path', /(?:\/Users\/|\/home\/|\/files\/)/],
  ['generated media file', /\.(?:mp4|mov|webm)\b/i],
  ['execution metadata', /(?:executionId|instanceId|canaryExecution)/i]
];
const forbiddenNodeTypes = new Set([
  'n8n-nodes-base.httpRequest',
  'n8n-nodes-base.googleSheets',
  'n8n-nodes-base.gmail',
  'n8n-nodes-base.telegram',
  'n8n-nodes-base.slack',
  'n8n-nodes-base.readWriteFile'
]);

const failures = [];
const fail = message => failures.push(message);
for (const [label, pattern] of forbiddenPatterns) {
  if (pattern.test(raw)) fail(`workflow contains forbidden ${label}`);
}

let bundle;
try {
  bundle = JSON.parse(raw);
} catch (error) {
  fail(`workflow is not valid JSON: ${error.message}`);
}

if (bundle) {
  if (!Array.isArray(bundle) || bundle.length !== 1) fail('workflow export must contain exactly one workflow');
  const workflow = bundle[0];
  if (workflow.active !== false) fail('workflow must import inactive');
  if (workflow.meta?.networkCallsEnabled !== false) fail('network calls must be explicitly disabled');
  if (workflow.meta?.paidGenerationEnabled !== false) fail('paid generation must be explicitly disabled');
  if (workflow.meta?.publishingEnabled !== false) fail('publishing must be explicitly disabled');

  const names = new Set();
  const ids = new Set();
  for (const node of workflow.nodes || []) {
    if (!node.name || names.has(node.name)) fail(`missing or duplicate node name: ${node.name || '<blank>'}`);
    if (!node.id || ids.has(node.id)) fail(`missing or duplicate node id: ${node.id || '<blank>'}`);
    names.add(node.name);
    ids.add(node.id);
    if (forbiddenNodeTypes.has(node.type)) fail(`network or filesystem-capable node is not allowed: ${node.name}`);
    if (node.type === 'n8n-nodes-base.code') {
      const source = node.parameters?.jsCode;
      if (!source) fail(`code node has no source: ${node.name}`);
      else {
        try {
          new Function(source);
        } catch (error) {
          fail(`invalid JavaScript in ${node.name}: ${error.message}`);
        }
      }
    }
  }

  for (const [source, outputs] of Object.entries(workflow.connections || {})) {
    if (!names.has(source)) fail(`missing connection source: ${source}`);
    for (const branches of Object.values(outputs)) {
      for (const branch of branches) {
        for (const edge of branch) {
          if (!names.has(edge.node)) fail(`missing connection target: ${edge.node}`);
        }
      }
    }
  }

  const finalNode = workflow.nodes.find(node => node.name === 'Output — NOT PUBLISHED');
  if (!finalNode) fail('required non-publishing output node is missing');
}

const markdownFiles = [
  'README.md',
  'SECURITY.md',
  'docs/architecture.md',
  'docs/demo-guide.md',
  'docs/provenance.md',
  'docs/verification.md'
];
for (const relativePath of markdownFiles) {
  const absolutePath = path.join(root, relativePath);
  const markdown = fs.readFileSync(absolutePath, 'utf8');
  for (const match of markdown.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].trim();
    if (!target || target.startsWith('#') || /^[a-z]+:/i.test(target)) continue;
    const filePart = target.split('#', 1)[0];
    const resolved = path.resolve(path.dirname(absolutePath), decodeURIComponent(filePart));
    if (!fs.existsSync(resolved)) fail(`${relativePath} links to missing file ${target}`);
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exit(1);
}

console.log('PASS: workflow is inactive, credential-free, offline, generation-disabled, and non-publishing');
console.log(`PASS: ${markdownFiles.length} Markdown files have valid local links`);
