'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../lib/AuthContext'
import styles from './page.module.css'

const STATS = [
  { value: '12.4K', label: 'CURATED CREATORS' },
  { value: '284',   label: 'ACTIVE SPACES' },
  { value: '0',     label: 'ADS, EVER' },
  { value: '1.2M',  label: 'POSTS THAT MATTERED' },
]

export default function Landing() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) router.push('/feed')
  }, [user, loading, router])

  if (loading) return null

  return (
    <div className={styles.page}>

      {/* ── NAV ── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            STRANGR <span className={styles.logoDot}>•</span>
          </Link>
          <div className={styles.navLinks}>
            <a href="#manifesto" className={styles.navLink}>MANIFESTO</a>
            <a href="#spaces"    className={styles.navLink}>SPACES</a>
            <a href="#feed"      className={styles.navLink}>FEED</a>
          </div>
          <div className={styles.navActions}>
            <Link href="/login"  className={styles.loginBtn}>LOG IN</Link>
            <Link href="/signup" className={styles.joinBtn}>JOIN STRANGR</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroBeta}>
          <span className={styles.betaDot} />
          NOW IN PRIVATE BETA · 2,431 INVITED
        </div>

        <h1 className={styles.heroTitle}>
          A quiet place<br />
          for <em className={styles.heroLoud}>loud</em> ideas.
        </h1>

        <p className={styles.heroSub}>
          Strangr is the anti-noise network for makers. No<br />
          engagement traps. No outrage feed. Just curated spaces<br />
          and posts that earned the room.
        </p>

        <div className={styles.heroCtas}>
          <Link href="/signup" className={styles.ctaOutline}>CLAIM YOUR HANDLE →</Link>
          <Link href="/feed"   className={styles.ctaDark}>PREVIEW THE FEED</Link>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className={styles.stats}>
        {STATS.map((s, i) => (
          <div key={s.label} className={styles.stat}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── MANIFESTO ── */}
      <section className={styles.manifesto} id="manifesto">
        <div className={styles.manifestoInner}>
          <div className={styles.manifestoLeft}>
            <p className={styles.sectionTag}>/ 01 — MANIFESTO</p>
          </div>
          <div className={styles.manifestoRight}>
            <h2 className={styles.manifestoTitle}>
              <span className={styles.manifestoWhite}>We don't measure success in screen time. </span>
              <span className={styles.manifestoGray}>We measure it in things you actually wanted to share.</span>
            </h2>

            <div className={styles.manifestoCards}>
              {/* Card 1 */}
              <div className={styles.manifestoCard}>
                <svg className={styles.cardIcon} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <h3 className={styles.cardTitle}>Seen, not surveilled</h3>
                <p className={styles.cardText}>No ad pixels. No third-party trackers. Your feed is yours.</p>
              </div>
              {/* Card 2 */}
              <div className={styles.manifestoCard}>
                <svg className={styles.cardIcon} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                  <polyline points="2 17 12 22 22 17"/>
                  <polyline points="2 12 12 17 22 12"/>
                </svg>
                <h3 className={styles.cardTitle}>Spaces over feeds</h3>
                <p className={styles.cardText}>Communities curated by humans. Quality is enforced, not gamed.</p>
              </div>
              {/* Card 3 */}
              <div className={styles.manifestoCard}>
                <svg className={styles.cardIcon} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <h3 className={styles.cardTitle}>Slow by design</h3>
                <p className={styles.cardText}>Drafts, not drafts-as-anxiety. Post when it's ready, not when you're bored.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPACES (no images — placeholder until admin assigns) ── */}
      <section className={styles.spaces} id="spaces">
        <div className={styles.spacesInner}>
          <div className={styles.spacesHeader}>
            <p className={styles.sectionTag}>/ 02 — SPACES</p>
            <h2 className={styles.spacesTitle}>Curated worlds,<br />not endless feeds.</h2>
          </div>
          <div className={styles.spacesEmpty}>
            <p className={styles.spacesEmptyText}>Spaces are curated by the community.<br />Join to explore them.</p>
            <Link href="/signup" className={styles.joinBtn}>JOIN STRANGR</Link>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className={styles.bottomCta} id="feed">
        <div className={styles.sparkle}>✦</div>
        <h2 className={styles.bottomCtaTitle}>
          <span className={styles.ctaWhite}>The internet got loud.</span><br />
          <em className={styles.ctaGray}>We made somewhere quiet.</em>
        </h2>
        <Link href="/signup" className={styles.joinBtn}>RESERVE YOUR HANDLE →</Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <Link href="/" className={styles.footerLogo}>
          STRANGR <span className={styles.logoDot}>•</span>
        </Link>
        <p className={styles.footerCopy}>© 2026 STRANGR · BUILT FOR THE QUIET ONES</p>
        <div className={styles.footerLinks}>
          <Link href="/privacy" className={styles.footerLink}>PRIVACY</Link>
          <Link href="/support" className={styles.footerLink}>SUPPORT</Link>
          <Link href="/about"   className={styles.footerLink}>ABOUT</Link>
        </div>
      </footer>

    </div>
  )
}