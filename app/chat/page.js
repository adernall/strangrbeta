'use client'
import { useState, useEffect, useRef } from 'react'
import AppShell from '../../components/AppShell'
import styles from './chat.module.css'

// Anonymous stranger chat — no Supabase, pure ephemeral session
// Real-time matching will be wired in Phase 7 with Supabase Realtime channels

const SYSTEM_MSGS = [
  "You've been connected to a stranger.",
  "Say something. Or don't. No pressure.",
]

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export default function ChatPage() {
  const [status,   setStatus]   = useState('idle')   // idle | searching | connected | disconnected
  const [messages, setMessages] = useState([])
  const [input,    setInput]    = useState('')
  const [sessionId] = useState(() => makeId())
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function startChat() {
    setStatus('searching')
    setMessages([])
    // Simulate finding a stranger (real matching in Phase 7)
    setTimeout(() => {
      setStatus('connected')
      SYSTEM_MSGS.forEach((msg, i) => {
        setTimeout(() => {
          setMessages(prev => [...prev, { id: makeId(), type: 'system', text: msg }])
        }, i * 600)
      })
    }, 1200)
  }

  function sendMessage() {
    if (!input.trim() || status !== 'connected') return
    setMessages(prev => [...prev, { id: makeId(), type: 'me', text: input.trim() }])
    setInput('')
  }

  function disconnect() {
    setStatus('disconnected')
    setMessages(prev => [...prev, { id: makeId(), type: 'system', text: 'You disconnected.' }])
  }

  return (
    <AppShell title="Stranger">
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Talk to a Stranger</h1>
            <p className={styles.sub}>Anonymous. Ephemeral. No logs.</p>
          </div>
          {status === 'connected' && (
            <button className={styles.disconnectBtn} onClick={disconnect}>Disconnect</button>
          )}
        </div>

        <div className={styles.chatBox}>
          {/* Idle */}
          {status === 'idle' && (
            <div className={styles.idleState}>
              <span className={styles.idleIcon}>✦</span>
              <p className={styles.idleText}>You'll be matched with a random stranger.<br />Completely anonymous. No history saved.</p>
              <button className={styles.startBtn} onClick={startChat}>Find a Stranger</button>
            </div>
          )}

          {/* Searching */}
          {status === 'searching' && (
            <div className={styles.idleState}>
              <span className={styles.searchingDot} />
              <p className={styles.idleText}>Looking for someone…</p>
            </div>
          )}

          {/* Messages */}
          {(status === 'connected' || status === 'disconnected') && (
            <div className={styles.messages}>
              {messages.map(msg => (
                <div key={msg.id} className={`${styles.msg} ${styles['msg_' + msg.type]}`}>
                  {msg.type === 'system'
                    ? <span className={styles.systemMsg}>{msg.text}</span>
                    : <span className={styles.bubble}>{msg.text}</span>
                  }
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        {status === 'connected' && (
          <div className={styles.inputRow}>
            <input
              className={styles.input}
              type="text"
              placeholder="Say something…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              autoFocus
            />
            <button className={styles.sendBtn} onClick={sendMessage}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        )}

        {status === 'disconnected' && (
          <div className={styles.reconnectRow}>
            <button className={styles.startBtn} onClick={startChat}>Find another stranger</button>
          </div>
        )}
      </div>
    </AppShell>
  )
}