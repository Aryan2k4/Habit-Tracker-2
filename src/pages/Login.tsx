import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from '@/lib/auth'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn(email, password)

    setLoading(false)

    if (error) {
      setError(error) // real Supabase error, not hardcoded
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="w-full max-w-sm px-6">

        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌱</div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-sm text-neutral-400 mt-1">Log in to Bloom</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-3 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 transition">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}