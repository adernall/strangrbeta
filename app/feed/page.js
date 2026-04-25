'use client'
import AppShell from '../../components/AppShell'
import styles from './feed.module.css'

export default function FeedPage() {
  return (
    <AppShell title="Feed">
      <div className={styles.page}>
        <div className={styles.feedCol}>
          {/* Coming Phase 5 — empty state */}
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>✦</span>
            <h2 className={styles.emptyTitle}>Your feed is quiet.</h2>
            <p className={styles.emptyText}>
              Join some spaces and follow people to fill it up.<br />
              Posts that earned the room will show up here.
            </p>
            <a href="/spaces" className={styles.exploreBtn}>Explore Spaces</a>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Suggested Spaces</h3>
            <p className={styles.sidebarEmpty}>No suggestions yet.</p>
          </div>
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Who to follow</h3>
            <p className={styles.sidebarEmpty}>No suggestions yet.</p>
          </div>
        </aside>
      </div>
    </AppShell>
  )
}