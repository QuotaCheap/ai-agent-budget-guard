import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCost, summarizeState } from '../src/budget.mjs';
test('calculates token cost', () => { const pricing = { models: { demo: { inputPer1M: 1, outputPer1M: 10, cacheReadPer1M: 0.5 } } }; const cost = calculateCost(pricing, { model: 'demo', input: 1_000_000, output: 100_000, cacheRead: 2_000_000 }); assert.equal(cost.inputCostUsd, 1); assert.equal(cost.outputCostUsd, 1); assert.equal(cost.cacheReadCostUsd, 1); });
test('summarizes state', () => { const summary = summarizeState({ events: [{ model: 'a', inputTokens: 1, outputTokens: 2, cacheReadTokens: 3, totalCostUsd: 0.25 }], runs: [{}] }); assert.equal(summary.totalCostUsd, 0.25); assert.equal(summary.runCount, 1); assert.equal(summary.byModel.a.inputTokens, 1); });
