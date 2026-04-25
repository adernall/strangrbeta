'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/AuthContext'
import styles from './setup.module.css'

export default function SetupProfile() {
  const router = useRouter()
  const { user, profile, fetchProfile } = useAuth()
  const fileRef = useRef(null)

  const [displayName, setDisplayName] = useState('')
  const [bio,         setBio]         = useState('')
  const [avatarFile,  setAvatarFile]  = useState(null)
  const [preview,     setPreview]     = useState(null)
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(false)

  useEffect(() => {
    if (profile?.display_name) setDisplayName(profile.display_name)
  }, [profile])

  function onFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setAvatarFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleSave() {
    if (!user) return
    setLoading(true); setError('')

    let avatarUrl = profile?.avatar_url ?? null

    if (avatarFile) {
      const ext  = avatarFile.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: upErr } = await supabase.storage
        .from('avatars').upload(path, avatarFile, { upsert: true })
      if (!upErr) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        avatarUrl = urlData.publicUrl
      }
    }

    const { error: saveErr } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim() || profile?.username,
        bio:          bio.trim(),
        avatar_url:   avatarUrl,
      })
      .eq('id', user.id)

    if (saveErr) { setError(saveErr.message); setLoading(false); return }
    await fetchProfile(user.id)
    router.push('/feed')
    router.refresh()
  }

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>STRANGR</Link>
      </nav>
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>One last thing.</h1>
          <p className={styles.sub}>Tell the quiet ones who you are.</p>

          {error && <div className={styles.error}>{error}</div>}

          {/* Avatar */}
          <div className={styles.avatarWrap}>
            <button className={styles.avatarBtn} onClick={() => fileRef.current?.click()}>
              {preview
                ? <img src={preview} alt="avatar" className={styles.avatarImg} />
                : <span className={styles.avatarInitial}>{profile?.username?.[0]?.toUpperCase() ?? '?'}</span>
              }
              <div className={styles.avatarOverlay}>Upload photo</div>
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className={styles.hidden} />
          </div>

          <div className={styles.fields}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Display name</label>
              <input
                className={styles.input}
                type="text"
                placeholder={profile?.username ?? 'Your name'}
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                maxLength={50}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Bio <span className={styles.optional}>(optional)</span></label>
              <textarea
                className={styles.textarea}
                placeholder="A few words…"
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={160}
                rows={3}
              />
              <span className={styles.charCount}>{bio.length}/160</span>
            </div>
          </div>

          <button className={styles.submit} onClick={handleSave} disabled={loading}>
            {loading ? 'Saving…' : 'Enter Strangr'}
          </button>

          <button className={styles.skip} onClick={() => router.push('/feed')}>
            Skip for now
          </button>
        </div>
      </main>
    </div>
  )
}