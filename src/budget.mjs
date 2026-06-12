import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
export function defaultStatePath() { return path.join(os.homedir(), '.ai-agent-budget-guard.json'); }
export function loadPricing(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
export function emptyState() { return { version: 1, events: [], runs: [] }; }
export function loadState(file) { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : emptyState(); }
export function saveState(file, state) { fs.writeFileSync(file, JSON.stringify(state, null, 2)); }
export function resetState(file) { saveState(file, emptyState()); }
export function calculateCost(pricing, usage) {
  const model = pricing.models[usage.model];
  if (!model) throw new Error(`Unknown model: ${usage.model}`);
  const input = Number(usage.input || 0), output = Number(usage.output || 0), cacheRead = Number(usage.cacheRead || 0);
  return { model: usage.model, inputTokens: input, outputTokens: output, cacheReadTokens: cacheRead, inputCostUsd: (input / 1_000_000) * model.inputPer1M, outputCostUsd: (output / 1_000_000) * model.outputPer1M, cacheReadCostUsd: (cacheRead / 1_000_000) * model.cacheReadPer1M };
}
export function recordUsage(statePath, pricing, usage) {
  const state = loadState(statePath); const cost = calculateCost(pricing, usage); const totalCostUsd = cost.inputCostUsd + cost.outputCostUsd + cost.cacheReadCostUsd; const event = { ...cost, totalCostUsd, recordedAt: new Date().toISOString() };
  state.events.push(event); saveState(statePath, state); return event;
}
export function summarizeState(state) {
  const totalCostUsd = state.events.reduce((sum, event) => sum + Number(event.totalCostUsd || 0), 0); const byModel = {};
  for (const event of state.events) { byModel[event.model] ||= { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, totalCostUsd: 0 }; byModel[event.model].inputTokens += event.inputTokens || 0; byModel[event.model].outputTokens += event.outputTokens || 0; byModel[event.model].cacheReadTokens += event.cacheReadTokens || 0; byModel[event.model].totalCostUsd += event.totalCostUsd || 0; }
  return { totalCostUsd, eventCount: state.events.length, runCount: state.runs.length, byModel };
}
