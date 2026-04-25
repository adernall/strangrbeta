'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import styles from './TopBar.module.css'

export default function TopBar({ title }) {
  const router = useRouter()
  const { profile } = useAuth()
  const [search, setSearch] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)

  function handleSearch(e) {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  return (
    <header className={styles.topbar}>
      {/* Left — page title (desktop) */}
      <div className={styles.left}>
        {title && <h1 className={styles.title}>{title}</h1>}
      </div>

      {/* Center — search */}
      <form className={styles.searchForm} onSubmit={handleSearch}>
        <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search spaces, people…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </form>

      {/* Right — bell + avatar */}
      <div className={styles.right}>
        {/* Notifications bell */}
        <div className={styles.bellWrap}>
          <button
            className={styles.iconBtn}
            onClick={() => setNotifOpen(o => !o)}
            aria-label="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {/* Unread dot — wired up in Phase 8 */}
            <span className={styles.notifDot} />
          </button>

          {notifOpen && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>
                <span className={styles.notifTitle}>Notifications</span>
                <button className={styles.notifMarkAll}>Mark all read</button>
              </div>
              <div className={styles.notifEmpty}>
                <p>You're all caught up.</p>
              </div>
            </div>
          )}
        </div>

        {/* Avatar → profile */}
        <Link href={`/profile/${profile?.username}`} className={styles.avatarLink}>
          <div className={styles.avatar}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt={profile.username} className={styles.avatarImg} />
              : <span className={styles.avatarInitial}>{profile?.username?.[0]?.toUpperCase() ?? '?'}</span>
            }
          </div>
        </Link>
      </div>
    </header>
  )
}