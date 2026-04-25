'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import QuickPost from './QuickPost'
import styles from './BottomNav.module.css'

const ITEMS = [
  {
    label: 'Home',
    href: '/feed',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    label: 'Spaces',
    href: '/spaces',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
      </svg>
    ),
  },
  { label: 'Post', href: null, icon: null }, // center create button
  {
    label: 'Messages',
    href: '/inbox',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    label: 'Profile',
    href: '/profile/me',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [postOpen, setPostOpen] = useState(false)

  return (
    <>
      <nav className={styles.nav}>
        {ITEMS.map((item, i) => {
          // Center create button
          if (!item.href) {
            return (
              <button key="create" className={styles.createBtn} onClick={() => setPostOpen(true)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            )
          }

          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}>
              {item.icon}
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <QuickPost open={postOpen} onClose={() => setPostOpen(false)} />
    </>
  )
}