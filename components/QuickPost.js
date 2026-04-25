'use client'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import styles from './QuickPost.module.css'

export default function QuickPost({ open, onClose }) {
  const { user, profile } = useAuth()
  const [content,   setContent]   = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const textRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    if (open && textRef.current) textRef.current.focus()
    if (!open) { setContent(''); setImageFile(null); setImagePreview(null); setError('') }
  }, [open])

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function onImageChange(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setImageFile(f)
    setImagePreview(URL.createObjectURL(f))
  }

  async function handlePost(isDraft = false) {
    if (!content.trim()) { setError('Write something first.'); return }
    setLoading(true); setError('')

    let imageUrl = null

    if (imageFile && user) {
      const ext  = imageFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('post-images').upload(path, imageFile)
      if (!upErr) {
        const { data } = supabase.storage.from('post-images').getPublicUrl(path)
        imageUrl = data.publicUrl
      }
    }

    const { error: postErr } = await supabase.from('posts').insert({
      user_id:   user.id,
      content:   content.trim(),
      image_url: imageUrl,
      is_draft:  isDraft,
    })

    if (postErr) { setError(postErr.message); setLoading(false); return }
    setLoading(false)
    onClose()
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Modal */}
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>New Post</span>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Author row */}
          <div className={styles.authorRow}>
            <div className={styles.avatar}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" className={styles.avatarImg} />
                : <span className={styles.avatarInitial}>{profile?.username?.[0]?.toUpperCase() ?? '?'}</span>
              }
            </div>
            <div>
              <p className={styles.authorName}>{profile?.display_name || profile?.username}</p>
              <p className={styles.authorHandle}>@{profile?.username}</p>
            </div>
          </div>

          {/* Text area */}
          <textarea
            ref={textRef}
            className={styles.textarea}
            placeholder="What's on your mind?"
            value={content}
            onChange={e => setContent(e.target.value)}
            maxLength={1000}
            rows={5}
          />

          {/* Image preview */}
          {imagePreview && (
            <div className={styles.imagePreview}>
              <img src={imagePreview} alt="preview" className={styles.previewImg} />
              <button className={styles.removeImg} onClick={() => { setImageFile(null); setImagePreview(null) }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.charCount}>{content.length}/1000</div>
        </div>

        <div className={styles.modalFooter}>
          {/* Image attach */}
          <button className={styles.attachBtn} onClick={() => fileRef.current?.click()} title="Attach image">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onImageChange} style={{display:'none'}} />

          <div className={styles.footerActions}>
            <button className={styles.draftBtn} onClick={() => handlePost(true)} disabled={loading}>
              Save draft
            </button>
            <button className={styles.postBtn} onClick={() => handlePost(false)} disabled={loading}>
              {loading ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}