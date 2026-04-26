'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import AppShell from '../../components/AppShell'
import styles from './spaces.module.css'

export default function SpacesPage() {
  const { user } = useAuth()
  const [featured,  setFeatured]  = useState([])
  const [trending,  setTrending]  = useState([])
  const [mySpaces,  setMySpaces]  = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    fetchSpaces()
  }, [user])

  async function fetchSpaces() {
    setLoading(true)

    const [featRes, trendRes] = await Promise.all([
      supabase
        .from('spaces')
        .select('*')
        .eq('is_featured', true)
        .order('member_count', { ascending: false })
        .limit(3),
      supabase
        .from('spaces')
        .select('*')
        .eq('is_private', false)
        .order('member_count', { ascending: false })
        .limit(12),
    ])

    setFeatured(featRes.data ?? [])
    setTrending(trendRes.data ?? [])

    if (user) {
      const { data: memberRows } = await supabase
        .from('space_members')
        .select('space_id, spaces(*)')
        .eq('user_id', user.id)
        .limit(20)
      setMySpaces(memberRows?.map(r => r.spaces) ?? [])
    }

    setLoading(false)
  }

  return (
    <AppShell title="Spaces">
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Spaces</h1>
            <p className={styles.sub}>Curated worlds, not endless feeds.</p>
          </div>
          <Link href="/spaces/create" className={styles.createBtn}>+ Create Space</Link>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <span className={styles.loadingDot} />
          </div>
        ) : (
          <>
            {/* My Spaces */}
            {mySpaces.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Your Spaces</h2>
                <div className={styles.grid}>
                  {mySpaces.map(space => (
                    <SpaceCard key={space.id} space={space} />
                  ))}
                </div>
              </section>
            )}

            {/* Featured */}
            {featured.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  Featured <span className={styles.featuredDot}>✦</span>
                </h2>
                <div className={styles.featuredGrid}>
                  {featured.map(space => (
                    <SpaceCard key={space.id} space={space} featured />
                  ))}
                </div>
              </section>
            )}

            {/* All spaces */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>All Spaces</h2>
              {trending.length === 0 ? (
                <div className={styles.empty}>
                  <span className={styles.emptyIcon}>✦</span>
                  <p className={styles.emptyTitle}>No spaces yet.</p>
                  <p className={styles.emptyText}>Be the first to create one.</p>
                  <Link href="/spaces/create" className={styles.emptyBtn}>Create a Space</Link>
                </div>
              ) : (
                <div className={styles.grid}>
                  {trending.map(space => (
                    <SpaceCard key={space.id} space={space} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  )
}

function SpaceCard({ space, featured }) {
  return (
    <Link href={`/spaces/${space.slug}`} className={`${styles.card} ${featured ? styles.cardFeatured : ''}`}>
      {/* Icon */}
      <div className={styles.cardIcon}>
        {space.icon_url
          ? <img src={space.icon_url} alt={space.name} className={styles.cardIconImg} />
          : <span className={styles.cardIconLetter}>{space.name?.[0]?.toUpperCase()}</span>
        }
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <h3 className={styles.cardName}>{space.name}</h3>
          {space.is_private && <span className={styles.privateBadge}>Private</span>}
        </div>
        {space.description && (
          <p className={styles.cardDesc}>{space.description}</p>
        )}
        <div className={styles.cardMeta}>
          <span className={styles.cardMembers}>
            {space.member_count ?? 0} {space.member_count === 1 ? 'member' : 'members'}
          </span>
          {space.tags?.length > 0 && (
            <div className={styles.cardTags}>
              {space.tags.slice(0, 2).map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <span className={styles.cardArrow}>→</span>
    </Link>
  )
}