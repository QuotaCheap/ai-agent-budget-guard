# AI Agent Budget Guard

Stop runaway AI agents before they burn your budget.

AI Agent Budget Guard is a small CLI for wrapping agent commands with a local budget gate. It is designed for coding agents, internal automation, support bots, benchmark scripts, and any workflow where model calls can run longer than expected.

## Why this exists

Agentic workflows are powerful, but they can fail in expensive ways:

- an agent loops on a broken test
- a benchmark runs too many scenarios
- a support bot retries the same failing job
- a coding agent keeps calling a strong model for cheap tasks
- a cron job runs after everyone forgot about it

Budget Guard gives those workflows a hard stop.

## Quickstart

```bash
npx ai-agent-budget-guard run \
  --budget 2.50 \
  --name codex-refactor \
  -- npm test
```

Record usage from a model call:

```bash
npx ai-agent-budget-guard record \
  --model gpt-5.4-mini \
  --input 12000 \
  --output 1800 \
  --cache-read 4000
```

Check current spend:

```bash
npx ai-agent-budget-guard status
```

Reset local state:

```bash
npx ai-agent-budget-guard reset
```

## Commands

### `run`

Run a shell command only if the remaining budget allows it.

```bash
ai-agent-budget-guard run --budget 5 --name nightly-agent -- npm run agent
```

### `record`

Record usage after a model call.

```bash
ai-agent-budget-guard record --model gpt-5.5 --input 100000 --output 12000
```

### `status`

Print current local budget state.

### `reset`

Reset local budget state.

## Pricing config

Pricing is stored in `pricing/quotacheap.json`. Current public examples include `gpt-5.5`, `gpt-5.4-mini`, `gpt-5.3-codex`, `gpt-oss-120b`, and `deepseek-v4-flash`.

Do not hardcode assumptions forever. Model availability and pricing can change.

## Design goals

- local-first
- boring JSON state
- easy to wrap around any command
- useful before deep provider integrations exist
- no API keys required for local budget tracking
- safe defaults for agent workflows

## Roadmap

- provider-specific usage importers
- OpenAI-compatible response parser
- GitHub Actions budget gate
- webhook alerts
- per-task and per-day budgets
- MCP/server mode for agent tools
- benchmark integration

## Production note

Local estimates are useful as guardrails. In production, you still need real request logs, quotas, balances, token usage, latency, and billing visibility.

QuotaCheap provides an [OpenAI-compatible API gateway](https://www.quota.cheap?utm_source=github&utm_medium=readme&utm_campaign=ai-agent-budget-guard) with those controls.

## Security

Do not put API keys or private request payloads in the budget state file. This tool tracks usage metadata, not secrets.

## License

MIT
