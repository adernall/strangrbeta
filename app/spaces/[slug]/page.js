'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/AuthContext'
import AppShell from '../../../components/AppShell'
import styles from './slug.module.css'

export default function SpaceDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const router   = useRouter()

  const [space,      setSpace]      = useState(null)
  const [membership, setMembership] = useState(null) // null | {role}
  const [request,    setRequest]    = useState(null)
  const [posts,      setPosts]      = useState([])
  const [members,    setMembers]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [joining,    setJoining]    = useState(false)
  const [guideOpen,  setGuideOpen]  = useState(false)

  useEffect(() => { if (slug) fetchAll() }, [slug, user])

  async function fetchAll() {
    setLoading(true)

    // Space
    const { data: spaceData, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !spaceData) { router.push('/spaces'); return }
    setSpace(spaceData)

    // Membership + recent members
    const [memRes, membersRes, postsRes] = await Promise.all([
      user
        ? supabase.from('space_members').select('role').eq('space_id', spaceData.id).eq('user_id', user.id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from('space_members')
        .select('user_id, role, profiles(username, avatar_url, display_name)')
        .eq('space_id', spaceData.id)
        .order('joined_at', { ascending: false })
        .limit(12),
      supabase.from('posts')
        .select('*, profiles(username, avatar_url, display_name)')
        .eq('space_id', spaceData.id)
        .eq('is_draft', false)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    setMembership(memRes.data ?? null)
    setMembers(membersRes.data ?? [])
    setPosts(postsRes.data ?? [])

    // Check for pending join request
    if (user && !memRes.data) {
      const { data: reqData } = await supabase
        .from('space_requests')
        .select('status')
        .eq('space_id', spaceData.id)
        .eq('user_id', user.id)
        .maybeSingle()
      setRequest(reqData ?? null)
    }

    setLoading(false)
  }

  async function handleJoin() {
    if (!user) { router.push('/login'); return }
    setJoining(true)

    if (space.is_private) {
      // Send join request
      await supabase.from('space_requests').upsert({
        space_id: space.id,
        user_id:  user.id,
        status:   'pending',
      })
      setRequest({ status: 'pending' })
    } else {
      // Join directly
      await supabase.from('space_members').upsert({
        space_id: space.id,
        user_id:  user.id,
        role:     'member',
      })
      setMembership({ role: 'member' })
    }
    setJoining(false)
  }

  async function handleLeave() {
    if (!user) return
    await supabase.from('space_members')
      .delete()
      .eq('space_id', space.id)
      .eq('user_id', user.id)
    setMembership(null)
  }

  function copyInviteLink() {
    const url = `${window.location.origin}/spaces/join/${space.invite_token}`
    navigator.clipboard.writeText(url)
  }

  const isOwnerOrAdmin = membership?.role === 'owner' || membership?.role === 'admin'
  const isOwner = membership?.role === 'owner'

  if (loading) return (
    <AppShell>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
        <span style={{width:8,height:8,borderRadius:'50%',background:'#c8ff00',display:'block',animation:'pulse 1.2s infinite'}} />
      </div>
    </AppShell>
  )

  if (!space) return null

  return (
    <AppShell title={space.name}>
      {/* Banner */}
      {space.banner_url && (
        <div className={styles.banner}>
          <img src={space.banner_url} alt="" className={styles.bannerImg} />
          <div className={styles.bannerOverlay} />
        </div>
      )}

      <div className={styles.page}>
        {/* Space header */}
        <div className={styles.spaceHeader}>
          <div className={styles.spaceIcon}>
            {space.icon_url
              ? <img src={space.icon_url} alt={space.name} className={styles.spaceIconImg} />
              : <span className={styles.spaceIconLetter}>{space.name?.[0]?.toUpperCase()}</span>
            }
          </div>

          <div className={styles.spaceMeta}>
            <div className={styles.spaceNameRow}>
              <h1 className={styles.spaceName}>{space.name}</h1>
              {space.is_private && <span className={styles.privateBadge}>Private</span>}
              {space.is_featured && <span className={styles.featuredBadge}>✦ Featured</span>}
            </div>
            <p className={styles.spaceDesc}>{space.description}</p>
            <div className={styles.spaceStats}>
              <span>{space.member_count ?? 0} members</span>
              <span className={styles.statDot}>·</span>
              <span>{space.post_count ?? 0} posts</span>
              {space.tags?.length > 0 && (
                <>
                  <span className={styles.statDot}>·</span>
                  <div className={styles.spaceTags}>
                    {space.tags.map(tag => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className={styles.spaceActions}>
            {!membership && !request && (
              <button className={styles.joinBtn} onClick={handleJoin} disabled={joining}>
                {joining ? 'Joining…' : space.is_private ? 'Request to Join' : 'Join Space'}
              </button>
            )}
            {!membership && request?.status === 'pending' && (
              <span className={styles.pendingBadge}>Request Pending</span>
            )}
            {membership && membership.role !== 'owner' && (
              <button className={styles.leaveBtn} onClick={handleLeave}>Leave</button>
            )}
            {isOwnerOrAdmin && (
              <>
                <button className={styles.inviteBtn} onClick={copyInviteLink} title="Copy invite link">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  Copy Invite
                </button>
                <Link href={`/spaces/${slug}/settings`} className={styles.settingsBtn}>Settings</Link>
              </>
            )}
          </div>
        </div>

        {/* Guidelines banner */}
        {space.guideline_name && (
          <button className={styles.guidelineBar} onClick={() => setGuideOpen(o => !o)}>
            <span>📜 {space.guideline_name}</span>
            <span className={styles.guidelineChevron}>{guideOpen ? '↑' : '↓'}</span>
          </button>
        )}
        {guideOpen && space.guideline_content && (
          <div className={styles.guidelineContent}>{space.guideline_content}</div>
        )}

        {/* Main content + sidebar */}
        <div className={styles.content}>
          {/* Posts column */}
          <div className={styles.postsCol}>
            {/* Create post CTA */}
            {membership && (
              <Link href={`/spaces/${slug}/posts/create`} className={styles.createPostRow}>
                <div className={styles.createPostAvatar}>+</div>
                <span className={styles.createPostText}>Write something in {space.name}…</span>
              </Link>
            )}

            {/* Posts */}
            {posts.length === 0 ? (
              <div className={styles.emptyPosts}>
                <p className={styles.emptyPostsTitle}>No posts yet.</p>
                <p className={styles.emptyPostsSub}>
                  {membership ? 'Be the first to post here.' : 'Join to start posting.'}
                </p>
              </div>
            ) : (
              posts.map(post => (
                <PostCard key={post.id} post={post} spaceSlug={slug} />
              ))
            )}
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            {/* About */}
            {space.about && (
              <div className={styles.sidebarBlock}>
                <h3 className={styles.sidebarTitle}>About</h3>
                <p className={styles.sidebarText}>{space.about}</p>
              </div>
            )}

            {/* Members */}
            <div className={styles.sidebarBlock}>
              <h3 className={styles.sidebarTitle}>Members · {space.member_count ?? 0}</h3>
              <div className={styles.membersList}>
                {members.map(m => (
                  <Link key={m.user_id} href={`/profile/${m.profiles?.username}`} className={styles.memberRow}>
                    <div className={styles.memberAvatar}>
                      {m.profiles?.avatar_url
                        ? <img src={m.profiles.avatar_url} alt="" className={styles.memberAvatarImg} />
                        : <span className={styles.memberInitial}>{m.profiles?.username?.[0]?.toUpperCase()}</span>
                      }
                    </div>
                    <div>
                      <p className={styles.memberName}>{m.profiles?.display_name || m.profiles?.username}</p>
                      {m.role !== 'member' && <p className={styles.memberRole}>{m.role}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  )
}

function PostCard({ post, spaceSlug }) {
  return (
    <Link href={`/posts/${post.id}`} className={styles.postCard}>
      <div className={styles.postHeader}>
        <div className={styles.postAvatar}>
          {post.profiles?.avatar_url
            ? <img src={post.profiles.avatar_url} alt="" className={styles.postAvatarImg} />
            : <span className={styles.postAvatarInitial}>{post.profiles?.username?.[0]?.toUpperCase()}</span>
          }
        </div>
        <div>
          <p className={styles.postAuthor}>{post.profiles?.display_name || post.profiles?.username}</p>
          <p className={styles.postTime}>{new Date(post.created_at).toLocaleDateString()}</p>
        </div>
      </div>
      <p className={styles.postContent}>{post.content}</p>
      {post.image_url && (
        <img src={post.image_url} alt="" className={styles.postImage} />
      )}
      <div className={styles.postFooter}>
        <span className={styles.postStat}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {post.likes_count ?? 0}
        </span>
        <span className={styles.postStat}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {post.comments_count ?? 0}
        </span>
      </div>
    </Link>
  )
}