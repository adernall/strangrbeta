'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../../lib/supabase'
import { useAuth } from '../../../../lib/AuthContext'
import styles from './join.module.css'

export default function JoinViaToken() {
  const { token } = useParams()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [space,   setSpace]   = useState(null)
  const [status,  setStatus]  = useState('loading') // loading | found | notfound | already | joined | error
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (!authLoading) fetchSpace()
  }, [token, authLoading])

  async function fetchSpace() {
    const { data, error } = await supabase
      .from('spaces')
      .select('id, name, slug, description, icon_url, member_count, is_private, invite_token')
      .eq('invite_token', token)
      .single()

    if (error || !data) { setStatus('notfound'); return }
    setSpace(data)

    if (user) {
      const { data: mem } = await supabase
        .from('space_members')
        .select('role')
        .eq('space_id', data.id)
        .eq('user_id', user.id)
        .maybeSingle()
      if (mem) { setStatus('already'); return }
    }

    setStatus('found')
  }

  async function handleJoin() {
    if (!user) { router.push(`/login?next=/spaces/join/${token}`); return }
    setJoining(true)
    const { error } = await supabase.from('space_members').upsert({
      space_id: space.id,
      user_id:  user.id,
      role:     'member',
    })
    if (error) { setStatus('error'); setJoining(false); return }
    setStatus('joined')
    setTimeout(() => router.push(`/spaces/${space.slug}`), 1500)
  }

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>STRANGR <span className={styles.dot}>•</span></Link>
      </nav>

      <main className={styles.main}>
        <div className={styles.card}>
          {status === 'loading' && (
            <span className={styles.loadingDot} />
          )}

          {status === 'notfound' && (
            <>
              <h1 className={styles.title}>Link not found.</h1>
              <p className={styles.sub}>This invite link is invalid or has expired.</p>
              <Link href="/spaces" className={styles.btn}>Browse Spaces</Link>
            </>
          )}

          {(status === 'found' || status === 'already') && space && (
            <>
              <div className={styles.spaceIcon}>
                {space.icon_url
                  ? <img src={space.icon_url} alt={space.name} className={styles.spaceIconImg} />
                  : <span className={styles.spaceIconLetter}>{space.name?.[0]?.toUpperCase()}</span>
                }
              </div>
              <h1 className={styles.title}>{space.name}</h1>
              <p className={styles.sub}>{space.description}</p>
              <p className={styles.memberCount}>{space.member_count ?? 0} members</p>

              {status === 'already' ? (
                <>
                  <p className={styles.alreadyText}>You're already a member.</p>
                  <Link href={`/spaces/${space.slug}`} className={styles.btn}>Go to Space →</Link>
                </>
              ) : (
                <button className={styles.btn} onClick={handleJoin} disabled={joining}>
                  {joining ? 'Joining…' : user ? `Join ${space.name}` : 'Sign in to join'}
                </button>
              )}
            </>
          )}

          {status === 'joined' && (
            <>
              <span className={styles.successIcon}>✦</span>
              <h1 className={styles.title}>You're in.</h1>
              <p className={styles.sub}>Welcome to {space?.name}. Redirecting…</p>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 className={styles.title}>Something went wrong.</h1>
              <p className={styles.sub}>Couldn't join the space. Try again.</p>
              <button className={styles.btn} onClick={handleJoin}>Retry</button>
            </>
          )}
        </div>
      </main>
    </div>
  )
}