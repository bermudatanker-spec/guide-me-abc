'use client'
import { useEffect, useState } from 'react'

type Category = { id: number; name: string }

export default function NewListingPage() {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(({ data }) => setCategories(data || []))
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget)) as any
    data.category_id = Number(data.category_id)
    setLoading(true)
    const r = await fetch('/api/listings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setLoading(false)
    if (!r.ok) alert('Error'); else window.location.href = '/dashboard'
  }

  return (
    <main className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">New Listing</h1>
      <form onSubmit={onSubmit} className="space-y-3 bg-white border rounded-lg p-4">
        <input name="business_name" placeholder="Business name" className="border p-2 w-full rounded" required />
        <select name="island" className="border p-2 w-full rounded" required>
          <option value="aruba">Aruba</option>
          <option value="bonaire">Bonaire</option>
          <option value="curacao">Curaçao</option>
        </select>
        <select name="category_id" className="border p-2 w-full rounded" required>
          <option value="">Select category</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <textarea name="description" placeholder="Description" className="border p-2 w-full rounded" />
        <button disabled={loading} className="px-4 py-2 rounded bg-black text-white">
          {loading ? 'Saving…' : 'Create'}
        </button>
      </form>
    </main>
  )
}