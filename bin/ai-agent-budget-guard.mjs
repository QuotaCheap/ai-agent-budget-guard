#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { defaultStatePath, loadPricing, loadState, recordUsage, resetState, saveState, summarizeState } from '../src/budget.mjs';

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const item = argv[i];
    if (item === '--') { args._.push(...argv.slice(i + 1)); break; }
    if (item.startsWith('--')) {
      const key = item.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) args[key] = true;
      else args[key] = argv[++i];
    } else args._.push(item);
  }
  return args;
}

function help() {
  console.log('AI Agent Budget Guard\n\nUsage:\n  ai-agent-budget-guard run --budget <usd> [--name <label>] -- <command...>\n  ai-agent-budget-guard record --model <slug> --input <tokens> --output <tokens> [--cache-read <tokens>]\n  ai-agent-budget-guard status\n  ai-agent-budget-guard reset');
}

const [cmd, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);
const statePath = args.state || defaultStatePath();
const pricingPath = args.pricing || new URL('../pricing/quotacheap.json', import.meta.url).pathname;

try {
  if (!cmd || cmd === 'help' || cmd === '--help') help();
  else if (cmd === 'status') console.log(JSON.stringify(summarizeState(loadState(statePath)), null, 2));
  else if (cmd === 'reset') { resetState(statePath); console.log(`reset ${statePath}`); }
  else if (cmd === 'record') {
    if (!args.model) throw new Error('--model is required');
    const event = recordUsage(statePath, loadPricing(pricingPath), { model: args.model, input: Number(args.input || 0), output: Number(args.output || 0), cacheRead: Number(args['cache-read'] || 0) });
    console.log(JSON.stringify(event, null, 2));
  } else if (cmd === 'run') {
    const budget = Number(args.budget || 0);
    if (!budget || Number.isNaN(budget)) throw new Error('--budget <usd> is required');
    if (!args._.length) throw new Error('missing command after --');
    const state = loadState(statePath);
    const spent = summarizeState(state).totalCostUsd;
    if (spent >= budget) { console.error(`budget exceeded: spent $${spent.toFixed(6)} >= budget $${budget.toFixed(6)}`); process.exit(42); }
    state.runs.push({ name: args.name || 'unnamed', command: args._, budgetUsd: budget, startedAt: new Date().toISOString(), spentBeforeUsd: spent });
    saveState(statePath, state);
    const child = spawnSync(args._[0], args._.slice(1), { stdio: 'inherit', shell: process.platform === 'win32' });
    process.exit(child.status ?? 1);
  } else throw new Error(`Unknown command: ${cmd}`);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
