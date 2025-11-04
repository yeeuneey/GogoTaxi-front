const PREFIX = 'oauth_state_'

type Provider = 'kakao' | 'google'

export function createOAuthState(provider: Provider) {
  const state =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${provider}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  sessionStorage.setItem(PREFIX + provider, state)
  return state
}

export function consumeOAuthState(provider: Provider, incoming?: string) {
  const key = PREFIX + provider
  const stored = sessionStorage.getItem(key)
  sessionStorage.removeItem(key)
  if (!stored) return false
  return stored === incoming
}
