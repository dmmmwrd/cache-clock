# cache-clock

A Claude Code mod that shows, in the status line, whether this session's prompt cache is still warm.

- `cache warm 42:17`: counts down the 1-hour cache lifetime (main conversation, Claude subscription).
- `cache: in use`: a turn is running.
- `cache cold · expired 12m ago · next prompt re-reads 187k tokens uncached`
- A toast 5 minutes before expiry.

The countdown is an estimate from elapsed time, not a query of the server. If you use an API key, a cloud provider, or usage credits, the real lifetime is 5 minutes: set `TTL_MS` in `hooks/register.ts` to `5 * 60 * 1000`.

## Install

Use Claude Code 2.1.299 or later (the desktop app's engine); older `claude` commands cannot load it.

```
claude plugin marketplace add dmmmwrd/cache-clock
claude plugin install cache-clock@cache-clock --scope user
```

In the desktop app: click + next to the prompt box, then Plugins, Add marketplace with `dmmmwrd/cache-clock`, then Add plugin.

The countdown shows as a band above the prompt (and in the status line where one is drawn).
