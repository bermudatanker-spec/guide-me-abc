'use client'

import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'
import { getLangFromPath } from '@/lib/locale-path'

export default function LoginPage() {
  const supabase = useMemo(() => supabaseBrowser(), [])
  const pathname = usePathname() ?? '/'
  const search = useSearchParams()
  const lang = getLangFromPath(pathname) || 'en'
  const redirectedFrom = search.get('redirectedFrom') || ''

  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState<false | 'otp' | 'github' | 'google'>(false)

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

  // ⬇️ Één centrale callback die door middleware wordt doorgelaten
  const callbackUrl =
    `${origin}/auth/callback?` +
    new URLSearchParams({
      lang,
      ...(redirectedFrom ? { redirectedFrom } : {}),
    }).toString()

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault()
    setMsg(null)

    // simpele check
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setMsg(lang === 'nl' ? 'Voer een geldig e-mailadres in.' : 'Enter a valid email.')
      return
    }

    try {
      setLoading('otp')
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: callbackUrl, // ✅ belangrijk
          // shouldCreateUser: true,    // optioneel: forceer aanmaken user
        },
      })
      setMsg(
        error
          ? (lang === 'nl'
              ? `Versturen mislukt: ${error.message}`
              : `Failed to send: ${error.message}`)
          : (lang === 'nl'
              ? 'Check je e-mail voor de login-link.'
              : 'Check your email for the magic link.')
      )
    } catch (err: any) {
      setMsg(err?.message ?? 'Er ging iets mis.')
    } finally {
      setLoading(false)
    }
  }

  const oAuth = async (provider: 'github' | 'google') => {
    setMsg(null)
    try {
      setLoading(provider)
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl, // ✅ terug naar onze callback
        },
      })
      if (error) setMsg(error.message)
      // Bij OAuth volgt vaak een redirect/popup; loading resetten is niet nodig
    } catch (err: any) {
      setMsg(err?.message ?? 'Kon OAuth niet starten.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold text-center">
          {lang === 'nl' ? 'Inloggen' : 'Login'}
        </h1>

        <form onSubmit={handleMagicLink} className="space-y-3">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
            required
            autoComplete="email"
            inputMode="email"
          />
          <button
            type="submit"
            disabled={!!loading}
            className="w-full rounded-md bg-blue-600 text-white py-2 hover:bg-blue-700 disabled:opacity-60"
          >
            {loading === 'otp' ? 'Versturen…' : 'Verstuur Magic Link'}
          </button>
        </form>

        <div className="flex items-center gap-2">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-500">{lang === 'nl' ? 'of' : 'or'}</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <div className="grid gap-2">
          <button
            onClick={() => oAuth('github')}
            className="w-full rounded-md border py-2 hover:bg-gray-50 disabled:opacity-60"
            disabled={!!loading}
          >
            {loading === 'github' ? '…' : 'Continue with GitHub'}
          </button>
          <button
            onClick={() => oAuth('google')}
            className="w-full rounded-md border py-2 hover:bg-gray-50 disabled:opacity-60"
            disabled={!!loading}
          >
            {loading === 'google' ? '…' : 'Continue with Google'}
          </button>
        </div>

        {msg && <p className="text-center text-sm text-gray-600">{msg}</p>}
      </div>
    </main>
  )
}