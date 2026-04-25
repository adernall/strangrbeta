'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../lib/AuthContext'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import styles from './AppShell.module.css'

export default function AppShell({ children, title }) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading) {
    return (
      <div className={styles.loading}>
        <span className={styles.loadingDot} />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className={styles.shell}>
      <Sidebar />
      <TopBar title={title} />
      <main className={styles.main}>
        {children}
      </main>
      <BottomNav />
    </div>
  )
}