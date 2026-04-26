'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import { useAuth } from '../../../../lib/AuthContext'
import AppShell from '../../../../components/AppShell'
import styles from './settings.module.css'

export default function SpaceSettings() {
  const { slug } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const iconRef = useRef(null)
  const bannerRef = useRef(null)

  const [space,       setSpace]       = useState(null)
  const [membership,  setMembership]  = useState(null)
  const [members,     setMembers]     = useState([])
  const [requests,    setRequests]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')
  const [saved,       setSaved]       = useState(false)

  // Editable fields
  const [name,        setName]        = useState('')
  const [description, setDescription] = useState('')
  const [about,       setAbout]       = useState('')
  const [tags,        setTags]        = useState('')
  const [isPrivate,   setIsPrivate]   = useState(false)
  const [guideName,   setGuideName]   = useState('')
  const [guideContent,setGuideContent]= useState('')
  const [iconPreview, setIconPreview] = useState(null)
  const [iconFile,    setIconFile]    = useState(null)
  const [bannerPreview,setBannerPreview] = useState(null)
  const [bannerFile,  setBannerFile]  = useState(null)

  useEffect(() => { if (slug) fetchAll() }, [slug, user])

  async function fetchAll() {
    const { data: spaceData } = await supabase.from('spaces').select('*').eq('slug', slug).single()
    if (!spaceData) { router.push('/spaces'); return }

    const { data: mem } = user
      ? await supabase.from('space_members').select('role').eq('space_id', spaceData.id).eq('user_id', user.id).maybeSingle()
      : { data: null }

    if (!mem || (mem.role !== 'owner' && mem.role !== 'admin')) {
      router.push(`/spaces/${slug}`); return
    }

    setSpace(spaceData)
    setMembership(mem)
    setName(spaceData.name)
    setDescription(spaceData.description ?? '')
    setAbout(spaceData.about ?? '')
    setTags((spaceData.tags ?? []).join(', '))
    setIsPrivate(spaceData.is_private)
    setGuideName(spaceData.guideline_name ?? '')
    setGuideContent(spaceData.guideline_content ?? '')
    setIconPreview(spaceData.icon_url)
    setBannerPreview(spaceData.banner_url)

    const { data: mems } = await supabase
      .from('space_members')
      .select('user_id, role, profiles(username, avatar_url, display_name)')
      .eq('space_id', spaceData.id)
    setMembers(mems ?? [])

    const { data: reqs } = await supabase
      .from('space_requests')
      .select('id, user_id, status, profiles(username, avatar_url, display_name)')
      .eq('space_id', spaceData.id)
      .eq('status', 'pending')
    setRequests(reqs ?? [])

    setLoading(false)
  }

  async function handleSave() {
    setSaving(true); setError('')
    let iconUrl   = space.icon_url
    let bannerUrl = space.banner_url

    if (iconFile) {
      const ext = iconFile.name.split('.').pop()
      const path = `${user.id}/${slug}-icon.${ext}`
      await supabase.storage.from('space-icons').upload(path, iconFile, { upsert: true })
      const { data } = supabase.storage.from('space-icons').getPublicUrl(path)
      iconUrl = data.publicUrl
    }
    if (bannerFile) {
      const ext = bannerFile.name.split('.').pop()
      const path = `${user.id}/${slug}-banner.${ext}`
      await supabase.storage.from('space-banners').upload(path, bannerFile, { upsert: true })
      const { data } = supabase.storage.from('space-banners').getPublicUrl(path)
      bannerUrl = data.publicUrl
    }

    const parsedTags = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)

    const { error: saveErr } = await supabase.from('spaces').update({
      name:             name.trim(),
      description:      description.trim(),
      about:            about.trim(),
      tags:             parsedTags,
      is_private:       isPrivate,
      icon_url:         iconUrl,
      banner_url:       bannerUrl,
      guideline_name:    guideName.trim() || null,
      guideline_content: guideContent.trim() || null,
    }).eq('id', space.id)

    if (saveErr) { setError(saveErr.message) }
    else { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    setSaving(false)
  }

  async function handleRoleChange(userId, newRole) {
    await supabase.from('space_members').update({ role: newRole }).eq('space_id', space.id).eq('user_id', userId)
    setMembers(prev => prev.map(m => m.user_id === userId ? { ...m, role: newRole } : m))
  }

  async function handleRemoveMember(userId) {
    if (!confirm('Remove this member from the space?')) return
    await supabase.from('space_members').delete().eq('space_id', space.id).eq('user_id', userId)
    setMembers(prev => prev.filter(m => m.user_id !== userId))
  }

  async function handleApproveRequest(req) {
    await supabase.from('space_requests').update({ status: 'approved' }).eq('id', req.id)
    await supabase.from('space_members').upsert({ space_id: space.id, user_id: req.user_id, role: 'member' })
    setRequests(prev => prev.filter(r => r.id !== req.id))
  }

  async function handleRejectRequest(req) {
    await supabase.from('space_requests').update({ status: 'rejected' }).eq('id', req.id)
    setRequests(prev => prev.filter(r => r.id !== req.id))
  }

  async function handleDeleteSpace() {
    if (!confirm(`Delete "${space.name}"? This cannot be undone.`)) return
    await supabase.from('spaces').delete().eq('id', space.id)
    router.push('/spaces')
  }

  if (loading) return <AppShell title="Settings"><div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}><span style={{width:8,height:8,borderRadius:'50%',background:'#c8ff00',display:'block',animation:'pulse 1.2s infinite'}} /></div></AppShell>

  return (
    <AppShell title={`${space?.name} · Settings`}>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Space Settings</h1>
            <p className={styles.sub}>{space?.name}</p>
          </div>
          <button className={styles.backBtn} onClick={() => router.push(`/spaces/${slug}`)}>← Back to Space</button>
        </div>

        {error  && <div className={styles.error}>{error}</div>}
        {saved  && <div className={styles.success}>Changes saved ✓</div>}

        {/* ── General settings ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>General</h2>

          {/* Banner */}
          <div className={styles.field}>
            <label className={styles.label}>Banner</label>
            <button className={styles.bannerBtn} onClick={() => bannerRef.current?.click()}>
              {bannerPreview ? <img src={bannerPreview} alt="" className={styles.bannerImg} /> : <span className={styles.placeholder}>Click to upload banner</span>}
            </button>
            <input ref={bannerRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if(f){setBannerFile(f);setBannerPreview(URL.createObjectURL(f))} }} style={{display:'none'}} />
          </div>

          <div className={styles.iconNameRow}>
            <div className={styles.field}>
              <label className={styles.label}>Icon</label>
              <button className={styles.iconBtn} onClick={() => iconRef.current?.click()}>
                {iconPreview ? <img src={iconPreview} alt="" className={styles.iconImg} /> : <span className={styles.placeholder}>Icon</span>}
              </button>
              <input ref={iconRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if(f){setIconFile(f);setIconPreview(URL.createObjectURL(f))} }} style={{display:'none'}} />
            </div>
            <div className={styles.field} style={{flex:1}}>
              <label className={styles.label}>Name</label>
              <input className={styles.input} value={name} onChange={e => setName(e.target.value)} maxLength={60} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Short Description</label>
            <input className={styles.input} value={description} onChange={e => setDescription(e.target.value)} maxLength={160} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>About</label>
            <textarea className={styles.textarea} value={about} onChange={e => setAbout(e.target.value)} rows={4} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Tags <span className={styles.hint}>(comma separated)</span></label>
            <input className={styles.input} value={tags} onChange={e => setTags(e.target.value)} />
          </div>
          <div className={styles.toggleRow}>
            <div>
              <p className={styles.toggleLabel}>Private Space</p>
              <p className={styles.toggleSub}>Require approval to join</p>
            </div>
            <button className={`${styles.toggle} ${isPrivate ? styles.toggleOn : ''}`} onClick={() => setIsPrivate(p => !p)}>
              <span className={styles.toggleThumb} />
            </button>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Guideline Name</label>
            <input className={styles.input} value={guideName} onChange={e => setGuideName(e.target.value)} maxLength={60} placeholder="e.g. The Code" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Guideline Content</label>
            <textarea className={styles.textarea} value={guideContent} onChange={e => setGuideContent(e.target.value)} rows={4} />
          </div>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </section>

        {/* ── Join Requests ── */}
        {requests.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Join Requests · {requests.length}</h2>
            <div className={styles.memberList}>
              {requests.map(req => (
                <div key={req.id} className={styles.memberRow}>
                  <div className={styles.memberAvatar}>
                    {req.profiles?.avatar_url ? <img src={req.profiles.avatar_url} alt="" className={styles.memberAvatarImg} /> : <span className={styles.memberInitial}>{req.profiles?.username?.[0]?.toUpperCase()}</span>}
                  </div>
                  <p className={styles.memberName}>{req.profiles?.display_name || req.profiles?.username}</p>
                  <div className={styles.memberActions}>
                    <button className={styles.approveBtn} onClick={() => handleApproveRequest(req)}>Approve</button>
                    <button className={styles.rejectBtn}  onClick={() => handleRejectRequest(req)}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Members ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Members · {members.length}</h2>
          <div className={styles.memberList}>
            {members.map(m => (
              <div key={m.user_id} className={styles.memberRow}>
                <div className={styles.memberAvatar}>
                  {m.profiles?.avatar_url ? <img src={m.profiles.avatar_url} alt="" className={styles.memberAvatarImg} /> : <span className={styles.memberInitial}>{m.profiles?.username?.[0]?.toUpperCase()}</span>}
                </div>
                <div style={{flex:1}}>
                  <p className={styles.memberName}>{m.profiles?.display_name || m.profiles?.username}</p>
                  <p className={styles.memberHandle}>@{m.profiles?.username}</p>
                </div>
                {m.role !== 'owner' && membership?.role === 'owner' && (
                  <div className={styles.memberActions}>
                    <select
                      className={styles.roleSelect}
                      value={m.role}
                      onChange={e => handleRoleChange(m.user_id, e.target.value)}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button className={styles.removeBtn} onClick={() => handleRemoveMember(m.user_id)}>Remove</button>
                  </div>
                )}
                {m.role === 'owner' && <span className={styles.ownerBadge}>Owner</span>}
              </div>
            ))}
          </div>
        </section>

        {/* ── Danger zone ── */}
        {membership?.role === 'owner' && (
          <section className={`${styles.section} ${styles.dangerSection}`}>
            <h2 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>Danger Zone</h2>
            <div className={styles.dangerRow}>
              <div>
                <p className={styles.dangerLabel}>Delete this space</p>
                <p className={styles.dangerSub}>All posts and members will be removed permanently.</p>
              </div>
              <button className={styles.deleteBtn} onClick={handleDeleteSpace}>Delete Space</button>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  )
}