'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import styles from './signup.module.css'

export default function SignupPage() {
  const router = useRouter()
  const [username,    setUsername]    = useState('')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [inviteCode,  setInviteCode]  = useState('')
  const [agreed,      setAgreed]      = useState(false)
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(false)

  async function handleSignup() {
    // — Validation —
    if (!username || !email || !password || !confirm || !inviteCode) {
      setError('Please fill in all fields.'); return
    }
    if (!/^[a-z0-9_.]{3,30}$/.test(username)) {
      setError('Username: 3–30 chars, lowercase letters/numbers/underscores/periods only.'); return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.'); return
    }
    if (password !== confirm) {
      setError('Passwords do not match.'); return
    }
    if (!agreed) {
      setError('Please agree to the Terms.'); return
    }

    setLoading(true); setError('')

    // — Verify invite code —
    const { data: codeRow, error: codeErr } = await supabase
      .from('invite_codes')
      .select('id, code, expires_at, uses_remaining')
      .eq('code', inviteCode.trim().toUpperCase())
      .single()

    if (codeErr || !codeRow) {
      setError('Invalid invite code. Check and try again.'); setLoading(false); return
    }
    if (new Date(codeRow.expires_at) < new Date()) {
      setError('This invite code has expired. Codes refresh every 24 hours.'); setLoading(false); return
    }
    if (codeRow.uses_remaining <= 0) {
      setError('This invite code has no uses remaining.'); setLoading(false); return
    }

    // — Check username uniqueness —
    const { data: taken } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (taken) {
      setError('That username is already taken.'); setLoading(false); return
    }

    // — Create auth user —
    const { data, error: authErr } = await supabase.auth.signUp({ email, password })
    if (authErr) { setError(authErr.message); setLoading(false); return }

    // — Save profile —
    await supabase.from('profiles').upsert({
      id:           data.user.id,
      username:     username.trim().toLowerCase(),
      display_name: username.trim(),
      status:       'active',
      created_at:   new Date().toISOString(),
    })

    // — Decrement invite code uses —
    await supabase
      .from('invite_codes')
      .update({ uses_remaining: codeRow.uses_remaining - 1 })
      .eq('id', codeRow.id)

    router.push('/setup-profile')
    router.refresh()
  }

  async function handleGoogle() {
    // Google users still need an invite code
    if (!inviteCode.trim()) {
      setError('Please enter an invite code before continuing with Google.'); return
    }

    const { data: codeRow } = await supabase
      .from('invite_codes')
      .select('id, expires_at, uses_remaining')
      .eq('code', inviteCode.trim().toUpperCase())
      .single()

    if (!codeRow || new Date(codeRow.expires_at) < new Date() || codeRow.uses_remaining <= 0) {
      setError('Invalid or expired invite code.'); return
    }

    // Store code in session so callback can use it
    sessionStorage.setItem('pending_invite_code', inviteCode.trim().toUpperCase())

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>STRANGR</Link>
        <Link href="/" className={styles.close}>Close ×</Link>
      </nav>

      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>Claim your handle.</h1>
          <p className={styles.sub}>Quiet by default. Loud when it matters.</p>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.fields}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Username</label>
              <div className={styles.inputWrap}>
                <span className={styles.prefix}>@</span>
                <input
                  className={`${styles.input} ${styles.inputPrefixed}`}
                  type="text"
                  placeholder="yourhandle"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                  maxLength={30}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Password</label>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Confirm</label>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                />
              </div>
            </div>

            {/* Invite code — the gate */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Invite Code
                <span className={styles.labelHint}> · refreshes every 24h</span>
              </label>
              <input
                className={`${styles.input} ${styles.inputCode}`}
                type="text"
                placeholder="XXXX-XXXX"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                maxLength={9}
                spellCheck={false}
              />
            </div>
          </div>

          <label className={styles.terms}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className={styles.checkbox}
            />
            <span>
              I agree to the{' '}
              <Link href="/privacy" className={styles.termsLink}>Terms</Link>
              {' '}and acknowledge that Strangr is a quiet space.
            </span>
          </label>

          <button className={styles.submit} onClick={handleSignup} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>

          <div className={styles.divider}><span>or</span></div>

          <button className={styles.googleBtn} onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className={styles.switchText}>
            Already a stranger?{' '}
            <Link href="/login" className={styles.switchLink}>Log in</Link>
          </p>
        </div>
      </main>
    </div>
  )
}