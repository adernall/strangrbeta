'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import AppShell from '../../components/AppShell'
import Link from 'next/link'
import styles from './search.module.css'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''

  const [tab,     setTab]     = useState('people')
  const [query,   setQuery]   = useState(q)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setQuery(q)
    if (q) runSearch(q, tab)
  }, [q])

  async function runSearch(val, activeTab) {
    if (!val.trim()) { setResults([]); return }
    setLoading(true)

    if (activeTab === 'people') {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio')
        .or(`username.ilike.%${val}%,display_name.ilike.%${val}%`)
        .limit(20)
      setResults(data ?? [])
    } else {
      const { data } = await supabase
        .from('spaces')
        .select('id, name, slug, description, icon_url, member_count')
        .or(`name.ilike.%${val}%,description.ilike.%${val}%`)
        .limit(20)
      setResults(data ?? [])
    }

    setLoading(false)
  }

  function handleTab(t) {
    setTab(t)
    if (query) runSearch(query, t)
  }

  return (
    <AppShell title="Search">
      <div className={styles.page}>
        {/* Search input */}
        <div className={styles.searchBar}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search people or spaces…"
            value={query}
            onChange={e => { setQuery(e.target.value); runSearch(e.target.value, tab) }}
            autoFocus
          />
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'people' ? styles.tabActive : ''}`} onClick={() => handleTab('people')}>People</button>
          <button className={`${styles.tab} ${tab === 'spaces' ? styles.tabActive : ''}`} onClick={() => handleTab('spaces')}>Spaces</button>
        </div>

        {/* Results */}
        <div className={styles.results}>
          {loading && <p className={styles.status}>Searching…</p>}
          {!loading && query && results.length === 0 && (
            <p className={styles.status}>No results for "<strong>{query}</strong>"</p>
          )}
          {!query && (
            <p className={styles.status}>Start typing to search.</p>
          )}

          {tab === 'people' && results.map(user => (
            <Link key={user.id} href={`/profile/${user.username}`} className={styles.resultRow}>
              <div className={styles.avatar}>
                {user.avatar_url
                  ? <img src={user.avatar_url} alt={user.username} className={styles.avatarImg} />
                  : <span className={styles.avatarInitial}>{user.username?.[0]?.toUpperCase()}</span>
                }
              </div>
              <div className={styles.resultInfo}>
                <p className={styles.resultName}>{user.display_name || user.username}</p>
                <p className={styles.resultSub}>@{user.username}</p>
                {user.bio && <p className={styles.resultBio}>{user.bio}</p>}
              </div>
            </Link>
          ))}

          {tab === 'spaces' && results.map(space => (
            <Link key={space.id} href={`/spaces/${space.slug}`} className={styles.resultRow}>
              <div className={styles.spaceIcon}>
                {space.icon_url
                  ? <img src={space.icon_url} alt={space.name} className={styles.avatarImg} />
                  : <span className={styles.avatarInitial}>{space.name?.[0]?.toUpperCase()}</span>
                }
              </div>
              <div className={styles.resultInfo}>
                <p className={styles.resultName}>{space.name}</p>
                <p className={styles.resultSub}>{space.member_count ?? 0} members</p>
                {space.description && <p className={styles.resultBio}>{space.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  )
}