'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/AuthContext'
import AppShell from '../../../components/AppShell'
import styles from './create.module.css'

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

export default function CreateSpace() {
  const router = useRouter()
  const { user } = useAuth()
  const iconRef   = useRef(null)
  const bannerRef = useRef(null)

  const [name,        setName]        = useState('')
  const [slug,        setSlug]        = useState('')
  const [description, setDescription] = useState('')
  const [about,       setAbout]       = useState('')
  const [tags,        setTags]        = useState('')
  const [isPrivate,   setIsPrivate]   = useState(false)
  const [guidelineName,    setGuidelineName]    = useState('')
  const [guidelineContent, setGuidelineContent] = useState('')
  const [iconFile,    setIconFile]    = useState(null)
  const [iconPreview, setIconPreview] = useState(null)
  const [bannerFile,  setBannerFile]  = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(false)

  function onNameChange(val) {
    setName(val)
    setSlug(slugify(val))
  }

  function onIconChange(e) {
    const f = e.target.files?.[0]; if (!f) return
    setIconFile(f); setIconPreview(URL.createObjectURL(f))
  }
  function onBannerChange(e) {
    const f = e.target.files?.[0]; if (!f) return
    setBannerFile(f); setBannerPreview(URL.createObjectURL(f))
  }

  async function handleCreate() {
    if (!name.trim())  { setError('Space name is required.'); return }
    if (!slug.trim())  { setError('Slug is required.'); return }
    if (!description.trim()) { setError('Description is required.'); return }
    setLoading(true); setError('')

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('spaces').select('id').eq('slug', slug).maybeSingle()
    if (existing) { setError('That slug is already taken. Try another name.'); setLoading(false); return }

    let iconUrl = null, bannerUrl = null

    // Upload icon
    if (iconFile && user) {
      const ext = iconFile.name.split('.').pop()
      const path = `${user.id}/${slug}-icon.${ext}`
      const { error: upErr } = await supabase.storage.from('space-icons').upload(path, iconFile, { upsert: true })
      if (!upErr) {
        const { data } = supabase.storage.from('space-icons').getPublicUrl(path)
        iconUrl = data.publicUrl
      }
    }

    // Upload banner
    if (bannerFile && user) {
      const ext = bannerFile.name.split('.').pop()
      const path = `${user.id}/${slug}-banner.${ext}`
      const { error: upErr } = await supabase.storage.from('space-banners').upload(path, bannerFile, { upsert: true })
      if (!upErr) {
        const { data } = supabase.storage.from('space-banners').getPublicUrl(path)
        bannerUrl = data.publicUrl
      }
    }

    // Parse tags
    const parsedTags = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)

    // Insert space
    const { data: space, error: spaceErr } = await supabase
      .from('spaces')
      .insert({
        name:             name.trim(),
        slug,
        description:      description.trim(),
        about:            about.trim(),
        tags:             parsedTags,
        creator_id:       user.id,
        is_private:       isPrivate,
        icon_url:         iconUrl,
        banner_url:       bannerUrl,
        guideline_name:    guidelineName.trim() || null,
        guideline_content: guidelineContent.trim() || null,
      })
      .select()
      .single()

    if (spaceErr) { setError(spaceErr.message); setLoading(false); return }

    // Add creator as owner
    await supabase.from('space_members').insert({
      space_id: space.id,
      user_id:  user.id,
      role:     'owner',
    })

    router.push(`/spaces/${slug}`)
  }

  return (
    <AppShell title="Create Space">
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create a Space</h1>
          <p className={styles.sub}>Build a curated community around an idea.</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.form}>
          {/* Banner */}
          <div className={styles.bannerSection}>
            <button className={styles.bannerBtn} onClick={() => bannerRef.current?.click()}>
              {bannerPreview
                ? <img src={bannerPreview} alt="banner" className={styles.bannerImg} />
                : <span className={styles.bannerPlaceholder}>Click to upload banner image</span>
              }
            </button>
            <input ref={bannerRef} type="file" accept="image/*" onChange={onBannerChange} style={{display:'none'}} />
          </div>

          {/* Icon + Name row */}
          <div className={styles.iconNameRow}>
            <div className={styles.iconSection}>
              <button className={styles.iconBtn} onClick={() => iconRef.current?.click()}>
                {iconPreview
                  ? <img src={iconPreview} alt="icon" className={styles.iconImg} />
                  : <span className={styles.iconPlaceholder}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </span>
                }
              </button>
              <input ref={iconRef} type="file" accept="image/*" onChange={onIconChange} style={{display:'none'}} />
            </div>

            <div className={styles.nameSlugCol}>
              <div className={styles.field}>
                <label className={styles.label}>Space Name <span className={styles.req}>*</span></label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="e.g. Brutal Structures"
                  value={name}
                  onChange={e => onNameChange(e.target.value)}
                  maxLength={60}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>URL Slug <span className={styles.req}>*</span></label>
                <div className={styles.slugWrap}>
                  <span className={styles.slugPrefix}>strangr.app/spaces/</span>
                  <input
                    className={`${styles.input} ${styles.slugInput}`}
                    type="text"
                    value={slug}
                    onChange={e => setSlug(slugify(e.target.value))}
                    maxLength={60}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Short Description <span className={styles.req}>*</span></label>
            <input
              className={styles.input}
              type="text"
              placeholder="One sentence about this space."
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={160}
            />
            <span className={styles.hint}>{description.length}/160</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>About <span className={styles.optional}>(optional)</span></label>
            <textarea
              className={styles.textarea}
              placeholder="Tell people what this space is about…"
              value={about}
              onChange={e => setAbout(e.target.value)}
              rows={4}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tags <span className={styles.optional}>(comma separated)</span></label>
            <input
              className={styles.input}
              type="text"
              placeholder="design, typography, brutalism"
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
          </div>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Privacy */}
          <div className={styles.toggleRow}>
            <div>
              <p className={styles.toggleLabel}>Private Space</p>
              <p className={styles.toggleSub}>Members must request to join. You approve them.</p>
            </div>
            <button
              className={`${styles.toggle} ${isPrivate ? styles.toggleOn : ''}`}
              onClick={() => setIsPrivate(p => !p)}
            >
              <span className={styles.toggleThumb} />
            </button>
          </div>

          <div className={styles.divider} />

          {/* Guidelines */}
          <div className={styles.field}>
            <label className={styles.label}>Community Guideline Name <span className={styles.optional}>(optional)</span></label>
            <input
              className={styles.input}
              type="text"
              placeholder="e.g. The Code, The Rules, The Quiet Pact"
              value={guidelineName}
              onChange={e => setGuidelineName(e.target.value)}
              maxLength={60}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Guideline Content <span className={styles.optional}>(optional)</span></label>
            <textarea
              className={styles.textarea}
              placeholder="What are the rules of this space? What keeps it good?"
              value={guidelineContent}
              onChange={e => setGuidelineContent(e.target.value)}
              rows={4}
            />
          </div>

          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={() => router.back()}>Cancel</button>
            <button className={styles.createBtn} onClick={handleCreate} disabled={loading}>
              {loading ? 'Creating…' : 'Create Space'}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}