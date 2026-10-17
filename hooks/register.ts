import type { Register } from 'claude-code'

// Prompt-cache TTL for the main conversation. Per code.claude.com/docs/en/prompt-caching:
// one hour on a Claude subscription within plan usage; five minutes on an API key, a cloud
// provider, or once usage credits are being drawn (unless promptCacheTtl is set to "1h").
// Change to 5 * 60 * 1000 if you are on any of those.
const TTL_MS = 60 * 60 * 1000

// Toast this long before the cache expires (once per idle stretch).
const WARN_MS = 5 * 60 * 1000

const clock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const ago = (ms: number) => {
  const m = Math.floor(ms / 60_000)

  if (m < 1) {
    return 'just now'
  }

  return m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ${m % 60}m ago`
}

const tokens = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}k` : `${n}`)

export const register: Register = on => {
  let lastAt = 0
  let isBusy = false
  let warnedFor = 0
  let lastTokens = 0
  let cancel: (() => void) | null = null

  const draw = async ($: any) => {
    if (isBusy || lastAt === 0) {
      return
    }

    const now = await $.clock.now()
    const left = TTL_MS - (now - lastAt)

    if (left > 0) {
      $.ui.status(`cache warm ${clock(left)}`)

      if (left <= WARN_MS && warnedFor !== lastAt) {
        warnedFor = lastAt
        $.ui.toast(`Prompt cache expires in ${clock(left)}: send a message to keep it warm`)
      }

      return
    }

    // Tokens the next prompt re-sends: the last response's context size. Fall back to the
    // window percentage, then to the figure captured when the turn ended.
    const { context } = await $.session.usage()
    const size = context.tokens || Math.round(((context.percent ?? 0) / 100) * context.window) || lastTokens
    const cost = size ? ` \u00b7 next prompt re-reads ${tokens(size)} tokens uncached` : ' \u00b7 next prompt re-reads your whole context uncached'
    $.ui.status(`cache cold \u00b7 expired ${ago(-left)}${cost}`)
  }

  on('prompt.submit', ($, e, next) => {
    isBusy = true
    $.ui.status('cache: in use')

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    // Subagent turns have their own cache; track the main thread only.
    if (e.agentId === undefined) {
      isBusy = false

      if (e.usage) {
        lastAt = await $.clock.now()
        const { context } = await $.session.usage()
        lastTokens = context.tokens ?? lastTokens
        const read = e.usage.cache_read_input_tokens ?? 0
        const wrote = e.usage.cache_creation_input_tokens ?? 0
        $.ui.log(`cache-clock: read ${read}, wrote ${wrote}`, { to: 'debug' })
      }

      if (cancel === null) {
        cancel = $.clock.every(1000, () => draw($))
      }

      await draw($)
    }

    return next(e)
  })
}
