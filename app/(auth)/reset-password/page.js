'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import styles from '../login/login.module.css'

export default function ResetPassword() {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleReset() {
    if (!email) { setError('Please enter your email.'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
    if (err) { setError(err.message); setLoading(false); return }
    setSent(true); setLoading(false)
  }

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>STRANGR</Link>
        <Link href="/login" className={styles.close}>← Back to login</Link>
      </nav>
      <main className={styles.main}>
        <div className={styles.card}>
          {sent ? (
            <>
              <h1 className={styles.title}>Check your inbox.</h1>
              <p className={styles.sub}>A reset link is on its way to <strong style={{color:'var(--text)'}}>{email}</strong>. Check spam if you don't see it.</p>
              <Link href="/login" className={styles.submit} style={{display:'block',textAlign:'center',padding:'13px'}}>Back to login</Link>
            </>
          ) : (
            <>
              <h1 className={styles.title}>Reset password.</h1>
              <p className={styles.sub}>We'll send a link to your email.</p>
              {error && <div className={styles.error}>{error}</div>}
              <div className={styles.fields}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Email</label>
                  <input className={styles.input} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReset()} />
                </div>
              </div>
              <button className={styles.submit} onClick={handleReset} disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  )
}