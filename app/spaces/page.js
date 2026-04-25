'use client'
import AppShell from '../../components/AppShell'
import Link from 'next/link'
import styles from './spaces.module.css'

export default function SpacesPage() {
  return (
    <AppShell title="Spaces">
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Spaces</h1>
            <p className={styles.sub}>Curated worlds, not endless feeds.</p>
          </div>
          <Link href="/spaces/create" className={styles.createBtn}>+ Create Space</Link>
        </div>

        {/* Coming Phase 3 */}
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>✦</span>
          <p className={styles.emptyTitle}>No spaces yet.</p>
          <p className={styles.emptyText}>Spaces are coming in Phase 3.<br />Create one and be the first.</p>
          <Link href="/spaces/create" className={styles.ctaBtn}>Create a Space</Link>
        </div>
      </div>
    </AppShell>
  )
}