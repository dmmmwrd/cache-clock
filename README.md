# cache-clock

A Claude Code mod that shows, in the status line, whether this session's prompt cache is still warm.

- `cache warm 42:17`: counts down the 1-hour cache lifetime (main conversation, Claude subscription).
- `cache: in use`: a turn is running.
- `cache cold · expired 12m ago · next prompt re-reads 187k tokens uncached`
- A toast 5 minutes before expiry.

The countdown is an estimate from elapsed time, not a query of the server. If you use an API key, a cloud provider, or usage credits, the real lifetime is 5 minutes: set `TTL_MS` in `hooks/register.ts` to `5 * 60 * 1000`.

## Install

At the prompt of a terminal session:

```
/plugin install cache-clock --marketplace <owner>/cache-clock
```

From a shell:

```
claude plugin install cache-clock --marketplace <owner>/cache-clock
```

In the desktop app: click + next to the prompt box, then Plugins, Add marketplace with `<owner>/cache-clock`, then Add plugin.
