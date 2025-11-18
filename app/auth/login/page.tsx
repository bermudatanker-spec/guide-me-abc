'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = supabaseBrowser()
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Waarheen na klikken op de mail-link
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })
    setLoading(false)
    setMsg(error ? error.message : 'Check je e-mail voor de login-link!')
  }

  const oAuth = async (provider: 'github' | 'google') => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    setLoading(false)
    if (error) setMsg(error.message)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold text-center">Inloggen</h1>

        <form onSubmit={handleMagicLink} className="space-y-3">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 text-white py-2 hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Versturen…' : 'Verstuur Magic Link'}
          </button>
        </form>

        <div className="flex items-center gap-2">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-500">of</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <div className="grid gap-2">
          <button
            onClick={() => oAuth('github')}
            className="w-full rounded-md border py-2 hover:bg-gray-50"
            disabled={loading}
          >
            Continue with GitHub
          </button>
          <button
            onClick={() => oAuth('google')}
            className="w-full rounded-md border py-2 hover:bg-gray-50"
            disabled={loading}
          >
            Continue with Google
          </button>
        </div>

        {msg && <p className="text-center text-sm text-gray-600">{msg}</p>}
      </div>
    </main>
  )
}